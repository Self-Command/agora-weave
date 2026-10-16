# 项目源码检查点与实际范围

观察日期：2026-10-16（Asia/Shanghai）。源分支codex/agoraweave-tdd-rebuild-clean；本轮工作区基点d2d1d53。业务改动仍在该分支工作区，规范同步不自动同步业务实现，也不表示其他分支测试通过。

当前业务实现：

- 0103修复AM02：邀请只能从unused初态建立，拒绝直接插入used／revoked／expired或附带消费事实；既有迁移未改写。
- 0104实现本人其他设备撤销与当前会话退出：当前权限、CAS、幂等、Auth到期、核心耐久拒绝事实、审计及outbox同事务提交；旧JWT后续新访问拒绝。
- 0105／0106实现当前已发布条款集合读取及原子注册准入：实际Auth手机号验证事实、邀请单次兑换、18岁主动声明及精确版本明确同意共同写入；不是完整公开注册协议。
- 0107建立仅服务器窄函数可操作的OTP挑战：用途／当前条款集合／年龄版本绑定，5分钟、60秒重发、5次错误锁定、手机号5次每小时／10次每日及IP30次每小时，过期／重发／消费终态和并发约束。尚未连接真实短信或公有challenge／verify协议，不视为真实OTP登录完成。
- 核心路由已有GET /documents/current、GET /me/sessions、DELETE /me/sessions/{id}、POST /auth/logout和POST /auth/refresh。刷新调用真实Auth、核验签名及当前核心资格，在输出准入锁内交付；不复活撤销会话。
- Android账号页面代码覆盖邀请／手机号／年龄声明、真实条款展示及同意、验证码步骤／倒计时、会话列表／撤销／退出、安全存储、失效清理与合法重试。条款变化会清除旧同意并重载；访问令牌过期保留刷新凭据并走受控刷新。APK与设备交互尚未通过。

本轮实际验证：48项账号目标及直接受影响回归同批通过；随后新增的2项真实Auth刷新用例通过，并复测8项当前授权回归及最终5项刷新／准入目标。50个独立用例均有通过结果，无最终失败／跳过／取消。首次两项输出锁回归因缺少自身合成夹具返回404，补齐套件夹具后复测通过；初期运行副本／Git同步锁及刷新令牌夹具格式故障均保留原日志。类型检查、包含核心函数在内的目标lint、目标登记发现、Expo原生预生成及Android JS打包通过。独立代码复核发现的条款重载及刷新凭据问题已修复并有对应测试；新刷新边界复核无P1/P2。

Android原生验证未完成：Gradle wrapper下载超时；使用本机同版本Gradle9.3.1及复制到H盘项目目录的依赖缓存后，离线构建仍缺AGP8.5.0等依赖。没有APK安装／页面交互／视觉通过结论，不能以JS打包替代。当前不运行iOS或完整Actions验收。

日志在H:/Projects/AgoraWeave/development/reports：account-batch-green.log、account-output-regression-final.log、account-refresh-security.log、account-refresh-final.log、account-auth-final.log、account-mobile-types-final.log、account-lint-final.log、account-android-bundle.log及account-android-local-gradle.log。源码仍在原工作树，运行／缓存／报告使用H盘。按本轮用户要求，旧套重复容器已删除，目前仅使用agoraweave-local-dev-0e2dc2a715c1这一套11个健康官方服务容器；原数据卷未执行不可逆删除。以后替换开发环境时仅保留当前最新一套项目开发容器。

下一步：真实短信接入及验证按用户明确决定暂缓；继续公开challenge／verify协议与受控Auth连接、认证临时资料到期清理、Android原生构建／实际交互、换号／恢复／注销后续子批。T033／T052–T064等完整任务保持未勾选，不以本切片代完整US1。

历史资料：已提交业务检查点8fdfd19及4f58058、旧版本65项核心回归与Actions检查点、ED-22规则工具13项目标和27项回归只证明其原记录版本。本轮未重新开展历史红链认证或归档回读。现有27个完整任务勾选保留；规范同步后仍须核各分支当前源码、Git状态和适用测试结果。
