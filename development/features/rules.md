# 跨功能业务规则

PRD保留产品范围，本目录承载可执行业务行为，共享OpenAPI/类型定义唯一接口。用户已批准整体替换旧spec/plan/tasks/宪法体系；原FR/QR/AC/US/EC/SC/AS仅是稳定迁移索引，不建立任务checkbox、计划平台或批准收据体系。文档覆盖不代表业务完成。

## 当前范围与三端独立开发

基础运营优先：真实账号与运营身份、文字静态图片单帖及审核、最新流/详情/基础资料/点赞普通评论、举报/拉黑/申诉、必要配置/安全审计/分类清理/运维。AI/MCP、私信及普通推送、视频/GIF、投票/串、复杂引用/深层讨论、跨设备草稿、高级关系/搜索推荐、分享Web/收录、插件SDK/管理及高级配置/灰度控制台后置；完整行为仍全部保留。未开放能力明确不可用。服务器、域名、短信、正式签名分发由用户搭建，缺资源仅暂停依赖动作，不以模拟成功充真实验证。

固定operationId、请求响应、错误、状态、权限契约后，App/后台/后端可以按独立文件并行；业务依赖用于集成与真实可用性，不要求整个后端故事结束才写客户端。mock/合成数据可辅助独立开发与故障定位，真实结论仍需实际Auth/DB/Storage/Realtime及客户端联通。不新增演示产品页或临时测试壳，不删有效合成测试；共享DB、设备、运行区串行使用。

## 范围排除与后续条件

首版不做广告/会员/付费内容/打赏/支付退款分账/虚拟币、复杂独立Articles、群聊/通话/直播/语音空间、通讯录导入/批量关注/X Lists、多人续写协作或串合并、为全员撤回DM、公开在线/最后活跃、投票者名单。产品AI无社交/账号/后台写，真实外联网/附件图像文件语音/生成图未确认只待启用，完整认证/第三方登录/高级地点搜索/复杂ML后续；旧草稿按钮徽章不新增能力。行业校园/租户/社区空间运营/多产品编排不在范围，插件组合和单多部署由未来使用者自主，不新增平台经营对象。

## 当前授权、事务与错误恢复

1. 读取先绑定可信主体/session/environment/plugin/audience/purpose，再核当前账号/会话/角色/处罚、资源状态与已通过revision、block、范围、依赖、作者用途、插件生命周期，最后最小投影。资料/内容、普通/管理/恢复/案件/AI用途分开授权。JWT、旧签名、cache、索引、cursor、历史成功不是当前授权；分享先方法路径用途白名单，未列默认拒。
2. 写动作同事务或等效并发边界内核当前权限/资源/完整配置、base_version CAS、operation_id与payload_hash、唯一业务键和合法状态，持久化结果/必要审计/outbox。相同主体/action/ID同payload复用原合法结果、异payload409。事件允许重送，effect_key/inbox唯一保证效果不重复，不承诺网络exactly-once。
3. pending/succeeded/failed/unknown与草稿/上传/保存/审核/公开分别事实。断网、超时、强关、响应解析失败先查原operation，不盲建新提交。查询也当前授权；认证回执须原challenge与验证证明，不凭裸operation_id取令牌。失败保正文、元数据、成功附件；成功前不清输入、不显示已保存。
4. 401重新认证但保本人可恢复输入；403/404或最小占位不泄block/隐私原因或正文；409保选择刷新版本；429显示可知retry_after；配置变化反馈当前版本并保输入；503如实依赖失败。故障不能跳OTP、自动过审、换未经批准处理方或把unknown当成功。
5. 权限在异步期间变化，后续输出单元/媒体GET或Range/cache命中/实时/复制/AI发送完成/最终副作用重新admission。固定锁顺序、epoch、失效lease防在途旧资格。独立耐久拒绝事实持久化失败/unknown、恢复水位缺口保持拒绝，旧库不回退已生效拒绝。
6. 默认分页20、最大50，稳定排序/查询scope绑定cursor；先当前过滤再排序分页及摘要/count，输出再核。有效聚合与过滤后名单长度分开。DTO只注册字段，无源站Storage key、service_role、短信/模型秘密、无关私人原文。

## 参数效力与设计批准

