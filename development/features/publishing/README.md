# 发布内容、帖子串与私人草稿恢复

对应原旅程US3；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 附件选择 / 失败项重试 | createUpload / putUploadPart / completeUpload | 本人目标intent、真实文件与part | allocated→uploading→uploaded→validated→reviewed→bound，成功块文件复用，未发布未审私有暂存 |
| 发布 / 查原结果 | createPost / getAppOperation | kind/body/tags/稳定mentions/media/visibility/reply_policy/operation_id | 草稿/上传/待提交/发布中/待确认/成功/失败分开；审核独立，保存可能pending，unknown不建第二逻辑帖 |
| 创建串 / 续写 / 批次状态 | createThread / appendThreadBatch / getAppOperation / getThread / listOwnedContents | 原作者、顺序条目、统一范围、expected_items | 全部准备/必要审核/当前资格后同事务公开，部分pending/rejected无半串，旧有效串不因新批等待隐藏 |
| 草稿保存 / 冲突选版 / 导入 | listDrafts / getDraft / createDraft / patchDraft / deleteDraft / createDraft | 本人cloud_version/base_version、文字元数据与上传状态；访客本机 | CAS冲突给两版本人选择不静默覆盖；登录明确选择导入，本机未上传文件不承诺跨设备 |
| 链接预览 / 标签提及 | createPost（发布内受控预览步骤） / searchCommunity（用户候选与稳定ID） | 普通URL、稳定账号引用、内部当前资格 | 最多一预览卡，多正文链接保留；失败超时不影响复制，重定向每跳防私网metadata/危险协议/内部泄漏 |

## 输入、权限、事务与异常边界

基础运营先文字/静态图片单帖及保输入、审核；长帖/视频GIF/投票/引用串/云草稿后置但完整保留。正文及媒体边界见公共规则，图片视频GIF互斥、投票不混媒体、quote只文字；长帖单内容可分段折叠展开，不是Articles。

服务端验真实格式/codec/大小/时长/归属及审核，不信扩展名。原工程采用JPEG/PNG、动态GIF、MP4 H264/AAC，必须真实双端验证才称支持；HEIC成熟转换失败保状态，GIF不默降首帧。代理/Storage须实际支持200,000,000字节，不只调UI。预览工程起点5秒/2MiB/3跳，每跳DNS与目标安全核验。

串只作者续写，整体范围修改见content-lifecycle。草稿仅本人、不进公共索引/默认AI；孤立暂存清理排除有效草稿与已绑定。发布预览/详情实际播放服从native-experience全条件。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

文字与 JPEG/PNG 图片单帖、真实私有 Storage 上传/回读校验/绑定、发布回执/原操作查询及本人当前修订列表已实现。0063仅在显式本地 dev 开关和指定账号授权同时有效时免审；普通账号保持待审。App 发布受理后清空编辑器并进入“我的内容”，未知结果保留原操作与输入。2026-10-18真实接口与隔离数据库验证见status及implementation/app-backend-alignment.md；UI待用户复查。草稿云同步、串及其他后置发布类型仍未实现，基础表不代表这些能力。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [packages/contracts/src/graphemes.ts](../../../packages/contracts/src/graphemes.ts)
- [supabase/migrations/0004_resources_media.sql](../../../supabase/migrations/0004_resources_media.sql)
- [supabase/functions/core/media/gateway.ts](../../../supabase/functions/core/media/gateway.ts)
- [supabase/functions/core/admission.ts](../../../supabase/functions/core/admission.ts)
- [packages/config/src/definitions.ts](../../../packages/config/src/definitions.ts)

## 最小必要验证

1. 每类型N/N+1、大小时长等于/超出、伪格式/他人归属/非法混合拒且保正文成功附件。
2. 部分上传/强关/写后丢响应/重复发布先查operation，仅一内容计数效果，暂存不公开。
3. 串初发续写未准备/未审不出现半串，旧串继续；多端草稿选版/访客明确导入。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-018"></a>

- **FR-018**：必须提供普通文本、简化长帖、单／多图、单视频、单 GIF、普通链接／预览、单选投票、转发、文字引用及同作者帖子串；按参数表和类型组合校验。图片、视频、GIF 不混排，投票不混附媒体，引用不额外附图／视频／GIF；长帖为单条内容并可分段、折叠、展开。（POST-01、PRD 第 6.1 节；AC-08）

