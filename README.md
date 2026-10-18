# AgoraWeave

产品需求、原型、生产源码与开发契约在同一仓库。开发入口为
[development/README.md](development/README.md)，代理入口为 [AGENTS.md](AGENTS.md)。

| 内容 | 入口 |
| --- | --- |
| 产品范围 | [PRD](docs/product/PRD.md) |
| 逐功能说明 | [需求覆盖](development/coverage.md) |
| 固定技术栈及官方源码 | [技术约束](development/technology.md) |
| 三端 API | [契约](development/contracts/README.md) |
| App 原型与批准 | [HTML 原型](docs/design/prototype/index.html)、[页面登记](docs/design/page-registry.json) |
| 成果与未完成范围 | [状态](development/status.md) |
| 本地运行 | [快速开始](development/quickstart.md) |

App 使用 Expo / React Native / Expo UI；后台完整复用 Kiranism；后端完整复用 Supabase 官方 Compose。
版本、来源提交和依赖固定；新增业务在这些源码的现有接口与扩展点上实现。

```sh
npm ci
npm run api:generate
npm run api:check
npm run api:mock:app
```

Windows 的依赖和运行数据按快速开始放在既有 H 盘运行区；原生安装包只在 GitHub Actions 编译。
模拟接口与契约检查不表示整个产品完成。真实对接、原型一致性和生产操作分别按对应范围验收。
