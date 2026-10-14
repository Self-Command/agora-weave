# AgoraWeave 数据模型与状态约束

版本1.0，2026-10-14。依据[规格](spec.md)、[计划](plan.md)、[研究](research.md)。这是逻辑／关系设计，不包含SQL迁移或服务实现。全部业务对象受当前授权；表名仅表示拟建结构，当前未建库。

## 公共字段、边界与存储

主键UUID；时间为服务端UTC timestamptz，展示按用户／配置时区。一般实体含id、created_at、updated_at、row_version（CAS整型）。环境通过独立数据库／网络／凭据实际隔离；控制面记录environment_id，不能仅靠行字段隔离生产。无tenant/community/product业务实体。plugin_id表示代码／数据归属，不是用户资格。

权威资源记录author_id、kind、visibility(public/followers/self)、current_revision_id、policy_epoch、publication_state、deleted_at、moderation_ref和data_class；输出DTO不默认包含隐藏字段／私人原文。正文按spec ED-01与RD-10字符口径，schema载荷有大小和类型约束。secret只存核心可用secret_ref，绝不随DTO输出；手机号在Auth保管，业务稳定account_id不以手机号作主键。

按数据用途分别建索引：稳定ID、(author,created_at,id)、关系pair、消息访问、依赖反向索引、到期(due_at,state)、outbox(effect_key)、全文候选。所有索引／缓存都是派生物，不单独授权。JSONB仅用于已注册schema的配置／插件声明，不存任意动态权限或任意可执行代码。

## 身份、资格、关系（FR-001–017、103–107）

| 实体 | 必要字段／关系 | 约束／状态 |
| --- | --- | --- |
| account | id→auth.users；status(active/cancelled)、phone_changed_at、sensitive_until、identity_epoch、registered_at | 注销立即拒登录；临时/永久处罚单独建模，非等同注销；DEC-001时间权威计算 |
| admission | account_id、invitation_id、phone_verified_at、age_declaration、terms_version→document_release、terms_receipt_id、admitted_at | 新注册三条件同时成立；条款关联实际发布版本及本人明确同意记录；未准入Auth主体不成为社区账号；主动声明不冒称年龄核验 |
| invitation | token_hash、creator_id、expires_at、state、used_account_id/used_at、revoke_reason | unused→used或revoked/expired；锁定单次兑换，used不能再分配 |
| session_registry | session_id→auth.sessions、account_id、device_label、trusted_at、revoked_at、epoch | 当前有效Auth会话＋核心撤销两者核验，JWT历史有效不够；本人仅见必要会话信息 |
| admin_grant | account_id、role、operation_scopes、resource_scope、environment、expires_at、revoked_at | 五类PRD角色；无角色自授，无默认私人原文权 |
| stepup_challenge | id、account/session、action_digest、aal、verified_at、expires_at、consumed_at | 敏感动作一次使用，当前MFA/权限/DEC-001再核；不储可用验证码 |
| recovery_case | account_ref、mode(trusted/manual/mfa_emergency)、state、minimal_evidence_ref、reviewer、result、audit_ref | received→reviewing→approved/rejected/need_evidence；受控一次执行，核验不足不保证成功 |
| profile | account_id、nickname、username、avatar/background_media、bio、registered_at | 资料读权独立于内容；无首版真实认证字段或必填所在地 |
| username_reservation | normalized_name、account_id、reserved_until、current | 名称大小写归一唯一，改名频率/旧名30天；链接绑定account_id而非可转移用户名 |
| follow | follower_id、followed_id、created_at、state | 有效有向pair唯一，无自己关注；移除/取消立即撤该关系资格 |
| follow_request | sender/recipient、created_at、expires_at、state、ended_at、internal_reason、cooldown_until、config_version | 同pair至多pending；pending→accepted/rejected/deleted/cancelled/expired/blocked，终态不复活；发送者只见ended |
| block | blocker/blocked、active、created_at、revoked_at | 任一方向有效均断双向关注/新联系；解除不恢复关系或请求 |
| user_preferences | account_id、follow_approval、dm_policy、read_receipt、typing、push/notification_categories、video_policy(always/wifi_only/never，初始wifi_only)、preload(boolean)、local_theme | 视频初始静音，蜂窝默认点击；preload=false关闭推测性媒体预取，不禁止本人主动播放所需缓冲；GIF再取当前可视区／省流量／减少动效条件；个人设置不授媒体读权，平台不能强开私信/回执；主题本机选择不新增账号同步 |
| mute_rule | owner、kind(account/keyword/topic)、target、active | 默认流/通知/主动AI过滤；显式搜索show_muted仍须当前读取资格 |

