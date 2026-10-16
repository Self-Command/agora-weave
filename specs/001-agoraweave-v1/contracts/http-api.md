# HTTP API v1

所有路径相对`/api/v1`；HTTPS、JSON UTF-8。字段以[data-model](../data-model.md)实体定义为基础，返回严格DTO投影而非数据库行。客户端使用服务器返回的allowed_actions改善显示，后续执行仍再次授权。[授权契约](authorization-events.md)适用于每一行端点。

## 通用请求与响应

- 移动Authorization Bearer；后台和分享用HttpOnly cookie＋CSRF。issuer/audience/session当前有效核验。分享audience=`share-read`只可调用本文末尾逐路由白名单，未列明一律拒绝；GET不自动获准，不能靠伪造`channel=app`、本人身份或管理员角色扩权。分享cookie不能用于App／后台会话。
- `X-Client-Release`匹配服务器发行登记及能力；`X-Config-Version`为展示快照，不能冻结权限。客户端自报OS/native capability只是兼容提示，服务端验证注册组合；不能作为安全授权。
- 创建/修改/生命周期命令带`operation_id` UUID；同主体/动作/ID payload hash相同复用结果，不同返回409。CAS变更带`base_version`，冲突返回双方版本引用且保输入；不盲覆盖。幂等结果重读也校当前资格。
- 成功对象`{request_id,operation_id?,config_version,data}`，列表data=`{items,next_cursor,has_more}`；游标不含原文或秘密，绑定查询/主体/范围版本，最多50、初始20。删除成功可204，异步命令202带operation状态，不写“公开成功”。
- 错误`{request_id,code,message,retryable,retry_after_seconds?,operation_id?,current_config_version?,field_errors?}`。401会话无效，403动作不可执行，404目标无权/不可用统一不泄露私人理由，409CAS/幂等冲突，422格式/超限，429限流，503依赖不可用。部分已上传文件保留并返回可复用refs；客户端不清正文。
- 当前授权后输出合法状态和`unavailable`占位，不带隐藏正文/作者私人原因；统计与具体名单资格分别判断。UTC时间ISO8601。请求体大小、字符/MB口径见configuration；验证不自动修剪正文。

表中“command”含operation_id/base_version（适用时），“read”不携effect；新增字段不得隐含另一个未批准业务。敏感后台命令额外`stepup_id,reason,preview_digest`，服务端核权限、MFA、精确动作和DEC-001。

## 身份、资料、关系

| 方法/路径 | 输入及资格 | 输出/关键结果 |
| --- | --- | --- |
| POST /auth/challenges | phone、purpose(login/register/change_phone)、invitation_ref/age_declaration（register），频率核 | challenge_id/expires_at/retry_after，无验证码返回 |
| POST /auth/verify | challenge_id/otp；仅register提交terms_release_id/digest及明确consent、age声明version，新用户邀请码原子兑换 | 当前session/account准入及注册真实条款receipt；缺有效／匹配当前条款则新注册不完成，已有账号login不要求新条款consent；手机verified不自动管理员 |
| POST /auth/refresh | 当前refresh/session，受控Auth代理，撤销/注销/过期核 | 新session token/cookie，不能复活撤销会话；验证码和refresh token不入日志 |
| GET /me/sessions；DELETE /me/sessions/{id} | 本人；delete command | 当前设备列表；撤销后旧JWT新请求拒绝 |
| POST /auth/logout | 当前session，command | 撤当前会话及应用受限缓存清理指示 |
| POST /me/phone-change/preview；POST /me/phone-change | 旧号/新号验证refs或受控恢复ref、command | 影响/摘要；完成时间和24h sensitive_until，撤其他session |
| POST /recovery-cases；GET /recovery-cases/{id} | 受控申请/申请人合法查询，不凭公开答案恢复 | 真实受理/缺证据/结果；无公开高权恢复旁路 |
| POST /me/cancellation/preview；POST /me/cancellation | 当前必要身份验证、显式确认、command | 立即注销访问，分类purge状态；窗口内DEC-001拒绝 |
| GET /profiles/{id}；PATCH /me/profile | 公开/当前有权；patch昵称/唯一名/bio/media_refs/base_version | profile合法DTO和当前关系数；私有管理内容不混入 |
| GET /profiles/{id}/contents | type=posts/replies/reposts/media、cursor | 当前有权资源，无草稿/收藏/AI历史 |
| GET /profiles/{id}/relationships | kind=followers/following、cursor | 访客拒明细；审批账号仅本人/有效关注者 |
| PUT/DELETE /me/follows/{id} | command、当前关系/审批/冷却/拉黑 | effective或pending真实状态；取消立即撤相关资格 |
| GET /me/follow-requests；POST /follow-requests/{id}/actions | read本人；action=accept/reject/delete/cancel | 一合法终态、发送者统一ended，expire按服务时间 |
| PUT/DELETE /me/blocks/{id} | command | 双向关系退出/新互动拒；解除不复活 |
| GET/PUT/DELETE /me/mutes | kind/account-keyword-topic/value、command | 本人偏好，与拉黑/DM mute独立 |
| GET/PATCH /me/preferences | 本人App会话、当前注册字段/base_version；video_policy=always/wifi_only/never、preload布尔 | 本人接收/回执/通知/AI用途及播放偏好；视频初始wifi_only／静音、蜂窝点击，关闭预加载生效；当前系统省流量／减少动效由各端消费，偏好不授媒体读权，分享不消费该接口 |
| GET/PATCH /me/search-indexing | 本人App会话；patch allow_indexing/base_version/operation_id | author_index_policy／epoch及作用范围：本人公开主页、帖子、串；不修改阅读权限或AI用途 |

