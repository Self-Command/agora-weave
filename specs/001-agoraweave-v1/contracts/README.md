# 首版契约目录

契约版本1.0，2026-10-14；服务基路径`/api/v1`，插件SDK/manifest/UI schema首版1.0。属于speckit-plan设计资料，当前没有接口实现。规范性约束与[数据模型](../data-model.md)、[计划](../plan.md)、spec及PRD全部原AC共同有效。

| 文件 | 规范对象 |
| --- | --- |
| [http-api.md](http-api.md) | 用户/后台/开发者HTTP动作、输入、输出、错误、分享只读 |
| [authorization-events.md](authorization-events.md) | 当前资格、撤权线性化、实时/任务/媒体、事件幂等 |
| [configuration.md](configuration.md) | 参数注册、范围优先级、版本、现有对象生效 |
| [ai-tools.md](ai-tools.md) | 内部MCP只读工具、用途、来源、额度/对账 |
| [plugin-sdk.md](plugin-sdk.md) | 三端声明式插槽、能力、隔离、包/开发工具、生命周期 |
| [plugin-manifest.schema.json](plugin-manifest.schema.json) | 可机器解析的包manifest结构；语义校验仍必需 |
| [release-evidence.md](release-evidence.md) | 生产具体确认、指定名单、兼容、同版云端证据 |
| [cloud-validation.md](cloud-validation.md) | CI先就绪、桥接开始／完成强制门禁、Actions TDD红绿、三端基准／AI代码和视觉审查 |

契约v1只能向后兼容追加；无法安全忽略的新动作/权限/字段需能力协商，破坏性变化新major并行适配。客户端和插件声明版本不授权限。SDK源码、模板、完整开发文档及测试由后续实施交付，本轮仅定义形态。

最新用户决定／资源分工及授权工程参数见[决定登记](../reviews/planning-decisions-2026-10-14.md)。用户处理部署上线运营，工程按需索取具体供给；不据此免除完整功能、实际云端验证或同版证据。

独立复检的三项缺口已补入本契约集：HTTP分享白名单／合法受限读取、模型及本人收录接口、正式资料版本管理／发布／适用记录和AI帮助来源。修订依据、复检和是否已闭环以[独立计划复检记录](../reviews/independent-plan-review-2026-10-14.md)最新状态为准；真实Actions验证仍在后续实施阶段。
