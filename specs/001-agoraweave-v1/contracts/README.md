# 首版契约目录

保留原产品/模型/安全/接口语义，当前实现与未完成范围见[开发状态](../../../docs/engineering/current-development-state.md)。基路径 `/api/v1`；SDK/manifest/UI schema首版1.0。契约定义不表示所有接口已实现。

| 文件 | 规范对象 |
| --- | --- |
| [http-api.md](http-api.md) | 用户/后台/开发者HTTP动作、输入、输出、错误、分享只读 |
| [authorization-events.md](authorization-events.md) | 当前资格、撤权、实时/任务/媒体、事件幂等 |
| [configuration.md](configuration.md) | key注册、范围/优先级、版本、现有对象与消费者生效 |
| [ai-tools.md](ai-tools.md) | 只读MCP、用途/来源/额度/对账，后续交付保留 |
| [plugin-sdk.md](plugin-sdk.md) | 三端插槽、能力/隔离/正式工具与生命周期，后续保留 |
| [plugin-manifest.schema.json](plugin-manifest.schema.json) | 包manifest结构，语义验证仍必需 |
| [release-evidence.md](release-evidence.md) | 生产具体确认、名单、兼容与同版真实产物 |
| [cloud-validation.md](cloud-validation.md) | 目标/阶段/发布验证、代码审查及本地独立视觉 |
| [simulator-validation.md](simulator-validation.md) | 最低/当前原生模拟器、适用能力与受限例外 |

配套[模型](../data-model.md)、[plan](../plan.md)、[spec](../spec.md)和PRD原AC共同约束。当前基础运营分期改变交付顺序，未实现的AI/插件/高级能力不删需求，按实际版本保持不可用。

产品决定见[汇总](../../../docs/engineering/development-decisions.md)：分享白名单/合法受限读取、作者/目标收录交集、正式资料不可变版本与发布/适用、无向pair唯一pending、本人GET/PATCH部分更新/CAS/幂等、分享只用默认/页面操作不读写账号偏好，均继续有效。Spec Kit已退役，直接维护现有文件，不重生成契约或任务。

契约v1仅兼容追加；无法安全忽略的新动作/权限/字段采用能力协商，破坏变化用新major并行适配。客户端/插件自报版本不授权限。当前批次按实际变更风险验证，日志不冒充尚未执行的真实业务；生产/费用/高影响数据动作仍按宪法九确认。
