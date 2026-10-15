# AgoraWeave 首版技术研究与工程决定

日期：2026-10-14。依据：获批 PRD v0.10 §21.3／22.2、spec v1.0（DEC-001、ED-01–04）、UI-SPEC v1.0、宪法 v3.0.1、独立规格复检。研究为只读官方资料调查；没有安装产品依赖或执行产品。本文的工程决定在既有授权内成立，产品及费用／真实服务／生产准入不因研究完成而自动批准。

**最新答复效力**：[决定登记](reviews/planning-decisions-2026-10-14.md)更新本文初次研究的候选／待确认描述。用户已确认公开仓库、Codex路线、工程核定模型、必要开发资料经核验境外处理、本人基准确认及阿里云短信。预算资源与部署上线运营用户处理，需要时具体索取；ED-05／06恢复与申诉参数已授权工程决定。实际API／设备通道、供应商策略与真实云端结果仍须核验，未选具体模型ID不等于重新向用户询问选型。

## 研究范围与核验方法

按 speckit-plan Phase 0 分派三个只读研究代理，分别核验移动／网页／云端设备，Supabase／撤权／恢复，以及插件／隔离／交付；均先读取仓库 AGENTS 与宪法。主代理合并原始来源、核对需求和技术缺口。所有实际兼容性、性能、安全及原生体验结论仍须来自后续 GitHub Actions；官方声明不能替代产品验证。

技术上下文的工程机制已作如下选择；本次追加RD-11–13，具体化初始化、桥接和审查路线。开发AI工具是待准入候选，模型、代码／截图处理条件、账户／预算以及首个实际基准确认未作既定决定。Q-02／03／04／08／10／11／16与新增CV-D01／02、CV-V01按plan节点登记，不能视为机制已规划就允许外发、付费、业务开发或上线。

## RD-01 — 兼容版本和复现边界

**Decision**：移动采用 Expo 57.0.28 官方关联组合；后台采用固定 Kiranism 快照，保留该端 React 补丁，不强行与移动统一。共同 Node 为 22.23.3 LTS。Supabase 采用官方完整自托管快照，不逐服务混搭。依赖均记录于下表；SDK 关联的范围在 Actions 首次建立 lockfile 时解析为精确版本，之后 frozen install，镜像固定 digest，Actions 固定 action commit SHA。当前仓库只有资料，没有已经生成的 lockfile／镜像 digest。

| 对象 | 官方核验基线 | 兼容约束／证据边界 |
| --- | --- | --- |
| Expo | 57.0.28；发布 2026-10-12；gitHead `58da4edafcb043872c3ed9bf8f5957e6544d0a9c` | SDK 57 发布 2026-06-30；不使用旧 beta 组合 |
| 移动 React Native／React | 0.86.3／19.2.3 | 使用该 expo 快照 bundledNativeModules，不追各自最新版 |
| Expo UI／Router | ~57.0.23／~57.0.26 | 范围内精确补丁由云端锁定；官方 UI 已为双端稳定 API |
| expo-image／image-picker／video／updates | ~57.0.5／~57.0.20／~57.0.5／~57.0.26 | 与固定 SDK 一起解析验证 |
| Node | 22.23.3，Jod LTS，2026-09-23 | 高于 Expo 所需 22.13.x；工具包按各端官方依赖锁定 |
| Kiranism | commit `7705dfc0d13889e45c26a55ad5908da6a7a9a605`，2026-08-24 | Next 16.2.12／React 19.2.4／TS 5.7.2／Tailwind ^4.2.2；shadcn 源码随快照 |
| Supabase | `self-hosted/v0.8.2`，commit `564eab8ad7840b13324f68b1bfac074ef8d51c21`，2026-09-23 | 官方整套 Compose；默认 Envoy，Postgres 17.6.1.136 |
| 原生平台 | iOS ≥16.4；Android ≥7；Android SDK 36；Xcode ≥26.4 | 作为工程支持基线，真实渠道与设备资源准入在 Q-02／16；云端记录 image、OS、Xcode、JDK、Gradle 和架构 |

**Rationale**：宪法既定栈和 TECH-01–04 不允许以另一个后台、托管 Supabase 或 WebView 解决困难；固定官方关联组合可减少独立漂移。SDK 56 曾有 Hermes 内存回归，采用官方后续 SDK 57；仍需实际长列表／媒体／内存回归。模板 Clerk 示例不是产品认证，移除 Clerk 业务接入与示例数据，接 Supabase 手机／MFA 和逐操作权限。

**Alternatives considered**：滚动 latest、逐服务更新、两端硬统一 React、模板原有 Clerk、旧 beta Expo UI 均不选。不把此表当已完成组合运行验证。