ED-10明确账号user_preferences由本人App管理，share-read无权读取或写入此模型的全部或部分字段。匿名／登录分享播放器的默认与页面内操作是页面状态，不新增账号持久化实体、账号同步或个人偏好投影；SSR／共享缓存／配置不得从该模型派生私人DTO给分享会话。

## 内容、草稿、评论、投票、互动（FR-018–060）

| 实体 | 必要字段／关系 | 约束／状态 |
| --- | --- | --- |
| resource | 公共资源字段；kind(post/comment/repost/quote)、root_post、thread_id、source_id | 来源可见交集；quote链依赖任一失效整条含附加文字隐藏，不复制永久可读原文 |
| content_revision | resource_id、revision_no、body、tags/mentions、alt_text、author、review_state、submitted_at | (resource,revision_no)唯一；编辑仅允许字段，媒体/引用关系不可替换；旧版当前权＋本人/具体治理权 |
| revision_review | revision_id、decision、reason、reviewer、decided_at、request_id | 决定只作用具体revision，不能批准后来未审版本；独立整条处置优先 |
| draft | owner、body/metadata、local_origin、cloud_version、attachment_refs、last_saved | 私人；CAS base_version不符返回冲突，本人选择版本；访客本机→云端需显式import |
| thread | author、head_resource、visibility、policy_epoch | 同作者，串统一范围，修改不可单条放宽 |
| thread_item | thread_id、resource_id、position、batch_id | (thread,position)唯一；中间删除保序占位；head无效整串不可用 |
| publication_batch | thread_id/operation_id、expected_items、state、published_at、config_version | preparing→awaiting_review→ready→published或rejected/failed/cancelled；全部准备/审核/资格满足才事务公开 |
| comment_relation | resource_id、post_id、parent_comment_id、reply_to_id、thread_root、display_depth | 父关系无循环，同原帖；显示最多三层，更深仍保存真实父/对象；中间占位不删合法子回复 |
| reply_policy | post_id、scope(all_readers/author_follows/mentioned/closed)、epoch | 每新回复取当前阅读＋回复交集；关闭不清历史 |
| media_binding | resource/revision/draft/message/evidence_ref、media_id、position、alt_text | 归属明确、有效上传和审核，不借其他主体媒体；编辑alt不换媒体 |
| poll | post_id、question_revision、original_closes_at、first_vote_at、ended_at、end_reason/correction | 首票后问题/选项/原截止锁；现在≥截止拒票，即使job未跑；提前结束保原截止不能重开 |
| poll_option | poll_id、ordinal、label | 初始2–4、label≤100可见字符；无媒体混附 |
| poll_vote | poll_id、voter_id或去身份聚合ref、option_id、operation_id、created_at | (poll,voter)唯一，一次不改；锁poll与编辑/结束竞争；投票者名单无公开API |
| poll_correction | poll、author、body、created_at | 独立记录同投票资格，不覆盖旧语义或票 |
| reaction | actor、target、kind(like/repost)、active、operation_id | (actor,target,kind)唯一；合法历史聚合和读者过滤名单分别处理 |
| bookmark | owner、target、created_at | 本人私密，无公开count/身份/搜索/AI索引；来源失效仅占位可移除 |
| resource_dependency | dependent、source、kind(quote/thread_head/comment_post/media/ai)、source_revision、purposes | 有向依赖闭包/反向索引；评论中间父占位非级联全文隐藏，具体kind分别计算 |
| topic/search_history | topic normalized_key；history owner/query/created_at | 搜索历史本人；话题/联想/count按授权；不包含私人收藏等隐藏信号 |
| ranking_signal | resource、real_event、actor_dedup、window、weight_version | 真实有效信号，去测试/异常；排名不是读权 |
| curated_placement | target、kind、order、starts/ends、operator、reason、audit | 显式运营标签/期限，不能伪造计数或绕资格 |

publication_state和review_state独立：保存成功不等于published；published资源的新revision pending时current_revision_id不变，批准该revision才切换；admin限制可使整条不可用。类型组合按spec，不新增评论收藏／转发引用或多作者续串。

## 分享与作者收录状态（FR-090–094；P2-01／02补齐）

