# Codex 直接开发（ED-23）

2026-10-16，用户批准执行 `codex-direct-development-adjustment-2026-10-16.md` 的清理方案：
保留 SK 规格、现有实现、有效业务测试与 UI 设计，卸载 Superpowers、SK–SP 桥接及其纯流程平台。
本决定取代 ED-22 中“继续使用 SP”及旧历史材料中的执行归属，不改变产品、安全或技术范围。

Codex 直接读取宪法、当前切片涉及的 spec／contract、tasks 和源码，完成可验证的小批次。
只在需求实质变化时维护规格；不重生成 285 个任务，不派生另一份执行计划，不默认多 agent。
目标检查及直接受影响回归按实际风险运行，保留真实失败和未验证项。有效权限、安全、数据完整性
及缺陷回归测试继续保留；不以编译、mock 或流程记录声称功能完成。

页面先在现有 HTML 原型统一入口补齐，用户明确验收该版后再实现对应生产页面。
移动端仍为 Expo、React Native、Expo UI。Android 所有安装包由 GitHub Actions 编译：
真机 arm64-v8a，模拟器 x86_64；本地仅下载、安装、运行，普通 JS／TS 使用 Metro 热更新。
真实短信接入暂缓，不用合成验证冒称真实短信登录完成。

源码保留在当前工作树，可配置运行、缓存和报告继续使用 H:/Projects/AgoraWeave/development。
本地服务配置迁入运行工作区 `.agoraweave/local/{dev|test}/runtime`，沿用原 project、凭据和数据卷。
旧流程文件由 Git 历史保存；未提交 bridge 事件及旧私有运行资料另存 H 盘私有备份，不作为现行入口。
规范同步及其 post-commit／post-checkout 钩子独立保留，全工作树和分支须保持一致。

日常入口和命令见 [执行政策](execution-policy.md)；实际实现、测试边界见
[源码检查点](current-development-state.md)。本次清理不代表全产品验收或生产授权。
