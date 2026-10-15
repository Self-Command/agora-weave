# 执行边界（ED-20现行）

依据根AGENTS、宪法v3.1.0、canonical spec/plan/tasks与[ED-20](android-first-development-decision.md)。本轮只完成Phase1工程准备并暂停，不继续扩展CI或实现业务。

## 阶段一退出

T001–T025按已实现工程能力、目标云端Red/Green及原报告核对；T026/T027只以当前目标SHA的真实Android development-ready收口。必需集合为固定依赖安装及类型/lint、非空工程回归、dev隔离官方Compose、test隔离官方Compose、真实Web基础交互。读取原报告、匹配checkout/run/attempt/check_set/foundation并核清理后才勾选。当前development_ready=true不设置全平台ci_ready、feature_complete、合并或生产批准。

现有verify-release的plan读取显式validation_intent=green、development_platform=android，复用verify-development；full_required=false，development_required=true。不启动iOS或完整原生矩阵。agoraweave/ci-gate保留正式completion完整链，非completion的拒绝不能冒称正式通过，也不作为本阶段退出条件。阶段一退出读取真实development-readiness原报告，而非顶层workflow图标。

完整跨平台正式链、全图审查和正式归档完整性另见[后续工程清单](phase1-follow-ups.md)。已有失败/取消不改写；未执行项不计passed。当前不再执行iOS，后续跨平台阶段恢复其适用验证。

## 开发边界

本地仅编辑/阅读文件、Git/GitHub控制面、下载读报告和可信桥接元数据操作；全部安装、构建、检查、测试、运行与交互采集只在GitHub-hosted Actions。不得本地runner代验。

初始化仅包含无业务壳、官方Compose与工具锁、工程测试和证据/审查/桥接能力。取得真实development-ready后，后续业务须按已批准任务范围及其实际依赖接入。T033仍未完成，首个核心行为Red前只接该行为所需真实迁移、fixture、非空目标和报告，不另造平台。

每个新行为先在健康前置下取得目标语义Red并读因果，再实现同oracle/fixture Green、受影响套件及必要回归；环境/导入/凭据失败不算Red。未知影响完整核验，禁止删断言、缩清单冒绿。目标结果不可认证、基础通道故障或安全边界未知时暂停依赖部分。

源报告绑定SHA/checkout/run/attempt/环境/工具摘要。普通业务仅在源为祖先且foundation未变时沿用基础准入，foundation漂移重新核验。缓存只能复用校验字节，不继承通过或审查。取消须核冗余/替代关系，保护唯一未读Red和清理。

公开只放允许的合成技术索引，完整工程证据/审查/完成记录写受控私库；秘密与生产用户数据不进入公开产物或审查。资源在实际需用时按ED-07索取最小权限，不复问既定决定。

## 交接与后续验收

干净检查点和Draft PR交接当前阶段一工程结果，handoff保持ready、剩余业务任务未完成，不调用feature complete。本轮交接后暂停，下一批[Android功能与T051拆分提案](android-next-batch.md)仅供下一轮确认与实施。

后续Android产品正式验收、合并与发行仍需其当时全部适用的同最终SHA/产物、安全权限、最低/当前Android、真实交互及代码/实际图像审查；iOS在后续跨平台阶段验证。首次产品图像基准由本人确认。云端验证不授权生产操作。新实质冲突按宪法九处理，已有明确决定不重复询问。
