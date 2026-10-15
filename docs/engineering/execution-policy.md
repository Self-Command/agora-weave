# 执行边界

**ED-20 当前范围（优先于本文历史全平台收口说明）**：用户要求阶段一按Android可开发条件完成并同步tasks；当前不做iOS验证，后续跨平台再执行。先取得当前foundation的真实development-ready后进入原Phase2/Android业务DAG；全平台ci-ready、产品验收、合并及生产批准仍未取得。见 [Android优先决定](android-first-development-decision.md)。

依据：根 `AGENTS.md`、宪法 v3.1.0、`specs/001-agoraweave-v1/{spec,plan,tasks}.md`、`contracts/cloud-validation.md`、[分层验证批准](validation-tiering-decision.md)和已确认的 ED-05–18（后续决定取代相应历史范围）。任务清单是唯一完成契约，现有全部 285 项仍未完成。ED-14仅使用Actions云端模拟器，保留最低／当前OS及适用能力矩阵，排除项以`contracts/simulator-validation.md`为准；ED-18仅对API24实际省电开启／深色捕获的系统自有警示栏给出受限not_applicable，不改变应用可读性、主题策略或其他平台验收。

## 初始化范围

`bootstrap-authoring`／`bootstrap-only` 用于建立基础通道。在独立认证的云端 `development-ready` 出现前，只允许下列初始化内容；取得开发准入后可沿canonical任务的原故事DAG做业务TDD，T027完整`ci-ready`另作正式验收，不再作为任何业务编写的无条件前置：

| 路径 | 允许内容 |
| --- | --- |
| `.github/workflows/` | 初始化、测试先行、报告、审查记录校验及验证调度 |
| `tools/ci/`、`tests/{contract,integration,security}/ci/`、`tests/fixtures/bootstrap/` | 工程门禁、采集、发现及拒绝探针；不包含社区业务 |
| `tests/e2e/bootstrap/`、`tests/e2e/{ios,android}/BootstrapShell*` | 无业务壳的真实交互与隔离服务联通 |
| `package.json`、`package-lock.json`、`apps/{mobile,admin,share}/` | 固定官方依赖与无业务客户端壳；不能因路径获准而加入业务 |
| `.gitmodules` | 修复已有 `superpowers-v7` 固定 gitlink 缺失的原始来源元数据；不改版本或技能内容 |
| `supabase/upstream/`、`infra/ci/` | 固定官方 Compose、工具锁、隔离初始化环境与资源准入 |
| `docs/engineering/` | 执行、资源、证据、工具和已确认决定的工程记录 |
| `.specify/extensions.yml`、`.specify/extensions/speckit-superpowers-bridge/` | T023 经云端 Red 后的项目门禁接入；不更改已有决策和规格 |
| `.specify/superpowers-handoff.json`、`.specify/bridge-*`、canonical `tasks.md` | 真实生命周期和有证据的任务进度；raw 状态不充当准入或完成证明 |

路径与内容共同决定范围。bootstrap-only不包含`modules/`、业务迁移、业务API／页面或插件；development-ready后这些内容按各任务目标及原依赖进入，不能借改profile免除目标测试、授权或服务前置。原有规划修订属于输入，不重新打开已关闭的问题。

## 执行与证据

本地只编辑、阅读文件和报告，执行 Git、GitHub 控制面以及桥接／任务提取元数据操作。禁止本地安装项目依赖、编译、静态检查、测试、运行、模拟器、视觉与交互验收；本机不能充当 runner。

初始化先建立 T002 的最小 Actions 传输、健康与报告通道。该通道的成功仅表示这次采集运行成功；不表示 `ci-ready`、产品通过或任务完成。T008–T012 的工程行为实现前必须在此通道逐行为先取得合格 Red。接口壳只能让测试可调用，不能预先实现目标行为。

Red 必须来自健康前置下的目标缺行为断言，保留原始failed状态。编译、导入、网络、凭据和工具故障不能作为Red。实现只能在读取因果后开始；开发Green使用相同oracle／fixture、受影响套件及必要回归，冻结实际diff／依赖／任务／契约及风险依据；未知影响用完整适用集合。不要求每提交完整OS／视觉矩阵，不得以feedback代Green、删断言、改结果或把skip／unknown当通过。任务验收、合并、阶段验收与发行最终SHA另须完整适用验证。

所有报告关联目标和实际 checkout SHA、run／attempt、环境、工具版本与摘要。公开仓库只出现允许公开的技术索引、纯合成探针和脱敏日志；完整私有证据及 completion record 必须进入受控存储。资源缺失时记录 `unavailable`，保留任务未完成。

业务TDD准入前取得真实固定安装／构建、非空目标测试通道及所需官方Compose服务健康，认证原报告与独立development_readiness；绑定源／目标祖先和稳定foundation摘要，基础输入漂移重核。不影响目标行为的CI采集、归档、完整矩阵和审查完备性问题可并行修复并保持未完成；基础或目标不可认证、安全未知暂停依赖部分。T026／T027仍需同最终SHA三端完整壳、最低／当前OS、采集归档、当前Codex代码／实际图像审查和拒绝探针等全部必需证据。首张壳截图不是产品视觉基准；首次产品候选由用户本人确认。

## 验证效率与安全检查点

用户2026-10-15授权局部调整调度、缓存、取证及工程资料；具体合同为`contracts/cloud-validation.md` §2.2，真实基线与下一窗口执行顺序见[验证效率执行说明](validation-efficiency.md)。本次plan／tasks局部更新保留285个任务ID、依赖、追溯和完成状态，不能把规划同步记为工程实现／云端验收完成。

同一目标的独立原生／共享矩阵与push／PR重复先查真实执行输入和保护check；仅等价链可去重，保事件／实际SHA绑定，不关闭保护或制造skip／空check。中间反馈明确`feedback/not_evaluated`，不能充正式开发S_G、任务完成或ci-ready；开发S_G同oracle及受影响套件／必要回归，合并／阶段验收与full-release仍完整同SHA验收。清单、门禁、依赖、测试、验收条款及工程行为不能误归普通文档；未知影响用完整适用集合。

取消旧运行前确认冗余／已替代、原证据已保留，保护唯一未读Red、当前必需验证和归档清理；原状态／日志不删除不改。依赖／构建缓存按锁、工具链、平台及实际构建输入隔离，命中仍校验和真实执行；独立job满足健康／fixture前置才并行。相同artifact按完整身份、archive及raw摘要复用已验字节，最终仍实际读取全部必需报告、失败明细和原图，不以缓存代passed。

新增或修改的工程行为先真实云端Red→读因果→实现→正式Green。完整验证前一次整理代码、测试、tasks和工程资料并冻结SHA／清单；最终完成记录、审查、测量写外部私库，避免为补记通过循环提交。冻结后改动产生新SHA必须重新验真。优化结果按可比真实运行说明消除的重复、run／job数量、排队／执行／传输时间及剩余阻塞；无数据如实记缺失，不承诺比例。优化完成后按原任务继续，不另造调度平台。

构建／验证成功不授权生产部署、迁移、权限生效、灰度或扩大。新实质冲突遵循宪法九，既定决定不重复询问。

干净检查点与Draft PR可用于当前工程批次移交，必须列已有开发证据和待补完整矩阵／审查，不调用formal complete、不勾未验任务，也不声称T027／阶段已验收、可合并或已发行。