正文采用Unicode17/UAX29 rev47用户可见字符；CRLF/CR→LF，组合Emoji一个、空白/换行计入，不trim改变正文。普通2000/长帖10000字符、图片9×10MB、视频1×200MB且300秒、GIF1×15MB、投票2–4选项/300–604800秒、用户名30天改名及旧名30天、10秒撤销/30天恢复、AI20成功/日及8000输入含上下文/2000输出为初始默认。MB=1,000,000字节。评论2000/DM4000/请求500/选项100及评论同类媒体大小是原登记工程初值；preload初始布尔未明确，不擅定。风险/OTP/MFA/费用金额及实际性能不拿厂商默认充用户批准。

DEC-001：换号成功T起连续24小时只禁止再次换号、主动注销、管理员角色/密钥/安全配置变更、插件敏感权限批准、生产启用、额外主动永久清理。退出/撤会话/举报/申诉可用，必要恢复受控人工；T+24h只解除冷却，其余权限仍核。其他session/plugin/回滚/再次验证不能绕过，不因“敏感”标签扩大禁止清单。

App/分享新页或设计变化先实际查看UI-SPEC/token/关联HTML，明确页面状态版本获人类批准；设计未变修复沿用，组件批准不授整页。后台直接完整Kiranism基准。布局复检本地稳定集成版单主题独立角色，仅看布局颜色遮挡可读性，不重复dark；功能交互由业务/API/组件/原生自动化。明显差异必修，细微渲染记建议，实质设计变化交用户。旧AC云端视觉地点措辞依此最新决定调整，业务断言不删。静态稿、沉默、AI自评不替人类批准或首次实际基准确认。

## 质量要求

<a id="qr-001"></a>

- **QR-001**：保持Expo/React Native/Expo UI、Supabase官方完整Compose/Auth/Postgres/Storage/Realtime自托管及完整Kiranism Next/shadcn；版本兼容与实际部署须核，依赖许可不冒充完整复用，Studio不替社区后台。

<a id="qr-002"></a>

- **QR-002**：日常实际变更/风险驱动目标测试与直接影响回归，保真实结果/必要失败日志；Actions按可用业务切片及发布需要独立复验，不是每次开发前置。

<a id="qr-003"></a>

- **QR-003**：完整产品覆盖移动双端、后端、后台、分享、AI/MCP、官方及受邀插件功能/接口/授权安全/回归/端到端/生命周期/配置变化，单端单页结果不替整体。

<a id="qr-004"></a>

- **QR-004**：正式功能验收实际启动相应客户端和真实隔离服务并联通，原生产物执行；mock可辅助定位，源码/编译/模拟不能替真实身份数据授权和跨端行为。

<a id="qr-005"></a>

- **QR-005**：实际各端检查设计布局样式、焦点触控、适用设备/字号/键盘/状态并留整页图/交互结果；视觉本地单主题独立复检，功能交互各层自动化，截图不替行为，网页不替原生。

<a id="qr-006"></a>

- **QR-006**：结果关联真实源码/产物版本、环境配置、范围、通过/失败；正式功能保Actions run与适用报告/日志/产物，本地视觉如实标来源，失败也留，证据无秘密及无关私人原文。

<a id="qr-007"></a>

- **QR-007**：失败/缺失/取消/超时/环境不可用/必需跳过/错版本均未通过；修复后窄复验影响行为，正式交付完成全部必需检查，不手改结果或沿用另一版报告。

<a id="qr-008"></a>

- **QR-008**：按实际业务依赖与固定接口迭代，三端可独立并行；本地高频及按需Actions并用，资源不足仅暂停直接依赖，费用/生产/安全边界按授权，保完整正式验收。

<a id="qr-009"></a>

- **QR-009**：生产独立长期部署，Actions只验证及经授权发布；dev/test/prod数据媒体账号凭据日志副作用真实隔离，云端通过不等生产确认，第三方继续批准处理政策。

<a id="qr-010"></a>

- **QR-010**：无未解决阻断/严重缺陷、未经授权泄漏、客户端秘密、重复效果或公开半成品；生产内容不混开发对话、AI自评、任务进度，保必要维护内容/有效测试/真实证据，不按关键词误删。

## AC-36技术与复用实查

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-36 | 实际移动工程基于 Expo / React Native + Expo UI、后台基于 Kiranism、Supabase 通过官方 Docker Compose 在自有 / 自管服务器部署，不依赖 Supabase 云端托管；Postgres / Auth / Storage / Realtime / Studio 管理及运维配置可验证，Studio 不替代业务后台。版本锁定与兼容证据可查，认证 / 业务替换示例配置，额外基础设施有明确缺口与成本依据。 | TECH-01–04 |

