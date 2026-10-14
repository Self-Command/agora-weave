# AgoraWeave 云端验证与开发预览指南

本指南定义后续实现应提供的可执行路径，当前尚无产品工程／工作流／测试套件；下列工作流名和npm命令是实施接口约定，**本轮没有执行它们**。SP本地编写代码和测试；所有编译、静态检查、测试、代码复检、回归、预览、实际页面、视觉复检、原生交互与性能验收只在GitHub Actions云端运行。本地只编辑／阅读文件、Git及调度／等待／读取Actions。缺云端资源保留阻塞，禁止本地服务／模拟器／设备／本地runner补验。完整门禁／TDD／审查规则见[云端验证契约](contracts/cloud-validation.md)。

## 1. 前置条件与准入

最新责任分工见[决定登记](reviews/planning-decisions-2026-10-14.md)。用户处理预算、服务器、设备、签名渠道、外部测试及真实运营内容；以下是实际验证时所需条件，不是要求用户现在重复决策。工程在具体需用节点说明用途和最小权限并索取，缺供给保留未完成。

1. 在GitHub仓库先建立bootstrap入口、固定upstream Compose／工具SHA及无业务壳；首次云端解析lockfile／镜像digest，回传受审后在新提交immutable install。bootstrap聚合实际运行并登记后保护必需check，正式业务前取得ci-ready。未实现业务不阻断初始化，也不计为通过。云端取固定Expo/Kiranism/Supabase组合，单独lint；不得将Next build当lint。
2. 使用独立开发／测试Compose/Storage/账号/密钥/日志/网络，合成数据和A/B插件；无生产凭据、无生产用户资料。Q-02/03/16提供真实云端实例/分钟/存储/设备/费用许可，不能凭指南认为已取得。
3. 真实短信/推送/审核/AI测试先满足Q-04/16的测试通道、价格、数据区域、条款和批准，AI满足大陆推理/日志/存储/分包、不训练和告知。模拟可辅助，不代替必需真实集成；未满足时相应job是blocked/unavailable，整体验收不通过。
4. iOS签名/渠道账号、Android渠道、最低OS和当前OS运行资源、物理VoiceOver/TalkBack/推送/播放必须就绪。iOS Simulator不能跑VoiceOver；XCTest审计不能取代读屏真实流程。Actions必须取得设备报告/交互和提交关联；无资源不得跳过后判通过。
5. 固定实际runner image/toolchain，Linux支持Android硬件加速；macos-26选Xcode26.4.1。最低OS(iOS16.4/Android7)和当前OS为独立运行层，当前image缺旧runtime则云设备资源门禁阻塞。不得把deployment target等同已在旧OS运行。
6. 公司治理／隐私／条款／告知／帮助功能与页面完整验证，合成内容用于CI；正式文案由用户管理。ED-06不新增硬性申诉截止，首响应／完成提醒3／7工作日为可配置流程目标，无第二合格复核者保持待复核、不自动结案，不编造实际运营承诺。
7. Codex路线／工程核定模型和必要开发资料经核验境外处理已确认；用户供给API账户／凭据后工程核查模型／图像／结构输出及供应商策略，真实用户／生产资料禁发。不能以产品AI准入或桌面身份替代真实通道。缺AI通道不ci-ready；首个真实基准由用户本人届时确认，初始化壳截图不作产品基准。

### 1.1 首次初始化验收

按cloud-validation §2，先只写基础设施，Actions实际安装固定工具并运行真实Compose、网页与双端原生壳、测试发现／报告／截图差异／交互／归档清理、独立AI代码和图像审查探针、桥接版本适配与拒绝探针。无业务检查在初始化清单记not_yet_applicable及激活节点，禁止把缺测试脚本包装成成功。故意失败／零用例／错误SHA／缺报告／跳过／取消／未确认基准必须被聚合和桥接拒绝；保存原始失败与“预期拒绝被观察”记录，不伪造passed。

最先只提供可调度的最小配置／接口壳／日志通道；它能运行后，报告聚合、桥接门禁和审查适配等工程行为也用该Actions通道先测试Red再实现Green，不以初始化为理由先实现全部逻辑。项目门禁脚本只在Actions计算与验证，本地SP只读取匹配结果／报告及桥接元数据，不运行项目工具。

全部初始化必需项有同SHA的真实结果且已读取后才声明ci-ready，并切换业务阶段清单；不宣称任一业务AC通过。尚无workflow时先通过获授权初始化提交／PR事件建立入口；不得预设缺失工作流可以dispatch。正式业务资源／AI审查通道缺失则停在初始化／未就绪，继续已获授权的无依赖编辑，不改本地验收。

