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

## 实际模拟入口

| 端 | 地址 | 使用方式 |
| --- | --- | --- |
| App | `http://127.0.0.1:4010/core/api/v1` | 传给现有account/feed API的base配置 |
| 浏览器管理协议 | `http://127.0.0.1:4011/api/management` | 独立HTTP/组件消费者；模拟不持久化真正Cookie或MFA状态 |
| BFF依赖的core | `http://127.0.0.1:4012/core/api/v1` | 将隔离后台的AGORAWEAVE_ADMIN_CORE_API_URL指向此地址；保留真实Next/BFF与Cookie适配 |

后台整站独立开发推荐“完整Next/BFF源码 + core Prism”，其SSR鉴权布局继续使用现有BFF。core模拟入口合并读取app认证与core管理的同版契约，不复制维护。Prism忽略servers前缀，脚本仅生成路径前缀适配；Windows临时文件在H盘运行区.agoraweave/api-mocks，报告在reports/api-contracts，CI使用工作区临时目录。这些生成文件不是另一份契约。

`api:verify`默认只读JSON；推荐先显式选 `--operations listLatestPosts --filter "STATUS='200'" --anonymous --client-release fixture-v1`。可追加`--environment test`、Docker内部网络`--network <name>`；报告区分`--provider real`与`--provider mock`，后者只证明工具互通。写操作需`--allow-mutations --environment test --operations ...`及隔离夹具，禁止对生产执行。

`npm run api:smoke -- --specmatic`只验证三Prism入口和Specmatic工具互通；报告明确标记mock，不作为真实后端通过。真实核心的可复现检查用 `node --experimental-strip-types tools/api/verify-core.ts --base-url http://functions:9000/core/api/v1 --network <isolated-network>`，运行环境必须显式dev/test。该命令复用既有合成配置夹具，结束恢复原active_ptr，不reset/seed/migrate。真实provider结果仅覆盖所选公开最新流读取；其余接口由对应业务夹具及原测试验证。原始日志保持私密，不作为公共CI附件，附件只含无凭据的result摘要。
