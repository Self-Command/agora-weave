# 审核、安装、启停、升卸与插件隔离

对应原旅程US13；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 开发邀请 / 包审核 / 敏感权限 | inviteDeveloperManagement / reviewPluginManagement / grantPluginPermissionsManagement | 超管当前MFA理由、具体version+digest+范围 | 自用受邀仅提交、兼容安全权限审核才装，官方无自动高权，增量重审，自用兼任分步骤审计 |
| 发现导入 / 安装预览与执行 | listPluginVersionsManagement / previewPluginLifecycleManagement（action=install） / changePluginLifecycleManagement（action=install） | env/manifest schema/来源hash/依赖DAG冲突/grant/迁移compat | acquired→checked→installing→installed_disabled→validating→awaiting_confirmation→enabled及真实failed/recovery，上传安装非全部端上线 |
| 启用 / 停用影响与明确联动 | changePluginLifecycleManagement（action=enable） / previewPluginLifecycleManagement（action=disable） / changePluginLifecycleManagement（action=disable） | env/version/grants、明确选受影响集合、operation | 有效依赖默认阻并列影响，安全compat才联动停；关新admission升epoch撤lease/入口新写任务通知AI，在途排空末端再核 |
| 升级恢复 / 卸载重装 | previewPluginLifecycleManagement（action=upgrade） / changePluginLifecycleManagement（action=upgrade） / changePluginLifecycleManagement（恢复动作） / previewPluginLifecycleManagement（action=uninstall） / changePluginLifecycleManagement（action=uninstall） | 目标包/敏感增量/迁移hash/恢复限制与必要确认 | code/config/schema/data分事实，失败仅安全最后版继续不承诺无损down；卸保原期限，重装仅有效有权 |
| 额外清理 / 健康日志 | previewPluginDataPurgeManagement / confirmPluginDataPurgeManagement / getHealthManagement / getAuditManagement（获准插件日志投影） | 独立精确超管MFA/DEC-001确认、日志最小权 | 额外清理保护共享证据恢复；原到期继续，日志无secret私人原文，异常可定位停隔有限资源 |

## 输入、权限、事务与异常边界

核心身份权限安全隔离/配置审计/契约/插件管理/生命周期持续，不因业务停失效。social/content/discussion/interaction/discovery/messaging/ai/sharing完整交付默认全启用；基础运营后置不冒称已可启。依赖与可停范围清楚，默认阻止，明确集合才安全联停，不卸依赖/删资格事实。

清单ID/来源维护者/semver/平台SDK三端compat/依赖冲突/权限配置/插槽/native代码/迁移保留，具体包不可换内容、审核绑digest。归档拒路径穿越重复项symlink炸弹。原工程.awplugin、50MiB包/200MiB解压/1000文件/压缩比20仅保留技术起点，服从共享契约，未实现不称可用。

broker每次可信user/env/plugin/version/epoch与原模块当前权，不直读他插件/借service_role或他人秘密；block/作者用途/删除地域持续。runner最小权无hostsocket/run/FFI/任意外网，资源越限实际停隔，配额按共享技术契约。

停用历史当前有权安全只读否则无正文占位，核心删除撤权证据到期继续。升卸分别代码配置结构数据恢复限制，卸载原trigger/due不改，兼容重装不复活删清撤权旧敏感grant；额外永久清理另授权，联停非联卸/清理。在途超时unknown不假成功。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

正式plugin registry/受审包/runner/broker/installation/管理控制台/官方模块注册未实现；可靠效果权限保留基础不代表插件平台完成。插件管理与SDK后置，业务记录是义务非已建表。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [supabase/migrations/0003_effects.sql](../../../supabase/migrations/0003_effects.sql)
- [supabase/migrations/0005_obligations.sql](../../../supabase/migrations/0005_obligations.sql)
- [packages/policy/src/authorize.ts](../../../packages/policy/src/authorize.ts)
- [services/core-worker/src/outbox.ts](../../../services/core-worker/src/outbox.ts)

## 最小必要验证

1. 未邀未审换包增权未批拒装，官方不高权，同人各步审计，DEC-001和生产确认逐动作。
2. 依赖默认阻、显式集合安全停；停用与在途输出/effect竞争当前epoch，历史安全而核心清理继续。
3. 迁移部分失败中断查询/重试防重，安全最后版事实，升卸重装原期限不变/extra purge独立确认，A/B跨域资源异常无旁路。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-143"></a>