## 2. 调度接口（未来工作流）

本地可以使用GitHub CLI调度／等待／读结果，不启动项目。FEATURE_BRANCH必须是真实已提交分支／ref；COMMIT_SHA、RUN_ID、ARTIFACT_ID须换成真实对象。拟工作流接收target_sha并校调度ref／实际checkout／run身份，分支移动造成不符则拒绝，不能只信输入。没有工作流前不能把命令成功视为验证已完成。本轮不推送、不dispatch。

```powershell
gh workflow run ci-bootstrap.yml --ref FEATURE_BRANCH -f target_sha=COMMIT_SHA
gh workflow run tdd-cycle.yml --ref FEATURE_BRANCH -f target_sha=COMMIT_SHA -f phase=red -f behavior_id=BEHAVIOR_ID
gh workflow run verify-release.yml --ref FEATURE_BRANCH -f target_sha=COMMIT_SHA -f profile=full -f environment=ci
gh run watch RUN_ID --exit-status
gh run view RUN_ID --json status,conclusion,jobs,headSha,url
gh run view RUN_ID --log-failed
gh api --paginate "repos/OWNER/REPO/actions/runs?head_sha=COMMIT_SHA"
gh api --paginate repos/OWNER/REPO/commits/COMMIT_SHA/check-runs
gh api repos/OWNER/REPO/actions/artifacts/ARTIFACT_ID
```

命令只是控制面查询示例，不是完整门禁：watch只等待一个run，不能证明所有必需结果。桥接完成前按清单枚举当前SHA全部必需run／attempt／job，等待终态、取得并校验artifact、读取测试／AI审查／视觉／回归报告。`gh run watch`不支持fine-grained PAT的checks:read，实际选择获准GitHub身份或REST查询适配，不要求放宽至生产权。

正式产物按artifact_id经官方REST下载并自校raw/archive摘要，UI展示的报告也须匹配commit/runtime/config。失败后仅编辑/提交/读取云端结果迭代，重新dispatch受影响行为和必要回归，完整正式发行执行全部必需集合。生产工作流与验证/预览分离，验证dispatch输入不接受生产token或绕确认flag。正常提交／PR事件也必须触发聚合，不能仅依赖dispatch满足分支保护。

### 2.1 SP迭代及完成判定

business开始先取得start门禁，使用与canonical tasks一致的临时适配；适配中的测试命令只调度／读取云端验证，不直接调用本地npm test。TDD先在S_R运行并读取目标断言失败，确认因行为缺失才实现；S_G同目标及已有适用套件通过，再重构／修复并在final SHA取得新结果。oracle实质变化重新建立Red；不固定用例数量，不将构建／环境失败当Red。

每次任务勾选及报告完成前执行complete门禁，读取当前SHA全必需报告和审查处置、同版产物、基准确认及必要回归；任务工具退出码必须只在这些满足后成功。完成记录绑定SHA／清单／报告摘要和read_by／read_at。queued／running等待；failed／skipped／cancelled／timed_out／missing／unavailable／unknown及版本不符都未通过。等待超时保留未完成，不打印成功。新提交使旧完成记录失效，不能直接写旧handoff complete绕开。

## 3. Actions 内部执行约定

以下命令**仅在未来Actions job中执行**，不是让开发者在本地操作。脚本必须由后续实施提供、行为与本指南匹配；本指南不包含实现代码或测试套件。