<a id="fr-019"></a>

- **FR-019**：标签必须进入有权话题检索，提及绑定稳定账号；每帖最多一个链接预览且保留允许的普通链接，失败／超时不妨碍展示或复制链接；不可信目标、危险抓取与受限内部预览不得泄露数据。（POST-02；AC-08）

<a id="fr-020"></a>

- **FR-020**：发布必须区分草稿、上传中、待提交、发布中、结果待确认、成功及失败待重试，审核状态独立；提交成功可待审核，不能等同已公开。（POST-03；AC-08–10）

<a id="fr-021"></a>

- **FR-021**：每次逻辑内容、评论、私信等提交必须可追踪并防重复；响应未知先查最终结果，重复点击、重连和强制关闭不能产生重复记录／计数。（POST-04；AC-09、AC-16、AC-20）

<a id="fr-022"></a>

- **FR-022**：失败必须保留正文、元数据及成功附件，只重试失败文件，区分网络、身份、类型、超限、审核和服务错误并提供合法恢复；未发布／未获审核许可的媒体只暂存，孤立暂存清理不得误删有效草稿或已发布对象。（POST-05–06；AC-08–09）

<a id="fr-023"></a>

- **FR-023**：登录用户必须拥有仅本人的云端文字／元数据草稿及多设备同步，本地临时草稿支持断网恢复；访客仅本机保存，登录后由本人选择导入，不自动上传。（DRF-01；AC-17）

<a id="fr-024"></a>

- **FR-024**：多端草稿冲突必须提示版本选择／恢复，不静默覆盖较新版本；附件应明确本机未上传与已可复用状态，不承诺本机文件自动跨设备可用。（DRF-02；AC-09、AC-17）

<a id="fr-025"></a>

- **FR-025**：草稿必须仅本人及明确授权流程可读，不进公共搜索、热门、推荐或默认 AI；主动分析和注销清理分别执行其规则。（DRF-03；AC-17、AC-23、AC-32）

<a id="fr-026"></a>

- **FR-026**：帖子串必须只允许原作者创建和续写，保存顺序、完整串入口、各条编辑与互动；初发和每次续写批次只有全部完成必要准备、审核及发布资格才统一可见，部分成功不公开半串，既有有效串不因新批次等待而隐藏。（THR-01–02；AC-10）

<a id="fr-027"></a>

- **FR-027**：串必须创建与整体修改统一范围，禁止单条放宽；收紧立即生效，放宽至公开须确认整串及符合发布规则附件的开放影响；首帖无效则整串不可用，中间删除只留顺序占位，不删其他合法内容或错误重排。（THR-03–04；AC-10、AC-15）

<a id="fr-112"></a>

- **FR-112**：媒体必须按真实类型、格式、大小、时长、归属和必要审核权威校验；超限、不支持、安全失败或超时保留草稿并给恢复。首版需实际支持批准格式双端播放，具体格式由方案核验，复杂转码不自行扩围。（MEDIA-05；AC-08、AC-35）

## US3旅程验收