- **FR-143**：身份、权限、安全／隔离、配置、审计、扩展契约、插件管理与生命周期必须为持续有效核心；官方帖子、讨论、关系、私信、发现、AI 等默认全部启用，完整既有首版不缩减。依赖、责任及受控可停用清单可查，有有效依赖默认阻止，明确选定且安全兼容才联动停用，不自动扩散／删数据。（PLT-02；AC-43、AC-46）

<a id="fr-144"></a>

- **FR-144**：核心、官方与第三方必须标来源、维护者、版本、权限、依赖和审核；首版仅自用及受邀提交，经兼容、安全、权限审核才装测试／生产，不开放无限公共安装，官方来源不自动高权限，每次更新绑定具体版本审查。（PLT-03；AC-43、AC-45）

<a id="fr-145"></a>

- **FR-145**：插件对身份、内容、关系、媒体、通知、AI、治理的调用必须通过当前授权及原模块许可，不能直读他插件或用高权限凭据绕过；拉黑、作者用途、删除／撤权、治理和地域跨插件持续生效，AI 插件也只读。（PLT-04；AC-43–45、AC-50）

<a id="fr-146"></a>

- **FR-146**：插件参数、组合、入口、主题、功能、测试及发布策略必须接统一配置及版本／范围／审计／恢复，共享依赖影响可预览；不另建越过核心配置体系，不引入行业、租户、社区空间或产品管理对象。（PLT-05；AC-38、AC-43、AC-50）

<a id="fr-147"></a>

- **FR-147**：插件必须声明自身数据归属、最小权限和允许共享契约，读写继续检查用户、资源、环境及插件资格；数据、媒体、实时、任务、日志、搜索／AI、配置与恢复同样隔离，不借凭据或直接访问绕过。（PLT-06；AC-50）

<a id="fr-152"></a>

- **FR-152**：插件必须有可读版本化清单，声明身份、来源／维护者、包版本、平台／开发工具／各端兼容、依赖冲突、权限、配置、位置、代码／原生变化、迁移及数据生命周期；发现／导入仅受邀或自用来源审核包，审核与实际版本不符不可安装。（PLG-01；AC-45）

<a id="fr-153"></a>

- **FR-153**：首版超级管理员必须负责开发者邀请、认可具体版本审核、敏感权限及生产确认；自用同人兼任分别操作留档，不豁免云端证据、多因素验证或审计，受邀默认只能提交。开发调试许可不等同测试／生产安装，任何另授权不得越核心角色边界。（PLG-01；AC-45）

<a id="fr-154"></a>

- **FR-154**：安装必须针对指定环境检查来源、清单、版本、依赖、权限、迁移和客户端兼容，仅满足授权及所需验证才登记；分别展示发现、已获取／待检查、检查未通过、安装中、已安装未启用、待验证／构建、待生产确认、已启用和失败／恢复等事实，上传成功不等于上线。（PLG-02；AC-45、AC-47）

<a id="fr-155"></a>

- **FR-155**：启用必须检查环境、依赖、权限及已发布版本；停用必须停止对应新入口、业务写入／调用、任务／事件、通知和 AI 工具，按预览受控收束在途操作。历史仅当前有权且安全路径只读，否则无正文占位；核心必要删除／撤权／治理／到期清理不中断。（PLG-03；AC-45–46）

<a id="fr-156"></a>

- **FR-156**：有有效依赖的停用／卸载必须默认阻止并列影响；管理员明确选定联动范围且校验通过才停用，不自动扩散，不将联动停用当自动卸载／清理。（PLG-03、PLG-05；AC-43、AC-46）

<a id="fr-157"></a>

- **FR-157**：升级必须检查权限增量、兼容、依赖及迁移，新敏感权限单独审核；失败尽可能保留安全兼容最后可用版并可查重试／恢复。执行前说明代码、配置、结构及数据恢复分别的限制、不可逆风险及必要备份，不承诺任意结构无损降级。（PLG-04；AC-46）

<a id="fr-158"></a>

- **FR-158**：卸载必须分别预览／处置代码、配置、结构和数据，默认按原分类期限保留业务数据；额外主动永久清理另行授权确认且保护共享、证据及恢复副本，原到期清理继续。兼容重装只恢复有效有权数据，不重算期限、不复活删／清／撤权，不自动授旧敏感权限，不损核心／他模块。（PLG-05；AC-46）

<a id="fr-159"></a>