`/me/preferences`方法按注册契约固定：GET只读本人当前合法投影；PATCH仅部分更新请求中明确列出的注册字段，携带`base_version`和`operation_id`，未列字段保持原值，不用完整替换语义或默认重置其他偏好。CAS错版409且保输入，非法枚举／类型／未注册字段拒绝且不部分提交；同主体／动作／operation相同payload复用当前可读结果、不同payload返回409。PUT不注册，Actions须验证其405／Allow=GET,PATCH；share-read用途仍先按白名单判定，不能因405声明或本人身份取得私人接口权限。测试／客户端／实现／路由注册表及OpenAPI不得共同漂移为GET/PUT。

## 内容、草稿、讨论、投票、互动和发现

| 方法/路径 | 输入及资格 | 输出/关键结果 |
| --- | --- | --- |
| POST /uploads；PUT /uploads/{id}/parts/{part}；POST /uploads/{id}/complete | intent/kind/size/hash、文件分块、operation；本人归属 | uploaded_parts/复用refs/validated状态，非公开；不返回源站可读签名 |
| GET /operations/{id} | 当前主体/动作资格 | pending/succeeded/failed/unknown＋合法结果引用；未知先查再重试 |
| GET/POST /me/drafts；GET/PATCH/DELETE /me/drafts/{id} | body/metadata/media_refs、base_version/command；访客import有明确选择 | 私人版本和冲突选择，不自动AI/公共索引 |
| POST /posts | type/body/tags/mentions/media_refs/poll/source_id/visibility/reply_scope/indexing_mode(inherit/allow/deny)、command | resource/operation/review_state，符合类型组合；收录默认inherit且不越过账号限制；失败保输入 |
| GET /posts/{id}；PATCH /posts/{id} | 公开/有权；patch允许正文/标签/alt/base_version | 当前通过版；作者管理另视图，patch新revision待审 |
| GET /me/contents；GET /posts/{id}/revisions | 本人或本案授权reviewer | 管理状态/历史，旧版继承当前权，非AI许可 |
| PATCH /posts/{id}/visibility；PATCH /posts/{id}/reply-policy | author、visibility或scope、preview_digest（放宽串）、command | 收紧立即；只改整串时范围统一，放宽确认全部影响 |
| GET/PATCH /resources/{id}/search-indexing | 当前作者App会话；target_kind仅post/thread，patch mode/base_version/operation_id | 目标policy、effective_indexable、epoch和投影作业状态；其他类型拒绝，关闭即按当前状态noindex／退出收录路径，不能等待异步完成 |
| POST /threads；POST /threads/{id}/batches；GET /threads/{id} | 同作者items、command；创建含indexing_mode默认inherit，续写继承串策略；read当前资格 | 整批准备/审核/发布结果，head失效整体占位；整串和实际展示依赖收录取交集 |
| GET/POST /posts/{id}/comments | sort=latest/hot/cursor；create body/media/parent/reply_to、command | 三层投影/真实父对象，新回复阅读＋reply_scope交集 |
| PATCH/DELETE /comments/{id} | 本人允许正文/alt/base_version或delete command | 审核新revision或无正文占位，合法子回复保留 |
| POST /polls/{id}/votes；GET /polls/{id}/results | option_id/command；read投票中须已投＋有权 | 一票或拒；结束后当前有权者可读，无投票者名单 |
| PATCH /polls/{id}；POST /polls/{id}/end；POST /polls/{id}/corrections | 首票前字段或独立说明/correction/reason、command | 锁三项；提前结束实际时间保原截止，不能重开 |
| PUT/DELETE /resources/{id}/likes；PUT/DELETE /posts/{id}/reposts | 当前互动资格、command | 去重合法效果/count；quote经POST /posts type=quote只附文字 |
| GET /resources/{id}/interactions | kind/合法统计/明细cursor | 访客仅统计，有权登录明细，不拿过滤长度代全数 |
| GET/PUT/DELETE /me/bookmarks/{id}；GET /me/bookmarks | 本人command/read | 私密，来源失效占位可移除，无公开收藏count |
| POST /resources/{id}/deletion；POST /deletions/{id}/restore | 本人/显式command；restore当前资格/期限/依赖 | 删除即时；恢复仅合法影响集，管理员处置走申诉 |
| GET /me/recently-deleted | 本人 | 有效恢复状态/截止/真实清理，非普通读取资格 |
| GET /feeds/{kind} | kind=recommended/following/latest、cursor；当前用户或公开访客 | 合法排序、过滤、游标；self不进公共流 |
| GET /search；GET /search/suggestions；GET /discover | q/type/time/show_muted、cursor | 帖子/用户/话题的当前结果、联想/count，低数据真实近期 |
| GET/DELETE /me/search-history | 本人query/cursor或clear command | 私人历史与清除结果 |
| GET /media/{id}；HEAD /media/{id} | 当前认证、Range/条件请求；派生同路径带variant | 每次主库核，不重定向、不失权304，no-store合法bytes |

