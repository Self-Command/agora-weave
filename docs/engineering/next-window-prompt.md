# 新窗口继续开发提示词

在C:/Users/by970/Desktop/my-project当前分支codex/agoraweave-tdd-rebuild-clean继续AgoraWeave开发。
先读取AGENTS.md、.specify/memory/constitution.md，运行
`pwsh -NoProfile -File tools/dev/sync-governance.ps1 -Verify`，再读execution-policy、current-development-state顶部最新状态，
及本阶段相关SK spec/plan/tasks、契约和实际源码。以当前Git、文件、服务和真实测试为准。

直接使用既有SK资料及285任务，不恢复SP/桥接/认证收据或另建框架，不因旧证明不完整重做健康代码。
核实Phase2 T028–T051现有成果和剩余后端范围，先完成本阶段后端实现及适用目标验证，再集中获批App页面/API和后台业务，
最后阶段集中真实视觉交互集成复检。日常目标及直接受影响回归，修复后只复测受影响项，发布保留完整适用矩阵。

用户已要求删除未按原型实现的旧UI。旧账号4个整页TSX已移除，业务逻辑提取至account目录纯controller和native-controllers，
API、安全存储、恢复辅助、已批准共享组件/token及有效测试保留。账号入口与分享首页暂为null，不恢复旧页面，不能声称账号旅程完成。
新账号页面按对应获批原型接回这些真实控制器；r2五页仍pending，基础组件批准不等于整页批准。
原型“基础组件”预览页已按用户确认删除，组件本身保留。

先实际查看docs/design/UI-SPEC.md、design-tokens.json、prototype/README.md及对应画面。
同一原型入口可精确直达，例如docs/design/prototype/index.html?page=login&scene=正常&theme=light；
五页为login/register/otp/security/recovery，状态来自选择器，theme=light/dark。不把旧UI、其他状态或历史组件图当该页设计。
先完善并展示具体页面/状态供我批准，再实现生产UI；等待批准继续独立工作。

宪法7.0.0采用忠实还原已批准设计、允许必要原生适配：保持布局、信息层级、颜色、组件和操作；
错页、缺内容、明显设计偏离、遮挡及功能问题必须修复；细微字形/抗锯齿/换行等差异作建议，不单独阻塞阶段。
不追求跨平台零像素差异，不借适配另作设计；实质设计差异交我决定。人的具体原型批准、独立复检与用户验收仍保留。

后台apps/admin已完整导入固定Kiranism源码，全部582原文件与SHA映射保全；读apps/admin/INTEGRATION.md。
保留官方布局、导航、主题、表格、表单与样例源码，开发到对应模块再接真实业务，不再裁壳重做。
当前只有显式本机开发模板预览，样例是合成数据；生产及尚未实现的真实管理身份/MFA/权限入口拒绝403。
不启Clerk/keyless或Sentry外发。16族同款字体已本地化，启动不需Google下载；不反复升级或重装依赖。
Supabase继续完整官方Compose/Auth/Postgres/Storage/Realtime，优先配置/接口/扩展点，不重造既有能力。

统一运行入口沿用tools/dev/local.ps1，H:/Projects/AgoraWeave/development/workspace和原私密配置/数据卷。
先-Status检查，按本阶段需要-Up -Services supabase,admin,metro；健康实例复用，-Logs查看，-Stop不删卷。
后台http://127.0.0.1:3000/dashboard/overview，Metro http://127.0.0.1:8081/status；先实际确认地址可用再给我。
缺依赖才显式-Install；迁移仅显式-Up -Services supabase -Migrate，不自动清seed，不创建重复开发容器组。
普通JS/TS用Metro/Next热更新；所有APK/AAB/IPA只在Actions编译，本机仅下载安装复检。
真机arm64-v8a、模拟器x86_64，无32位。App保持Expo/RN/Expo UI，不转网站或WebView。

用户建议采用Uniwind减少重复App样式，官方评估已完成，优先在下一批获批页面接入免费MIT版及Tailwind4。
本次尚未安装；先核当前官方版本并锁定，映射既有设计token，按monorepo指引只扫描实际App/共享组件。
配置Metro及正确CSS导入位置，复用同一运行环境并实际验证bundle、主题、热更新；不因纯JS样式依赖无故重建APK。
Expo UI原生控件按其modifier/props适配，必要动态style保留；Uniwind不替代原型批准或决定页面设计。
后台继续使用完整模板原有Tailwind/shadcn方案。依据及官方链接见prototype-development-research-2026-10-17.md的Uniwind评估。

主agent负责范围、架构、接口、复杂授权/事务/并发、集成审查、验证与交付，复用开发者真实结果。
所有开发子agent含代码复检固定显式gpt-6.1-sol/high；UI独立复检固定gpt-5.6-luna/xhigh，不参与开发。
启动/恢复核实际模型，配置不可用报告不自行替换。通常主加两开发，活动数服从工具上限，不强拆小改动或递归扩张。
每包给仓库根、宪法路径及遵守要求、既有任务ID、文件范围、API契约、预期行为和目标测试，不继承整个开发会话。
同文件单写者；公共契约/依赖锁/迁移编号/规范由主agent协调。共享DB夹具、H运行区、Metro、浏览器和设备串行交接；
工作树只隔离源码，切来源先停旧受管环境，不同时覆盖运行区。规范集中完成后-AllBranches/Publish再Verify。

当前27核心目标/159用例/37迁移；新增纯控制器回归不代表完整159或云端dev/test通过。
旧完整139曾2失败，随后局部修复，当前未重跑完整核心；Unicode本地Node/Deno/Android Hermes766向量的历史结果不能代云端Hermes。
真实短信继续暂缓；公开challenge/verify、无登录恢复、补证/审核/恢复执行及完整跨端旅程仍有缺口。
任务完整范围才勾选，保留失败/跳过/未执行事实，不把工具/模板/空路由通过当业务完成。
完成可验证业务小批，简短报告实现、实际测试和剩余项；不以反复整理旧报告代替开发。
