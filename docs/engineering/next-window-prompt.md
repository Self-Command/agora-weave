请在当前仓库继续 AgoraWeave 基础运营版开发。先读 AGENTS.md、.specify/memory/constitution.md、docs/engineering/execution-policy.md、docs/engineering/current-development-state.md，核当前 Git 分支/HEAD/工作区并按规则运行或复用 Verify，不用交接内容代替当前源码和验证。

以现有 spec/plan/tasks/contracts 为唯一基线；285 任务仍 51 勾选、234 未完成，不重生成、不恢复 Spec Kit/SP/收据平台。当前原账号 App 接入与后台真实身份/MFA/必要 OTP 配置两批合并收尾，详细范围、唯一目标表及报告入口见 specs/001-agoraweave-v1/implementation/01-core-accounts.md。本轮运行时未提交，最终源码摘要与提交由主控核对后补记。

先核并复用已有公有手机号认证、原子准入、会话/unknown 回执、App controller、完整 Kiranism 后台身份/TOTP/OTP 配置与 BFF。原两批 11 目标 152/152、工程 68/68、tools/mobile/admin TS 与 admin oxlint 已通过；password adapter TS/ESLint 初次失败已修正，窄复验待补。0038–0043 已显式追加，最新 55 条迁移摘要匹配、未 reset/seed，不能改写已应用迁移。真实官方 Auth/TOTP、管理发布、operation 及撤销 4 项 HTTP 通过；本机 BFF/UI 完整链与剩余 light 布局复检正在跑，先核主控最新结果，不能自造完成。报告在 H:/Projects/AgoraWeave/development/reports/account-app-admin-20261017。

后台国家区号 Select 与本国号码输入、用户名密码/图形验证码/忘记密码入口 UI 已接现有模板；备用登录整体默认关闭，真实用户名密码初始化与端到端验收未完成，不声称已有可用账号。忘记密码仅受理申请。真实 SMS 资源仍缺，默认公有发送关闭，合成供应商接受不等短信到达。完整五页原生/视觉旅程、换号/恢复/注销、角色邀请分配、MFA 丢失恢复、分享登录、分类物理清理及生产仍未完成，不以局部验证勾完整任务。

访客公开最新流 API/controller 已写，纯移动客户端 6/6 属原批之外，未接生产首页。重复 guest 原型已删除；继续前主控亲审现有首页原型、实现、任务、依赖与批准记录，只派缺失增量，禁止未审委派重复设计。账号 r2 已批设计直接复用；后台直接完整 Kiranism 现有 UI，无需另画原型。独立 UI 复检仅布局样式、单主题，不查功能或交互、不重复 dark；业务/组件/原生验证继续承担功能交互责任。

主控统筹架构、复杂授权、接口与集成交付；优先复用同职责合规实例，开发/代码复检显式 gpt-6.1-sol/high，独立 UI 固定 gpt-5.6-luna/xhigh，实际工具未暴露型号记未知，不继承默认或回退。共享 DB/H盘运行区/Metro/设备串行，禁止递归扩张。普通 JS/TS 用 Metro，原生变化才 Actions 构建，本机只下载安装。

先完成待补的窄复验与本地集成/布局结果，保留原失败及真实未验边界，再由主控集中 AllBranches、Verify、显式暂存和提交。真实 SMS、服务器、域名与正式分发由用户搭建；费用、高影响数据、生产及安全边界变化按宪法九取得具体决定，其余授权内持续推进。
