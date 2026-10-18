# 三流、搜索、真实推荐与私密收藏

对应原旅程US6；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 三流 / 刷新 / 翻页 | listLatestPosts / listPersonalFeed（kind=following） / listPersonalFeed（kind=recommended） | 当前读者、query scope/cursor/limit | 关注最新发布时间倒序，访客公开/登录含有效关注，self不入公共流；先过滤再排序分页输出重核，切换留位置去重 |
| 搜索 / 筛选 / 联想 / 清历史 | searchCommunity / suggestSearch / listSearchHistory / clearSearchHistory | posts/users/topics、时间类型、明确show_muted、本人历史 | 建议数量摘要同权、历史私人；旧cache失权退出，非法cursor刷新非假空成功 |
| 兴趣 / 推荐用户 / 趋势 / 精选 | getDiscovery / getInterests / patchInterests / getDiscovery（推荐用户投影） / getPlacementsManagement / createPlacementManagement / patchPlacementManagement / deletePlacementManagement | 真实信号、有效placement、运营逐action授权期限理由 | 近期增长/独立参与/衰减反作弊，不足近期最新；不高粉垄断/通讯录批量关注，精选明标不改计数 |
| 点赞 / 转发 / 引用 / 撤销 | putResourceLike / removeResourceLike / putPostRepost / removePostRepost / createPost（kind=quote） / listInteractions | 当前可读可互动、source及文字quote、operation | 唯一关系计数/effect，quote不换源；访客只允许聚合，登录明细当前核，block互藏不任删历史 |
| 收藏 / 列表 / 移除 | putBookmark / deleteBookmark / listBookmarks | 仅本人，原帖当前资格与operation | 无公开收藏数身份偏好索引/AI；源无效仅本人无正文占位可移除，不保正文快照 |

## 输入、权限、事务与异常边界

基础运营先最新流/详情/点赞；三流搜索历史、兴趣推荐趋势精选、转发引用/收藏后置。cursor仅位置不含授权，分页实时用稳定ID去重，当前页长度非全量统计。

现有guestFeedApi DTO严格仅id/author_id/visibility/revision_id/body/row_version，latest加created_at，默认20最大50。加字段先协调共享投影契约，不静默放宽客户校验。流/搜索/收藏/引用/详情真实视频GIF复用当前App本人偏好和native-experience全条件，不以策略单测代实际播放。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

访客公开最新流API/游标、纯移动API/controller已写，尚未接生产首页，不等推荐关注/登录个性化/搜索收藏互动全套；Kiranism运营样例不等真实精选。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [supabase/functions/core/routes/discovery.ts](../../../supabase/functions/core/routes/discovery.ts)
- [supabase/functions/core/routes/discovery-cursor.ts](../../../supabase/functions/core/routes/discovery-cursor.ts)
- [supabase/migrations/0042_public_latest_feed.sql](../../../supabase/migrations/0042_public_latest_feed.sql)
- [apps/mobile/src/features/feed/api.ts](../../../apps/mobile/src/features/feed/api.ts)
- [apps/mobile/src/features/feed/feed-controller.ts](../../../apps/mobile/src/features/feed/feed-controller.ts)
- [tests/contract/discovery/feed-search.spec.ts](../../../tests/contract/discovery/feed-search.spec.ts)
- [tests/contract/discovery/mobile-client.spec.ts](../../../tests/contract/discovery/mobile-client.spec.ts)

## 最小必要验证

1. 同时刻多帖稳定翻页刷新切换去重；公开/关注/self/删除/block/mute混合，旧cursor不维持资格。
2. 反复点赞转发撤销一效果，聚合明细分离；收藏数身份偏好公共/AI泄漏为0。
3. 搜索建议count摘要同权，信号少显示近期，精选期限标签及当前过滤；实际首页控件触发相应operation。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-053"></a>

- **FR-053**：帖子必须提供点赞／取消、收藏／取消、转发／撤销及引用创建／编辑／删除，效果和计数持久且重复操作不多记，引用关系不可编辑替换。（INT-01；AC-16）

<a id="fr-054"></a>

