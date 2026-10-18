# 项目代理入口

- 先读 `development/README.md`、`development/technology.md`、`development/status.md`；再读本次功能及对应契约。用户已于2026-10-18批准此入口取代旧spec/plan/tasks/宪法，禁止恢复旧体系。
- PRD保产品范围；`development/features/`保逐动作规则；OpenAPI保wire字段；版本化SQL保实际schema；既有原型/页面登记保设计及人类批准。冲突定位具体来源，不猜测、不重生成产品需求。
- 技术栈与官方来源固定，见technology。完整复用Kiranism和Supabase官方源码及能力；App保持Expo/React Native/Expo UI。优先配置、官方接口、扩展点，只实现产品业务，不重写成熟平台或裁成空壳。
- 保留现有代码、未提交成果、有效测试和原型。先核现状，只做缺失增量。模拟接口、类型检查和旧报告不代表真实业务完成；如实记录失败、未执行及环境问题。
- 三端按同版契约可并行或各自独立开发。使用openapi-typescript、Prism、Specmatic；生成文件不手改。开发者只读共享契约，主控单写公共契约/依赖/迁移编号，并完成影响审查和再生成。
- 多agent职责和最小工作包见 `development/agents.md`。所有子agent必须显式指定允许模型并核对工具配置，禁止继承、默认或回退到Astra/名单外型号。允许名单仅 `gpt-6.1-sol`、`gpt-6-sol`、`gpt-5.6-luna`；三端开发统一 `gpt-6.1-sol` / `high`。用户2026-10-18取消独立UI复检，App与后台UI、交互及前端逻辑由用户验收。
- 当前快速开发按 `development/delivery-mode.md`：保留并复用现有原型/批准，App和后台按既定规则直接实现缺失页面并热更新，不再逐页等待原型批准；后台复用完整Kiranism。每轮先读根 `人工验收.md`，保留用户反馈，用户指出的问题修复后更新待复查，其余时间继续开发。分享Web仍按其范围及原批准边界后置。
- 验证按 `development/acceptance.md`：日常仅受影响编译/类型/契约及后端关键权限/事务/并发等必要检查；不做独立前端/UI巡检，不新增重复测试，不删除有效测试。完整流程在当前首版功能齐备后集中运行，不将未验收记通过。
- 普通可逆工程自主完成。改变产品范围/固定技术栈/安全隐私、产生费用、不可逆数据或具体生产操作须用户批准，仅暂停相关动作；本次文档迁移及旧体系清理已获批准，不重复请示。
- 源码留本工作树，运行/依赖/缓存/报告用既有H盘区域；共享DB、运行副本、设备和浏览器串行。保留原私密配置/唯一dev组/数据卷，不自动reset或seed，不复制生产秘密。
- JS/TS/样式使用Metro；原生变化才重建。APK/AAB/IPA全部在GitHub Actions编译，本机只下载安装运行；arm64-v8a真机、x86_64模拟器，无32位。
- 首次/切换工作树或分支/共享规范变化后运行 `pwsh -NoProfile -File tools/dev/sync-governance.ps1 -Verify`；未变复用。共享文档、契约、现行工具集中修改后主控同批 `-AllBranches` 再 `-Verify`。同步失败修复原因，不绕钩子，不使用 `git add .`，不把文档同步当业务同步。
