# 统一配置契约 v1

定义字段：`key,owner_module/plugin,description,value_schema,default,status(confirmed/engineering/provisional),allowed_scopes,range,dependencies/conflicts,read_permission,write_permission,sensitive,effect_mode,consumer_ids,existing_object_policy,validation_refs`。凭据仅secret_ref；客户端只获合法非敏感effective projection。新参数缺上述登记拒绝，插件不得另建覆盖核心资格配置。

## 范围、版本和消费

作用域`global`→`environment`→目标`module/plugin`→显式授权`user_group`逐层覆盖，所有层都限定当前环境/owner。用户多组同key必须有注册的唯一优先级；相同优先级冲突拒发布，无读取顺序默认。无tenant/community业务范围。个人接收/作者可见/AI设置与平台值取约束交集，配置不能放宽当前资格。

bundle=`{version,schema_version,scope_values,compat_matrix,effective_at,preview_digest,existing_object_impacts,reason}`不可变。流程draft→validated→consumers_ready→active；无类型/范围/依赖/兼容/授权/MFA/必要生产确认则rejected。主库单事务切激活指针，关联参数不半生效。需要reload的所有消费者就绪才active，否则保旧完整bundle。每操作固定兼容bundle，当前会话/删除/用途/lifecycle独立再核，不因bundle固定被冻结。

账号批次必要后台位于`/dashboard/configuration/otp`，只管理既有六项`auth.otp_*`。超管须有当前环境、平台范围的`config.read`/`auth.config.write`及对应`config.release`或`config.rollback`；审计员仅显式`config.read`，其他角色不因名称获得权限。预览克隆完整当前bundle，仅覆盖当前环境六项，不丢其他namespace/层/compat/消费者就绪状态；复用实际OTP消费者的同一校验器与官方Auth期限上界。

不可变预览绑定actor/session/env/base_version/registry_digest/完整候选/原因/动作摘要，5分钟过期。提交重新核当前grant、签名及当前Auth aal2、DEC-001、registry和CAS基版本，消费一次具体动作stepup后在同一事务创建并激活完整新版本、operation及审计；任何失败保原指针。发布同时保存变更前OTP值与版本，包含首次baseline；回滚选本环境历史值生成新版本，仍需预览/MFA/权限/相同校验，不能直接复活旧完整bundle。已完成精确重试只重读结果，当前撤权仍拒绝；新challenge消费新配置，旧challenge保签发时期限/预算，修改与回滚均不清历史限流。

旧客户端值只能提示，服务端执行当前值；冲突错误返回current_config_version和可恢复结果，保输入/已成功附件。消费者含移动、后台、分享、API、SQL/RLS、媒体、任务、AI/MCP及插件；适用规则同源生成版本化投影，不把厂商env默认当孤立权威。回滚构建新bundle并重新校当前兼容/权限，不能回滚删除/撤权/锁票/终态请求。基础核心认证/RLS/隔离/审计/AI只读/数据政策没有普通关闭开关。

## 现有对象生效

| 参数类 | 新操作 | 既有对象 |
| --- | --- | --- |
| 文字/附件大小/数量/类型 | 执行时当前上限；超限保输入 | 已合法发布不因新上限自动删除，仍授权；再次编辑验证允许修改字段 |
| 请求expiry/冷却 | 创建/结束时固化截止与config_version | 旧截止保留；专门变更需预览且不复活终态或绕拉黑 |
| 删除恢复/保留 | 状态转换固化trigger/due | 不早毁唯一恢复副本；延期有理由授权审计；原时钟不随插件重装改 |
| 投票时长/选项 | 新投票当前校验，首票前允许合法修改 | 首票后三项锁定、原截止不变，结束不重开 |
| AI日成功/成本 | 当前规则核新预留与结算，未知独立对账 | 已成功次数不回退，降低上限阻止新调用、不重复扣；金额缺失不无限 |
| 可见性/用途/收录/处罚/会话 | 当前事实即时核 | 权限收紧立即拒新访问，收录关闭立即noindex；配置恢复不能覆盖事实或作者选择 |
| UI/排序/菜单 | 仅现有支持能力版本化生效 | 无运行能力/权限则不可用，不凭配置新增代码/native |

FR-113播放消费者须显式登记：本人video_policy三值（初始wifi_only）、preload关闭能力、播放器与GIF组件、系统网络／省流量／减少动效适配、设置页，以及信息流／详情／主页／搜索／收藏／评论／私信和适用分享／后台／插件媒体入口。本人明确选择和当前系统条件分别输入，配置默认不能覆盖既有个人选择；主题仍本机。各端只消费实际支持且当前有权的媒体，投影／设置读写／状态切换与验证引用须完整，不能仅登记编辑器或上传器。行为与验收见[plan TD-07D](../plan.md#td-07d--媒体播放偏好与消费入口)。本轮不另设新的预加载默认值，不扩大可上传媒体种类。

播放输入按audience登记真实来源：App本人账号选择经GET/PATCH /me/preferences取得；ED-10的分享端仅有固定合法平台默认＋当前页面操作，没有账号选择来源，匿名／登录一致。分享/config/effective不得附本人preferences或假装“非敏感”即获私人投影授权；T147等共享配置消费须按此分开，不推导分享读取个人DTO。分享页改变播放／预加载状态不持久化账号、不同步App，正常平台配置与个人设置不能互相代替。后台／插件也仅使用已有合法用途投影，不扩权。

## 首版注册集合和效力

必须登记spec“已确认初始业务参数”“已确认数据分类期限”的全部项、ED-02文字上限、DEC-001清单及RD-10工程参数；此处不复制全文改变批准身份。namespace至少`auth,profile,social,content,comments,polls,drafts,deletion,media,dm,notifications,search,sharing,ranking,moderation,documents,ai,retention,ui,plugins,release,sandbox`，每个真实consumer关联key。

确认值：帖2000/长10000、图9/10MB、视频1/200MB/300秒、GIF1/15MB、评论4图或GIF、投票2–4/300–604800秒、用户名频率/旧名30天、删10秒/30天、不同请求30/7天、AI20次/8000输入含上下文/2000输出及各数据期限。ED-02正文评论2000/DM4000/请求500/选项100是工程选择。RD-10风险/timeout/页大小、时区Asia/Shanghai也是工程选择，启用前核风险/成本，不冒称用户原话。MB=1,000,000bytes工程口径，各端显示一致。

生产既有参数变更若实际影响生产权限/范围/结构，仍按release契约先具体确认；无需构建不等于无需权限或确认。所有发布留下前后值、人员、理由、影响、结果、版本和恢复限制。云端AS-04覆盖旧对象/失败/竞争/回滚和consumer一致性。

## 收录及正式资料消费者

sharing登记有效公开默认可收录、非公开强制不收录、网页响应／sitemap／主动收录／预览消费者及[数据模型](../data-model.md)的author/target策略。账号与目标设置是本人受控业务事实，不是管理员普通scope覆盖；配置不得把作者false改成true、将AI开关映射为收录许可，或拿异步投影旧值替代当前决定。

documents登记注册条款／隐私入口、AI处理告知、社区规则／帮助的稳定key、环境／入口／用途、当前document_release引用及消费者，引用必须已发布且匹配scope/digest。正文通过[HTTP文档管理协议](http-api.md)形成不可变版本，不允许在普通配置字符串、模板示例或插件配置里绕过编辑／发布／审计。发布相关引用与必要consumer投影保持一致，不完整／无权限／版本错配则拒激活；回滚引用不能自动重发旧制度、生成用户同意或绕过生产具体确认。
