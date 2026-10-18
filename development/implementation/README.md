# 独立实现指南

2026-10-18当前执行以[快速开发与人工验收](../delivery-mode.md)为准：App/后台用户验收，取消独立UI复检，三端持续开发及热更新，日常最小工程/后端检查，完整流程最后集中执行。

本目录解释如何在既有源码和固定接口下实现真实产品，不再维护另一份计划或任务列表。业务判断见[功能](../features/)，技术边界见[架构](../architecture.md)，页面批准见[UI来源](../ui/README.md)。

| 开发端 | 可独立修改的现有路径 | 只读依赖 | 独立反馈 |
| --- | --- | --- | --- |
| 后端 | `supabase/functions/core/`、`services/core-worker/`、对应业务测试；追加迁移编号先主控协调 | app/core-admin OpenAPI、领域契约、已应用SQL、官方Compose/Auth API | 按发现目标单元/API/DB/安全/并发，Specmatic仅指向真实implemented路由 |
| App | `apps/mobile/`及明确归属组件/测试 | app OpenAPI生成类型、token、当前页面/状态/版本人类批准 | `api:mock:app`、包typecheck、controller/组件；真实接口切换后再原生集成 |
| 后台 | `apps/admin/src/features/management/`、`src/app/admin`、`src/app/dashboard`、`src/app/api/management`对应增量及测试 | management与core-admin生成类型、完整Kiranism组件 | `api:mock:admin`供UI，`api:mock:core-admin`供BFF，独立Next构建/测试后接真实core |

每次分派核现有实现和缺失增量，按独立文件拆分；公共契约/包依赖/锁文件/迁移编号由主控单写者管理。开发者不并行改同文件、不在消费端私改OpenAPI或生成DTO，不以临时生产页面/假认证/空路由代真实业务。契约新增或破坏变化先在唯一契约修订并生成，随后各端消费同版，不边实现边猜字段。

## mock与真实接口切换

App通过现有 `src/features/account/api.ts`、`src/features/feed/api.ts`和controller依赖注入消费HTTP，不把Prism返回写入正式状态/账号。后台UI只调固定 `/api/management/*`；BFF统一加密cookie、同源校验与core请求，浏览器不得直持core秘密或管理员token。mock UI与mock core-admin分别隔离，不能交叉把浏览器契约当core契约。

独立mock只验证可渲染状态、输入保留、方法与结构。切真实接口时恢复统一local运行配置，确认实际base URL、当前会话/audience/环境，再测试完整HTTP及失败/unknown/CAS/撤权；类型、mock、组件均不能证明官方Auth/DB/Storage或真实MFA已成功。不得为了测试创建另一套平台认证或永久演示产品路由。

## 共享资源与运行

源码留当前工作树。唯一H盘运行副本、DB/夹具、Metro、浏览器及设备串行交接；`local.ps1`本身有共享operation锁，不等于允许两个开发者轮流覆盖稳定采图版本。并行期间使用独立mock和端内检查；需要真实服务时先由主控安排资源所有者和范围，后续交接给出源码版本/入口/设备与影响项。

常规JS/TS/Uniwind样式走Metro；native依赖/代码/config plugin或runtime兼容变化才Actions重建，禁止本机编APK/AAB/IPA。使用既有工作流和已产出同版包，健康服务/依赖复用，不重复创建容器组、reset或seed。运行命令见[quickstart](../quickstart.md)。

## 验证与真实交付

业务规则、权限、安全、数据完整性和并发由有效API/集成测试证明；组件验证真实控件触发参数；原生自动化验证输入/导航/反馈/生命周期。固定独立UI角色仅按稳定集成版本、同页同状态单主题检查布局/颜色/遮挡/可读性，不查功能交互或重复dark。必要整页真实对照与用户首次实际产品基准继续保留。

日常目标及直接影响回归，失败保原结果，修复后窄复测；无关文档变化不重开完整业务/设备矩阵。未执行/失败/跳过/取消/超时/环境故障不计通过。生产另匹配具体版本/产物/迁移/权限/环境/名单授权；开发通过不自动部署。

可复用现有能力及当前账号边界见[accounts](accounts.md)，完整媒体消费技术见[media](media.md)。