| 实体 | 必要字段／关系 | 约束／状态 |
| --- | --- | --- |
| author_index_policy | account_id唯一、allow_indexing(boolean)、policy_epoch、row_version、updated_at | 已确认有效公开默认允许收录；账号设置覆盖本人公开主页、帖子及串，false不关闭人的合法阅读；与ai_use_policy独立 |
| target_index_policy | target_kind(post/thread)、stable_target_id、author_id、mode(inherit/allow/deny)、policy_epoch、row_version | 每稳定目标唯一，默认inherit；发布页／编辑页承接逐目标设置，allow不能越过账号false、资源非公开或展示依赖的拒绝 |
| index_projection_job | stable_target_ref、desired_policy_digest、stage(sitemap/submission/preview)、state(pending/running/succeeded/failed/superseded)、attempt/error、effect_key | 只记录系统内更新事实，不冒称外部搜索缓存已消失；消费前核当前策略，陈旧enable任务不能反向覆盖新deny |

`effective_indexable`必须同时满足：目标当前有效公开／通过审核、作者允许、目标未deny、实际输出中所有正文／媒体／引用依赖允许用于收录。主页或串不能通过组合预览重新生成已关闭对象的可收录摘要；综合输出不满足交集时给noindex，人的合法内容投影仍按阅读资格返回。受限目标即使有权用户登录200，也不进入匿名元信息、sitemap或收录预览。

账号及目标策略修改在主库原子提交并递增epoch、登记outbox；响应、sitemap输出与预览逐次读当前策略，不能等异步job或缓存TTL才执行noindex。重新允许只重新核仍公开且有权的目标，不复活删除／处罚／失权对象，也不修改任何AI用途选择。范围和接口见[HTTP契约](contracts/http-api.md)。

## 删除、媒体与核心保留（FR-048–052、108–118）

| 实体 | 字段／关联 | 规则 |
| --- | --- | --- |
| deletion | target、actor、kind(user/moderation/account)、deleted_at、undo_until、restore_until、state、epoch | 真实删除时钟；10秒撤销/30天恢复当前核，管理处置无普通恢复；physical_removed终态 |
| dependency_hide | cause_deletion、affected_resource、previous_validity、hidden_at | 记录当次影响集，不新起删除期限；恢复head只恢复仍合法且当次连带对象 |
| media_object | owner/plugin、bucket/object_internal_key、sha256、detected_mime/codec、size_bytes/duration_ms、state、data_class | allocated→uploading→uploaded→validated→reviewed→bound；failed/quarantined/orphan/cleaned独立；源站key不输出 |
| media_derivative | parent_media、kind(thumbnail/preview/segment)、hash、size、state | 继承原资源全部资格，独立清理责任；无匿名派生旁路 |
| upload_session | owner、target_intent、media、received_parts、expires_at、operation_id | 分块复用成功部分，私有暂存，结束不等正式发布；有效草稿/已绑资源不被孤立清理 |
| retention_record | target/storage_ref、class、owner_plugin、trigger_at、due_at、rule_version、purge_state | 原时钟不随停卸/重装改；到期job主库判断，失败重试和责任可查 |
| retention_interest | target、subject/purpose、allowed_scope、expires_at、reason、grant/audit | 私信各方/恢复/案件合法需求分别保留，不授普通访问 |
| purge_job | record、stage(DB/object/derivative/index/cache)、attempt、result/error、watermark | 全阶段真实结果，无UI隐藏代全部清理；幂等，不误删共享需求 |
| security_journal | seq、deny_intent_id、target/subject、action、policy_epoch、committed_result、timestamp、hash_chain | 独立耐久归档，普通写不可篡改；恢复不得回退，缺watermark不开放 |
| backup_manifest | id、DB/object_digest、captured_at、schema/config、security_watermark、expires_at、encryption_ref | DB和Storage实体分别；轮转90天目标未实测；秘密不输出 |
| restore_run | backup、latest_security_watermark、replayed_seq、state、checks/evidence | isolated→replay→rebuild→verify→ready→opened；缺日志/验证失败保持closed |

已确认分类：注销30天、主动删除恢复30天、私信最后会话活动24个月、删AI30天/不活跃12个月、AI元数据30天/必要受控原文最长7天、证据结案180天、审计1年、OTP日志30天；spec全文继续约束触发/例外。独立证据延长有理由/责任/授权，普通配置不可无限保留。离线仅本人未发布本地草稿可恢复，不能显示未重核他人受限媒体或依赖答案。