| 云端job | 命令／阶段约定 | 预期结果 |
| --- | --- | --- |
| dependency-freeze（首次） | 固定官方提交，解析依赖并提交受审lock/digest清单；后续npm ci | 精确依赖、action SHA、Node/SDK/原生/DB版本报告；漂移失败 |
| bootstrap-readiness（仅初始化） | 云端执行无业务壳／服务／采集／审查通道与门禁拒绝探针 | 只证明基础设施就绪；未实现业务不计通过，缺必需探针不ci-ready |
| tdd-red／tdd-green | `npm run ci:tdd`（拟脚本，phase／behavior／case-set取受审清单） | Red目标语义断言真实失败且因果确认；Green同目标及适用套件／回归通过，绑定测试摘要 |
| service-prepare | `docker compose -f supabase/upstream/docker/docker-compose.yml -f infra/ci/compose.yml up -d --wait` | 同固定官方Compose，真实Auth/DB/Storage/Realtime/Edge/代理健康；不使用本地或托管替代 |
| schema-fixtures | `npm run ci:migrate`；`npm run ci:seed` | 核心/官方/插件受控schema，合成A/B/C/访客/角色、内容依赖和时钟夹具 |
| static-contract | `npm run ci:lint`；`npm run ci:typecheck`；`npm run ci:contracts` | 独立lint/type/schema/接口合规；不单独证明业务通过 |
| service-scenarios | `npm run ci:service`；`npm run ci:security`；`npm run ci:concurrency` | 真实接口/授权/DB/对象/事件/任务与竞争报告 |
| web | `npm run ci:build:web`；`npm run ci:run:web`；`npm run ci:e2e:web` | 真Kiranism/分享/插件页，Playwright连接真实隔离服务，页面/角色/视觉/键盘 |
| native-ios | `npm run ci:build:ios`；`npm run ci:e2e:ios` | Actions Xcode构建安装运行实际native，XCTest交互/截图/审计，连接隔离真实后端 |
| native-android | `npm run ci:build:android`；`npm run ci:e2e:android` | Actions原生Gradle产物、emulator真实流程/媒体/视觉/无障碍检查 |
| cloud-physical | `npm run ci:device` | Actions调度云端实际双端设备、读屏/键盘/媒体/推送，最小/当前OS，录证不是网页替代 |
| plugins | `npm run ci:plugins`；`npm run ci:developer-journey` | 两插件实际隔离、生命周期、三端从零样例/SDK/CLI/文档闭环 |
| ai-real | `npm run ci:ai:integration`；`npm run ci:ai:eval` | 合格真实模型/工具/来源/政策/限额/自动有标签评估；未准入不通过 |
| measurement-recovery | `npm run ci:performance`；`npm run ci:recovery` | 固定负载/失败分布、陈旧备份安全重放/对象恢复和清理证据 |
| ai-code-review | 固定Codex候选或另经准入工具，只读final diff／源码／需求／真实验证报告，真实模型调用 | schema合规findings／覆盖／证据；处置并当前SHA重审，缺工具／凭据拒绝 |
| ai-visual-review | 真实图像输入＋UI-SPEC／基准／页面矩阵／差异／交互报告，逐批云端审阅 | iOS／Android／后台／分享／插件适用各状态的语义审查及处置，不能只比较截图 |
| aggregate | `npm run ci:evidence` | 同发行必需check全passed才输出通过；任何缺证据/版本不匹配拒绝 |

云端服务测试与macOS/Android测试通过有TLS/访问范围/短期凭据的同一隔离场景环境联通，不能各端偷偷换mock。作业结束撤sandbox/凭据、回收临时服务，保留按类证据；Actions不长期托管生产。镜像拉取/启动失败是环境不可用，不算产品通过。

## 4. 验证场景与判定（全部首版）

