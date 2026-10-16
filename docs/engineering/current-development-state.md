# 项目源码检查点与实际范围

## 2026-10-17 当前交接状态（ED-24）

源码分支 `codex/agoraweave-tdd-rebuild-clean`，现有Phase2 T028–T051成果仍含未提交业务：Git状态55个路径，展开64个实际文件。
父agent已保存原文件SHA256于H盘reports/workflow-optimization-existing-business.json；本轮流程优化不修改或夹带这些业务文件。
规范同步保持各树规则一致，不代表其他分支已具相同业务源码或通过本分支验证。保留285任务ID和27项历史勾选，Phase2未完成。

当前manifest登记27个core targets、139个core cases、37个core migrations。最近完整139仍有2失败（phase2-core-full-2.log）；
随后effects夹具事务屏障修复目标4/4通过（phase2-effects-worker-barrier.log），配置完整性5+网关4+生效配置4共13通过
（phase2-config-completeness-green.log），真实Deno独立归档7/7通过（phase2-archive-deno.log）。这些均为局部结果，尚未重新完整139或云端dev/test。
typecheck5与lint5通过；Unicode Node/Deno/本地Android Hermes的766向量分别实际通过，云端Hermes未执行，不冒充跨环境完成。
以上日志位于H:/Projects/AgoraWeave/development/reports，以实际源版本和原日志为准。

完整账号r2原型未获人明确批准；仅Phase2基础组件预览图曾获用户“通过，按此视觉实现”，独立于账号整页。
App生产页面不能按基础组件批准重做；可继续原型和独立后端。后台当前仍是h1入口，完整Kiranism官方模板待恢复，未声称已恢复。
真实SMS及公有challenge/verify继续暂缓/未完成；完整账号原生旅程、整页视觉、iOS及正式产品验收未完成。

本轮只落实宪法6.0.0/ED-24、轻量页面绑定、内容增量运行同步及原生旧壳断言适配；新增工具目标测试6/6通过（runtime增量/边界2项，UI绑定/阶段/CLI4项）；目标TypeScript及ESLint检查通过，页面清单structure通过。原生测试仅代码适配，未云运行。
父代理独立复检：全部41项工具回归、规范同步工具1项回归、工具TypeScript检查通过；额外lint发现同步脚本缺少显式Node process导入，已修正并复测。64个既有业务文件SHA256变化0，285条任务正文和勾选变化0。日志为reports/workflow-optimization-primary-*及workflow-optimization-governance-tests.log。
未运行完整139DB、云端dev/test、云端Hermes、完整原生构建/矩阵，未开发产品业务。规范同步与远端发布以本轮最终Verify及reports/governance-remote-sync.json为准，不推导产品通过。
下一窗口先核现有Phase2源码和后端剩余范围，复用健康成果，按后端→获批UI集中实现→阶段集中复检继续。

## 2026-10-16 历史检查点（以下仅证明所记版本）

观察日期：2026-10-16（Asia/Shanghai）。源分支codex/agoraweave-tdd-rebuild-clean；原批次业务b4c825c及操作恢复／登录绑定3486fe2已提交，并在607def1合入已发布规范历史。恢复申请批次在该分支继续提交；规范同步不自动同步业务实现，也不表示其他分支测试通过。

2026-10-16 最新执行状态：已按 ED-23 清理 SP 插件及其 marketplace、SK–SP 桥接、强制 hook、子模块和纯流程认证／收据平台；由 Codex 直接使用现有 SK 资料推进。原 285 个任务 ID 和 27 个历史勾选保留，业务代码与既有核心测试未因清理删除。旧未提交 bridge 事件及私有运行资料保存在 H 盘 private-backups/sp-removal-20261016，不是现行入口。

服务配置已按原字节迁入 H 盘工作区 .agoraweave/local/dev/runtime；原 project、凭据和数据卷沿用，11 个官方服务健康。清理后保留 18 个 CI 辅助文件及 5 份工具测试。35 项工具测试、工作区全部类型检查与 lint 通过；最终 19 个目标／105 项真实核心测试全部通过，无失败、跳过或取消。首轮整组串行执行在服务组 55/62 项通过时触发旧 150 秒限时，保留原日志，改为逐目标执行后完整复测通过。核心最终日志为 reports/codex-direct-core-final.log；类型、lint、工具和健康日志同目录 codex-direct-*。

独立新 agent 复检发现的原生 HTTPS 联合入口 P2 已修复：verify-release 同时开启服务 ingress 与原生 HTTPS，等待器按同一 run／attempt 的唯一平台版本 job 匹配。工作流 YAML、路径和本地 import 校验通过；本次未重新运行完整原生 Actions 矩阵或编译安装包，不把静态接线复核说成云端原生通过。最终复检结论以交付时的实际复核为准。

当前前端优先事项：账号页面原型草稿已接入现有 docs/design/prototype/index.html（account-pages.css／js），尚未获用户明确验收。先完善并展示统一风格原型，用户通过后才调整生产页面。现有生产账号页面尚未按该草稿重做；不能把旧设备功能检查当作设计符合。真实短信仍暂缓。

当前业务实现：