## 私信、通知与可靠效果（FR-061–072、119–124）

FR-065的“每对”指无向账号对。创建请求在同一pair事务内重核资格、原pending及时间／冷却，以数据库pending部分唯一约束兜底；A→B与B→A并发最多提交一条pending及一条初始消息／对应业务通知效果。竞争失败不替换、自动接受或追加原请求；同operation重试只复用原结果。过期按服务端时间在同锁内转终态后才可再判创建，不靠后台job或唯一索引自动计算时间。与接受／直接发送竞争仍遵守FR-067：当前合法正常消息可进入唯一会话，旧initial独立至显式接受；原终态／冷却、阅读状态及去重规则不变。关注请求是独立业务，不借本次私信修订改变其行为。

| 实体 | 字段／关系 | 约束／状态 |
| --- | --- | --- |
| account_pair | lower_account_id、upper_account_id、lock_version | lower<upper的无向账号pair唯一；请求创建／接受／到期／直接发送使用一致pair锁顺序，不以发送方向建第二pair |
| dm_request | pair→account_pair、sender/recipient、initial_message_id、created/expires、state、reason、cooldown_until | 同一规范化无向pair至多一条pending，部分唯一约束只按pair不含方向；sender/recipient保留动作权限，只有显式合法accept可合入，结束不影响合法会话 |
| conversation | pair_id、established_by、created_at、last_activity_at | pair唯一正常会话，取消关注不自动终止；当前发送资格逐次核 |
| message | stable_id、sender、conversation_id或request_id、original_saved_at、sequence、body/type、operation_id | pending请求不可正常分页；接受原ID/时间，(saved_at,id)稳定排序；无为全员撤回功能 |
| message_access | message_id、subject、readable、revoked_at、actual_read_at、delivered_at | (message,subject)唯一；本人删单条立即撤其资格，其他方独立；解除或会话重现不复活 |
| conversation_member | conversation、subject、list_hidden_at、mute、read_cursor | 删会话只隐藏列表；新合法消息可重现，逐消息读权仍优先 |
| notification | recipient、kind、target_refs、group_key、state/read_at、source_epoch | 合并真实互动，不自通知；当前授权投影摘要/目标；必要安全类核心生成 |
| delivery_attempt | message/notification、channel、effect_key、state、provider_ref、timestamp/error | saved、provider_accepted、device_delivered、read分离，重试不多提醒 |
| operation | actor/session、environment、action、operation_id、payload_hash、result_ref、state | 唯一主体/动作/ID，同ID不同payload冲突；pending/succeeded/failed/unknown，查询结果当前授权 |
| outbox/inbox | event_id、aggregate_id/version、owner_plugin、lifecycle_epoch、effect_key、lease、attempt/result | 事务outbox，消费者effect唯一；重复可发生但效果不重复，停用/撤权后lease失效 |

request actual_read分别保存双方状态；合入迁移所属域不重设actual_read，不新通知，未读只计一次。输入提示仅短暂signal，配置双方/各端当前核，非长期在线状态记录。

## AI（FR-073–089）

| 实体 | 字段／关系 | 约束 |
| --- | --- | --- |
| ai_use_policy | account、resource override、retrieve/summarize/recommend、epoch | 账户与逐帖交集，涉及实际用途全满足；重新开不复活失效源 |
| approved_service | kind/provider/model_id、state、policy_evidence_ref、region/subprocessors/no_training/retention/delete、tokenizer_ref、secret_ref | verified+approved+configured+healthy才可用；费用/条款真实准入未满足不调用 |
| ai_conversation | owner、title/custom_title、last_activity、deleted_at、title_dependency_refs | 本人，标题同源资格；删除即时退出上下文，物理清理独立 |
| ai_request | operation、conversation、input_ref/selected_refs、notice_version→document_release、notice_receipt_ref、model/service_version、config、state、provider_request_ref | submitted→retrieving→generating→completed/stopped/failed/unknown；实际处理告知与本次用途／合格服务对应；重试可追踪原请求，不能重复气泡/账目 |
| ai_answer | request、body_ref、source_refs、dependency_complete、state/withdrawn_reason、purposes | direct及previous_answer传递闭包；失效不能可靠划分整条隐藏，禁止仅删链接 |
| ai_dependency | answer、source resource/revision、document_revision/release或prior_answer、required_purposes、policy_epoch | 输出/历史/标题/复制/续问都重核闭包；帮助来源须仍为有效获发布版本，普通管理读取不授AI用途 |
| ai_quota_reservation | user、day_bucket/timezone/config、request、state(reserved/settled/released/unknown) | 锁用户日桶，成功次数+有效预留≤20；唯一request只结算一次，停止费用独立 |
| ai_cost_ledger | request/provider_ref、tokens、estimated/actual_amount、status、reconciliation_ref | 未知保留对账，不能假免费；金额预算缺失不无限调用 |
| ai_feedback | owner、answer、kind、created_at | 本人当前合法答案，反馈不赋额外源资格 |

