# 2026-10-15：分层验证、工程移交与桥接续接

本文件是继续开发的工程交接，不是阶段验收通过记录。用户已明确批准当前阶段按建议修改工作流程及宪法、执行后提交PR并保持工作区干净，再开新窗口执行`sk-sp-br`。依据宪法v3.1.0及[批准与迁移记录](validation-tiering-decision.md)，开发准入改为独立development-ready，T027完整ci-ready与正式合并／阶段验收仍保全部适用证据。实际本次开发证据／PR以最终交接消息和对应原报告为准，不能从本文推断已Green或已验收。

## 正确工作树与入口

- 工作树：`C:/Users/by970/.codex/worktrees/tdd-rebuild/my-project`。
- 分支：`codex/agoraweave-tdd-rebuild-clean`；仓库：`Self-Command/agora-weave`。
- 桌面主工作树仍在 `codex/agoraweave-phase1-handoff`，不能在该旧检查点实施或用它覆盖当前分支。
- 先读取本工作树 `AGENTS.md`、`.specify/memory/constitution.md`、现有 plan/tasks、工程执行政策和验证效率说明；调用 `$speckit-superpowers-bridge`。不得改用 `speckit.implement` 或重新生成整份任务清单。
- 本次治理修订先通过真实桥接将executing置blocked，再通过constitution guard；最终桥接状态以实际文件及新快照为准。新窗口遵循实际before_implement认证receipt；`ready`只表示资料交接，不授development-ready、ci-ready、任务完成、feature complete或生产权限。

## 已有批准和边界

保持 ED-11 当前 Codex 实际代码／图像审查；ED-14 最低／当前 OS 的 Actions 模拟器覆盖及明示硬件排除风险；ED-15 隔离分支真实 TDD 重建；ED-17 Actions 内临时 Cloudflare HTTPS 与一次性认证；ED-18 Android7 受限系统警示色例外。决定原文在 `specs/001-agoraweave-v1/reviews/execution-decisions-2026-10-15.md`，不得重新索要已有批准或扩大例外。

现有285个canonical任务全部未勾选。真实基础构建、非空测试通道及所需隔离服务健康取得独立`development-ready`后，可沿原故事DAG做业务TDD；完整CI证据问题按依赖并行修复。基础／目标不可认证、安全未知则暂停依赖部分。T027只作为正式完整初始化验收，不假完成；全部项目安装、构建、测试、回归、运行、图像／交互采集及门禁计算只在Actions。本地仅编辑、Git、控制面、元数据与下载／阅读证据。

开发准入记录绑定认证源run／attempt、SHA／checkout／事件、实际原报告、源与目标祖先及稳定foundation摘要；工作流、门禁／执行器、治理契约、冻结依赖／工具链或环境变化须重新核基础证据。普通业务变更仅在基础输入未漂移时沿用；development-ready永不冒充ci-ready或formal complete。

## 检查点和待读取证据

本次计划更新前代码检查点为 `72cb1a23ce0f921949f96f360e87048659376bec`。其工程、journal 和 bridge 传输结果不能替代最终完整矩阵与当前审查。下列链接是交接时的运行入口；下一窗口应重新查询实际状态和所有 attempt，不能把本文件快照当结果。

