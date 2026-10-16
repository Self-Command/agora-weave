# 执行边界（ED-21现行）

依据根AGENTS、宪法4.0.0、canonical spec/plan/tasks与[ED-21](local-cloud-responsibility-decision.md)。本地高频真实开发反馈，Actions独立复验及正式验收；当前先修订并核对执行资料，后续实现仍按真实任务及直接依赖推进。ED-20的Phase1完成事实与Android先行保留，旧交接的暂停指令不覆盖用户之后明确要求继续的工作。

## 阶段一退出

T001–T025按已实现工程能力、目标云端Red/Green及原报告核对；T026/T027只以当前目标SHA的真实Android development-ready收口。必需集合为固定依赖安装及类型/lint、非空工程回归、dev隔离官方Compose、test隔离官方Compose、真实Web基础交互。读取原报告、匹配checkout/run/attempt/check_set/foundation并核清理后才勾选。当前development_ready=true不设置全平台ci_ready、feature_complete、合并或生产批准。

现有verify-release的plan读取显式validation_intent=green、development_platform=android，复用verify-development；full_required=false，development_required=true。不启动iOS或完整原生矩阵。agoraweave/ci-gate保留正式completion完整链，非completion的拒绝不能冒称正式通过，也不作为本阶段退出条件。阶段一退出读取真实development-readiness原报告，而非顶层workflow图标。

完整跨平台正式链、全图审查和正式归档完整性另见[后续工程清单](phase1-follow-ups.md)。已有失败/取消不改写；未执行项不计passed。当前不再执行iOS，后续跨平台阶段恢复其适用验证。

## 开发边界

本地允许固定依赖安装、增量构建、lint/types、单元/契约和隔离官方Compose迁移/接口/权限/并发调试、Android/Web实际开发交互。记录真实local来源、提交/差异快照、工具环境及原报告；不触达生产。Actions负责独立干净环境复验和正式系统/安全/恢复/交互/图像、最终构建及归档；本地不能充正式云端结果或替代runner。

历史初始化仅包含无业务壳与工程能力。当前业务按切片直接依赖推进，T051不再是所有故事开始的无条件前置。T033负责当前迁移/fixture/非空目标/来源与报告的本地及Actions最小适配，不另造平台；runner-only入口在合法本地适配和健康检查前不得伪装CI运行。

每行为先在健康适用的本地或云端环境取得语义Red、读因果，再实现同oracle/fixture Green与受影响回归；环境/导入/类型/凭据失败非Red。Actions功能检查点复现必要Red并独立验证候选Green，正式同最终SHA完整验收。目标不可认证、基础故障或安全未知仅暂停直接依赖，无关远端排队/归档不无限阻塞本地开发；禁止缩验收或造通过。

源报告绑定SHA/checkout/run/attempt/环境/工具摘要。普通业务仅在源为祖先且foundation未变时沿用基础准入，foundation漂移重新核验。缓存只能复用校验字节，不继承通过或审查。取消须核冗余/替代关系，保护唯一未读Red和清理。

公开只放允许的合成技术索引，完整工程证据/审查/完成记录写受控私库；秘密与生产用户数据不进入公开产物或审查。资源在实际需用时按ED-07索取最小权限，不复问既定决定。

## 交接与后续验收

续接先核当前路径/分支/SHA和未完事项；已授权开发持续到当前任务完成、用户明确暂停或真实依赖阻塞，状态询问后继续。工作树与用户可见目录在可核检查点同步，保留原分支和未提交修改。当前文档修订后handoff ready仅表示源已同步，剩余258项仍未完成，不调用feature complete。[Android功能与T051依赖方案](android-next-batch.md)已由ED-21批准，随消费者实施。

后续Android产品正式验收、合并与发行仍需其当时全部适用的同最终SHA/产物、安全权限、最低/当前Android、真实交互及代码/实际图像审查；iOS在后续跨平台阶段验证。首次产品图像基准由本人确认。云端验证不授权生产操作。新实质冲突按宪法九处理，已有明确决定不重复询问。