来源：[Expo SDK 57](https://expo.dev/changelog/sdk-57)、[SDK 参考与平台要求](https://docs.expo.dev/versions/latest/)、[Expo 包元数据](https://registry.npmjs.org/expo/57.0.28)、[Node 发布](https://nodejs.org/en/blog/release/v22.23.3)、[Kiranism 固定 package](https://github.com/Kiranism/next-shadcn-dashboard-starter/blob/7705dfc0d13889e45c26a55ad5908da6a7a9a605/package.json)。核验日 2026-10-14。

## RD-02 — 核心和官方业务模块

**Decision**：TypeScript 工作区；原生 App、Kiranism 后台、独立只读分享页、核心 API／控制面、官方模块、插件 SDK／工具／文档分别成包。核心运行于自托管 Supabase 网络内，使用受控 Edge Functions 及核心后台 worker；不新增另一个后端产品。Postgres 保存权威数据，Storage 私有对象，Realtime 为内部事件输入。初期用 Postgres 全文／trigram 检索、SQL 排名和事务 outbox；不先引入独立搜索集群、Redis、Kafka、Kubernetes 或向量库。

**Rationale**：首版 10,000 注册／1,000 DAU／200 在线是暂定测量规模，不足以证明需要额外集群。模块独立边界满足 PLT-02，官方社交／AI 全部默认启用；核心保留删除、撤权、审计、配置、保留与生命周期职责。模块和依赖见 plan，不把逻辑模块误写为每模块一个生产数据库。

**Alternatives considered**：所有业务塞单页模板、微服务全拆分、独立搜索和机器学习推荐分别不满足维护／需求／成本依据；后续测量证实缺口时再在授权范围评估，不能删功能。

## RD-03 — 权威身份与严格撤权

**Decision**：所有业务读取、媒体和实时输出均经过核心网关。原始 DB、Storage、Realtime、Studio 和对象源站无公共旁路。Auth 的必需手机／MFA 协议由网关受控代理，关闭未批准登录方式；即使直接协议调用，也不能越过注册资格和核心账号有效性检查。每请求验证 JWT 签名／issuer／audience／expiry，核 `session_id` 的当前会话、撤销记录、账号、角色、环境、插件、对象与依赖。DB 业务角色最小 grants＋RLS 作第二道防线；当前资格从主库读取，不用 replica 或 TTL 正授权缓存。

媒体不下发 Storage 签名或重定向源站；GET／HEAD／Range／条件请求／缩略图／分片／下载／缓存命中都先核当前资格，失权不返回 304。对外 private,no-store；Next 数据缓存／图片优化／service worker 不缓存可撤权正文或派生物。字节内缓存允许，但每次命中重新授权。新导航、复制、前台恢复和离线重开不得只读本机旧受限缓存。

撤权提交为权威线性化点；撤权事务提升会话／账号／关系／资源／用途的策略 epoch，写持久拒绝事实并使所有后续新访问拒绝。在途生成、长媒体、实时逐输出单元再核。访问与撤权使用一致锁顺序和事务／输出 admission 协调，不能依赖异步通知成功或过期窗口；已送出的字节无法收回，后续单元停止。最终实现若做不到 SC-002／AC-31，则记录缺陷，不能改成 60 秒允许窗口。

**Rationale**：JWT 尚未过期不等于会话当前有效，RLS 高权限绕过和 Realtime 连接缓存都存在；签名与 CDN TTL 不是资格。本方案直接落实 S23／FR-004／044–052／108–110／122。

**Alternatives considered**：短 JWT、60 秒签名、直接私有频道、客户端菜单隐藏、仅事件失效、托管 Smart CDN 默认保证均不选。

来源：[Auth sessions](https://supabase.com/docs/guides/auth/sessions)、[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)、[私有媒体与签名](https://supabase.com/docs/guides/storage/serving/downloads)、[Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)、[PG17 显式锁](https://www.postgresql.org/docs/17/explicit-locking.html)。核验日 2026-10-14。

## RD-04 — 幂等、发布、关系与私信事务

**Decision**：唯一逻辑 operation_id＋payload hash＋主体／环境／动作唯一约束；未知结果先查询，重试复用 operation。PostgreSQL 行锁、唯一／部分唯一索引和短事务保证邀请码、用户名、首票、请求接受／过期、唯一正常会话。版本审核绑定 revision_id；最后通过指针只切获审版。串批次只有全部条目及媒体／审核就绪后，事务切整批 published。数据模型保留草稿 CAS 冲突、评论中间占位、串首帖依赖、引用传递依赖、删除独立时钟与恢复影响集。

私信请求初始消息为独立 request 域；新合法直接消息可创建唯一账号对正常会话，但不得查询出该初始消息。显式接受锁请求／账号对，重查时间／拉黑／关闭全部／处罚，单次合入原消息 ID 和原时间，读状态迁移而非新增，outbox 消息提醒去重。各参与者逐消息访问资格独立；删会话只改列表可见性，删单条永久撤销本人的正常资格。

**Rationale**：对应 ED-03、AS-02、AC-09–17／19–21／37／54；依赖关系不能统一级联删除。事务 outbox 将业务与事件持久保存，消费者 effect_key 幂等，不声称网络 exactly-once。

**Alternatives considered**：全靠客户端防连点、请求自动合入、单一会话 hide flag 代替逐消息撤权、审核最新指针不绑定版本均不选。

## RD-05 — 产品只读 AI 与来源闭包

**Decision**：内部 MCP 协议基线 2025-11-25，由核心代理绑定当前请求用户；AI 进程无 DB／Storage／service_role／管理工具／任意网络。tools/list 仅契约白名单，参数有范围，readOnlyHint 只是描述，实际由 broker 拒绝写入。会话改名／删除／反馈等用户命令走确定性业务服务，不给模型写工具。

工具返回来源版本＋用途集合＋完整依赖闭包；混合检索／总结／推荐取所需许可交集。主动选受限内容／本人私稿绑定选择和告知版本，禁止私信、证据、待审及旧版。每次向模型发送、输出单元、历史／标题／复制／续问重新核；不能可靠追踪则整条回答及传递依赖隐藏。匿名广泛索引只含合法公开候选，索引不是授权源。首版关键词／SQL 检索已能覆盖查找／总结／相关／热门，不为语义检索预设额外供应商。

采用 quota reservation→成功结算、失败释放、结果未知待核、成本独立对账；时区初始 Asia/Shanghai（工程选择），唯一 request ID 防重复成功扣量。精确 tokenizer 由获准模型适配器提供，输入含检索上下文，不支持计数不能启用。没有合格服务时返回真实不可用；完整 AI 首版依然需要获批真实模型验收，模拟不可宣称通过。

**Rationale**：AI-01–20 和宪法第三条；只读提示词、链接删掉、会话快照均不构成边界。

**Alternatives considered**：高权限 Supabase MCP 接模型、模型动态工具／URL、自动换处理方、检索改名绕总结许可不选。服务商未被擅自选定。

来源：[MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)、[MCP 安全](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)。HTTP 对外 MCP 若后续开放，须完整资源受众与授权协议，首版不因内部 MCP 自动开放公共客户端。核验日 2026-10-14。

## RD-06 — 配置、现有对象与安全恢复

**Decision**：参数注册＋不可变完整 bundle＋主库激活指针。覆盖序为全局默认→环境→该模块／插件→显式授权用户组；作用域包含目标环境和 owner。同层多用户组冲突必须声明唯一优先级，否则拒绝，不能按偶然遍历顺序。单次业务事务固定一个兼容配置版本，当前权限／删除／用途仍实时核，不被固定 bundle 冻结。切换原子，重载所需 consumer 就绪后才激活，否则保留旧完整版。

长度／上传／新请求／预算按执行时当前规则；请求 expiry／冷却、恢复截止、投票原截止与保留起点在创建／状态转换时固化。期限变更默认仅新对象，修改有效既有对象必须预览专门迁移且不复活终态／撤权，不早毁恢复副本；回滚是新 bundle，不回滚业务事实。敏感凭据只保存 secret_ref。

恢复使用独立于业务备份回退的安全日志，收紧前先耐久登记拒绝意图，随后业务事务和结果；未知拒绝保守保持并对账。恢复隔离环境必须达到最新安全 watermark，重放注销／删除／撤权／处罚／隐私／AI 用途后再开读取；缺日志／版本不明保持关闭。备份覆盖 DB 与 Storage 实体分别验证，90 天轮转与 RPO／RTO 仍按原节点确认和实测。

**Rationale**：CFG-01–13、ED-04／AS-04、DATA-01–04；插件缺席不停止核心保留作业。

**Alternatives considered**：逐字段分发、本机默认授权、配置回滚回滚权限、仅 DB dump 代表全部媒体恢复均不选。

来源：[PostgreSQL17 backup](https://www.postgresql.org/docs/17/backup.html)、[Supabase backup 覆盖边界](https://supabase.com/docs/guides/platform/backups)。后者只说明对象覆盖，不选托管备份。核验日 2026-10-14。

## RD-07 — 插件包、隔离和生命周期

**Decision**：包为有界 `.awplugin` ZIP（manifest、声明式三端 UI、服务端 bundle、受控迁移、文档和测试引用），核心校验归档路径、解压限额、hash、邀请来源、版本审核与权限增量。UI 采用正式声明式 schema＋平台组件／动作 broker：Expo UI 和 shadcn host 渲染，插件不执行任意客户端 JS／DOM，不得到 Supabase token。页面、路由、组件插槽、表单与受控事件足以覆盖正式样例；新 host/native 能力走版本化平台契约及云端重建。

服务端代码在每插件独立受限 Deno 容器，固定无 root／只读文件系统／CPU-memory-PID-time 配额／无 host socket／无生产秘密；网络仅至 capability broker，拒绝任意外联网。受控 SQL 迁移以该插件无 BYPASSRLS、无核心 schema grants 的 owner 执行，不能交出超级数据库角色；共享读取只能走原模块 API。每次 broker 调用校用户／资源／插件／环境，事件 payload 也重核。官方 Edge runtime 在可信核心网络，不能把同进程 Deno 或普通函数环境当敌对插件隔离。

停用提升安装 generation 并关闭新 admission，旧任务在最终副作用前重核 lease；短事务可在关闭的线性化点前完成，其后取消／拒绝并记录排空事实。依赖默认阻止，明确选定的联动仅停用，不自动卸载。卸载去代码／撤 capability，结构与数据独立保留；核心持有安全的历史投影、保留登记和清理责任。无安全 renderer 仅占位。兼容重装重核新审核与权限，不恢复 tombstone 或重算期限。

**Rationale**：PRD §21.3／22.2、Q-16 明确授权包／SDK／隔离选择；EXT／PLG／TST 要求隔离真实有效。共享同运行时任意插件代码可窃取核心 session，代码审查不能单独当权限隔离。

**Alternatives considered**：任意 JS 动态注入同 App、后台 iframe 任意网络、全部 Edge function 共用 service_role、无限 SQL migration 和依靠 prefix 隔离均不选。容器和 OS 权限是组合措施，逃逸／资源耗尽仍须云端负向实测，不称绝对沙箱。

独立插件Deno锁2.9.6（2026-08-27），镜像digest在云端冻结；核心使用官方Compose内置Edge Runtime，不以此覆盖它。来源：[Deno v2.9.6](https://github.com/denoland/deno/releases/tag/v2.9.6)、[Deno 权限](https://docs.deno.com/runtime/fundamentals/security/)、[Docker 安全](https://docs.docker.com/engine/security/)、[Docker资源限制](https://docs.docker.com/engine/containers/resource_constraints)、[PG17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)。核验日 2026-10-14。

## RD-08 — 更新、生产确认和证据

**Decision**：移动 runtime 使用明确版本 ID，原生 fingerprint 比较为门禁；不用 experimental fingerprint policy 当保证。四类变更按最高要求合并：纯现有配置、服务／后台／DB、兼容移动更新、新原生／不兼容重建。兼容 expo-updates 服务可自托管，Actions 构建与签名，避免依赖外部 EAS 托管作为唯一构建／数据路径；渠道及协议真实兼容仍需云端核验。

指定名单由服务端当前 eligibility 决定；百分比 rollout 不能替代实名名单。客户端版本／契约／native capability 仅用于兼容选择，不授数据权限。服务端拒绝不兼容 descriptor／代码／动作；安全旧核心继续，局部扩展提示更新，只有核心确实无法安全兼容才全 App 强更。

生产 broker 验超级管理员当前 MFA、近期 challenge、DEC-001、具体 digest／权限／迁移／环境／名单摘要确认，再给 Actions 单次短租约；包括生产部署、迁移、权限与版本替换的每一影响动作。扩大名单生成新确认，审批后计划／产物变化使旧确认失效。Actions Environment 是附加锁，非产品管理员授权证明。

**Rationale**：私库 GitHub 套餐不一定有 required reviewers／attestations；不能默认功能存在，也不能只 workflow_dispatch 按钮表示超级管理员生产确认。所有 evidence-index 关联 SHA、bundle、runtime、各端 digest、run ID、用例状态，正式证据存受控持久档案，报告分类清理，不能假定 Actions run 永久保留。

**Alternatives considered**：EAS 百分比替名单、上传即启用、任意 OTA 免重建、检查一个包后发布新包、仅 GitHub reviewer 代业务确认均不选。

来源：[Expo runtime](https://docs.expo.dev/eas-update/runtime-versions/)、[Update 部署](https://docs.expo.dev/eas-update/deployment/)、[自定义更新服务](https://docs.expo.dev/distribution/custom-updates-server/)、[GitHub environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment)、[Artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations)、[OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect)。核验日 2026-10-14；部署身份匹配实际 repository_id／workflow_sha／environment，兼容实际 OIDC subject 格式，不猜旧字符串。

## RD-09 — 原生 UI、媒体和云端真实验收

**Decision**：Expo Router 组织五入口和侧栏；Expo UI 原生控件、RN 长列表／文本／布局和 expo-image／video 完成已有界面，不用 WebView 产品。主题使用已有语义 token，本机跟随系统并可选浅／深，无账号同步新功能；中文系统字体动态缩放，iOS 44pt／Android 48dp 最小主触区，正文对比目标 4.5:1，状态配文字与读屏。token 的弱色可调整并记录原生适配，不改归档源。

首版图片 JPEG／PNG、动态 GIF、视频 MP4 容器 H.264＋AAC 为受控输入清单；拒绝伪格式／不支持编码并保留输入，不扩复杂转码。HEIC 选择后可用 SDK 成熟转换到受支持静态格式并明确失败；未经双端云端验证不加到直接服务清单。上传入口／Storage 大小联动以支持 spec 的 200 MB 视频；官方默认约 50 MiB 不可照抄。所有媒体 GET／Range 仍走 RD-03。

Actions Linux 跑整套真实 Compose／权限／并发／生命周期／浏览器 Playwright／性能；macOS 跑固定 Xcode 的 iOS 原生产物与 XCTest；Android 云端 emulator 跑原生产物与 UIAutomator／Espresso。用户已按ED-14决定今后只有模拟器设备层，撤出旧物理设备验收前置，最低/当前OS均独立实际运行；原生语义／焦点／键盘／媒体／支持的推送及辅助技术仍须实际证据，不支持的硬件流程按[模拟器验收范围](contracts/simulator-validation.md)明示not_applicable及未验证风险，不能标记passed。预览由 Actions 运行隔离环境、产出录像／截图／轨迹和受保护限时远程视图，不能要求本地启动。

**Rationale**：ED-14是用户对验收设备范围的明确变更，读屏适配本身仍要求实现。Apple既有辅助技术指南说明Simulator的VoiceOver限制；2026-10-15复核官方symbol metadata，新 `XCUIVoiceOverService` 的iOS可用性为27.0，不能据此声称已锁iOS16.4／26.4.1可执行；系统audit与语义/焦点流程分别记录，均不冒充真实VoiceOver用户验收。模拟器资源与预算仍为Q-16／03真实条件，不假设已有新runtime或API。

**Alternatives considered**：仅网页截图、Expo Go 代实际 native build、仅模拟器 VoiceOver、仅静态 token 对照、本地 runner 后备均不选。

来源：[Expo UI SDK57](https://docs.expo.dev/versions/v57.0.0/sdk/ui/)、[Expo Video SDK57](https://docs.expo.dev/versions/v57.0.0/sdk/video/)、[Expo Picker GIF约束](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/)、[Android真实媒体格式](https://developer.android.com/media/platform/supported-formats)、[Apple accessibility testing](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app)、[Apple accessibility audit](https://developer.apple.com/documentation/accessibility/performing-accessibility-audits-for-your-app)、[云端macOS26软件表](https://raw.githubusercontent.com/actions/runner-images/main/images/macos/macos-26-Readme.md)。核验日 2026-10-14。云端选择Xcode26.4.1并记录实际image；当前image缺最低OS运行时须Q-16云端设备补齐，不等同编译下限已验。

## 官方Compose及Actions锁定补充

官方self-hosted/v0.8.2对应Studio2026.09.07-sha-7996410、Envoy1.39.1、Auth2.196.0、PostgREST14.17、Realtime2.134.10、Storage1.74.0、imgproxy3.31.4、postgres-meta0.99.0、Edge Runtime1.76.2、Postgres17.6.1.136、Supavisor2.9.12；整套来源[固定Compose](https://raw.githubusercontent.com/supabase/supabase/self-hosted/v0.8.2/docker/docker-compose.yml)。实际拉取后登记digest，不以标签永久不可变作假设。

官方Actions基线：[checkout7.0.1固定SHA](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1)、[upload-artifact7.0.2固定SHA](https://github.com/actions/upload-artifact/commit/cf430e030ddbb5b0abf93d22962f4752f3646cd9)、[attest4.2.2固定SHA](https://github.com/actions/attest/commit/1e69f48acb82d1966a394da916b4c1698aa569d6)。checkout/upload内置Node24，最低runner2.327.1（特定容器内认证Git需2.329.0），不与产品Node22混为一件事。attest私库需Enterprise Cloud，保留可选身份；[官方artifact保留](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)默认90天、public上限90/private上限400，自2026-10-01也影响run/check。当前未核到download-artifact准确SHA，明确选官方REST按artifact_id取并核hash，不冒写最新版。核验日2026-10-14。

## RD-10 — 工程初始参数、成本和性能

**Decision**：保留 spec 所有已确认默认值与 ED-02。字符计数以 Unicode 17.0.0 UAX #29 revision 47 Extended Grapheme Cluster 为共同语义，CRLF／CR 归一 LF 后计数，组合 Emoji 1 单元，空白计入，不修剪正文；共同模块附官方向量，跨 Hermes／Node／Deno 在云端核同结果，不能依赖各 OS ICU 漂移。

风险／基础参数为可配置工程起点：OTP 5 分钟、重发 60 秒、每 challenge 最多 5 次失败、每手机号 5 次发送／小时及 10／日，IP 30／小时（可信代理识别，手机号只存受控 hash）；后台闲置提示 15 分钟、敏感 challenge 5 分钟且绑定动作摘要一次使用；普通认证 JWT 10 分钟仅减轻暴露、不作撤权机制，会话可信度仍由当前状态验证。用户名初始 3–30 ASCII 字母／数字／下划线、大小写不敏感，昵称中文不受此规则；保留词列表由真实品牌／治理配置提供。适用费用／滥用与体验验证前不称最终风控标准；不得扩大 DEC-001 禁操作清单。

普通 API 超时 10 秒、链接抓取 5 秒／2 MiB／最多 3 跳、AI 总期限 60 秒、工具 ≤8 次／单结果≤20条为工程保护；抓取 DNS 每跳重核、拒私网／本机／metadata／非 HTTP(S)，AI 不使用该外链抓取能力。基础页大小 20、最大 50。性能使用 PRD 暂定目标，明确全部尝试分母，不筛快请求。预算金额无授权不能猜，缺 AI 金额配置／合格模型时停新付费调用而保留完整功能待验。

**Rationale**：PRD §22.2 授权参数细化；明确可配置假设比把供应商默认冒称用户批准更可追溯。性能／容量和 ≥90% 普通 AI 有用性仍暂定，授权／来源 100% 和泄露 0 为硬门槛。

**Alternatives considered**：字节数／UTF16 长度、厂商默认无记录、无限超时／调用、预算未知却实际扣费均不选。

来源：[Unicode17 UAX29 rev47](https://www.unicode.org/reports/tr29/tr29-47.html)。官方算法只是字符语义依据，成熟实现复用与 conformance 由云端锁定核验。

## 研究结论及剩余节点

本节原研究结论继续有效，本次补充决定／候选见下方RD-11–13；不改变获批产品基线。

未发现要求修改获批范围、栈、严格撤权或验收标准的实质性冲突。官方默认能力的缺口已被明确的网关、隔离和交付设计承接；不可据此宣称实际成功。新冲突按宪法第九条仅暂停依赖工作、报告影响和选项等待用户决定，不自行改变条件。

计划可以进入 Phase 1。以下仍是执行前条件：Q-02 实际大陆服务器／网络／备份；Q-03 预算／日期；Q-04 合格短信／审核／推送／AI 真实准入；Q-08 参数风险验证／性能／备份与 RPO-RTO；Q-11 域名／制度／处理告知／申诉合格责任人；Q-16 Actions 云端模拟器资源／预览／真实外部测试许可（ED-14不再要求物理设备）。Q-10 新范围默认不启用。没有把任一条件记作通过，也没有重问已确认决定。

## RD-11 — 先验证CI基础设施，再开发业务

**Decision**：同一个项目聚合check按受审阶段清单检查；bootstrap-only只初始化固定工具／锁文件、真实Compose、网页与双端原生壳、采集／归档／审查通道、门禁拒绝探针。全部实际结果齐备才ci-ready。未实现业务在该阶段not_yet_applicable、不计通过；相关业务开始激活，首版全量检查不能豁免。详细执行与拒绝语义见[cloud-validation §2](contracts/cloud-validation.md)。

**Rationale**：现有quickstart先要求业务脚本和lockfile，却没有首个工作流／脚本如何产生及验真路径。GitHub自身接受部分skipped／neutral结果，路径过滤会使必需check挂起，依赖失败会跳过后续job；因此需始终运行聚合、显式审报告并检查必需集合。首次解析锁文件回传新SHA后重新验证，避免旧结果证明新输入。

**Alternatives considered**：先写业务再补CI、要求所有未实现业务test阻断首次初始化、缺脚本用--if-present、全部skip后绿色、取消后不产报告视成功、手动关闭保护均不选。dispatch用于控制运行，push／PR产生必需check；保护状态与项目验收分开。

来源：[GitHub必需状态排障](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)、[手动运行前置条件](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)、[workflow runs API](https://docs.github.com/en/rest/actions/workflow-runs)、[check runs API](https://docs.github.com/en/rest/checks/runs)、[gh run watch](https://cli.github.com/manual/gh_run_watch)。核验日2026-10-14。watch只等待一个run，且不支持fine-grained PAT的checks:read；不能作为全集合证据检查。

## RD-12 — 现有桥接缺口与云端TDD／完成协议

**Decision**：保留SK canonical契约和SP执行职责，规划项目start／complete证据适配与单一状态转换入口、非bridge自身命名空间mandatory before／after_implement检查，实施时云端验证其无法绕过。证据索引独立存储，不手加现有handoff固定字段。bootstrap-only与business双模式，开始业务要ci-ready；完成要当前最终SHA全部必需结果、实际报告读取、TDD链／AI审查／基准与必要回归满足。

TDD S_R先测试提交，Actions真实断言因行为缺失／真实缺陷失败、读取确认后才实现；S_G同测试Green与已有适用套件／回归，最终SHA再验。测试从FR／AC／边界／异常推导，不固定数量；环境错误不作Red、修改oracle重新建有效Red。SP临时adapter只派生canonical任务与本验证契约，任务测试命令在本地仅控制Actions，不能套用技能npm test的本地示例。

**Rationale**：只读核现有脚本：guard五条职责规则并默认allow，无云端结果检查；update-handoff的complete对缺规格豁免、契约漂移／未勾任务仅警告，且重建固定字段；convergence看规格快照／任务ID／事件不校实现SHA和实际云端报告。SP task-done只看给定命令exit0，故未来须让该命令消费当前任务／SHA的真实门禁结论，不能直接gh watch就勾选。

**Alternatives considered**：只提示代理“记得检查”、仅打印钩子、review requested即通过、只校checkbox、一个run绿或旧SHA绿、在handoff手填证据、自动把延期首版任务排除均不选。修复和等待保未完成，直接旧脚本的complete不能作项目有效结论。

本地依据：[bridge执行协议](../../.agents/skills/speckit-superpowers-bridge/SKILL.md)、[guard实际规则](../../.specify/extensions/speckit-superpowers-bridge/scripts/powershell/guard-command.ps1)、[handoff实际写入](../../.specify/extensions/speckit-superpowers-bridge/scripts/powershell/update-handoff.ps1)、[convergence校验](../../.specify/extensions/speckit-superpowers-bridge/scripts/powershell/prepare-convergence.ps1)、[hooks注册](../../.specify/extensions.yml)。同时只读核安装的SP7执行／TDD／verification技能，不在本轮执行实现技能或改脚本。

桥接文字仍为SP6.4.2 adapter，实际安装SP7.0.0可识别Task N，但还需红绿／Expected／接口预检／整体测试等完整适配。仓库init-options为SK1.0.12，已验证组合记录SK1.1.3／SP7／bridge1.4.0，不能继承其兼容声明。初始化以当前组合执行云端任务提取、远端task-done和错误SHA／缺报告拒绝探针；失败且既定条件无法解决才按宪法九报告选择，不自动升级或更改原生技能。这里只读调查，没有创建adapter／handoff或运行探针。

## RD-13 — 开发AI代码与视觉审查候选（历史路线）

**2026-10-15已被ED-11取代**：用户明确要求并确认当前Codex完成代码与Actions实际图像／报告审查，取消额外独立云端AI／API资源要求。以下保留原调查历史，不是当前实施门禁；当前规则见cloud-validation §6及[执行决定](reviews/execution-decisions-2026-10-15.md)。

**Decision（候选，尚待CV-D01准入）**：独立Linux Actions job分别使用官方Codex Action运行非交互代码审查和图像视觉审查，冻结action／CLI／proxy；输入只读、结果结构化。具体模型必须显式配置获准ID，不使用默认模型隐含决定。代码读final diff、必要完整源码、需求契约及真实验证报告；视觉通过--image实际附各端截图、基准／参考和UI-SPEC／页面状态／交互报告。每批覆盖和图像digest都登记，不能只给模型文件名。

| 候选对象 | 已核验能力／实施约束 |
| --- | --- |
| openai/codex-action | 固定完整SHA `bdf19a4a223ec2549a3e2274a0cf61556bc07675`；v1标签于2026-10-05指向此提交，不使用浮动标签 |
| CLI／Responses proxy | 候选固定0.162.1；官方npm均2026-10-09发布，action codex-version约束两者；实际初始化再核下载完整性 |
| action输入 | permission-profile为`:read-only`，safety-strategy为drop-sudo；prompt-file、output-schema-file、output-file、显式model与codex-args；不同时设legacy sandbox |
| 视觉参数 | codex-args传--image及实际截图路径（可重复／逗号分隔）、--ephemeral；schema约束最终结构；超批量限制按受审manifest拆批不漏页 |
| job隔离 | action内部Node24与产品Node22 job分开；只读必要输入／受保护prompt和schema，无生产秘密、部署权、仓库写／评论权限，checkout不持久化凭据 |
| 凭据 | 独立获准API Key通过action openai-api-key／proxy注入，不放入执行仓库代码的job环境；不复用产品AI Key或桌面登录 |

action／CLI支持这些参数只是工具能力依据，不证明安全组合、模型图片可用、数据政策或本项目审查已通过；必须在bootstrap实际探针。只读权限本身不保护高权进程内秘密，须drop-sudo／独立受限身份及输入／网络隔离；不采用Windows unsafe或让受审仓库脚本与密钥同job执行。`codex review --base/--commit`有目标与自定义prompt互斥限制，本候选采用exec便于统一契约／结构化报告。

**Rationale**：复用一个已有开发审查工具家族，但代码和视觉为独立实际调用／报告，不引入产品AI新能力。只读审阅＋固定schema适合门禁消费；像素diff／lint仍保留但不代语义审查。视觉可能误读小字、中文或位置，保全图并附必要裁图；真实交互／权限／读屏另验，模型不从截图推定通过。

**Alternatives considered**：本地AI自评、仅lint／pixel、GitHub展示图标或评论作为完整证据均不选。可另评估Actions中无工具Responses API图像输入＋strict JSON Schema候选，使用受信任包装器、无tools、测试截图base64、store:false；该参数不证明供应商不保留／大陆处理，不自动作为fallback。供应商／模型可用性、地域／训练／保留、源代码／截图授权和费用均须独立确认，当前未选定或调用任何模型。

官方能力来源：[固定Action源码](https://github.com/openai/codex-action/blob/bdf19a4a223ec2549a3e2274a0cf61556bc07675/action.yml)、[Action使用和密钥隔离](https://learn.chatgpt.com/docs/github-action)、[非交互／结构输出](https://learn.chatgpt.com/docs/non-interactive-mode)、[CLI图像／review参数](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[固定CLI参数源码](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/exec/src/cli.rs)、[CLI官方包](https://registry.npmjs.org/@openai%2Fcodex)、[proxy官方包](https://registry.npmjs.org/@openai%2Fcodex-responses-api-proxy)、[图像输入](https://developers.openai.com/api/docs/guides/images-vision)、[structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses)。核验日2026-10-14；能力与版本调查未包含模型调用或云端运行。

实际通过要求：真实调用成功／图像实际输入／结构可读、覆盖齐全、适用缺陷均处置并final SHA重审及回归、无未知／拒绝／截断。误报须独立核事实和反证，实质冲突留decision_required。first baseline另外按CV-D02由用户或明确获权验收人确认，AI no_findings不能替代。CV-D01／02和Q-03／16未满足只阻塞依赖步骤，不给本地或静态替代。

最新5A／6B将上述“尚待用户选型／外发批准”转为明确授权：路线已选，API资源提供后工程核定代码／视觉模型并记录必要资料／合成截图范围，真实用户／生产数据禁发；具体训练／分包／保留删除条款工程核查，不冒称用户已批未给定的天数。产品AI大陆／不训练政策不变。用户本人确认实际基准，未供资源按ED-07具体索取，不反复问预算或部署运营偏好。

## RD-14 — 三项独立复检缺口的工程闭环

**Decision**：用户明确授权补齐三处规划后推送。分享使用HTTP逐路由／方法／投影白名单，合法受限读取与无权读取分开；作者收录以账号开关和post/thread逐目标inherit/allow/deny持久化，默认有效公开允许，显式allow不越过账号false／非公开／实际展示依赖限制；制度／隐私／条款／告知／帮助以managed_document、不可变revision/release和必要receipt贯通后台管理、各端展示、注册／AI／帮助版本引用。详细字段／状态／动作在data-model、HTTP、授权、配置及AI工具契约，真实云端场景在quickstart V12／12A／13A。

**Rationale**：WEB-02和FR-091要求有权登录读取而非全部受限404；只禁止写不足以排除私人GET。WEB-04–06／FR-093–094及UI-SPEC §5设置／发布入口已有作者收录功能，账号与目标范围闭合且与AI用途分离；当前主库决定优先于异步投影。用户答复16要求功能／页面完整、正式内容用户处理，版本引用必须有真实来源，普通config字符串和引用Q-11不能代替版本／发布／适用记录。复用当前授权、CAS、outbox、配置consumer、审计及具体生产确认，不新增框架、服务、角色或经营制度。

**Alternatives considered**：分享全部GET通行或所有受限404、只在网页加noindex而无作者状态、复用AI开关控制收录、用模板帮助／虚构条款或只要求用户提供文案均不采用。资料展示不等于用户同意，也不引入老用户登录或普通公开AI逐次强制同意；真实服务准入与来源资格继续独立。

依据：本仓库PRD WEB-01–06／AI-04／08–10／ADM-01–07、spec FR-078／090–107、UI-SPEC §5设置与发布入口、[最新决定ED-08](reviews/planning-decisions-2026-10-14.md)及[独立发现](reviews/independent-plan-review-2026-10-14.md)。本节是依据既有材料的设计修订，不包含新外部技术选型或实际执行结论。

## RD-15 — Analyze四项缺口的修订边界

**Decision**：按既有FR／PRD／UI-SPEC恢复四项约束并把验证责任落到可派生任务：FR-065使用规范化无向账号pair的单一pending部分唯一约束和A→B／B→A并发断言；在共享核心Green前，ci-ready必须能真实调用business-increment验证作业，US14只扩充完整发行与受控部署；US2实现同时依赖US1与US3实现；FR-113拆为播放器、偏好设置和所有实际媒体消费入口，并在云端验证网络／视区／声音／预加载／省流量／减少动效行为。

**Rationale**：FR-065原文“每对至多一个”与旧任务的“同方向／每向”不相容；只建立聚合门禁不能证明核心前已有可执行验证作业；DAG和前置表不一致会允许US2过早启动；FR-113的真实行为不能由编辑器或一般媒体截图覆盖。上述修订只澄清并恢复已批准行为，不增加用户范围或新产品选择。

**Alternatives rejected**：保留有向pending、让US14首次创建增量工作流、只在文字前置表补US2而不改DAG、把播放器行为并入编辑器或最终通用视觉任务，均会留下同类跨产物缺口。

**Verification mapping**：plan TD-07A／TD-07D／TD-07E；data-model与HTTP/configuration契约；quickstart V09／V19；下一次speckit-tasks需把模型、云端作业调用链、依赖图／前置表、播放器消费入口和Red／Green／回归断言一并派生。此处未修改既有tasks或交接状态。

### 后续I3／I4核对

I3不引入新方法选择，HTTP已有GET/PATCH为准，计划／HTTP／V19A补足部分更新／CAS／幂等及PUT拒绝；现有任务需同步。I4不能由“各端同语义”推导share-read可读取账号偏好，/config/effective非敏感平台投影也不授个人数据用途。曾呈现A默认／页面内操作与B最小本人只读投影待决，用户随后明确选择A，以下最新决定生效。

**Decision（ED-10）**：匿名与登录分享均用合法平台默认＋当前页面操作，不读取／同步账号preferences，账号设置由App管理。保留现有share-read白名单，配置／SSR／hydration／缓存／认证响应不派生私人偏好投影，页面操作不写账号。**Rationale**：完整实现播放控件和默认策略即可满足本次明确选择，登录仅提升当前合法内容读取资格。**Alternative rejected**：B最小本人只读端点未获选择，更不能开放整个GET/PATCH preferences。**Verification**：quickstart V12B与V19A测试账号已有相反偏好、匿名／登录同默认来源、无私人读取及页面操作不写回，同时保持当前媒体gate；下一次tasks按真实来源同步实现、配置consumer和安全／浏览器回归。
