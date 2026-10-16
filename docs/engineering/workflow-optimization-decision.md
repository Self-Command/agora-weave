# ED-24：直接开发与设计验证优化决定

2026-10-17，用户明确批准调研方案，并要求使用允许模型 `gpt-6.1-sol` 的子 agent 只读复检后更新相关文件、父 agent 复检，交接新窗口继续业务。本轮不开发产品、不恢复后台、不更改既有64个未提交业务文件，不重生成规格或285任务。宪法6.0.0重定义后台设计基准，保留 App 整页批准、真实运行与用户最终判断，首次批准日期仍未知。

保留 SK 现有 spec/plan/tasks，直接实施；完整复用 Kiranism 源码和 Supabase 官方能力，优先配置、接口和扩展点。App/分享页具体原型先批准，后台以完整官方模板为基准；独立组件批准不等于整页批准。每阶段后端→集中已批 App 页面/API→集中实际客户端复检；日常目标与影响回归，阶段批量验证，发布完整适用矩阵。页面轻量绑定、内容增量运行同步及既有测试适配服务真实交付，CI 不判断美观、不产生人类批准、不恢复收据平台。

调研适用性：

- [OpenAI Harness engineering（2026-02-11）](https://openai.com/index/harness-engineering/)：入口短导航、可读工程知识与真实 UI 反馈；本项目不另建平台。
- [Stripe Minions Part 2（2026-02-19）](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)：复用环境、局部反馈和有限完整 CI；不照搬其内部编排。
- [Spotify background coding agent](https://www.engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1)：沿用已有 PR 和工程流程；本轮不部署后台代理。
- [Anthropic long-running apps（2026-03-24）](https://www.anthropic.com/engineering/harness-design-long-running-apps)：实际运行验证与审查边界；代理自评不能替代用户验收。
- [Figma Code Connect](https://developers.figma.com/docs/code-connect/code-connect-ui-setup/)：设计到实际组件映射；仅借鉴绑定思路，不迁移 Figma、不购买服务。
- [Rakuten 客户案例](https://claude.com/customers/rakuten)属供应商客户自述，[DORA 2025](https://dora.dev/research/2025/dora-report/)强调 AI 放大现有系统优劣；不把营销速度数字作为本项目承诺。
- [React Native 测试说明](https://reactnative.dev/docs/testing-overview)：JS 组件测试不覆盖完整原生行为，仍需对应客户端运行。

本轮仅工具目标测试/静态检查，未运行完整139核心、云端 dev/test、云端 Hermes 或完整原生矩阵；无产品完成或生产批准结论。
