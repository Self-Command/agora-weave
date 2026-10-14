# 统一配置契约 v1

定义字段：`key,owner_module/plugin,description,value_schema,default,status(confirmed/engineering/provisional),allowed_scopes,range,dependencies/conflicts,read_permission,write_permission,sensitive,effect_mode,consumer_ids,existing_object_policy,validation_refs`。凭据仅secret_ref；客户端只获合法非敏感effective projection。新参数缺上述登记拒绝，插件不得另建覆盖核心资格配置。

## 范围、版本和消费

作用域`global`→`environment`→目标`module/plugin`→显式授权`user_group`逐层覆盖，所有层都限定当前环境/owner。用户多组同key必须有注册的唯一优先级；相同优先级冲突拒发布，无读取顺序默认。无tenant/community业务范围。个人接收/作者可见/AI设置与平台值取约束交集，配置不能放宽当前资格。

bundle=`{version,schema_version,scope_values,compat_matrix,effective_at,preview_digest,existing_object_impacts,reason}`不可变。流程draft→validated→consumers_ready→active；无类型/范围/依赖/兼容/授权/MFA/必要生产确认则rejected。主库单事务切激活指针，关联参数不半生效。需要reload的所有消费者就绪才active，否则保旧完整bundle。每操作固定兼容bundle，当前会话/删除/用途/lifecycle独立再核，不因bundle固定被冻结。

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

## 首版注册集合和效力

必须登记spec“已确认初始业务参数”“已确认数据分类期限”的全部项、ED-02文字上限、DEC-001清单及RD-10工程参数；此处不复制全文改变批准身份。namespace至少`auth,profile,social,content,comments,polls,drafts,deletion,media,dm,notifications,search,sharing,ranking,moderation,documents,ai,retention,ui,plugins,release,sandbox`，每个真实consumer关联key。

确认值：帖2000/长10000、图9/10MB、视频1/200MB/300秒、GIF1/15MB、评论4图或GIF、投票2–4/300–604800秒、用户名频率/旧名30天、删10秒/30天、不同请求30/7天、AI20次/8000输入含上下文/2000输出及各数据期限。ED-02正文评论2000/DM4000/请求500/选项100是工程选择。RD-10风险/timeout/页大小、时区Asia/Shanghai也是工程选择，启用前核风险/成本，不冒称用户原话。MB=1,000,000bytes工程口径，各端显示一致。

生产既有参数变更若实际影响生产权限/范围/结构，仍按release契约先具体确认；无需构建不等于无需权限或确认。所有发布留下前后值、人员、理由、影响、结果、版本和恢复限制。云端AS-04覆盖旧对象/失败/竞争/回滚和consumer一致性。

## 收录及正式资料消费者

sharing登记有效公开默认可收录、非公开强制不收录、网页响应／sitemap／主动收录／预览消费者及[数据模型](../data-model.md)的author/target策略。账号与目标设置是本人受控业务事实，不是管理员普通scope覆盖；配置不得把作者false改成true、将AI开关映射为收录许可，或拿异步投影旧值替代当前决定。

documents登记注册条款／隐私入口、AI处理告知、社区规则／帮助的稳定key、环境／入口／用途、当前document_release引用及消费者，引用必须已发布且匹配scope/digest。正文通过[HTTP文档管理协议](http-api.md)形成不可变版本，不允许在普通配置字符串、模板示例或插件配置里绕过编辑／发布／审计。发布相关引用与必要consumer投影保持一致，不完整／无权限／版本错配则拒激活；回滚引用不能自动重发旧制度、生成用户同意或绕过生产具体确认。