## 共享必要业务记录

记录逻辑名不等于待建同名表；UUID/服务端UTC/CAS、稳定ID、Auth手机号与业务身份分离、secret仅可信服务端ref、JSONB仅注册schema、环境真实隔离不靠行字段等约束保留。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| account | id→auth.users；status(active/cancelled)、phone_changed_at、sensitive_until、identity_epoch、registered_at | 注销立即拒登录；临时/永久处罚单独建模，非等同注销；DEC-001时间权威计算 |
| session_registry | session_id→auth.sessions、account_id、device_label、trusted_at、revoked_at、epoch | 当前有效Auth会话＋核心撤销两者核验，JWT历史有效不够；本人仅见必要会话信息 |
| admin_grant | account_id、role、operation_scopes、resource_scope、environment、expires_at、revoked_at | 五类PRD角色；无角色自授，无默认私人原文权 |
| stepup_challenge | id、account/session、action_digest、aal、verified_at、expires_at、consumed_at | 敏感动作一次使用，当前MFA/权限/DEC-001再核；不储可用验证码 |
| follow | follower_id、followed_id、created_at、state | 有效有向pair唯一，无自己关注；移除/取消立即撤该关系资格 |
| block | blocker/blocked、active、created_at、revoked_at | 任一方向有效均断双向关注/新联系；解除不恢复关系或请求 |
| user_preferences | account_id、follow_approval、dm_policy、read_receipt、typing、push/notification_categories、video_policy(always/wifi_only/never，初始wifi_only)、preload(boolean)、local_theme | 视频初始静音，蜂窝默认点击；preload=false关闭推测性媒体预取，不禁止本人主动播放所需缓冲；GIF再取当前可视区／省流量／减少动效条件；个人设置不授媒体读权，平台不能强开私信/回执；主题本机选择不新增账号同步 |
| mute_rule | owner、kind(account/keyword/topic)、target、active | 默认流/通知/主动AI过滤；显式搜索show_muted仍须当前读取资格 |
| audit_event | actor/session、operation、object/environment/plugin、reason、before/after_digest、result、request_id | 追加受控、普通API无改删，不记录秘密/无关完整正文 |
| operation | actor/session、environment、action、operation_id、payload_hash、result_ref、state | 唯一主体/动作/ID，同ID不同payload冲突；pending/succeeded/failed/unknown，查询结果当前授权 |
| outbox/inbox | event_id、aggregate_id/version、owner_plugin、lifecycle_epoch、effect_key、lease、attempt/result | 事务outbox，消费者effect唯一；重复可发生但效果不重复，停用/撤权后lease失效 |
| resource | 公共资源字段；kind(post/comment/repost/quote)、root_post、thread_id、source_id | 来源可见交集；quote链依赖任一失效整条含附加文字隐藏，不复制永久可读原文 |
| resource_dependency | dependent、source、kind(quote/thread_head/comment_post/media/ai)、source_revision、purposes | 有向依赖闭包/反向索引；评论中间父占位非级联全文隐藏，具体kind分别计算 |
| media_object | owner/plugin、bucket/object_internal_key、sha256、detected_mime/codec、size_bytes/duration_ms、state、data_class | allocated→uploading→uploaded→validated→reviewed→bound；failed/quarantined/orphan/cleaned独立；源站key不输出 |
| media_derivative | parent_media、kind(thumbnail/preview/segment)、hash、size、state | 继承原资源全部资格，独立清理责任；无匿名派生旁路 |
| deletion | target、actor、kind(user/moderation/account)、deleted_at、undo_until、restore_until、state、epoch | 真实删除时钟；10秒撤销/30天恢复当前核，管理处置无普通恢复；physical_removed终态 |
| dependency_hide | cause_deletion、affected_resource、previous_validity、hidden_at | 记录当次影响集，不新起删除期限；恢复head只恢复仍合法且当次连带对象 |
| retention_record | target/storage_ref、class、owner_plugin、trigger_at、due_at、rule_version、purge_state | 原时钟不随停卸/重装改；到期job主库判断，失败重试和责任可查 |
| retention_interest | target、subject/purpose、allowed_scope、expires_at、reason、grant/audit | 私信各方/恢复/案件合法需求分别保留，不授普通访问 |
| security_journal | seq、deny_intent_id、target/subject、action、policy_epoch、committed_result、timestamp、hash_chain | 独立耐久归档，普通写不可篡改；恢复不得回退，缺watermark不开放 |
| config_definition | key/owner、schema/default/range、scopes/priority、permissions、dependencies、effect_mode、existing_policy、evidence_refs | 全域唯一key，安全不变量非普通开关 |
| config_bundle/activation | version、scoped_values、schema/compat、state、effective_at、preview_digest、actor/audit、active_ptr | 完整不可变；draft→validated→ready→active/rejected；回滚新bundle，原子指针 |
| managed_document | id、stable_key、kind(community_rules/privacy/terms/processing_notice/help)、locale、owner、public_surfaces、active_release_id、row_version | 核心受控内容；环境／适用入口分别登记，不新增社区空间；正文由用户／获权公司人员提供，无模型虚构正式制度 |
| document_revision | document_id、version、title/body、content_digest、linked_release_refs、state(draft/ready)、row_version、editor、created_at | 版本唯一；draft编辑CAS，ready及已发布内容不可原地替换，修改产生新revision；渲染不得执行脚本或泄漏秘密 |
| document_release | id、document/revision_ref、content_digest、scope(environment/surfaces/purposes)、state、publisher、published_at、confirmation/audit_ref | 绑定正文／范围不可变；prepared→published→superseded或withdrawn留真实状态审计；权限／MFA／必要生产具体确认满足后原子切active指针；无自动回退旧制度，重新发布另建记录 |
| document_receipt | subject(account或注册verified_challenge)、release_id/revision_digest、presentation_ref、purpose、decision(presented/acknowledged/consented/declined)、occurred_at、request_id | presented仅记录展示版本、不授同意；acknowledged/consented仅来自本人明确动作，不把访问／展示／沉默当同意；注册成功原子绑定account/admission；本人查询，后台无通用全量原文入口 |

