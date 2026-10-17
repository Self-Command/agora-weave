# 当前开发状态

更新时间：2026-10-17。先核当前Git/源码/适用验证，不由规范同步推导其他分支具相同业务或测试。

## 基线与当前目标

285任务ID，T001–T051共51项勾选、234项未完成；Phase1开发准备与Phase2按用户指定交付条件收口。当前按[plan](../../specs/001-agoraweave-v1/plan.md)合并收尾账号App接入与后台真实身份/MFA/必要OTP配置两批，范围及唯一目标结果表见[账号批次](../../specs/001-agoraweave-v1/implementation/01-core-accounts.md)，不重做Phase2或重生成任务。

核心规格/模型/契约、完整后续需求、已有业务和有效测试保留。Spec Kit已退役，直接维护现有资料；执行规则见[执行政策](execution-policy.md)，长期决定见[决定汇总](development-decisions.md)。历史私有SQL及公有认证切片源码、报告集中见账号批次；本轮运行时未提交，最终源码摘要与提交待主控核对，完整任务不提前勾选。

## 最近完整交付证据

Phase2交付源码 `1f3861e6e62f49866c1c7e044f1dbce61936a1fe`；最终功能复验 `1e8c24d2d88f0572ba9645d2fe88b44932eb3e33`，两者产品源码相同，差异为原生自动化/Runner与发布工作流。Release固定实际构建源码：[v0.0.0-p2-20261017](https://github.com/Self-Command/agora-weave/releases/tag/v0.0.0-p2-20261017)。

| 对象 | 所记版本实际结果 |
| --- | --- |
| 类型/lint/工具/来源 | Actions通过；Linux适用工具54项、3项Windows不适用；本机57/57 |
| 官方Compose dev/test | 各27目标204/204真实用例；各45条干净库及增量迁移核验通过 |
| Web | 构建与2项功能通过，未做云端视觉 |
| Android API24/API36 | 各1项真实功能测试：输入/点击/校验/输入保留/48dp/生命周期/两个环境HTTPS；各766条Hermes向量 |
| iOS16.4/26.4.1 | 各1项真实功能测试：输入/点击/校验/输入保留/44pt/生命周期/两个环境HTTPS；各766条Hermes向量 |
| APK | Actions arm64-v8a、x86_64 preview构建，2 APK及SHA256SUMS三资产发布并核摘要/大小/状态 |

[最终功能运行39013838196](https://github.com/Self-Command/agora-weave/actions/runs/39013838196)，[安装包运行39010183818](https://github.com/Self-Command/agora-weave/actions/runs/39010183818)。原始结果与失败在 `H:/Projects/AgoraWeave/development/reports/phase2-closeout-20261017`；旧失败/取消不记通过。最终运行含临时HTTPS、dev/test容器/网络/卷及配置清理。

APK SHA-256：arm64 `2bdb256e0b6b5d0b9ea94dabc82a50b32daf7028bd3c1b95d90c2741d16b942e`；x86_64 `063a3cbcf4dfcbf9d23cd1e0c78c23909af9745cdff1c7bf3faacf308d36fc55`。这是隔离测试签名Android预览包，不代表生产或iOS设备IPA发布。用户按决定下载后本地检查视觉。

## 已有能力与真实未完成边界

已有核心当前身份/RLS、资源/依赖/媒体输出、耐久拒绝日志、幂等/可靠效果、配置解析和版本、正式资料读取/原子准入；现有controller/API、安全存储、刷新/撤销/退出及恢复申请/状态读取优先复用。AD04真实8MiB对象证明撤权后新Range拒绝、同流截断；观测窗口70秒，不承诺立即EOF或播放器消费者完成。

公有challenge/verify及同operation证明查询已接官方Auth和阿里云适配；当前邀请/年龄/条款原子准入、环境keyed摘要、网关入口、单次发送/验证、短期加密回执及清理保留。App账号controller/API已对接；完整Kiranism后台已接真实身份/MFA、必要OTP配置预览/发布/回滚及BFF，旧aal1 JWT不因数据库升级获管理资格。后台手机号输入新增国家区号Select；用户名密码/图形验证码/忘记密码入口UI已接模板，备用登录整体默认关闭，端到端验收及真实用户名密码初始化未完成，不能冒称已有可用账号。

原合并两批11目标152/152、工程68/68、tools/mobile/admin TypeScript与admin oxlint通过；password adapter TS/ESLint初次失败已修正，窄复验待补。0038–0043已显式追加至唯一dev组，最新核验为追加0043一条并核原54条，总55条，未reset/seed；0043修复0041手机regex。真实官方Auth/TOTP、管理配置发布、operation及撤销4项HTTP通过；本机BFF/UI完整链及剩余light布局复检仍在执行，待主控补结果。证据位于 `H:/Projects/AgoraWeave/development/reports/account-app-admin-20261017/`，目标表、命令与精确边界集中见[账号批次](../../specs/001-agoraweave-v1/implementation/01-core-accounts.md)，不重复推断全产品通过。

访客公开最新流API/controller已写，纯移动客户端6/6单独记录，未计入原批152项且未接生产首页。重复guest原型已删除，继续先审现有首页原型与批准记录，复用已批设计，不再重画。真实SMS、完整五页原生/视觉旅程、分享登录、换号/恢复/注销、角色邀请分配、MFA丢失恢复、分类物理清理及生产仍未完成；全部配置消费与外观闭环也未完成。

账号r2 login/register/otp/security/recovery及选择器全部状态/浅深已获用户明确批准，准确版本见[页面登记](../design/page-registry.json)。先审现有批准再决定缺失增量，设计不变不重画；新设计仍须具体批准。当前单主题布局复检不代表完整五页原生旅程或全部视觉已验收。

后台完整固定Kiranism源码/来源映射与本地字体保留，直接接现有UI与真实API，无需另画后台原型；当前业务与本机BFF/UI收尾不等生产或完整运营验收。旧App/分享呈现退役，保真实逻辑/测试，不恢复旧页面或将空入口算完成。

## 环境与后续

源码留工作树；运行/依赖/缓存/报告位于 `H:/Projects/AgoraWeave/development`。复用原11服务官方Supabase唯一dev组及数据卷，不建立重复组，不自动清seed；运行状态先经统一local.ps1实查，旧“服务就绪/设备在线”不作当前事实。App已接免费Uniwind1.12.2/Tailwind4.3.3，常规JS/TS/样式用Metro，原生变化才Actions重建。

服务器、域名、短信与正式分发用户自行搭建。下一步先补当前窄复验、本机BFF/UI完整链与light布局结果，再核源码摘要并收尾原两批；剩余真实SMS、五页原生旅程及完整账号安全链按依赖继续。独立UI仅布局样式单主题，功能交互由业务/组件/原生验证，不重复dark。新窗口入口见[next-window-prompt](next-window-prompt.md)，实际提交以最终Git及主控核验为准。
