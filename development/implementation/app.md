# App独立开发

先读本次[功能](../coverage.md)、[页面/状态/批准](../ui/pages.md)、app OpenAPI及[固定技术栈](../technology.md)。
在 `apps/mobile`现有Expo/RN/Expo UI源码上补增量，不建移动网站代替App，不重画已批原型。

生成类型来自 `packages/contracts/src/generated/app.d.ts`；账号API/controller/SecureStore和访客feed API优先复用。
接口调用按契约确定输入、成功/失败/未知结果和保输入行为；组件负责真实触发，不把controller单测当点击通过。
用 `npm run api:mock:app` 提供端内开发服务；原有base URL配置切向模拟服务，开发状态不能写成正式认证完成。
后端就绪后切同版真实隔离API，完成当前交付的原生交互与获批原型整页对照。

typecheck只证明类型；Prism不验证授权、事务或完整状态流。JS/TS/样式用Metro，原生变化才Actions重建。
依赖、公共schema、迁移和原型修改交主控；详细接线及命令见[公共指南](README.md)与[quickstart](../quickstart.md)。