## 跨功能边界场景

以下保留业务断言；涉及云端的视觉地点依本文件最新分层执行，100%仅指登记适用集合，不作无限输入保证。

- **EC-01** 同邀请码、同用户名、同请求、同票或同提交发生并发：只产生一个合法结果／业务效果；冲突方得到真实状态，不能多端绕限。

- **EC-02** 权限在请求、生成、复制、媒体读取或发布确认期间变化：每个后续新访问以当前资格为准，缓存、旧令牌及历史成功不作授权。

- **EC-03** 多级引用任一来源失效：整条依赖引用及附加文字退出展示；评论中间节点删除和串中间项删除分别保留合法关系，不能统一级联删除。

- **EC-04** 编辑审核与再次编辑竞争：审核决定只作用于对应版本；首发／续写批次部分审核成功不公开半成品。

- **EC-05** 关闭审批不自动批准旧请求；关闭全部私信不取消原期限，但阻止接受；解除拉黑不恢复旧请求或关注。

- **EC-06** 直接私信、旧请求接受、自然过期并发：一个正常会话，初始消息只在合法显式接受后合入，终态及未读／提醒不重复。

- **EC-07** 本人删除单条私信后，对方引用证据、会话重现或备份恢复：独立保留不授予删除方普通消息／附件访问。

- **EC-08** AI 能检索但不能总结、或可阅读但作者不许相应用途：链接与实际生成内容按用途分别授权，不更换名称绕限。

- **EC-09** AI 依赖此前回答但来源追踪不完整：整条受影响回答隐藏；标题、摘要、复制与续问不能保留撤回信息。

- **EC-10** 停止 AI、超时或服务商费用结果未知：成功额度、实际成本与待对账分别记录，不重复扣额度或虚构免费失败。

- **EC-11** 配置生效／回滚与旧端缓存、期限到期竞争：完整版本与既有对象规则可查，不变无限额度、不复活结束状态。

- **EC-12** 插件停用时有在途任务或有效依赖：先显示影响，未经明确选定不联动；在途按受控排空处理，核心义务继续。

- **EC-13** 插件升级涉及敏感权限增量、不兼容结构或不可逆迁移：先审核并说明恢复限制，失败不标成功，不承诺无损降级。

- **EC-14** 云端开发环境有真实外部服务费用／副作用：未经对应测试准入不使用生产凭据，不向真实用户发消息或传未经批准数据。

