# 持久通知、跨端未读与独立故障反馈

对应原旅程US15；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 通知/未读/打开/已读 | listNotifications / getPost / getThread（当前目标读取） / readNotifications | 本人当前资源依赖cursor/实际阅读状态 | 持久跨端补同步、合并去重不自通知，摘要目标每次当前核，无失权旧正文/私密原因 |
| 分类推送 / 设备登记 | getPreferences / patchPreferences / registerPushDevice / revokePushDevice | 本人/系统推送许可/互动DM推荐安全类别 | 普通mute不抑必要安全服务，关推送仍站内前台重连未读，设备token最小保护 |
| 派送状态 / 通道重试 | getAppOperation / getProjectedEvents（实际投递事实） / 受控worker重试（effect去重，无普通用户端点） | 受控worker/effect/当前接收和plugin epoch | saved/provider_accepted/device_delivered/read分离，attempt末端再核不多提醒，实时不漏正文名单DM元数据 |
| App服务状态 / 后台故障 | getServiceAvailability（App最小可用状态） / getHealthManagement（后台实际依赖影响投影） | SMS/review/AI/push/realtime/core实际错误影响起止 | 不跳OTP/自动过审/暗换，持久消息保留，unknown先查operation保输入，无关合法按真实依赖继续 |

## 输入、权限、事务与异常边界

事件follow请求/like/comment-reply/repost-quote/mention/DM请求/poll结束/公告安全审核处置全覆盖。ref非历史授权，删收紧block/mute影响列表摘要目标，请求initial合入不重提醒，投票结束一effect。

锁屏/隐藏payload默认通用，无DM受限正文证据OTP秘密，公开短预览显式选也不开放敏感，App打开当前读。Android内测后台不足可说明，但前台/站内/重连/未读/必要安全审核必须可用，大陆公开前核华为小米OPPOvivo等原生渠道，不承诺任意省电即时。

审核故障已合法内容继续，新内容草稿pending/人工队列；AI保输入合法历史成本待对账；push/realtime断持久补同步；DB存储核心故障如实影响，不假全站正常，不降低授权审核作者许可删除。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有outbox/inbox实时gate；正式notification/delivery/token/API、App推送通知及故障管理消费者未实现，后台notification样例非业务。基础运营保必要安全，普通推送后置，真渠道缺项未验证。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [supabase/functions/core/realtime/gateway.ts](../../../supabase/functions/core/realtime/gateway.ts)
- [services/core-worker/src/outbox.ts](../../../services/core-worker/src/outbox.ts)
- [services/core-worker/src/inbox.ts](../../../services/core-worker/src/inbox.ts)
- [supabase/functions/core/routes/public-auth.ts](../../../supabase/functions/core/routes/public-auth.ts)

## 最小必要验证

1. 全事件真实生产者落库去重不自通知，多端重连阅读真实未读，initial合入和poll结束各一提醒。
2. 锁屏payload隐藏字段零敏感，公开预览不放DM，派送前撤权block/mute新摘要目标拒。
3. 各依赖故障恢复强关网络，保输入查unknown，无OTP旁路/自动过审/暗换，accepted非送达读。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-119"></a>

- **FR-119**：站内通知必须覆盖关注／请求、点赞、评论／回复、转发／引用、提及、私信／请求、投票结束、公告、安全、审核和处置，持久化且跨端有权可查，不发无意义自我通知，同帖大量互动合并去重。（NTF-01；AC-12、AC-33、AC-54）

<a id="fr-120"></a>

- **FR-120**：必须分类控制互动、私信、推荐和手机推送，必要安全／服务状态独立说明、不受普通屏蔽抑制；关闭推送不丢站内通知，删除、收紧、屏蔽及拉黑影响列表／摘要／目标。（NTF-02；AC-07、AC-33）

<a id="fr-121"></a>

- **FR-121**：锁屏及推送负载必须默认通用提醒，无私信正文、受限内容、证据、验证码或秘密；可选公开短预览不放开敏感正文，打开 App 后重新授权读取。（NTF-03；AC-33）

<a id="fr-122"></a>

- **FR-122**：消息保存、服务商接受、设备送达、实际已读必须分别记录；推送失败可重试且不重复提醒，实时输出不暴露无权正文、名单或私信元数据，连接异常可补同步。（NTF-04；AC-20、AC-33）

<a id="fr-123"></a>

- **FR-123**：内测必须保持前台消息、站内通知、重连、未读恢复及必要安全／审核消息可用，Android 后台覆盖不足明确提示；大陆公开发布前核验目标渠道，不承诺所有省电策略即时推送。（NTF-05；AC-20、AC-33）

<a id="fr-124"></a>

- **FR-124**：独立故障必须记录类别、范围、起止和结果，短信不跳验证、审核不自动通过、AI 不暗换模型、推送不丢持久消息、未知提交先查结果；正常已发布有效内容及无关合法功能按实际依赖继续，核心依赖故障如实说明，不降授权／审核／删除标准。（FAIL-01、PRD 第 17.2 节；AC-34）

## US15旅程验收

1. **Given** 有互动、请求、私信、投票结束、公告或安全事件，**When** 通知产生，**Then** 持久保存、适当合并去重、不发无意义自我通知，内容和目标按当前授权更新。
2. **Given** 系统推送关闭或 Android 后台通道不足，**When** 重连或回前台，**Then** 站内通知、消息和未读可同步，明确权限／兼容状态，不把服务商接受当设备送达。
3. **Given** 锁屏通知，**When** 展示或检查负载，**Then** 默认通用提醒，公开短预览选择不放开私信、受限内容、证据或秘密。
4. **Given** 独立服务故障，**When** 请求相关功能，**Then** 不跳验证码、不自动审核通过、不暗换模型；允许的其他功能继续，核心依赖故障则如实说明影响。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| notification | recipient、kind、target_refs、group_key、state/read_at、source_epoch | 合并真实互动，不自通知；当前授权投影摘要/目标；必要安全类核心生成 |
| delivery_attempt | message/notification、channel、effect_key、state、provider_ref、timestamp/error | saved、provider_accepted、device_delivered、read分离，重试不多提醒 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-33 | 推送默认无正文 / 秘密、公开预览选择不放开私信；关闭推送仍有站内未读。Android 不支持后台通道时前台 / 重连仍可收消息，无重复提醒或自我通知。 | NTF-01–05 |
| AC-34 | 短信、审核、AI 分别故障和恢复，不跳 OTP、不自动审核通过、不暗换服务商，输入可恢复、已发布合法内容不因独立服务故障全部下线；后台可诊断。 | AUTH-10、AI-20、FAIL-01、POST-03–06 |
