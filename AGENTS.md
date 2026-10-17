# 项目代理入口

- 开始工作先读 `.specify/memory/constitution.md`、`docs/engineering/execution-policy.md` 和 `docs/engineering/current-development-state.md`；宪法缺失或不可读即报告并请求用户处理，不得推断或代替。
- 本会话首次工作、切换工作树/分支或规范变化后，在仓库根运行 `pwsh -NoProfile -File tools/dev/sync-governance.ps1 -Verify`；未变更时复用结果。失败先同步，不使用旧规范开发。
- 一切规格、计划、实现、测试、复检与交付须遵宪法；实质冲突按第九条取得决定。既有 SK spec/plan/tasks 是唯一规格基线，保留 285 个任务 ID、产品范围和真实未完成边界，不重生成、不恢复 SP/桥接/认证收据或另建执行框架。
- 实际生产业务优先，按阶段后端→集中获批 App 页面/状态/真实 API→集中视觉交互集成复检。除 HTML 原型外不新增演示产品页面、临时功能或测试壳；不删除有效合成测试。细则统一见执行政策。
- 用户已批准按执行政策分工并行：主 agent 统筹架构、接口、复杂风险、集成与交付；所有开发子 agent（含后端/App/后台与代码复检）统一显式使用 `gpt-6.1-sol`、`high`，UI 复检沿用固定配置。按独立文件与依赖拆分，不同时启动全部角色；共享 DB、运行区和设备串行使用，规范由主 agent 集中同步。
- App/分享 Web 生产 UI 前须取得具体页面、适用状态、版本的人类明确原型批准；基础组件批准不等于整页批准。设计不变的实现修复沿用批准，设计变更重新批准；页面完成须实际整页对照和真实交互复检。
- App 在正常字体 1.0、同页同状态同主题及适用约 390×844 内容区须与批准原型一模一样，正确处理安全区；具体差异须用户决定。后台直接以完整 Kiranism 官方模板为基准，无需重画同款 HTML，仍须实际后台视觉/交互复检。检查时提供已确认入口或设备路径，不暴露秘密。
- 阶段 UI 复检由独立专职子 agent 承担，固定 `gpt-5.6-luna`、`xhigh`；不参与开发，按对应设计基准检查真实页面和交互、列明差异并复测修复。不能自授用户批准，模型不可用须报告，不静默替换。
- 完整复用 Kiranism 源码与 Supabase 官方 Compose/Auth/Postgres/Storage/Realtime，优先配置、官方接口和扩展点；不得裁成空壳重做或把许可/依赖冒充复用。App 保持 Expo/React Native/Expo UI。
- JS/TS 使用 Metro 热更新；原生变化才重建。所有 APK/AAB/IPA 在 GitHub Actions 编译，本机只下载安装运行；arm64-v8a 真机、x86_64 模拟器，无 32 位。
- 规范及现行工具/验证契约变更集中完成后，必须同一变更运行 `pwsh -NoProfile -File tools/dev/sync-governance.ps1 -AllBranches`，再 Verify；发布分支用 `-AllBranches -Publish`。钩子不可绕过，报错须修复。不得 `git add .`。
- 历史报告只证明历史，规范一致不代表业务或测试相同；不得靠记忆、交接提示或旧报告代替当前文件/Git/校验结果。
- 子 agent 仅允许 `gpt-6.1-sol`、`gpt-6-sol`、`gpt-5.6-luna`，须显式指定并核对实际模型，禁止继承/默认/回退到 Astra 或名单外模型；委派须传仓库根和宪法路径并要求遵守。