| 场景组 | 操作与注入 | 必须观察到的真实结果 | 需求/原AC |
| --- | --- | --- | --- |
| V01身份 | 无/过期/用过邀请码、OTP猜测/重发/故障、同码竞争；撤会话/退出/换号/注销 | 至多一准入、不跳OTP、普通用户无后台；旧JWT后续拒；注销清理追踪 | AC-01–03/30/32；AS-03 |
| V02关系 | 改名/重名冷却、审批切换、请求各终态/到期、移粉/屏蔽/拉黑 | ID稳定；待请求不涨数、不自动批；分别30/7冷却，旧资格撤回，匿名无明细 | AC-04–07 |
| V03发布 | 所有帖子组合及N/N+1字符/MB/时长，伪格式/SSRFi；分块失败/丢响应/强关；草稿多端冲突 | 上传私有、原文保留、成功附件复用、同operation仅一效果、CAS选择，访客导入显式 | AC-08–09/17；AS-01 |
| V04串/审核 | 首发/续写一项待审/拒绝/媒体失败，旧版编辑再编辑竞审 | 不公开半串、旧串不因续写等待隐藏；只切获审revision，读者见最后通过版 | AC-10/14/37 |
| V05讨论投票 | 三层更深/删中间、评论关闭；首票vs改问题选项截止/结束 | 子回复合法保留，回复交集立即核；一票且锁三项，未投作者/访客无统计，终止不重开 | AC-11–13 |
| V06跨入口撤权 | A收紧/移除B/拉黑/删原帖，B持旧URL/JWT/缓存/WS/Range/引用链/通知/旧版/网页/AI | 撤权提交后每新访问拒、无正文摘要缩略图/元数据/附加引用文字；外部已收字节单列 | AC-06/10/14–16/25/27/31 |
| V07删恢复 | 10秒/30天边界、首帖恢复影响集、独立删除/处置、共享对象与到期 | 当前核恢复，独立失效不复活；不早删恢复副本、不误删他方；物理阶段真结果 | AC-15/21/32 |
| V08互动发现 | 重复点赞/转发/收藏、名单过滤、三流翻页/回位、搜索联想/count、无热度、精选 | 一效果/合法聚合，收藏私密，当前有权无重复，真实低数据提示、运营明确标记 | AC-07–08/16/18 |
| V09私信 | 陌生请求/后关注新直接消息/accept-vs-expire-vs-send、关闭全部/重开/拉黑、删单条/会话、回执 | 初始请求不提前正常读取，唯一会话/消息/未读/提醒；单条旧附件拒、对方独立；保存/接受/送达/读分离 | AC-19–21/54；AS-02 |
| V10AI | 六类功能/模型真状态/注入/用途交集/主动选择/粘贴/源撤回/后续答案/标题/复制/流/续问 | 只读、事实真相关有权来源100%，不能只删链接；不可靠整条隐藏，不能跨境或暗换 | AC-22–25/42 |
| V11AI额度 | 20次边界/并发/8k含上下文/2k输出/时区重置/停止/未知费用 | 成功唯一扣、未知待核、费用独立；无心跳/半截假完成，保输入、超预算停止 | AC-26 |
| V12分享 | 访客/有权及无权登录/机器人；直接调用逐路由白名单和所有私人GET、伪造channel/audience、旧cookie；受限/删除/媒体/源码/缓存 | 有权followers/self分享目标200且noindex，无权404或安全占位；share-read不能读本人草稿/收藏/私信/AI/后台或写社区；匿名元信息无受限正文 | AC-27/31 |
| V12A作者收录 | 账号false/逐目标inherit-allow-deny、CAS竞争、当前/历史已发帖及串/主页组合、陈旧enable作业、重新允许/删除/收紧 | 状态与接口真实生效；账号false不被目标allow突破，正文/媒体/依赖预览取交集，noindex/sitemap/主动收录同源；人的合法分享及App读取不变，AI用途不变，不保证外部缓存即时删除 | AC-27/31；FR-093/094 |
| V13治理 | 五角色矩阵、敏感证据/MFA/旧会话、举报失败/多报、处罚/独立申诉/无第二人 | 无任意私人读取；原处置不独审，缺人待复核；撤销只恢复该处置合法影响 | AC-28–30/37；AS-03 |
| V13A正式资料功能 | 合成规则/隐私/条款/告知/帮助录入-CAS-ready-预览-发布-撤下；错角色/MFA/正文digest/生产范围；跨端当前/历史/未发布读取；注册与AI适用版本竞争、明确动作/展示区分、帮助来源失效 | 正文用户负责但功能完整；不可原地改已发布正文、无权限/确认不激活、draft/withdrawn不泄漏；实际terms/notice/help版本可追，展示不冒充同意；缺资料只阻塞适用动作，不增老用户登录或公开查询逐次强制同意；旧帮助不被重述 | AC-01/22–23/28–30/42；用户答复16；现有数据期限 |
| V14配置 | 所有namespace/范围/冲突/同层多组/并发/bundle失效/旧缓存/reload/rollback | 唯一来源、完整版本，保输入、不无限、不关核心、不复活终态/锁票/撤消息 | AC-38–42；AS-04 |
| V15插件工具 | A/B从文档从零三端；未受邀/换包hash/缺依赖/冲突/跨用户插件环境/资源耗尽 | 自用同人也分步审；开发者仅提交；不改核心，有权明确共享，其他路径拒且证据齐 | AC-43–45/48–50 |
| V16生命周期 | 有依赖停卸/明确选定联动、在途副作用、权限增量、迁移失败、停用历史/卸载/重装 | 默认阻止、无自动卸载/清理依赖；epoch停新调用，历史只读或占位；原期限/核心义务/当前grant持续 | AC-43/45–46/50 |
| V17交付 | 四类/混合变更、无生产确认/冷却/换digest/扩灰、名单内外/旧新端、失败中断回滚 | 同版产物；所有生产影响先确认；明确名单/扩灰再确认；局部禁扩展/只核心不安全强更；不复活 | AC-47/51–53 |
| V18通知故障 | 关推送/多端未读/重连、各供应商独立故障/未知保存 | 真实持久消息；推送接受≠送达；不丢/重提醒、不跳验证/审核/模型政策 | AC-20/33–34 |
| V19原生/视觉 | 各端全部UI-SPEC页面、浅深/窄屏/大字/键盘/长文/加载空失败失权/插件停用 | 双端真实原生和对应web后台，截图+交互+读屏；无主操作遮挡/假成功/假系统栏/虚构认证 | AC-35/52/55 |
| V20技术/恢复 | 固定Compose完整服务、模板认证替换；陈旧DB+对象备份/安全日志缺口/插件缺席清理 | 既定栈同版真实运行；重放最新安全事实才开读，缺日志保持关，分类purge真结果和轮转 | AC-03/21/25/31–32/36/46/50 |