## 私信、通知与AI用户命令

| 方法/路径 | 输入及资格 | 输出/关键结果 |
| --- | --- | --- |
| GET /dm/eligibility/{recipient} | 当前找人/发送资格 | 可允许动作/统一不可联系，不泄漏隐私原因 |
| GET/POST /dm/requests；POST /dm/requests/{id}/actions | initial_text或accept/reject/delete/cancel、command | 规范化无向pair至多一pending，反向并发也互斥；同operation重试一效果，其他竞争409且不泄漏无权请求详情；初始独立、30天/30或7冷却，accept重核并只合一次 |
| GET /dm/conversations；GET /dm/conversations/{id}/messages | all/unread/cursor；当前参与者 | 正常历史不混待请求，逐消息资格过滤 |
| POST /dm/messages | recipient或conversation、body/type/media_refs、command | 当前允许发送；唯一pair/稳定ID、saved状态非送达 |
| DELETE /dm/messages/{id}/access | 本人command | 本人的消息/附件资格撤销，对方保留独立 |
| DELETE /dm/conversations/{id}/listing | 本人command | 仅列表隐藏；新消息不复活已撤message |
| POST /dm/messages/{id}/delivery；POST /dm/conversations/{id}/read | 当前设备/message或read_cursor、command | delivered/read真实记录；双方回执开才互显 |
| POST /dm/conversations/{id}/typing | 短signal、当前输入提示/发送资格 | 有界暂态信号，不长期在线记录 |
| GET /notifications；POST /notifications/read | kind/cursor或IDs、command | 当前投影/去重未读，失权摘要/target退出 |
| GET /ai/models；GET/POST /ai/conversations | 获准合格模型；本人创建command | 模型真实availability，私人会话 |
| GET/PATCH/DELETE /ai/conversations/{id} | 本人；title/base_version或delete command | 标题/历史核依赖，删除即退出上下文 |
| POST /ai/requests | conversation/input/selected_refs/model/notice_ref、operation_id | request状态/SSE地址；真实服务不合格503保输入 |
| GET /ai/requests/{id}；GET /ai/requests/{id}/stream | 本人，last_event_id | 当前合法状态/有界输出，不将心跳当有效结果 |
| POST /ai/requests/{id}/stop；POST /ai/requests/{id}/retry | command、关联原request | stopped/unknown可查，费用独立对账，无重复成功扣量 |
| POST /ai/answers/{id}/copy；POST /ai/answers/{id}/feedback | 当前依赖授权、command | copy输出合法body或不可用；feedback真实记录 |
| GET /ai/usage | 本人当前日桶 | settled/reserved/unknown/限额与可知reset，不暴露供应商秘密 |

