# 2026-10-15：验证效率优化及初始化续接

本文件是工程交接，不是验证通过记录。用户要求本窗口由一个 agent 使用 `speckit-plan`、`speckit-tasks` 局部同步优化方案后收尾，下一窗口通过 `speckit-superpowers-bridge` 实施。优化实现、真实云端 Red→读取失败→Green、优化后测量与最终完整验收均留待执行，不因本次资料更新记为完成。

## 正确工作树与入口

- 工作树：`C:/Users/by970/.codex/worktrees/tdd-rebuild/my-project`。
- 分支：`codex/agoraweave-tdd-rebuild-clean`；仓库：`Self-Command/agora-weave`。
- 桌面主工作树仍在 `codex/agoraweave-phase1-handoff`，不能在该旧检查点实施或用它覆盖当前分支。
- 先读取本工作树 `AGENTS.md`、`.specify/memory/constitution.md`、现有 plan/tasks、工程执行政策和验证效率说明；调用 `$speckit-superpowers-bridge`。不得改用 `speckit.implement` 或重新生成整份任务清单。
- 本次 after_tasks hook 将交接状态刷新为 `ready`，仅表示资料交接。新窗口执行时遵循实际 before_implement 云端 receipt；`ready` 不授予 `ci-ready`、任务完成、feature complete 或生产权限。

## 已有批准和边界

保持 ED-11 当前 Codex 实际代码／图像审查；ED-14 最低／当前 OS 的 Actions 模拟器覆盖及明示硬件排除风险；ED-15 隔离分支真实 TDD 重建；ED-17 Actions 内临时 Cloudflare HTTPS 与一次性认证；ED-18 Android7 受限系统警示色例外。决定原文在 `specs/001-agoraweave-v1/reviews/execution-decisions-2026-10-15.md`，不得重新索要已有批准或扩大例外。

现有 285 个 canonical 任务全部未勾选。当前仍为 bootstrap-only；T027 有效 `ci-ready` 前不开始业务。全部项目安装、构建、测试、回归、运行、图像／交互采集只在 GitHub Actions。本地仅编辑、Git、控制面、元数据与下载／阅读证据。

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
2. 在现有工程通道逐行为取得真实 Red，下载校验并读取完整失败后再实现。针对同目标重复执行、快速反馈／正式 S_G／最终验收分层、安全取消、按锁与工具链平台缓存、认证 artifact 复用与 SHA 冻结实施最小必要改动，不另造通用调度平台。
3. 快速反馈不授予正式 Green 或完成；S_G 保持同 oracle、当前激活适用套件及必要回归。事件、head SHA、实际 checkout SHA、run／attempt 与真实 required check 绑定完整，未知或门禁／清单／测试／依赖变更走保守完整验证。
4. 最后一次性整理代码、测试、tasks、工程资料与桥接元数据，提交冻结目标 SHA，再取得最低／当前 iOS 与 Android、Web、官方服务、非空增量编排、认证 journal、归档清理和当前 Codex 代码／实际图像审查等全部必需证据。新提交使相应验收失效。
5. 读取所有必需原报告、失败详情和实际图像，将最终完成记录写受控外部证据库。按真实前后数据说明消除的重复、运行数及排队／执行／传输时间；无可比数据就明确缺口，不承诺提速比例。
6. 优化后继续原初始化任务，只有 T027 有效 ci-ready 后进入业务。285 项未全完成时不调用 feature complete；不得用 raw handoff 或 task-done exit0 冒充完成。
