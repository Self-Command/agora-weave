# Analyze四项发现的规划修订核对

日期：2026-10-14。执行者：主代理。依据：用户提供的speckit-analyze C1／I1／I2／G1及明确“根据建议更新plan、随后重跑sk-task”的授权；AGENTS、宪法v3.0.1、spec／PRD／UI-SPEC、现有规划／tasks和ready交接。此记录是规划修订与文档核对，不是独立复检、产品运行或任务清单已通过的证据。

## 修订落点与下一轮任务要求

| ID | 已更新的规划／设计 | 下一轮speckit-tasks必须同步 | 后续验证 |
| --- | --- | --- | --- |
| C1 | plan TD-03、data-model account_pair／dm_request、HTTP请求契约及quickstart V09：无向pair一pending；方向保留动作权限，唯一键不含方向；同pair事务及部分唯一约束兜底 | 旧T093／T094的模型原文与每向限制改为无向pair；并发测试显式覆盖A→B／B→A、重试／接受／到期／直接发送，保持独立initial与冷却 | analyze对照FR-065／067和PRD；Actions真实DB并发最多一pending、无覆盖／追加／自动接受、通知及消息去重 |
| I1 | plan TD-07A、cloud-validation §2.1、quickstart首次初始化／job阶段：ci-ready前真实增量编排，核心Green前全部已激活入口及真实套件接入 | 在旧T048前安排真实verify job实现／调用／发现／脚本／报告／审查链，不能仅T015聚合；旧T167改为扩充full-release及受控部署，不首次创建核心验证入口 | analyze核任务前置及可执行产出；Actions绿路径非空真实执行，空矩阵／缺job或脚本／调用依赖缺边等拒绝 |
| I2 | plan TD-07E图、前置表及正文均规定US1-implementation与US3-implementation前置US2 | 完整DAG补US1→US2、US3→US2；前置表和US2故事说明一致，所有故事仍需共享核心；编号可重排 | analyze对完整DAG／表／正文比对依赖集合及无环；真实API／consumer按前置验证 |
| G1 | plan TD-07D／E、preferences模型与HTTP、configuration消费者、quickstart V19／V19A：共享播放器／设置／真实入口、每项网络／视区／动效／声音／预加载行为 | 明确播放器实现、偏好读写及各故事消费入口，具体Red／Green／必要回归；FR-113追溯同时指向这些责任，不只编辑器／草稿或一般US16播放检查 | Actions双端实际与必要物理播放，真实网络／下载／播放器事件／设置／读屏／交互；截图不能证明网络或播放 |

恢复原规格不修改spec或PRD，不新增评论／私信视频、群聊／通话、技术或服务。个人播放选择不授媒体读取资格；旧请求终态、FR-067合入／未读、当前撤权、生产确认和所有首版验收保持有效。没有新待用户选择的事项；实际资源／基准／生产节点继续按原决定处理。

## 技能和现有交接边界

extensions.yml成功解析，before_plan注册mandatory guard且无condition；按PowerShell配置实际执行`guard-command.ps1 -Action speckit.plan -Actor codex`，返回allow，读取交接status=ready、pending_tasks=276。setup-plan成功定位现有plan，未覆盖模板；其Branch功能标识不代表创建Git分支。没有未知技术选择需要新研究代理，RD-15只记录既有资料及用户明确方向。

保留本轮开始时已有的tasks.md、superpowers-handoff.json、bridge-snapshots及其未提交状态，不执行实现状态转换，不勾选任务；guard只自然追加真实bridge事件。源plan／模型／契约变化使旧ready快照不再代表当前输入；下一轮必须重新生成tasks、执行after_tasks必需handoff刷新摘要／快照／映射，随后analyze通过再实施。不能借旧ready或本报告直接开始业务。

## 核对状态

规划修订已经写入上述文件。已核对15份规划／契约／本次记录的UTF-8、表格列数、相对文件链接和JSON，未发现结构问题；规范化路径下无新的敏感凭据材料。实际核对七份开始时摘要（spec、PRD、UI-SPEC、追溯表、宪法、既有tasks与handoff）全部不变；现有四份snapshot文件未编辑。Git空白检查发现guard日志空行后仅规范每行一个对象，八条原事件逐对象一致保留；再次`git diff --check`通过。after_plan重新解析为空，无后置钩子需执行。