AI会话改名/删除由用户确定性业务命令实现，模型工具仍严格只读。stream/output与实时遵守授权事件契约。

## 治理、配置、插件和开发环境

| 方法/路径 | 输入/权限 | 输出/关键结果 |
| --- | --- | --- |
| POST /reports；GET /me/reports | target/reason/必要evidence_refs、command | 真实受理与允许公开反馈，无他人内部证据 |
| GET /me/sanctions；GET/POST /appeals | 本人statement/media/command或状态 | 当前处罚/申诉，无第二复核者待处理 |
| GET /admin/{collection} | collection=overview/accounts/contents/media/cases/appeals/topics/placements/audit/health，五角色逐action/resource/env；filters/cursor | 真实业务有权DTO，无任意私信/草稿/AI原文入口 |
| POST /admin/revisions/{id}/decision | specific revision decision/reason/command | 发布只作用该revision，批次统一就绪 |
| POST /admin/cases/{id}/decision；POST /admin/sanctions；POST /admin/sanctions/{id}/revoke | 本案权限/MFA/原因/command | 证据决定/分类型处罚、撤销只恢复其合法影响 |
| GET /admin/cases/{id}/evidence/{ref} | 最小案授权/stepup/reason | 当前允许证据、读取审计，不恢复普通访问 |
| POST /admin/appeals/{id}/decision | 独立reviewer/stepup/reason/command | 原处置人独自决定拒绝，决定与实际执行分别记录 |
| POST /admin/roles/preview；POST /admin/roles；POST /admin/invitations | 超管stepup/reason/preview_digest/command | 当前grant/邀请，DEC-001列明限制 |
| POST /admin/stepup | 当前MFA挑战＋action_digest | 一次短证明，不替当前会话/角色 |
| GET /config/effective | 当前用户/env/module/non-sensitive scope | 公共展示bundle/version/source，不含后台策略/秘密 |
| GET /documents/current；GET /documents/{id}/releases/{release_id} | kind/stable_key/locale/surface；公共读取只限该入口已发布且当前允许的版本 | title/body/digest/release/state及适用说明；当前和合法历史分别标识，draft/ready/withdrawn不泄漏 |
| GET /me/document-receipts；POST /me/document-receipts | 当前本人App会话；明确decision、release/digest、purpose、presentation_ref、operation_id | 本人实际版本／动作证明；陈旧／错用途／未发布拒绝并返回当前合法版本提示，不替后台产生用户同意 |
| GET/POST /admin/documents；GET/POST /admin/documents/{id}/revisions；PATCH /admin/document-revisions/{id} | 专门document.action/type/scope授权；录入title/body/locale，draft编辑base_version/command | 真实版本列表／草稿／验证结果；不以普通运营页面权限授予条款、隐私或告知发布权 |
| POST /admin/document-revisions/{id}/ready；POST /admin/documents/{id}/release-previews | 当前特定编辑／发布权限、revision/content_digest/scope、command | 不可变ready版本及精确影响摘要；校适用入口／关联服务政策／渲染／必需配置，未发布不对用户可见 |
| POST /admin/documents/{id}/releases；POST /admin/document-releases/{id}/withdrawals | 特定发布／撤下权限、stepup/reason/preview_digest、command；生产含匹配release_confirmation | 实际published/superseded/withdrawn、active指针与审计；缺当前权限／确认或摘要变化拒绝，未知先查不重复发布 |
| GET /admin/config/definitions；POST /admin/config/previews；POST /admin/config/releases；POST /admin/config/rollbacks | 按参数授权、scoped_values/base_version/reason/stepup | 完整预览/bundle/status，失败不半生效；见配置契约 |
| POST /admin/developers/invitations；GET/POST /developer/plugin-packages | 超管邀请或当前受邀提交包digest/manifest | 默认仅submit，不自审/安装/发布 |
| GET /admin/plugins；GET /admin/plugins/{id}/versions | 当前管理权限 | 来源/摘要/权限/依赖/迁移/状态/健康 |
| POST /admin/plugins/{id}/reviews；POST /admin/plugins/{id}/permission-grants | 超管具体version/digest、stepup/reason | 具体审核/敏感增量记录，同人分步骤 |
| POST /admin/plugin-installations/previews；POST /admin/plugin-installations/actions | env/version/action(install/enable/disable/upgrade/uninstall)/selected_dependents/preview_digest | 检查/实际各状态；生产动作另确认，依赖默认阻止 |
| POST /admin/plugin-data/purge-previews；POST /admin/plugin-data/purge-confirmations | 额外主动永久清理超管/stepup/reason/command | 分数据义务影响和独立确认，不随uninstall自动授权 |
| GET /extensions；POST /plugins/{id}/actions/{action} | version/slot或schema payload；当前插件能力 | 兼容descriptor或局部不可用，受控broker无原SQL |
| POST /developer/sandboxes；GET /developer/sandboxes/{id}/evidence | 当前受邀env/plugin/expiry/limits、command | 仅授权云端sandbox/Actions预览关联，无生产秘密 |
| POST /admin/releases/previews；POST /admin/releases/confirmations；POST /admin/releases/expand-confirmations | immutable release/scope digest、超管stepup/reason/明确名单 | 完整影响/生产具体确认/扩灰新确认；见发布契约 |
| GET /admin/releases/{id}；GET /admin/releases/{id}/evidence | 当前管理/审计权限 | 真阶段/失败恢复限制及同版证据，未通过不得假成功 |