每组还须执行原AC完整正常/异常/并发和直接访问，不以表格摘要替代。SC-001–018逐项统计，失权新访问/秘密/重复业务/未授权生产/复活0为硬门槛，不能只报告平均性能。

## 5. 视觉、无障碍与测量矩阵

页面集合来自UI-SPEC §6，含注册/恢复/发布/详情/评论/关系/请求/AI/通知/个人管理/举报申诉/分享/后台/配置/插件/开发预览。每页适用加载/空/错误/提交未知/失权/删除/不兼容；浅深语义、窄屏（工程参考320pt或360dp）、100%/200%字号、长昵称/长文本、键盘与安全区。主操作按iOS44pt/Android48dp，必要正文对比4.5:1目标，错误有文字/焦点/读屏标签。

最新答复16的资料管理／版本预览／发布结果、移动及网页的条款／隐私／规则／处理告知／帮助页和本人适用记录同样纳入实际页面／状态矩阵，使用既有组件语义和样式。UI资料尚无该页精确画面时按文档补全流程呈现候选供本人审查，不自称已批准原型；正式文案仍用户提供，CI只用标识清楚的合成内容。

首次由Actions真实各端生成baseline-candidate，附已确认原型／UI-SPEC／token摘要、平台适配理由、AI视觉报告和交互／无障碍证据。无旧基准时按design_reference审查，不制造零diff；由用户或其明确授权的设计验收人确认具体候选摘要／覆盖矩阵后才成为基准，确认尚未发生时awaiting_confirmation，不宣称视觉通过。初始化壳和历史HTML自身均不作产品基准。

后续同设备/OS/字体快照0.5%像素差异作为告警，动态区域须预登记遮罩且不能遮内容/错误/授权状态；布局/遮挡/触达/业务状态为独立硬断言。即使低于告警值，AI语义／交互／权限失败仍拒绝。保存before／after／diff和审查结论；不能自动接受差异、update-snapshots或重拍择优。需改基准时保旧图与失败，附设计依据及适当批准，实质改变先用户决定，再云端审查新候选和重验。阈值是工程起点，稳定性核验后登记，不把像素相近代AI视觉或交互通过。

代码AI审查与视觉AI审查各为独立必需实际调用：分别存输入／图像摘要、提示／schema、工具／模型、请求／run／用量、覆盖及findings／处置。输出格式错误、拒绝、截断、漏文件／漏图、模型不可用或不能判断都阻塞。编写代理阅读并修复，当前SHA重审及必要回归；误报须独立核事实和反证，不自行忽略。视觉模型不能仅看静态图推定读屏或按钮已运行，代码模型不能代测试。

真正VoiceOver/TalkBack执行注册、发布、评论、私信、举报、处罚、申诉等流程；保焦点/朗读/操作报告与设备会话证据。自动audit、可访问性树、模拟器截图只辅助。视频/GIF检验播放/暂停/Wi-Fi蜂窝/静音/省流量/减少动效、文件真实格式，iOS/Android都必须通过；GIF picker不能静默降首帧。

性能使用plan TD-09固定夹具/样本/窗口/网络/资源；明确API端到端和服务端、冷/热启动、AI实际模型/上下文/并发。所有有效尝试分母，报告失败/超时/未知和p50/p95/p99；暂定值不能无测量写生产SLA。AI真实来源/授权100%与一般有用≥90%效力分开。

## 6. 失败修复、证据和生产边界

每run生成[release evidence](contracts/release-evidence.md) index，绑定同提交/产物/配置/环境/工具/页面状态/AC-AS/报告/截图/差异/交互，并关联TDD链、基准确认、开发AI审查／处置和报告读取。必需check缺失、取消、超时、跳过、环境不可用、真模型/物理设备未执行或版本不同都不能通过；失败同样上传脱敏证据。聚合须显式识别必需项，GitHub绿图标／neutral不作产品通过。修复后重验受影响行为和必要回归，正式发行完成全必需集合。报告使用合成数据，秘密/私人原文不入长存档。

生产另经超级管理员当前MFA和DEC-001核验对准确版本/权限/迁移/环境/名单确认，观察后扩大再确认；Actions通过不自动部署。预览/验证工作流不能写生产配置或执行迁移。实际生产发布/采购/外部真实消息均非本轮授权内容。