1. **Given** 输入及附件处于当前允许边界内，**When** 提交每种支持类型，**Then** 内容和当前审核状态持久保存；超限、伪格式、非法归属或不允许的混合附件被拒绝且不清空输入。
2. **Given** 多附件中部分上传成功、部分失败，**When** 重试，**Then** 复用成功附件，只重试失败项；成功暂存不代表内容已公开。
3. **Given** 服务已保存但响应丢失，**When** 重连或重复点击发布，**Then** 先查最终结果，同一逻辑提交只产生一条内容和一次业务效果。
4. **Given** 作者创建或续写一批帖子串，**When** 某条待审核、未通过或提交失败，**Then** 整批不先部分公开，作者可查真实状态；既有有效串不因续写等待而隐藏。
5. **Given** 本人多设备编辑草稿发生冲突，**When** 恢复编辑，**Then** 提示选择版本，不静默覆盖；访客草稿登录后须本人选择导入，未上传本机文件不被承诺跨设备可用。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| content_revision | resource_id、revision_no、body、tags/mentions、alt_text、author、review_state、submitted_at | (resource,revision_no)唯一；编辑仅允许字段，媒体/引用关系不可替换；旧版当前权＋本人/具体治理权 |
| revision_review | revision_id、decision、reason、reviewer、decided_at、request_id | 决定只作用具体revision，不能批准后来未审版本；独立整条处置优先 |
| draft | owner、body/metadata、local_origin、cloud_version、attachment_refs、last_saved | 私人；CAS base_version不符返回冲突，本人选择版本；访客本机→云端需显式import |
| reply_policy | post_id、scope(all_readers/author_follows/mentioned/closed)、epoch | 每新回复取当前阅读＋回复交集；关闭不清历史 |
| thread | author、head_resource、visibility、policy_epoch | 同作者，串统一范围，修改不可单条放宽 |
| thread_item | thread_id、resource_id、position、batch_id | (thread,position)唯一；中间删除保序占位；head无效整串不可用 |
| publication_batch | thread_id/operation_id、expected_items、state、published_at、config_version | preparing→awaiting_review→ready→published或rejected/failed/cancelled；全部准备/审核/资格满足才事务公开 |
| media_binding | resource/revision/draft/message/evidence_ref、media_id、position、alt_text | 归属明确、有效上传和审核，不借其他主体媒体；编辑alt不换媒体 |
| upload_session | owner、target_intent、media、received_parts、expires_at、operation_id | 分块复用成功部分，私有暂存，结束不等正式发布；有效草稿/已绑资源不被孤立清理 |
| poll | post_id、question_revision、original_closes_at、first_vote_at、ended_at、end_reason/correction | 首票后问题/选项/原截止锁；现在≥截止拒票，即使job未跑；提前结束保原截止不能重开 |
| poll_option | poll_id、ordinal、label | 初始2–4、label≤100可见字符；无媒体混附 |
| author_index_policy | account_id唯一、allow_indexing(boolean)、policy_epoch、row_version、updated_at | 已确认有效公开默认允许收录；账号设置覆盖本人公开主页、帖子及串，false不关闭人的合法阅读；与ai_use_policy独立 |
| target_index_policy | target_kind(post/thread)、stable_target_id、author_id、mode(inherit/allow/deny)、policy_epoch、row_version | 每稳定目标唯一，默认inherit；发布页／编辑页承接逐目标设置，allow不能越过账号false、资源非公开或展示依赖的拒绝 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-08 | 各帖子类型按已确认默认与当前配置边界成功发布 / 展示，验证 2,000 / 10,000 字符、9 张 / 10 MB 图片、1 视频 / 200 MB / 5 分钟、1 GIF / 15 MB 的边界；超限、伪格式、非法归属、危险链接抓取后端拒绝，保留输入和可重试结果。多链接正文最多 1 个链接预览，失败 / 超时 / 目标不可访问仍可展示复制普通链接；引用仅附文字，额外图片 / 视频 / GIF 拒绝，原帖失权整条引用含附加文字为不可用占位。 | POST-01–06、MEDIA-05–06、VIS-01–03、CFG-03、CFG-09 |
| AC-09 | 上传一半、强制关闭、写成功响应丢失和重复发布后，先查提交结果，仅一逻辑内容；成功附件复用，失败仅重试失败附件，孤立对象可清理。 | POST-03–06、DRF-01–03 |
| AC-10 | 串初发和续写批次任一步失败均不对外出现部分帖子；部分条目已审核通过而另条待审核 / 未通过时整批不先公开，全部满足审核 / 发布资格后才统一可见，作者可查状态，等待中的新续写不隐藏既有有效串。只有作者续写，顺序稳定；整体权限变化统一生效，中间删除不错误串联、首帖删使整串不可用。恢复首帖一并恢复当次连带隐藏的有效条目，独立删除 / 限制不复活，窗口不被依赖隐藏重置。 | THR-01–04、VIS-03、DEL-01–04、POST-03、GOV-01 |
| AC-17 | 登录草稿云同步、断网本地恢复、多端冲突可选版本；访客登录导入有明确选择，无他人读取或默认 AI 使用；注销关联清理。 | DRF-01–03、AI-08–09、AUTH-09 |
