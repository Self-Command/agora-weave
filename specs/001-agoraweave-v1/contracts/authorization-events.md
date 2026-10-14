# 当前授权、撤权与事件契约

版本1.0。主体`{account_id,session_id,audience,environment_id,plugin_id?,installation_epoch?}`由可信核心校验/构建，不信payload覆盖。动作`{action,resource_ref,requested_fields,purposes,case_grant_ref?}`由注册契约确定。所有读/写均核当前会话/注销/处罚、具体权限、资源/当前通过版、可见性/拉黑/依赖、环境/插件能力，AI再核实际用途交集。观众/计数与私人明细不同投影，管理/恢复/证据不授普通阅读或AI资格。

`share-read`先按[HTTP逐路由白名单](http-api.md)核方法、audience与用途，再核当前目标资格；只读不是全体GET许可。本人或管理员用分享会话读取草稿／收藏／私信／AI／后台等未列路由同样拒绝；有权受限分享目标及合法媒体可读，匿名输出不能继承该登录资格。分享认证仅维持该audience，无刷新／参数切换扩权。收录设置、文档管理和本人证明各自采用独立注册action，普通config写权限不能代行作者或文档发布者。

## 线性化和无旁路

撤权以主库提交／耐久拒绝事实的权威时点生效；其后新请求/Range/输出单元不能使用更早允许快照。访问admission与撤权按固定锁顺序协调，授权记录含session/account/resource/dependency/purpose/lifecycle epoch，在输出前再核；权限检查、字段投影和最终发送不得留未经协调的TOCTOU窗口。长事务不跨等待网络；媒体/AI分有界单元，续输出逐单元获准，撤权停止后续。设计不规定残余TTL许可，实测发现新访问成功就是缺陷。

原始Storage/对象/Realtime/PostgREST/Studio仅内网；业务RLS和最小grants二道保护，secret/service_role仅必要窄适配器。所有媒体HEAD/GET/Range/派生/conditional/cache-hit重核，拒绝不能304或外跳；字节缓存不等于资格。受限客户端磁盘/离线缓存禁读，前台重开/复制/历史/导航重核；失联无法核则合适占位。已经交付字节及系统外副本不可保证收回，不能混称后续服务器可控访问。

## 事件格式与实时

内部事件必须含`event_id(UUID),type,schema_version,aggregate_ref,aggregate_version,owner_plugin,environment_id,request_id,operation_id,effect_key,occurred_at,policy_epoch,lifecycle_epoch,payload`。payload受该type schema限制，默认仅必要内部refs/状态，无秘密/私人原文；内部refs也不得直接发无权客户端。

类型白名单：resource/revision/batch.changed、relation.changed、message.saved/access.changed、request.changed、notification.changed、ai.source.changed、index.policy.changed、document.publication.changed、config.activated、plugin.lifecycle.changed、release.changed、purge.changed、service.health.changed。终态变更附reason分类内部可查，发送者统一展示请求ended。新增类型版本化审核，不动态执行包代码字符串。

Postgres事务同时提交业务与outbox；consumer inbox按`(consumer,effect_key)`唯一，at-least-once重试不重复业务/通知。租约绑定环境/插件generation，到期或停用最终副作用前拒；不能只在入队核。实时gateway核每事件收件人/资源/当前会话后发合法投影，Supabase频道连接授权不承担逐事件资格。reconnect cursor只定位增量，不授权旧数据，断线补同步用当前HTTP read；失权目标正文和元数据均不返回。

客户端事件只触发失效/重新读取，安全不依赖事件送达。推送默认通用提醒，公开短预览须用户选择且发送前当前公开，私信/受限/证据/验证码始终不发正文；provider accepted不是device delivered/read。输入signal最多工程5秒、不持久在线，回执双方开才互显。

index.policy.changed只带目标／账号引用、epoch、作用范围和策略摘要，驱动sitemap／主动收录／预览作业；响应仍同步当前核，不靠事件送达实施noindex。document.publication.changed带文档／release／正文摘要及状态，不附私人证明；帮助工具、关联AI依赖和各端资料投影当前重核，陈旧事件不能重新激活已撤下版本或制造同意。

## 必需负向证据

Actions同时执行多客户端撤会话、拉黑/移粉/收紧、删除、AI撤用途、停插件、改单条消息访问；在旧JWT/URL、未过期签名、缓存HIT/304、开放WS、并发Range、SSE、重连、复制、插件API和恢复后尝试。撤权提交后的新获准读取/输出成功数0，拒绝响应不泄露隐藏正文/摘要/元数据。记录线性化请求序列/epoch/bytes和提交，不用TTL内“很快撤了”当通过。