- **EC-15** 旧端扩展不可运行但核心可安全兼容：局部不可用而非全 App 强更；只有核心无法安全兼容才强更。

- **EC-16** 只有一名管理员能处理申诉：最终复核保持待处理，兼任插件审核／发布不豁免独立申诉复核。

- **EC-17** 用户换号后尚在 24 小时窗口：逐操作执行 DEC-001，不能通过其他会话、插件、回滚、再次验证或高权限入口跳过；必要恢复仍为受控人工流程。

- **EC-18** 大字、弱色、长文本和归档尺寸冲突：优先可读与可操作，保留设计意图并记录适配，不以静态稿代替原生证据。

- **EC-19** 必需云端检查缺失、取消、超时、设备不可用或证据版本不同：记录未通过／阻塞，不能沿用其他提交结果或本地演示。

## 可验证产品结果

以下保留业务断言；涉及云端的视觉地点依本文件最新分层执行，100%仅指登记适用集合，不作无限输入保证。

- **SC-001**：PRD 55 个原验收场景与本规格补充场景的全部适用正常、异常、权限和并发结果均完成且通过，未解决阻断／严重问题为 0；必需未执行、跳过、超时或缺证据不计通过。

- **SC-002**：全部已登记多用户、关联入口、插件与环境越权用例的未经授权正文、摘要、媒体、名单、私信元数据、收藏行为或 AI 依赖输出为 0；每个系统可控撤权后新访问立即按当前资格拒绝。

- **SC-003**：邀请码、用户名冲突、首票、重复发布／评论／消息、请求处理和配置竞争用例中，100% 保持合法单一结果，不出现重复业务计数、额外资格、第二正常会话或公开半成品串。

- **SC-004**：普通帖 2,000／长帖 10,000 字符、各类媒体、评论附件及投票数量／时长默认边界的全部“边界内／等于／超出／非法组合”用例正确接受或拒绝，拒绝后用户正文及合法可复用附件不丢失。

- **SC-005**：100% 编辑审核用例在待审／驳回时只向读者提供最后通过版本，通过后只切换获审版；历史版本、详情、引用、检索及 AI 不泄漏待审或受限版本。

- **SC-006**：删除后 10 秒撤销及 30 天恢复窗口的边界用例按当前资格正确处理，首帖恢复只恢复当次连带有效条目；独立删除／限制、已结束请求或撤权数据错误复活数为 0。

- **SC-007**：私信请求与正常会话全部交叉用例保持一个正常会话，初始请求显式接受前在正常历史可读次数为 0；接受后只出现一次且未读／提醒不重复，单条删除后本人消息／附件正常读取成功次数为 0。

- **SC-008**：100% AI 社区事实来源用例的引用真实、相关且当前有权；无证据时明确无法确认。检索／总结／推荐许可、来源撤回、恶意指令及续问用例均符合预期，AI 写操作或跨用户越权成功次数为 0。

- **SC-009**：内测每日第 20 次成功及后续尝试、8,000 输入／2,000 输出 Token、跨重置边界和并发用例全部正确执行；重复扣同一成功额度、虚假完成、未经批准第三方转发为 0，未知费用均有可查待对账状态。

- **SC-010**：分享网页全部权限及收录用例提供正确阅读／占位／不收录结果；网页社区写操作成功数为 0，关闭收录仍合法可读，受限信息进入预览、源码或公开媒体次数为 0。

- **SC-011**：五类后台角色与会话／多因素条件的操作矩阵 100% 按授权执行，必要敏感动作均有理由和可追踪审计；原处置人独自最终复核申诉次数为 0，缺复核者保持待复核。

- **SC-012**：配置全部域、范围、版本及失败／回滚用例正确，关联部分生效、旧缓存绕限、配置复活撤权或关闭核心安全的次数为 0；用户能保留输入并理解当前限制／恢复状态。

- **SC-013**：首版全部官方业务默认启用并完成原验收；至少以两个插件及不同用户完成已登记跨插件隔离用例，未经授权读取／调用或副作用到生产次数为 0。

- **SC-014**：具备对应技术能力的开发者仅依据正式版本资料与工具，完成覆盖移动／后台／后端／权限的通用样例及云端调试、打包、生命周期和恢复验收；为该样例修改核心源码的需求为 0。

