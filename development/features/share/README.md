# 只读分享、稳定链接与搜索收录

对应原旅程US9；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 复制链接 / 打开App | getPost / getProfile / getThread（本地构造稳定链接） | post/profile/thread稳定ID、允许公开预览 | /p/u/t目标改名不转他人，未安装可浏览器读，外部副本限制明示 |
| 分享登录刷新退出 / 目标阅读 | createOtpChallenge / verifyOtpChallenge / refreshAppSession / logoutAppSession / getPost / getProfile / getThread | 可信share-read用途及当前目标资格 | 方法路径投影白名单先判，有权受限可200 no-store/noindex，无权安全占位；本人/管理员登录不扩API权 |
| App作者账号 / 目标收录 | getAuthorIndexPolicy / patchAuthorIndexPolicy / getTargetIndexPolicy / patchTargetIndexPolicy | 本人CAS/operation、账号allow_indexing与post/thread inherit/allow/deny | effective=账号允许∩目标不拒∩公开通过∩依赖当前可读；target allow不盖账号false，noindex/sitemap/提交/预览同源，陈旧enable重核 |
| 网页播放暂停声音/页内自动预加载 | getMediaBytes / headMediaBytes / getEffectiveConfiguration | 仅固定合法平台默认与当前页状态 | 匿名登录均wifi_only静音/蜂窝点击，网络未知或浏览器拒自动开声给点击回退；不读写同步私人偏好或显示已保存 |

## 输入、权限、事务与异常边界

登录网页仍只读，发帖评论点赞转发关注投票收藏私信AI转App。未列GET、私人/me、关系明细、普通feed/search、后台默认拒；不信客户端audience/channel升级，SSR高权也按实际用途投影。

ED-10：分享不读取完整或部分preferences，不从config query/SSR/service_role/hydration/shared cache/media DTO/auth响应偷带video_policy/preload。App相反always/never/preload或后续改变不影响分享；所有播放控件仅当前页，不写账号不发同步不假保存。后台/插件同语义也不自动增私人投影。

有效公开默认可收录，关收录仍人按权限读且App公开读不变；源码/meta/结构化/缩图/cache/media同权，Next图片优化无源站旁路。收紧删除立即无旧摘要，robots/noindex退出站点图及提交只证明系统内行为，不能承诺外部缓存消失。收录与AI用途独立。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有分享壳/状态与core share-read白名单/配置媒体gate；无真实p/u/t完整SSR、分享登录闭环、作者收录API/作业/网页播放器。壳不等分享业务，新页仍需具体批准；分享收录后置。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [apps/share/src/app/page.tsx](../../../apps/share/src/app/page.tsx)
- [apps/share/src/components/ReadingState.tsx](../../../apps/share/src/components/ReadingState.tsx)
- [supabase/functions/core/index.ts](../../../supabase/functions/core/index.ts)
- [supabase/functions/core/config/effective.ts](../../../supabase/functions/core/config/effective.ts)
- [supabase/functions/core/media/gateway.ts](../../../supabase/functions/core/media/gateway.ts)

## 最小必要验证

1. 匿名登录/本人/管理员方法路径白名单，写/私人me拒、有权受限合法读，源码预览元信息媒体无泄漏。
2. 账号false×target模式、陈旧enable/收紧竞争，noindex且人仍可读，App不变。
3. App相反账号值不影响分享，逐查请求SSR/hydration/config/cache/media/auth零私人；页控件后DB版本不变，真实浏览器点击网络帧验证。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-090"></a>

- **FR-090**：公开帖子、主页、串必须有可复制稳定分享链接和允许公开的卡片，支持打开 App，未安装可浏览器阅读，改名不转向新账号。（WEB-01；AC-27）

<a id="fr-091"></a>

- **FR-091**：分享网页必须只读，登录仅取得当前有权读取，不提供发帖、评论、点赞、转发、关注、投票、收藏、私信或 AI；链接本身不授予资格，写操作引导 App。（WEB-02；AC-27）

<a id="fr-092"></a>

- **FR-092**：网页正文、预览、源码、元信息、结构化信息、媒体和受控缓存必须保护受限信息，未登录机器人仅公开输出；无权、删除或依赖失效用适当占位，失效引用连附加文字隐藏。（WEB-03；AC-27、AC-31）

<a id="fr-093"></a>

- **FR-093**：有效公开帖／主页／串必须默认可收录，受限、草稿、私信、证据及敏感资料不可收录。作者关闭收录不停止人按权限阅读分享页或 App 公开读取；网页提供不收录信号、退出站点地图及主动收录，不再正常提供可收录预览，删除／收紧不留失权旧摘要。（WEB-04–05；AC-27）

<a id="fr-094"></a>

- **FR-094**：必须说明外部缓存、转载及另存不保证同步撤回；搜索引擎设置与 AI 用途独立，不承诺第三方即时执行。（WEB-06；AC-27）

## US9旅程验收

1. **Given** 稳定帖子、主页或串链接，**When** 外部打开，**Then** 可按当前资格阅读并打开 App；改名不使链接指向他人。
2. **Given** 浏览器已登录，**When** 尝试发帖、互动、投票、私信或 AI，**Then** 网页保持只读并引导 App，登录仅提供读取资格。
3. **Given** 受限、删除或依赖失效目标，**When** 读取网页、卡片、源码、元信息或媒体，**Then** 不泄露正文、摘要、缩略图及失效引用文字。
4. **Given** 作者关闭收录，**When** 人或搜索引擎访问，**Then** 人仍按当前权限阅读，网页提供不收录信号并退出收录流程，App 公开读取不变；外部缓存不承诺即时消失。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| index_projection_job | stable_target_ref、desired_policy_digest、stage(sitemap/submission/preview)、state(pending/running/succeeded/failed/superseded)、attempt/error、effect_key | 只记录系统内更新事实，不冒称外部搜索缓存已消失；消费前核当前策略，陈旧enable任务不能反向覆盖新deny |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-27 | 网页访客公开可读、受限登录再验；登录仍不能写 / 投票 / 聊天。分享卡 / 源码 / 爬虫 / 缓存不含受限内容；关闭收录后人仍可按权限阅读分享页，页面不收录信号 / 站点地图移除生效，内部公开读取不变。 | WEB-01–06、VIS-02、PRF-03 |
