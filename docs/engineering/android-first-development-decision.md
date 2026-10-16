# ED-20：Android 优先开发与阶段一工程收口

ED-21现行更新（2026-10-16）：本文保留阶段一批准与运行历史；后续按[本地/Actions职责决定](local-cloud-responsibility-decision.md)及宪法4.0.0执行。Android先行与后续跨平台责任保留，旧暂停、T051待批准及云端独占开发规则不作为新开发前置。

日期：2026-10-15。用户明确指令：

> 先把第一阶段快点搞定 然后task给我完成。我要进行正式开发。 当前可以开发就不要太严格浪费我token了。 ios以后不做验证测试，先把安卓做出来，后续再进行跨平台。

本决定承接同轮“ios不测试先做出安卓app”的明确指令，按宪法第九条修改当前执行范围。当前交付优先级为 Android；iOS 原生验证与验收后置到用户后续跨平台阶段，当前不再调度 iOS 构建、模拟器测试或等待其结果。跨平台技术栈和共享业务实现保留。

## 本轮第一阶段完成口径

Phase1 以“具备 Android 业务正式开发所需的工程准备和真实 development-ready 通道”为收口条件：固定依赖、实际云端安装/构建与类型/lint、非空工程测试及必要回归、隔离 dev/test 官方服务和实际 Web 基础交互均取得可认证的原报告。可据此进入原任务 DAG 的 Phase2 核心与 Android 业务 TDD。

T001–T025 已实现的工程能力、测试与接口保留；T026/T027 本轮收口核当前 foundation 与原报告绑定的 development-ready。原先把完整 iOS/Android/Web 矩阵及正式代码/全图审查、归档完整链作为 Phase1 完成前置的部分后置，不再阻塞当前开发。本轮任务勾选依据本决定调整后的要求；不将后置项目标成已执行，也不伪造旧版本通过。

此结论属于 Android 开发准备完成。它不设置全平台 ci_ready、feature_complete、产品图像基准确认、合并许可或生产发行许可。正式 Android 产品验收仍需其当时已激活功能、权限安全、最低/当前 Android、真实交互与图像的同最终版本证据；后续跨平台再执行 iOS 及共享能力回归。既有失败、取消、未读结果和排除项均保留原状态。

## 调度与任务

开发请求显式登记 validation_intent=green 与 development_platform=android，复用现有 verify-development 基础通道，不调用 native-bootstrap 的全平台验收矩阵。当前行为所需业务套件和 Android UI/设备测试在其任务节点接入并执行，不能以工程 development-ready 代替业务 Green。未知输入与 iOS 目标不得混入此 Android 开发范围；completion 仍进入原完整正式验收链。

不再为本轮工程收口要求全平台矩阵或全幅 iOS 图像审查。先完成当前基础回归、同步 canonical tasks 及干净 Git 检查点，再交接正式开发。

## 保留的证据与取消

348ee457 的工程 Green：CI bootstrap 38744632580/1，215/215 通过、无失败/跳过/取消，原 ZIP11978201550 摘要已核并读报告；类型检查通过。公共私有边界及 ED19 增量只读复检没有 Critical/Important 发现，原生 ED19 新测量未完成，不能据此声称 Android 原生验收已通过。

acaa9fd 的真实规划失败探针：38745927060/1，plan=failure 后最终 agoraweave/ci-gate 实际运行且 failure，两个 executor 均 skipped，result.json 记录 ci_ready=false 及拒绝原因；原产物11979785074/11978766533 的 ZIP摘要已核并实际读取。这是预期拒绝观察，不是成功验收。

依用户停止当前 iOS 验证的指令，已请求取消仍在执行的旧全平台 run38744633820 和38736933035。取消原状态与产物保留；它们不作为本轮完成证据。各自未完成的清理须继续检查终态。新增 Android 调度行为仍先取得独立健康云端语义 Red，读取后实现、同 oracle Green。

调度目标语义Red：6a34d48 / CI bootstrap38747329749/1，健康执行217项、215通过、仅AD01/AD02两项语义断言失败，0跳过/取消/todo；ZIP11979986787与11978813111摘要已核并于14:01Z实际读取。完整共享run38747329724在iOS job出现前依用户指令取消，独立Red源保留，不以该取消run冒充失败原因或Green。

## 本轮进一步明确的收口与暂停

用户进一步要求：停止继续扩展CI平台，统一plan/tasks/验证契约与实际门禁的旧前置，只以真实Android development-ready退出；只勾满足现行要求的任务，干净提交后暂停。已将原T026/T027全平台前置逐处移出当前退出条件，完整正式验收责任另登记phase1-follow-ups。下一批Android功能、身份/授权/安全最小依赖及T051按消费者拆分仅形成android-next-batch提案，不重生成tasks、不实现业务或擅改原DAG。

当前阶段一进度为T001–T027，后续258项不勾选；勾选依据同现行工程范围实现、目标Red/Green和真实基础源报告，最终HEAD重新核同基础集合后写外部记录。现有正式completion聚合继续拒绝非completion；开发退出使用原development-readiness，不新造门禁平台。