- **FR-054**：必须提供点赞、转发、引用统计及有权登录者具体记录；访客只见允许公开统计，名单与引用再检查来源和关系；拉黑隐藏明细不任意删历史，不以过滤后列表长度替代聚合数。（INT-02；AC-07、AC-16）

<a id="fr-055"></a>

- **FR-055**：收藏必须仅本人管理，不公开数量、收藏者身份或偏好，不进公开搜索／AI／名单；重开校验原帖，失效只占位并可移除，不保留泄露快照。（INT-03；AC-16）

<a id="fr-056"></a>

- **FR-056**：必须提供推荐、关注、最新，关注按发布时间倒序，最新按当前可读帖倒序；访客仅公开，登录者可含有效关注者内容，仅自己内容不进公共流。（FEED-01；AC-18）

<a id="fr-057"></a>

- **FR-057**：信息流必须可分页、下拉刷新、去重并在切换时保留适用位置；权限、删除、审核或关系变化后不使用旧缓存继续展示失效内容。（FEED-02；AC-18）

<a id="fr-058"></a>

- **FR-058**：冷启动必须可选兴趣、主动关注推荐用户，行为不足用近期合规公开内容、兴趣及运营精选；不伪造用户量、热度、互动，不要求首版复杂机器学习推荐。（FEED-03；AC-18）

<a id="fr-059"></a>

- **FR-059**：必须搜索帖子、用户、话题并提供时间／类型筛选、关键词联想及本人搜索历史管理／清除，建议、数量、摘要和结果全部按当前授权。（SEARCH-01；AC-18）

<a id="fr-060"></a>

- **FR-060**：发现必须有真实热门话题／趋势、热门帖、最新和推荐用户，考虑近期增长、独立参与、时间衰减及反作弊，数据不足显示近期／最新；推荐不永由高粉垄断，不默认通讯录或批量关注；运营置顶／精选独立标记、有效期限、可预测排序及审计，不放宽资格或伪造计数。（SEARCH-02–04；AC-18）

## US6旅程验收

1. **Given** 有不同范围内容，**When** 切换三类信息流、刷新和翻页，**Then** 按各流规则展示当前可读内容，无重复，保留适用位置，公共流不含仅自己帖子。
2. **Given** 用户搜索并筛选类型／时间或管理搜索历史，**When** 查询建议、摘要、数量及结果，**Then** 均符合当前资格；数据不足展示近期讨论或最新，不伪造热度。
3. **Given** 用户重复点赞、转发或撤销，**When** 查看统计和具体记录，**Then** 业务效果不重复，访客只看允许统计；拉黑后具体记录过滤不把可见列表长度当全量计数。
4. **Given** 用户收藏后原帖不可用，**When** 重开收藏，**Then** 仅本人见不可用占位且可移除；收藏数、身份、列表与偏好不经公开入口或 AI 泄露。
5. **Given** 运营置顶或精选内容，**When** 读者浏览，**Then** 明确标记、期限和排序，仍执行权限及过滤，运营不能伪造真实互动。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| bookmark | owner、target、created_at | 本人私密，无公开count/身份/搜索/AI索引；来源失效仅占位可移除 |
| topic/search_history | topic normalized_key；history owner/query/created_at | 搜索历史本人；话题/联想/count按授权；不包含私人收藏等隐藏信号 |
| ranking_signal | resource、real_event、actor_dedup、window、weight_version | 真实有效信号，去测试/异常；排名不是读权 |
| curated_placement | target、kind、order、starts/ends、operator、reason、audit | 显式运营标签/期限，不能伪造计数或绕资格 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-16 | 点赞 / 取消、转发 / 撤销、收藏重复提交不多记；互动名单对访客受限，拉黑隐藏个别记录但聚合不误算。收藏数不向他人公开，收藏列表及身份仅本人；公开 API、互动名单、搜索与 AI 检索不能泄露收藏行为；失权原帖为占位可移除。 | INT-01–03 |
| AC-18 | 三流排序和权限正确，切换位置合理、分页无重复；搜索帖子 / 用户 / 话题和筛选 / 历史清除可用，建议 / 数量不泄密；无真实热度时不伪造榜单。 | FEED-01–03、SEARCH-01–04 |