- **FR-159**：管理必须可查当前／目标版、环境、权限、依赖、兼容、发布、健康、请求／运行日志、失败与恢复；日志仍授权且无秘密／无关私人原文，插件异常可定位并受控停隔，资源使用不能无界损害其他主体，共享依赖故障如实说明。（PLG-06；AC-46、AC-50）

## US13旅程验收

1. **Given** 初始首版，**When** 用户使用官方模块，**Then** 完整社交和 AI 默认全部启用，身份、权限、安全、配置、审计、插件管理与生命周期不依赖业务模块启用。
2. **Given** 来源未获邀请、包未审或与获审版本不符，**When** 安装到测试／生产，**Then** 拒绝；自用同人兼任也分别保留提交、审核、权限和发布记录。
3. **Given** 插件有有效依赖，**When** 停用或卸载，**Then** 默认阻止并列影响；仅管理员明确选定且校验通过才联动停用，不自动扩散、卸载或清理依赖。
4. **Given** 插件停用，**When** 新业务调用或读取历史，**Then** 新写入、调用、任务、通知和工具受控停止；历史按当前资格安全只读或无正文占位，核心删除、撤权、证据和到期清理继续。
5. **Given** 升级、卸载或兼容重装，**When** 执行，**Then** 权限增量需审核，代码／配置／结构／数据恢复限制可见；卸载默认保留原期限数据，额外主动永久清理另行确认，不复活已删、已清理或已撤权记录。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| developer_invitation | developer、inviter、scope、expires/revoked、state | 受邀默认提交，不授review/install/release |
| plugin/version | plugin_id、maintainer/source、semver、manifest/hash、payload_digest、compat、dependencies、permissions、migration/lifecycle | ID/版本唯一，原包不可替换；官方也不自动高权 |
| plugin_review/grant | version/digest、compat/security/permission checks、reviewer、decision、sensitive_permissions | 审核绑定digest，更新增量重新审；自用同人也分步骤留档 |
| plugin_installation | environment/plugin、current/target_version、state、lifecycle_epoch、grants、health、history_projection | acquired→checked→installing→installed_disabled→validating→awaiting_confirmation→enabled；failed/draining/disabled/uninstalled各有事实 |
| migration_run | version/environment、migration_digest、schema_version、state、result/recovery_limits | 前置/实际状态核，重试幂等；生产迁移前确认，失败不承诺down无损 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-43 | 首版实际交付安装管理、三端扩展、文档工具和隔离测试；核心身份 / 权限 / 安全 / 审计 / 生命周期与官方社交业务清单可查，既有首版验收全部保留，官方业务默认全部启用。管理员可在权限 / 依赖校验下受控停用；有有效依赖时默认阻止并列影响，只有明确选定联动范围且校验通过才停用，不自动扩散或删其他模块数据。核心身份 / 安全 / 配置 / 审计 / 插件管理持续可用；以契约增加业务无需改核心源码，官方 / 第三方均按权限与统一配置运行。 | PLT-01–05、PLG-03–05、CFG-01–13、VIS-01–03、ADM-02 |
| AC-45 | 自用及受邀开发者提交来源 / 版本 / 权限明确的包，经兼容、安全与权限审核才可安装到测试或生产；超级管理员负责邀请、认可具体版本审核通过、敏感权限及生产确认。自用同人兼任仍有各步独立记录、云端证据、MFA 和审计；受邀开发者未另获授权不能认可审核通过、批权限、安装或发布，普通角色不能借入口越权。未受邀、未审或版本不符拒绝；管理端显示兼容、依赖、迁移、环境及状态，上传不等同上线，停用同步处理新业务页面 / API / 任务 / 通知 / AI 工具，历史按受控只读或占位。 | PLG-01–03、PLT-03–05、EXT-01–04、ADM-02–03、ADM-06 |
| AC-46 | 升级权限增量需审核，依赖 / 迁移失败可查和恢复，最后可用版本按兼容状态保留；代码 / 配置 / 结构 / 数据恢复限制分别明确。停用历史当前有权且可安全展示时只读，否则无正文占位；有依赖时默认阻止卸载，明确联动停用不自动卸载依赖。卸载默认保留数据并按原分类期限清理，不重置时间；卸载时额外永久清理单独授权确认，证据 / 共享数据 / 恢复副本不误删，原到期清理仍执行。兼容重装恢复有效数据，已删 / 已清理 / 撤权或未批敏感权限不复活；核心删除 / 撤权 / 治理义务持续有效，运行健康及授权日志可定位故障。 | PLG-03–06、PLT-02、DATA-01–04、ADM-02–03、FAIL-01 |
