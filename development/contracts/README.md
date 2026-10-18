# 固定接口与领域契约

三端读取本目录的固定契约独立开发；字段、方法、路径和响应类型只在以下OpenAPI 3.0.3共同子集维护，由主控协调改变。`x-implementation`标记真实implemented或planned；mock生成不授真实能力。兼容追加可保持v1，破坏变化用新major与安全并行适配，客户端自报版本不授权。

| 文件 | 唯一职责 |
| --- | --- |
| [app-api.yaml](app-api.yaml) | App与核心业务的机器HTTP契约 |
| [management-api.yaml](management-api.yaml) | 浏览器后台到固定BFF的机器HTTP契约 |
| [core-admin-api.yaml](core-admin-api.yaml) | BFF到核心管理服务的机器HTTP契约 |
| [http-api.md](http-api.md) | 完整产品HTTP业务语义、后续能力、状态、事务与安全补充，不是第二套DTO权威 |
| [authorization-events.md](authorization-events.md) | 当前资格、撤权、媒体/实时输出、事件幂等 |
| [configuration.md](configuration.md) | 注册key、范围/版本、旧对象策略与真实consumer |
| [ai-tools.md](ai-tools.md) | 产品只读MCP、来源/用途、额度与未知费用 |
| [plugin-sdk.md](plugin-sdk.md) | 三端host、插件包/隔离、SDK/CLI及生命周期 |
| [plugin-manifest.schema.json](plugin-manifest.schema.json) | 原manifest结构；迁移保持原字节，语义审查独立 |
| [release-evidence.md](release-evidence.md) | 同版产物、兼容、指定名单及具体生产确认 |
| [cloud-validation.md](cloud-validation.md) | 日常影响回归、Actions独立验证、真实客户端与审查 |
| [simulator-validation.md](simulator-validation.md) | 最低/当前原生模拟器范围及批准例外 |

OpenAPI通过openapi-typescript生成 `packages/contracts/src/generated/{app,management,core-admin}.d.ts`，禁止手改生成输出；Prism提供独立mock；Specmatic对真实本地测试服务验证已实现接口。命令见[quickstart](../quickstart.md)，工具配置由主控统一维护。mock不连接共享DB，不能证明业务、RLS、撤权或集成成功；planned接口不得被contract通过结果冒充真实完成。

完整业务见[PRD](../../docs/product/PRD.md)及[功能文档](../features/)，架构见[architecture](../architecture.md)，真实schema与未来设计分开见[database](../database/schema.md)。后台与App的批准依据见[UI](../ui/README.md)。当前实现与后续能力分开记录，不从契约存在推断功能可用。

分享白名单、有权受限200、作者/目标收录交集、正式资料不可变版本及适用记录、无向pair单pending、本人preferences GET/PATCH部分更新/CAS/幂等、分享默认/本页操作不读写账号偏好均为保留的业务与安全决定。历史过程收据/逐行为TDD认证不是开发前置，真实验证和生产具体授权仍必要。