人工对照C1实体／唯一键／当前事务及双向场景，I1初始化→共享增量编排→ci-ready→核心Green→后续扩充链，I2局部DAG／表／正文，G1每项行为及实现／设置／消费入口责任，均已出现在规划输入；初始化调用保持bootstrap-only，不因业务start依赖ci-ready形成新循环。旧tasks及handoff的ready状态不改动、不作为修订已被实施的证据。

没有本地项目构建／测试／静态检查／运行，也没有Actions调度、代码／CI实现、采购、秘密读取或生产操作；本次只进行文件编辑、阅读与工程文档一致性核对，未提交或推送。

四项是规划输入已修订，旧任务清单仍包含本次发现，不能称“analyze全部关闭”。用户下一轮重生成任务并完成跨产物分析后，才能给出实际闭环结论。

## 后续I3／I4发现（本次继续）

用户下一轮重生成285项tasks后继续提供I3／I4。I3保留当前HTTP契约GET/PATCH，不将实现／测试的GET/PUT倒灌为新决定；plan TD-07D、HTTP及V19A明确PATCH部分字段／保留未列值、CAS／幂等和PUT拒绝，下一次tasks应同步T192／T198及客户端／路由／用例。当前tasks尚未在本轮更改，不称I3跨产物已关闭。

I4确认不存在share-read账号播放preferences的合法路径：私人/me全部拒，config/effective不能返回个人偏好。首次提出A默认及页面内操作，或B最小本人video_policy／preload只读投影两个具体选项；当时按宪法第九条等待明确选择，现有share白名单保持有效。用户随后明确选择A，最新修订及结论以下方为准。

本次guard读取handoff=ready／pending_tasks=285并实际allow，setup-plan定位已有文件不覆盖。开始时tasks SHA-256为`55eb6544de611c2da8c7356ff0c44b37a5282f13d21989a0d1e17627062e7ade`，handoff为`12a20f0fce63f2eff9234c8cd20851cbe486557f3f251f306fd0cb965af53383`，区别于上次历史核对，不复用旧摘要或声称新清单已审无问题。本轮仍只修改规划／配套设计，未实现或运行产品／CI。

### 用户选择A后的同步

用户明确A后继续speckit-plan，重读AGENTS／宪法及既有资料；解析before_plan并实际执行guard得到allow，setup-plan不覆盖模板。ED-10记录准确批准范围，B只保历史备选不生效。

| 发现 | 已修订设计及下一轮要求 | 实际闭环条件 |
| --- | --- | --- |
| I3 | plan／HTTP／V19A统一GET/PATCH及部分字段保留、CAS／operation幂等、错误PUT拒绝；tasks须同步T192／T198及客户端／路由注册表 | 任务方法与契约一致、analyze无同类发现；未来Actions真实目标Red／Green与回归 |
| I4 | plan TD-07D、模型、HTTP／授权／配置、V12B／V19A及研究／决定登记同步A：匿名／登录默认和页面操作，不读／同步账号偏好，不增加投影接口；tasks须同步T147／T228／T233／T235及US16／Final适用矩阵 | analyze核真实来源与白名单一致；未来Actions实测相反账号偏好不影响分享、无私人API／SSR／响应泄漏、页面操作不写账号，默认与播放／媒体资格行为真实 |

保留完整FR-113默认／页面播放能力及严格撤权；当前页面操作不变为账号设置，也不把B最小只读投影作为“工程细化”加入。App管理账号设置未变。旧tasks及ready快照继续保留，必须由下一轮speckit-tasks刷新必需交接；不能仅凭本次用户答复或规划文件宣称任务完成／CI就绪／analyze全部关闭。

用户选择后的结束核对：15份规划／契约／记录的UTF-8、表格、相对文件链接、JSON及敏感凭据匹配检查均无问题；spec／PRD／UI-SPEC／追溯表／宪法及当前285项tasks／handoff七份摘要与本次开始完全一致。after_plan再次解析无注册项。guard事件去空行后十二条对象逐项一致保留；Git空白检查通过。人工复核A的来源／白名单／无账号写入及I3方法／CAS／幂等在设计与用例指南一致。未生成任务、未刷新交接、未实施或运行CI／产品，未提交推送；本次只完成规划输入修订，跨产物结论留给tasks更新后的analyze。