- 0103修复AM02：邀请只能从unused初态建立，拒绝直接插入used／revoked／expired或附带消费事实；既有迁移未改写。
- 0104实现本人其他设备撤销与当前会话退出：当前权限、CAS、幂等、Auth到期、核心耐久拒绝事实、审计及outbox同事务提交；旧JWT后续新访问拒绝。
- 0105／0106实现当前已发布条款集合读取及原子注册准入：实际Auth手机号验证事实、邀请单次兑换、18岁主动声明及精确版本明确同意共同写入；不是完整公开注册协议。
- 0107建立仅服务器窄函数可操作的OTP挑战：用途／当前条款集合／年龄版本绑定，5分钟、60秒重发、5次错误锁定、手机号5次每小时／10次每日及IP30次每小时，过期／重发／消费终态和并发约束。尚未连接真实短信或公有challenge／verify协议，不视为真实OTP登录完成。
- 核心路由已有GET /documents/current、GET /me/sessions、DELETE /me/sessions/{id}、POST /auth/logout和POST /auth/refresh。刷新调用真实Auth、核验签名及当前核心资格，在输出准入锁内交付；不复活撤销会话。
- Android账号页面代码覆盖邀请／手机号／年龄声明、真实条款展示及同意、验证码步骤／倒计时、会话列表／撤销／退出、安全存储、失效清理与合法重试。条款变化会清除旧同意并重载；访问令牌过期保留刷新凭据并走受控刷新；限流等待读取契约字段retry_after_seconds。
- 后续0108／0109提供当前本人账号操作结果查询，返回operation_id／action／state，不泄漏payload、会话或凭据；同编号跨操作歧义返回409。客户端对撤销结果未确认时先查询真实operation，只有匹配的succeeded才认成功。
- 后续0110为已准入账号绑定实际Auth OTP会话，核手机号、当前账号／会话资格、幂等和撤销事实；已有账号不追加注册条款同意。仅为私有后端能力，尚未接入公有verify链，不能视为真实短信登录完成。
- 后续0111／0112提供当前会话的恢复申请与本人状态查询：人工／可信模式由服务端核资格，冷却期只允许人工通道，重复及并发请求复用同一待处理案件，不返回证据／审核人，不授予恢复权限。Android页面区分受理与恢复成功，前后台切换后的晚到提交重新读取当前状态，卸载后不绘制；未接入无登录人工申请、补证、审核及一次恢复执行。

本轮实际验证：48项账号目标及直接受影响回归同批通过；随后新增的2项真实Auth刷新用例通过，并复测8项当前授权回归及最终5项刷新／准入目标。50个独立用例均有通过结果，无最终失败／跳过／取消。首次两项输出锁回归因缺少自身合成夹具返回404，补齐套件夹具后复测通过；初期运行副本／Git同步锁及刷新令牌夹具格式故障均保留原日志。类型检查、包含核心函数在内的目标lint、目标登记发现、Expo原生预生成及Android JS打包通过。独立代码复核发现的条款重载及刷新凭据问题已修复并有对应测试；新刷新边界复核无P1/P2。

后续目标结果：请求读取边界3项、操作结果3项、不确定撤销恢复2项、登录绑定2项、恢复申请4项及客户端恢复3项新增检查通过；与既有测试合计67个独立用例有分批通过结果。操作／绑定批次窄复核无P1/P2。恢复批次客户端10项及恢复／撤销最终7项通过，独立审查发现的前后台提交P2已修复并复核关闭；环境隔离、同命令异载荷冲突及并发单案件均有实际DB验证。曾因审查与主进程同时短暂撤销共享夹具导致SM02为401，改用独立恢复夹具后串行7/7通过，原失败日志保留。

原生与打包：本机首次x86_64 APK构建曾受网络及Windows260字符路径限制，使用项目缓存和短路径后已构建、安装；对应失败日志保留。用户随后明确全部安装包改由GitHub Actions编译，本机不再编译APK／AAB／IPA。android-package.yml使用64位真机arm64-v8a与模拟器x86_64分包；Actions运行38870863145／源码ca6585b预览包、38875978439／源码607def1开发包各两架构均成功，均已下载校验SHA256；云端x86_64开发包已实际安装、通过Metro加载账号登录页。arm64包未在真实手机运行，不把构建当真机通过。

设备局部检查：登录页加载、空手机号校验、服务不可用提示且保留输入、注册页年龄默认未选／条款不可用时同意禁用、普通与深色大字布局已在API35模拟器运行观察。Switch触区修至48dp已纳入607def1云端开发包，先前通过开发包热更新后的原生语义树确认。恢复页面尚未在真实认证的原生旅程完成交互复检；尚无完整注册登录／会话页面设备旅程、本人基准确认、iOS或完整Actions产品验收结论。

日志在H:/Projects/AgoraWeave/development/reports：既有account-batch／refresh／auth系列保留；恢复批次使用account-recovery-lifecycle-green.log、account-recovery-final.log及account-recovery-session-regression-serial.log，失败诊断见account-recovery-requests.log与account-recovery-session-regression.log。源码仍在原工作树，运行／缓存／报告使用H盘。按本轮用户要求，旧套重复容器已删除，目前仅使用agoraweave-local-dev-0e2dc2a715c1这一套11个健康官方服务容器；原数据卷未执行不可逆删除。以后替换开发环境时仅保留当前最新一套项目开发容器。

下一步：先落实前述账号原型验收；等待验收可继续独立的公开challenge／verify协议与受控Auth连接、认证临时资料到期清理、换号／恢复／注销后端子批，真实短信按用户决定暂缓。按需在Actions构建开发包并复用热更新，本机只下载安装和实际运行。T033／T052–T064等完整任务保持未勾选，不以本切片代完整US1。

历史资料：已提交业务检查点8fdfd19及4f58058、旧版本65项核心回归与Actions检查点、ED-22规则工具13项目标和27项回归只证明其原记录版本。本轮未重新开展历史红链认证或归档回读。现有27个完整任务勾选保留；规范同步后仍须核各分支当前源码、Git状态和适用测试结果。