本人AI会话用户命令可写上述实体；模型/MCP只有读业务投影，不能写这些表或后台。用户无法识别的粘贴不授源/附件读取，发送仍需处理告知。

## 治理、配置、插件与发布（FR-095–107、130–173）

| 实体 | 必要字段／关系 | 约束／状态 |
| --- | --- | --- |
| report/case | reporter、target、reason、minimal_evidence_refs、state、handler、public_feedback | pending→reviewing→processed/not_actionable；举报数量不自动认定，反馈不漏举报人 |
| evidence/grant | case、object_ref、retention、allowed_reviewer/action、reason、expires_at | 最小案授权，敏感读审计；不授普通消息读权 |
| sanction | subject/target、type、functions、starts/ends、reason、original_decider、state | 功能/临时/永久分开，解除仅该处罚影响，不能恢复主动删/请求/关系 |
| appeal | sanction、appellant、statement/media、state、reviewer、decision/execution | awaiting_independent_review→reviewing→decided；最终reviewer≠original_decider，无第二人保持待复核 |
| managed_document | id、stable_key、kind(community_rules/privacy/terms/processing_notice/help)、locale、owner、public_surfaces、active_release_id、row_version | 核心受控内容；环境／适用入口分别登记，不新增社区空间；正文由用户／获权公司人员提供，无模型虚构正式制度 |
| document_revision | document_id、version、title/body、content_digest、linked_release_refs、state(draft/ready)、row_version、editor、created_at | 版本唯一；draft编辑CAS，ready及已发布内容不可原地替换，修改产生新revision；渲染不得执行脚本或泄漏秘密 |
| document_release | id、document/revision_ref、content_digest、scope(environment/surfaces/purposes)、state、publisher、published_at、confirmation/audit_ref | 绑定正文／范围不可变；prepared→published→superseded或withdrawn留真实状态审计；权限／MFA／必要生产具体确认满足后原子切active指针；无自动回退旧制度，重新发布另建记录 |
| document_receipt | subject(account或注册verified_challenge)、release_id/revision_digest、presentation_ref、purpose、decision(presented/acknowledged/consented/declined)、occurred_at、request_id | presented仅记录展示版本、不授同意；acknowledged/consented仅来自本人明确动作，不把访问／展示／沉默当同意；注册成功原子绑定account/admission；本人查询，后台无通用全量原文入口 |
| audit_event | actor/session、operation、object/environment/plugin、reason、before/after_digest、result、request_id | 追加受控、普通API无改删，不记录秘密/无关完整正文 |
| config_definition | key/owner、schema/default/range、scopes/priority、permissions、dependencies、effect_mode、existing_policy、evidence_refs | 全域唯一key，安全不变量非普通开关 |
| config_bundle/activation | version、scoped_values、schema/compat、state、effective_at、preview_digest、actor/audit、active_ptr | 完整不可变；draft→validated→ready→active/rejected；回滚新bundle，原子指针 |
| developer_invitation | developer、inviter、scope、expires/revoked、state | 受邀默认提交，不授review/install/release |
| plugin/version | plugin_id、maintainer/source、semver、manifest/hash、payload_digest、compat、dependencies、permissions、migration/lifecycle | ID/版本唯一，原包不可替换；官方也不自动高权 |
| plugin_review/grant | version/digest、compat/security/permission checks、reviewer、decision、sensitive_permissions | 审核绑定digest，更新增量重新审；自用同人也分步骤留档 |
| plugin_installation | environment/plugin、current/target_version、state、lifecycle_epoch、grants、health、history_projection | acquired→checked→installing→installed_disabled→validating→awaiting_confirmation→enabled；failed/draining/disabled/uninstalled各有事实 |
| migration_run | version/environment、migration_digest、schema_version、state、result/recovery_limits | 前置/实际状态核，重试幂等；生产迁移前确认，失败不承诺down无损 |
| sandbox_lease | developer/plugin/environment、expires、limits、credential_ref、evidence_run | 实际独立环境，合成数据，不能切生产凭据或副作用 |
| client_release | app/build/platform、runtime/native_fingerprint、contract/sdk/ui_versions、capabilities、distribution_ref | 发行注册可信；旧端仅局部不兼容不强更，必要核心不安全才强更 |
| release_plan | id、commit/各产物digest、config/plugin/contract、change_class、migration/permission、environment、cohort_digest、rollback_limits | 不可变摘要；混合最高要求；构建/验证同产物 |
| release_confirmation | plan_digest、scope_digest、approver/session/stepup、reason、expires/consumed | 生产每动作匹配/当前授权，改变计划失效；扩灰新确认 |
| cohort_member | release/cohort_version、account_id、added_by、effective_at | 管理员明确名单，非随机百分比；资格不等于数据权限 |
| evidence_index | release、SHA/checkout、run/attempt、artifact ID/digests、config/env/toolchain、profile/check_set、required_cases/applicability/actual_states、reports、TDD/基准/AI审查/完成记录refs | 不可改成功；缺失/失败/跳过/超时/取消阻止通过；未适用不计通过；工程记录独立私有存储，原证据脱敏/分类到期 |

