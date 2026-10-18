# 统一配置的预览、发布、消费与回滚

对应原旅程US11；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 客户端规则 / 后台参数定义 | getEffectiveConfiguration / getConfigurationDefinitionsManagement（全域planned）/ getOtpConfigurationManagement（当前OTP六key） | 当前env/module/plugin/有权group/audience | 唯一effective及version/source可查，客户只必要非敏感值，无secret他人配置/private preferences |
| 改值预览 | previewConfigurationManagement（全域）/ previewOtpConfigurationManagement（OTP） | 逐key权、base_version、schema值scope/reason | 类型范围依赖冲突校验，现有/新增生效风险恢复限制，group同层无明确优先级拒不靠遍历 |
| 发布/定时重载/状态 | publishConfigurationManagement（全域）/ publishOtpConfigurationManagement（OTP） / getOperationManagement / getConfigurationDefinitionsManagement / getOtpConfigurationManagement | 完整bundle/preview digest/action摘要、当前MFA/stepup/operation | draft→validated→ready→active/rejected，全部compat/reload consumer-ready后原子active，失败保旧无半生效 |
| 回滚预览 / 回滚 / 历史 | previewConfigurationManagement（目标历史值与影响） / rollbackConfigurationManagement（全域）/ rollbackOtpConfigurationManagement（OTP） / getConfigurationDefinitionsManagement / getOtpConfigurationManagement（history） | 当前权、合法旧值当前schema依赖与必要生产确认 | 新bundle及审计不回退删权安全事实，unknown查询原operation保输入 |

## 输入、权限、事务与异常边界

每key含唯一名/owner/说明、默认当前、confirmed/engineering/provisional、schema/range/scope、依赖冲突、读写敏感权、生效重载、consumer、现有对象策略及验证。global→env→module/plugin→有权group；个人接收回执/作者AI收录只收窄不平台强开。

内容投票社交账号数据/AI推荐/通知DM治理/媒体cache/UI插件各域已实现规则均纳统一；开放业务随交付必要管理入口和真实服务端客户端消费，高级控制台后置。注册条目不证明消费者，API/SQL/作业/MCP各端单次固定完整兼容版本，当前权限不冻结旧版。

旧客户端与权威不一致返当前version、刷新保正文成功附件结果。缺配置不无限额度/强开功能/免安全，最后合法版与明确故障区分。核心身份当前授权/RLS/隔离/secret/审计/AI只读大陆政策不能普通关。

期限状态预览写清既有/新增对象生效，不毁唯一恢复副本、不复活terminal请求/已删/逐消息撤权、不改锁票；必要专门迁移明示。runtime尽量免部署，代码/native/schema不兼容走真实交付，UI只已支持中文主题导航排序，ED-10分享固定平台默认不偷读本人偏好。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有参数解析注册版本与必要OTP预览发布回滚/后台；非全域管理/全部consumer闭环。全控制台、定时重载consumer、真实既有对象/跨端播放/插件消费未完成。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [packages/config/src/definitions.ts](../../../packages/config/src/definitions.ts)
- [packages/config/src/resolve.ts](../../../packages/config/src/resolve.ts)
- [packages/config/src/resolve-core.ts](../../../packages/config/src/resolve-core.ts)
- [supabase/functions/core/config/effective.ts](../../../supabase/functions/core/config/effective.ts)
- [supabase/functions/core/routes/configuration.ts](../../../supabase/functions/core/routes/configuration.ts)
- [apps/admin/src/features/management/components/otp-configuration.tsx](../../../apps/admin/src/features/management/components/otp-configuration.tsx)
- [supabase/migrations/0018_configuration_registry.sql](../../../supabase/migrations/0018_configuration_registry.sql)
- [supabase/migrations/0034_otp_configuration.sql](../../../supabase/migrations/0034_otp_configuration.sql)

## 最小必要验证

1. scope优先级/同层冲突，敏感key普通运营拒，前后值理由version审计，客户端无secret私人。
2. 并发base_version、未就绪/失败发布回滚无部分生效，旧客户端保输入按当前阈值。
3. 锁票terminal请求/已删/逐消息撤权回滚无复活，恢复副本保护，平台更新不盖App选择，分享无私人偏好。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-130"></a>

- **FR-130**：必须有唯一权威业务配置来源，各端、模块和 AI 取得当前适用规则；客户端仅获展示与交互所需非敏感配置，不获凭据、他人配置或后台专用安全策略。（CFG-01；AC-38）

<a id="fr-131"></a>

- **FR-131**：每项可调整参数必须登记唯一标识、名称、说明、模块、默认／当前值、类型／范围、环境／作用范围、依赖冲突、修改权、生效／重载方式和验收；新增参数不能只放孤立字段。（CFG-02；AC-38、AC-40）

<a id="fr-132"></a>

- **FR-132**：配置中心必须覆盖内容、投票、社交、账号、数据生命周期、AI、推荐、通知／私信、审核／治理、媒体／缓存、界面及插件各域的已实现规则，包括数量、时长、频率、开关和策略；不因字段出现新增未经确认能力。（CFG-03、PRD 第 19.2 节；AC-38–41）

<a id="fr-133"></a>

- **FR-133**：必须支持全局默认、适用环境、模块／插件、授权用户组，适用优先级、覆盖及冲突结果可查且产生唯一有效值，不引入社区／租户运营配置；个人接收、回执与作者设置不被平台参数放宽。（CFG-04；AC-38）