后台未确认的业务导出没有通用全库导出端点。必要安全配置/密钥变更另以已有核心受控action契约登记secret_ref，不能返回原密钥。正式社区制度/隐私/条款/告知/帮助正文由用户管理；上述版本化功能属于工程交付，不能将Q-11正文供给节点当作功能未设计的理由。

## 制度、条款、告知及帮助版本契约

后台实现录入／版本列表／预览／发布／撤下及真实结果，移动设置／注册／AI处理入口、分享站点和后台帮助以UI-SPEC既有组件语义展示适用资料；无合成内容冒充生产正式政策。权限沿用既有角色和逐action/resource/environment规则：文档功能不新增角色，系统政策发布权限专门登记在核心配置授权，社区运营或AI运维角色不自动拥有条款／隐私／告知发布权，审计角色仍只读。

document_release所绑定revision／正文摘要／作用范围不可变，发布状态按模型转移并留审计，激活只切精确作用范围的当前指针；同一注册／AI操作获取的所需版本集合带服务端document_set_digest，提交时再次校当前集合和明确用户动作。注册同意与admission原子绑定；已登录用户的必要处理告知由本人App命令记录，不能把页面打开、AI调用或服务器自动重试当同意。记录只证明明确动作与该版本，不声称证明用户实际读完或法律效力。

presented只记录展示版本，acknowledged/consented只记录真实明确动作；依spec FR-078／080区分必要告知与self／草稿主动确认，不把普通公开查询新增为逐次强制同意流程。相同版本／用途的有效记录可引用，版本／服务范围或所选目标变化时重新满足原有适用要求，不能用一次条款同意替代任何来源／作者用途许可。

旧版本作为合法历史展示时明确标识，不作为当前条款／告知／帮助；文案或权限撤下立即阻止后续相关读取／工具引用。撤下不自动回退旧版，需按正常发布确认另建release。条款缺失阻塞新注册，处理告知缺失阻塞该用途的新AI发送，帮助不可用如实提示；不新增旧用户每次登录重同意或平台统一强制重同意政策。真实服务地域／不训练／费用准入与用户当前数据许可仍独立核验。