核心保留 plugin/version/install/数据归属和安全账本，卸载不抹历史或审核。运行schema `plugin_<id>`和有限角色是真隔离的一部分，DB角色不能直读他schema、TRUNCATE、REFERENCES或修改核心RLS。

制度／条款／隐私／告知／帮助不是自由配置字符串：现有terms_version、notice_version和approved_help_version均指向不可变document_release及正文digest。发布／撤下记录及必要证明不因业务插件停卸消失；同意记录依账号数据的既有注销30天分类清理，必要独立证据仍按已批准授权／期限登记；审计1年只保最小动作／版本摘要，不借审计无限保留个人证明。公司正文的版本保留独立登记，不能包含真实用户私人资料。

未完成注册的临时记录遵守既有认证临时材料期限，不无限遗留；注册事务失败不留下伪成功admission／同意绑定。历史发布正文可保持不可变关联，状态撤下／替代仍以当前事实判可读，不用“不可变”禁止合法状态转换。

客户端可读取当前发布版本和合法历史版本并明确历史标识，不能读draft／ready／未发布或越过withdrawn；缺有效条款只阻塞新注册，缺匹配处理告知只阻塞相应新AI处理，帮助缺失给真实不可用，不自动伪造正文或阻断无关已获权功能。注册／AI各自使用当前所需版本集合及服务端摘要校验，不新增所有老用户登录强制重同意规则，也不以文案发布替代实际服务商政策准入。

必要告知展示与明确同意是不同事实；仅在已批准规格要求的注册同意、本人self／草稿主动确认等场景校对应consented和具体选择，受限主动分析及无法识别粘贴仍落实发送前必要告知。当前相同版本／用途且有效的既有记录可引用，不新增普通公开AI查询逐次强制点击同意；源资格和作者用途始终另行当前核验。

CI就绪、TDD链、视觉候选／基准确认、开发AI报告／处置和报告读取／完成记录是工程证据对象，不新增社区业务或产品AI工具；字段与转换见[cloud-validation](contracts/cloud-validation.md)及[release-evidence](contracts/release-evidence.md)。不得把额外证据字段假定为现有原生handoff支持的字段。业务通过、基准确认、审查通过和生产确认分别记录，互不自动推导。

## 跨实体授权与并发验收

权威资格函数先核session/account，再核action/role/environment/plugin lifecycle、resource当前版与visibility、block/依赖/治理、purpose；字段投影后才返回。回复/投票/私信写入再叠业务条件；share-read只走HTTP契约列出的分享／公开资料／必需认证白名单，不因本人私有GET或管理员角色获得额外入口；AI只白名单读。恢复／证据／本人历史是独立action，不自动授权普通浏览或AI。原始SQL、对象源站、Realtime、日志、备份不提供旁路。

Actions必需竞争：邀请码双兑换、用户名冲突、草稿CAS、首票vs编辑/截止、审核vs新revision、批次部分审核、请求accept/expire/direct send、删单条vs附件Range、撤权vs缓存/流/实时、配置publish/rollback、停用vs在途job、迁移中断/恢复和旧备份日志缺口。每结果关联operation/effect/epoch/evidence；失败或未知不能冒称成功。
