# 产品只读 MCP 与 AI 契约

内部MCP协议2025-11-25，标准initialize/tools/list/tools/call；核心AI broker建立调用上下文，未对外开放任意MCP客户端。内部调用身份必须由broker绑定当前用户/会话/环境/插件，工具payload不能换用户；工具进程无任意DB/网络/写入/管理权。readOnlyHint为描述，实际权限与服务端白名单强制，无写工具注册。

| 工具 | 有界输入 | 输出及实际用途 |
| --- | --- | --- |
| community.search | query≤2000字符、type/time、limit≤20、explicit_refs可选 | 当前有效公开候选链接，retrieve；生成摘要必须另获summarize |
| community.get_content | resource_ref、approved_selection_ref可选 | 合法当前版/依赖/作者时间；实际用途retrieve及summarize（如果用于生成） |
| community.get_discussion | post_ref、cursor、limit≤20、selection_ref | 当前有权讨论/占位，同上，无已删除中间正文 |
| community.public_profile | stable_account_ref | 允许公开资料，无手机号/收藏/私人历史 |
| community.topics_trends | window/limit≤20 | 真实公开信号，推荐选择/排序须recommend，不能泄进行中未投结果 |
| community.related | source_ref、limit≤20 | 当前有权且允许recommend候选，生成相关理由再核summarize |
| community.help | query、approved_help_version→document_release | broker核当前有效且获发布的规则／帮助版本，输出真实正文及document_ref/revision/release/digest；不可选draft／ready／withdrawn或把历史版本当现行制度，无虚构制度 |

统一结果`{items,sources:[{resource_id,revision_id,author_public_ref,published_at,required_purposes,dependency_refs}],policy_epoch,availability,errors}`。来源不含高权地址。工具参数/返回/上下文/调用次数由统一配置限制，初始≤8次/请求；超出拒绝保输入。恶意内容仅数据，不改变工具清单/主体/用途/网络边界。普通关键词搜索不是AI用途。

来源为显式联合：社区内容保留上述resource字段；制度／帮助使用`source_kind=document,document_ref,revision_id,release_id,content_digest,published_at,dependency_refs`，不能伪造帖子ID／个人作者或省略来源。模型提供的approved_help_version只能与broker解析的当前获准版本匹配，不能选择未发布或过期制度。发布变更／撤下使帮助来源进入当前有效性重核，答案、标题、历史、复制和续问沿同一依赖闭包处理；正常文档阅读不授予模型写入、发布或用户同意能力。

## 输入、发送与输出

广泛查找/总结/热门/自动推荐只用合法公开候选，满足所有实际用途和屏蔽/拉黑/治理。受限帖必须主动selected_ref＋当前资格＋作者许可＋处理告知版本；self/草稿本人显式确认。私信/证据/后台记录/待审限制删除/旧版均无通用选取工具。已识别内部引用不能改称粘贴绕过，不能识别来源的输入告知处理且不自动扩展源/附件访问；外链仅文字，无自动抓取。

获准模型必须service registry中具体模型/版本、真实政策证据、地域/分包/不训练/保留删除、tokenizer、配置和预算就绪。请求每次发送必要正文前当前核；不传手机号/凭据/无关资料/整库。无合格服务/缺预算拒新真实调用，保留输入，不能暗换供应商/跨境。

答案保存直接来源及依赖旧回答传递闭包，标题也是依赖输出。每流单元、完成、历史打开/标题、复制、重试、续问、来源跳转重核资格/用途；源失效导致原文/摘要/实质依赖撤回，不能可靠拆则整条withdrawn，后续上下文不引用隐藏内容。重新生成无撤源答案是新真实request，不能改标假完成。完成须真实有效内容及完整状态，heartbeat/截断不是成功。

## 用户命令与额度

新会话/改名/删/停止/复制/反馈由HTTP确定性用户服务授权写，不赋模型写工具。20成功/日、8000输入含系统必要上下文和检索、2000输出，模型tokenizer在云端边界验证后启用；过限缩上下文仍遵循来源，不擅自丢证据生成。Asia/Shanghai初始时区，日桶和配置版本明确。

quota锁日桶预留，成功唯一settled，明确失败released，未知保留待核，不能并发超过成功+预留上限；费用estimated/actual/unknown独立，不把停止/失败当免费。retry关联原request，原未知先对账，不重复成功扣或同一供应商请求费用记录。全局/单用户/单次预算金额Q-03/04准入，不默认无限。

用户最新明确金额通过后台设置、运营由用户负责：交付全局／用户／单次金额限额、当前消耗／预留／未知对账、告警、暂停新调用、审计及安全重启的统一配置功能。具体金额由用户配置，不前置询问预算；未配置有效付费许可／额度时不默认无限或偷偷选服务。既定20次／日与Token规则独立保持。

云端验证包括真实模型、来源真/相关/当前有权100%、无证据明确未知、用途混合、恶意指令、源撤权/流中撤回/标题/续问、未知费用/并发额度及政策禁止。普通有用≥90%仍暂定有标签评估集，不能由模型自评或mock当完整验收。