- [工程与聚合 run38691309464](https://github.com/Self-Command/agora-weave/actions/runs/38691309464)：工程节点已成功，聚合仍等待完整执行器。
- [完整共享 run38691309718](https://github.com/Self-Command/agora-weave/actions/runs/38691309718)：交接调查时四个原生 job、临时入口仍运行。先读取其实际产物、原失败和清理结果，再判定保留或被新 SHA 取代；不得粗暴取消唯一证据或归档清理。
- [journal run38691309315](https://github.com/Self-Command/agora-weave/actions/runs/38691309315)：workflow 成功；仍须读取完整认证报告，不能只据绿图标宣称最终覆盖。
- [ED-18 工程 Green 来源 run38690805835](https://github.com/Self-Command/agora-weave/actions/runs/38690805835)：实际 174 项工程断言及 typecheck/lint 成功；顶层 run 最终 failure，不能称整体成功。SC02 原始 Red 是 `c943e260` 的 [run38690425924](https://github.com/Self-Command/agora-weave/actions/runs/38690425924)，原状态保留。
- [旧独立原生 run38690805779](https://github.com/Self-Command/agora-weave/actions/runs/38690805779)：与旧共享矩阵有重复构建，但独立模式不要求 HTTPS，不能把它的成功替代完整 HTTPS 验收。取消前逐项确认是否冗余、已读以及清理安全。
- [旧完整 run38681620881](https://github.com/Self-Command/agora-weave/actions/runs/38681620881)，目标 `348e1ac817a369547a531f37c349883d472b39e7`：API24 系统警示栏原失败及 ED-18 决定详见 `android7-system-chrome-decision.md`。iOS26.4 dark 原失败也必须保留，不能因其他端成功而跳过。

### 已核验的 iOS26.4 原失败

`38681620881` 的原 artifact `11948648942`，名称 `bootstrap-ios-26.4-38681620881-1`，原 ZIP 51,887,331 字节，SHA-256 `b4bf60dd8ef65a61c755c7d12e640206a73d1eee8cd88e0fd90e3bd90869a4f4`。已下载私有归档的原 ZIP、核对 GitHub 元数据摘要并解包。light 为 1pass／0fail；dark 为 0pass／1fail，实际失败在 `BootstrapShellTests.swift:34`：后台状态等待 5 秒所得 `XCTWaiterResult(rawValue: 2)` 不等于 completed（1）。dark 原日志 8018 行记录该断言，不能误称主题对比度失败，也不能通过扩大超时或删断言直接换绿。下一窗口先读取完整失败上下文、原 xcresult 与实际图像，区分前置、测试驱动和产品行为；需改工程行为时取得相应真实云端 Red。

已校验本机缓存目录：`C:/Users/by970/AppData/Local/Temp/agoraweave-shared-current-348e1ac/11948648942/`，可信原 ZIP 是 `source-private.zip`，内容在 `raw/`，身份记录为 `github-artifact.json`。同目录其他 `source*.zip` 包含失败或不完整传输，不能复用；每次使用核对完整身份、字节数和摘要。缓存不授予通过。专用连接信息及密钥只在既有私有配置，不能写公开资料。

原 ZIP 校验完成后，本窗口停止了两个仍挂起的相同 artifact 只读 `gh` 下载进程；保留不完整文件和原始记录，没有取消 Actions 运行或改变测试结果。未记录精确传输耗时，不能据此量化提速。

## 下一窗口顺序

1. 在此分支最新干净检查点恢复 bridge，先读 `validation-efficiency.md` 和局部更新后的 TD-07A/B/C、cloud-validation、release-evidence、T026/T027。使用实际当前运行记录确定最小改动，保留任务 ID、依赖、追溯和完成状态。
2. 读取本次已取得的真实Red／Green及未决项，只对新增或改变的行为先取得云端语义Red、校验读取因果后再实现；已有正确行为只回归，不重造Red。仍需处理同目标重复执行、反馈／开发S_G／验收分层、安全取消、缓存、认证artifact复用与SHA冻结中的实际缺口，不另造调度平台。
3. 快速反馈不授开发Green或完成；开发S_G保持同oracle／fixture、受影响套件及必要回归，记录整个diff、依赖和风险，未知影响完整适用验证。事件、head／checkout SHA、run／attempt与真实check准确绑定。工程门禁／清单／测试／依赖变更也先目标Red／Green，不能归普通文档免测。
4. 最后一次性整理代码、测试、tasks、工程资料与桥接元数据，提交冻结目标 SHA，再取得最低／当前 iOS 与 Android、Web、官方服务、非空增量编排、认证 journal、归档清理和当前 Codex 代码／实际图像审查等全部必需证据。新提交使相应验收失效。
5. 读取所有必需原报告、失败详情和实际图像，将最终完成记录写受控外部证据库。按真实前后数据说明消除的重复、运行数及排队／执行／传输时间；无可比数据就明确缺口，不承诺提速比例。
6. 按原DAG继续：独立development-ready后可做核心／业务TDD，T026／T027完整ci-ready可并行闭合。合并、阶段验收交付及发行前必须同最终SHA完整适用验证，最低／当前OS、安全权限、真实交互与当前代码／实际图像审查齐全。Draft PR工程交接明确未决验收项，285项未全完成不调用feature complete，不以raw handoff或task-done exit0冒充完成。