## 分享网页契约

网页路由`/p/{stable_id}`、`/u/{account_id}`、`/t/{thread_id}`，SSR逐请求当前授权，只读；登录仅取得share-read会话。有效公开目标200且只带合法元信息；非公开但当前有权的登录用户读取200，正文及媒体只向该用户投影，no-store/noindex，匿名爬虫仍无正文或私密存在信息。未登录的受限目标只给不泄漏存在性的登录提示／安全占位或统一404；登录后仍无权、已删除／失效的目标统一404或安全占位。不能因visibility不是public就把有权登录读取一律判404。

关闭收录仍有权200，但X-Robots-Tag及meta noindex、移出sitemap／主动收录、无可收录预览；sitemap与元信息逐次核当前公开、author_index_policy和target_index_policy及展示依赖。账号设置覆盖本人公开主页／帖子／串，逐目标设置只作用该post/thread及实际展示依赖，显式allow不能突破账号false或资源读权。所有产品可撤权响应no-store，robots不能替授权，投影作业成功不保证外部缓存即时删除。

### share-read逐路由白名单

核心路由注册表将以下方法／路径／投影固化为`audiences`声明，Actions校核表与实现一致；未列明默认拒绝，新增端点不能默认继承share-read。

| 方法／路径 | share-read的唯一用途／限制 |
| --- | --- |
| POST /auth/challenges；POST /auth/verify | 必需登录协议，purpose仅login；challenge绑定分享登录上下文，verify只签发share-read，不能借客户端audience/channel切App／后台权限；register/change_phone转完整App受控流程，不因分享登录自动兑换邀请码或注册 |
| POST /auth/refresh；POST /auth/logout | 仅保持或撤销当前分享会话，不能升级audience或管理其他设备会话 |
| GET /profiles/{id}；GET /profiles/{id}/contents | 分享主页的合法公开／有权内容投影，不包含本人管理视图、草稿、收藏、私人历史或后台字段；公开统计不授关系名单读取 |
| GET /posts/{id}；GET /posts/{id}/comments；GET /threads/{id} | 只读当前分享目标及其合法正文／讨论／串投影，受限目标按当前本人／有效关注等实际资格判定，不取作者管理revision |
| GET /polls/{id}/results | 只限有权分享目标关联投票，仍校投票中已投／结束规则；登录不能在网页投票 |
| GET/HEAD /media/{id} | 只限上述分享目标当前合法绑定的正文／资料媒体与派生，逐Range/conditional当前核；即使本人也不能读草稿、私信、证据或AI附件；客户端target_ref仅供定位，不能授予绑定资格 |
| GET /config/effective | 仅服务器固定的分享UI非敏感投影及获准平台播放默认，匿名／登录均不混入账号preferences，query不能扩为个人偏好／后台策略／秘密 |
| GET /documents/current；GET /documents/{id}/releases/{release_id} | 仅当前入口允许公开的已发布／合法历史制度及帮助内容，无草稿／未发布版本／私人同意记录 |

除此之外包括所有私人`/me`读取、关系明细、信息流／搜索、通知、私信、AI、治理／开发者／后台及收录修改均拒绝，既有社区写入全部引导App。Cookie认证的SSR/API和底层媒体使用同一audience注册及当前资格判断，不能以服务端service_role读取后跳过用户／用途投影。必需认证POST不表示允许任何社区业务写入。

**ED-10分享播放输入**：用户明确选择A，匿名／登录均使用上述合法平台默认与页面内明确操作，不读取或同步账号播放偏好，不新增最小本人偏好投影端点。页面播放／暂停／声音／自动播放／关闭预加载控件只改变当前页面播放状态，不发账号PATCH，不形成“设置已保存／同步”结果；账号设置转App。SSR和客户端都不能读取完整或部分preferences后塞入HTML／hydration／缓存／媒体DTO／登录响应，登录仅改变内容当前读权。测试须以账号已保存always／never等相反偏好验证分享默认不受影响，并检验所有/me及伪config query读取／写入拒绝、响应不泄漏个人字段、页面操作不改数据库。