- **SC-015**：全部插件安装、停卸、升级、权限增量、依赖、迁移失败、四类更新及灰度用例正确；未经具体生产确认／名单范围生效、不兼容扩展下发、错误全 App 强更、重复发布及数据复活为 0。

- **SC-016**：UI-SPEC 登记页面及其适用加载／内容／空／失败／失权等状态全部有对应端真实可运行和交互证据；必需流程的大字、读屏、键盘、焦点、中文及播放检查完成，主操作遮挡／不可达或假成功／虚构能力为 0。

- **SC-017**：换号后限制窗口开始、24 小时内、恰好到期及多会话／插件入口用例全部按 DEC-001 执行；窗口内列明禁操作成功为 0，合法退出、撤会话、举报及申诉不受此冷却阻断。

- **SC-018**：分类到期、延期、共享保留、清理失败、插件缺席和备份恢复用例 100% 可追踪责任与结果；已生效删除／撤权／处罚／隐私状态在恢复后错误撤销为 0。30 天注销／主动删除 AI 清理、最长 7 天受控 AI 原文等已确认期限按分类真实执行。

## 补充边界验收

以下保留业务断言；涉及云端的视觉地点依本文件最新分层执行，100%仅指登记适用集合，不作无限输入保证。

1. **AS-01（FR-018、FR-034、FR-061、FR-065、FR-028；ED-01–02）**：**Given** 文字分别含中英文、组合 Emoji、空白和不同换行表示，且当前配置正文限额为 N，**When** 输入恰好 N 或 N+1 个用户可见字符并提交，**Then** 各端计数一致，N 按其他资格接受、N+1 拒绝并保留原输入；评论 2,000、正常私信 4,000、请求 500、单选项 100 初始边界分别覆盖，后台改有效值后同样执行。

2. **AS-02（FR-067；ED-03）**：**Given** 初始请求的双方实际阅读状态已知且其后已有合法正常消息，**When** 显式接受有效请求及多端重连，**Then** 初始消息按原保存时间稳定插入，仅一条；已读不变未读、未读从请求域转到会话仅一次，无新重复提醒；结束或过期未接受者不插入。

3. **AS-03（FR-005–006、FR-103；DEC-001）**：**Given** 本账号换号完成时间 T，**When** 在 T、T+24 小时之前及恰好 T+24 小时从正常／旧会话／插件入口执行列明操作，**Then** 限制期内拒绝并显示解除时点，到期仅解除冷却而仍检查正常权限；退出、撤会话、举报、申诉不受冷却，必要恢复走受控人工。

4. **AS-04（FR-140；ED-04）**：**Given** 已锁定投票、结束请求、已撤销私信访问和待清理对象，**When** 预览／应用／回滚期限及状态参数，**Then** 预览分别列出现有及新增对象生效方式，应用后不改锁定票、不复活请求或访问；真实不可逆风险未明确时不能假称安全执行。

## 暂定测量、观察与真实条件

核心API P95≤800ms、首屏≤2.5s、双在线DM实际展示≤3s、AI首有效≤8s/完成≤30s、10k注册/1k DAU/200在线、普通AI有用≥90%仍为暂定观察目标，不是生产SLA；来源真实相关当前有权100%及零泄漏独立硬约束。固定环境设备OS网络/数据分布/负载/样本量/窗口，成功失败超时unknown全入分母，不筛快样本。原工程测量起点10k合成账号/100k帖/300k评论/1m消息/200连接、70%读20%写10%媒体、预热5min稳定30min、每类≥1000请求每端任务≥100；调整记录依据，不偷改目标以通过。

真实观察邀请码兑换/有效激活、首帖评论DM/AI完成、D1/D7、活跃、请求接受举报block、AI反馈失败延迟费用、崩溃网络失败，定义分母/去重/窗口/样本并排除测试刷量；不默认保存私信草稿完整提示词当埋点。

Q-02机器网络/大陆上线与年龄核验、Q-03日期规模预算、Q-04真实服务及条款价格、Q-08风控/用户名格式/费用/既有对象生效/严格撤权/实测清理备份、Q-11域名真实制度责任人条款帮助、Q-16工具支持版本/隔离设备资源费用分别到对应节点核验。名称AgoraWeave及换号24h已决定不重问；Q-10真实AI扩展/认证仍后续不启用。文档齐全不自动批准真实服务、费用或生产操作。