<a id="fr-134"></a>

- **FR-134**：配置必须有版本、范围、时点、状态和立即／定时／重载说明，关联参数按完整兼容版本生效，单操作不读矛盾组合，各消费者识别适用版本及失败。（CFG-05；AC-39）

<a id="fr-135"></a>

- **FR-135**：旧缓存规则与当前权威结果不一致时必须告知、刷新并保留输入／恢复状态，客户端缓存仅作非敏感提示；资源、账号和敏感操作每次当前校验。（CFG-06；AC-39）

<a id="fr-136"></a>

- **FR-136**：配置修改必须逐参数授权，普通运营仅获准项、敏感项更高权限及再次验证，记录前后值、人员、时间、理由、版本、结果；高影响变更有预览、确认与必要恢复。（CFG-07；AC-40）

<a id="fr-137"></a>

- **FR-137**：发布／回滚必须校验类型、范围、依赖、冲突和作用范围，失败不部分生效；恢复仍校验当前资格／兼容，缺失／不兼容／故障不回到无限额度、强开功能或免安全。（CFG-08；AC-39–40）

<a id="fr-138"></a>

- **FR-138**：所有真实消费路径必须执行同一有效参数，不能各端、任务或工具各自写死冲突规则；提高阈值／隐藏提示不取消权威校验，覆盖并发及更新竞争。（CFG-09；AC-38–40）

<a id="fr-139"></a>

- **FR-139**：核心身份、当前授权、隔离、秘密保护及必要审计必须持续有效，普通参数不能关闭或授予越权；模型／工具配置不放宽 AI 只读、作者用途或批准地域。（CFG-10；AC-41–42）

<a id="fr-140"></a>

- **FR-140**：涉及期限、状态及资格的变更必须预览生效对象、时间和现有资源处理，不恢复撤权／已删数据，不复活结束请求或破坏既有锁定投票，恢复／申诉／新申请仍走合法流程。（CFG-11；AC-41）

<a id="fr-141"></a>

- **FR-141**：已有运行时参数必须按真实生效规则尽可能免重建／部署；新增代码、原生、结构或不兼容契约仍走适用交付。主题、颜色、菜单、导航、页面、排序和语言仅配置已支持能力，保持中文、无障碍及真实反馈，显示不替代授权、不伪造能力。（CFG-12–13；AC-39、AC-41、AC-55）

## US11旅程验收

1. **Given** 全局、环境、模块／插件及用户组存在适用值，**When** 查看有效配置，**Then** 优先级和来源可查，产生唯一有效值，不污染无关范围。
2. **Given** 参数类型、范围、依赖或权限不合法，**When** 发布配置，**Then** 拒绝且关联配置不部分生效；预览、理由、版本、结果和合法恢复可查。
3. **Given** 客户端缓存旧限制，**When** 提交新操作，**Then** 权威校验执行当前规则，提示并刷新，输入与可恢复结果保留，缓存不作为授权。
4. **Given** 变更或回滚涉及期限、状态、权限，**When** 应用，**Then** 预览说明现有对象如何处理，不复活结束请求、已删除数据、已撤销访问或改变既有锁定票。
5. **Given** 配置缺失、故障或入口被隐藏，**When** 使用功能，**Then** 不变成无限额度、免授权或假可用；普通配置不能关闭核心安全及必要审计。

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-38 | 配置按注册元数据管理，默认 / 当前值、环境 / 模块与插件 / 用户组范围、依赖和权限可查，按明确优先级得唯一有效值。各消费者使用相同适用规则；未授权人员不能读改他插件、其他用户或后台专用配置，调整一个插件参数不污染无关模块及环境。新增参数有默认、范围、生效与验收登记。 | CFG-01–04、CFG-08–09、ADM-02、PLT-05–06 |
| AC-39 | 修改帖子长度、媒体大小、投票时长、AI 额度及推荐权重后各消费者按版本 / 时点生效；离线或旧客户端缓存不能越新限制，服务端拒绝后刷新并保留输入。权限 / 账号 / 敏感操作不依赖缓存授权，配置缺失或不兼容不变成无限额度或跳过检查；并发不读取冲突参数组合。 | CFG-05–06、CFG-08–10、POST-04–05、AI-18–19 |
| AC-40 | 普通运营只能改授权参数，敏感变更高权限 / 再次验证，变更前预览并记录前后值 / 理由 / 版本 / 结果。非法类型 / 范围 / 依赖组合拒绝；关联发布失败不部分生效，回滚和恢复结果可查；API / 数据函数 / Edge Functions / 作业不另写一套业务阈值。 | CFG-02、CFG-07–09、ADM-02–03、ADM-06 |
| AC-41 | 参数调整 / 回滚不恢复单条私信已撤销访问、已删内容、结束请求或破坏已锁定投票；后台不能通过普通参数关闭认证、RLS、隔离和审计。常规运行时参数按规则生效且无需重建，新增原生 / 结构 / 不兼容能力仍走构建迁移；主题 / 菜单 / 模块 / 已支持语言调整有反馈且不虚构能力或放开授权，默认中文和无障碍保持有效。 | CFG-10–13、DATA-01–04、POL-02–03、DM-06、DM-09–11、UX-01–06 |
