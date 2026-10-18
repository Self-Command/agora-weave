# 同版验证、生产确认、名单灰度与旧端兼容

对应原旅程US14；完整产品义务保留，文档不表示实现或验收通过。[公共规则](../rules.md)适用于以下所有动作。operationId是控件与共享OpenAPI的业务绑定，尚未登记的名称须协调统一，不代表路由已实现。

## 可执行动作与控件绑定

| App / 后台控件或消费者 | operationId | 前置身份、状态与输入 | 权威判断、转移与副作用 |
| --- | --- | --- | --- |
| 变更预览 / 验证证据 | previewReleaseManagement / Actions验证（无新增产品HTTP operationId） / getReleaseEvidenceManagement | 不可变SHA/各端artifact digest、contract/config/plugin/权限迁移/env名单摘要 | runtime配置/backend-admin-schema/兼容移动更新/new-native不兼容重建，混合最高要求，适用检查与同版产物可查 |
| 确认生产 / 受控执行状态 | confirmReleaseManagement / 受控部署worker（消费确认，非用户任意执行端点） / getReleaseManagement | 当前超管aal2/一次stepup/DEC-001/理由，准确plan+scope+evidence | 无具体确认拒部署迁移后台替换权限版本生效，计划名单变摘要失效，自动验证/Actions Environment不替产品确认 |
| 指定名单 / 观察 / 扩大确认 | previewReleaseManagement（冻结名单scope） / getReleaseManagement（health状态） / confirmReleaseExpansionManagement | 明确account名单∩compat∩当前数据权 | prepared→cloud_verified→awaiting_confirmation→approved→deploying→canary→awaiting_expansion→expanded，扩灰新确认名单外不下发 |
| 旧端更新 / 中断恢复 | getClientCompatibility / getClientCompatibility（更新去向） / 受控发布worker重试（原operation/确认再核） / previewReleaseManagement / confirmReleaseManagement（恢复版本） | 可信发行runtime/native fingerprint/SDK能力、原operation | 安全核心兼容继续，局部扩展不兼容仅提示更新，核心确不安全才强更且安全申诉可达；unknown先查不重复安装迁移通知发布 |

## 输入、权限、事务与异常边界

产物同SHA/digest冻结，不验A发B，签名派生最终包有核验；上传安装启用/各端上线/外部分发分别事实。兼容OTA需真实runtime/native能力签名分发，不信客户端自报；JS/TS开发Metro热更新，native变化Actions构建。

Actions OIDC受限部署身份核issuer/aud/repo/owner/ref/workflow/run/attempt/env，只换准确动作短租约，不能dispatch或Environment reviewer替产品确认。失败留日志，恢复回滚核当前compat/权限/安全日志，不复活数据；不可回滚/部分成功/在途/渠道待处理真实告知。

正式完整产品移动双端/后端后台分享AI及插件真实联通，业务接口安全并发恢复原生交互全适用验证；视觉稳定版本本地单主题。失败缺失skip取消超时错版未通过，编译mock非真实完成。

观察固定环境负载设备网络分母，原24h/100核心20扩展样本/≤1%失败率为暂定工程起点，样本不足继续，不升SLA。生产独立常驻，用户服务器域名SMS签名分发按真实资源，缺项仅停依赖。

所有写动作均应用公共CAS/operation/未知结果规则；失败保输入，当前资格变化不复用旧授权。后台动作继续逐操作/资源/env/MFA核验，控件启禁只作提示。

## 现有代码与真实未完成范围

已有验证云构建与Phase2历史产物；完整release plan/产品确认broker/名单扩灰/OTA兼容/发布控制台未实现。历史Release不是完整首版/生产批准，版本结果仍主控当前核。

本轮实查存在的复用位置（仅源码定位，不表示完整业务通过）：

- [.github/workflows/verify-release.yml](../../../.github/workflows/verify-release.yml)
- [.github/workflows/verify-increment.yml](../../../.github/workflows/verify-increment.yml)
- [tools/ci/validation-manifest.json](../../../tools/ci/validation-manifest.json)
- [apps/mobile/app.json](../../../apps/mobile/app.json)
- [supabase/upstream/docker/docker-compose.yml](../../../supabase/upstream/docker/docker-compose.yml)

## 最小必要验证

1. 四类混合最高路径、替换digest/缺失败skip拒，所有生产影响无确认/错摘要/过期/撤角色/冷却拒。
2. 名单内外×compat×当前数据权、扩名单新确认；局部扩展不兼容不强更安全核心。
3. 每阶段unknown查原结果重试不重复，迁移恢复限制真实，恢复不回安全水位，SHA/env/run与实际产物相同。

日常目标和直接影响回归，正式结论需真实客户端与隔离服务；后置/缺资源消费者保持未验证，编译、mock或截图不替业务通过。

## 完整需求行为

<a id="fr-160"></a>

- **FR-160**：安装／升级必须自动检查变更并关联全部适用验证、回归、构建、实际运行及视觉与预发布；任何影响生产用户的部署、迁移、权限或版本生效前，必须超级管理员确认具体版本、权限及范围。先明确名单灰度，扩大前再确认，不默认预授权低风险生产自动发布。（UPD-01；AC-47、AC-51–53）

<a id="fr-161"></a>

- **FR-161**：更新必须区分已有运行时配置、后端／后台代码／结构、兼容移动更新、新原生或不兼容需 App 重建；混合变更按最严格实际要求安排，不能仅改页面造成权限／结构／契约不兼容，不承诺所有插件免重建。（UPD-02；AC-47）

<a id="fr-162"></a>

- **FR-162**：平台必须识别客户端能力、契约及插件兼容，不下发不能运行代码／动作；安全兼容旧功能继续，局部不兼容仅禁该扩展并给更新／暂不可用去向，仅核心无法安全兼容才强更。灰度不授不兼容或越权资格，必要安全／申诉指引保持可达。（UPD-03；AC-47）

<a id="fr-163"></a>

- **FR-163**：发布必须有目标环境、明确灰度名单、版本、健康观察、失败中止／恢复；名单外不提前启用，验证／观察后扩大仍确认，失败、未批权限、缺依赖或不兼容不得跳过，回滚不复活删除／撤权／未授权能力。（UPD-04；AC-47）

<a id="fr-164"></a>

- **FR-164**：失败／中断必须可查询最终状态、重试及恢复，不重复安装、迁移、通知或发布，旧版仅安全兼容时继续；不能回滚、部分成功、在途及外部渠道待处理明确告知，用户不困于假成功或半启用。（UPD-05；AC-47、AC-53）

## US14旅程验收

1. **Given** 变更包含配置、后端／后台、兼容移动更新或新原生能力，**When** 检查交付，**Then** 按实际最高要求选择生效、部署或重建路径，不能将上传／安装当所有端已上线。
2. **Given** 自动验证已完成但无超级管理员对具体版本、权限及范围确认，**When** 尝试影响生产，**Then** 拒绝，包括迁移、后台替换、权限生效和生产启用。
3. **Given** 生产版本获批且指定灰度名单，**When** 启用及扩大，**Then** 名单外不提前取得能力，扩大须再次确认，新旧版本继续当前授权。
4. **Given** 旧端仍安全兼容核心但某扩展不兼容，**When** 使用，**Then** 兼容功能继续，对扩展提示更新／不可用；仅核心无法安全兼容才强更并给有效去向。
5. **Given** 验证缺失、跳过、失败、超时或发布中断，**When** 重试／恢复，**Then** 状态与证据可查，不重复安装、迁移、通知或发布，不承诺无损降级，不复活撤权数据。

## 必要业务记录与状态不变量

逻辑名与字段用于保留业务含义；先复用现有结构及共享数据契约，不要求重建同名表或重跑迁移。

| 记录 | 必要信息 | 不变量 |
| --- | --- | --- |
| client_release | app/build/platform、runtime/native_fingerprint、contract/sdk/ui_versions、capabilities、distribution_ref | 发行注册可信；旧端仅局部不兼容不强更，必要核心不安全才强更 |
| release_plan | id、commit/各产物digest、config/plugin/contract、change_class、migration/permission、environment、cohort_digest、rollback_limits | 不可变摘要；混合最高要求；构建/验证同产物 |
| release_confirmation | plan_digest、scope_digest、approver/session/stepup、reason、expires/consumed | 生产每动作匹配/当前授权，改变计划失效；扩灰新确认 |
| cohort_member | release/cohort_version、account_id、added_by、effective_at | 管理员明确名单，非随机百分比；资格不等于数据权限 |

## 原AC完整行为承载

保留完整前置、操作、正常/异常/并发及直接访问结果；历史云端视觉地点条款依公共规则改本地实际复检，业务断言不删，PRD历史原文不改。跨功能消费者见[覆盖索引](../../coverage.md)。

| 场景ID | 前置、操作与可验证结果 | PRD对应需求 |
| --- | --- | --- |
| AC-47 | 安装 / 升级自动识别配置、后端 / 后台、兼容 OTA 或 App 重建，检查 / 测试 / 构建 / 预发布可追踪。未经超级管理员对版本、权限与作用范围确认，不影响生产用户；迁移、后台生效或版本替换不能绕过确认。先指定名单灰度，名单外不提前启用，扩大范围前再次确认；失败 / 未批权限阻止。旧版兼容功能仍可用，不兼容扩展仅提示更新，核心无法安全兼容时才强制更新整个 App；不下发无法运行代码，中断重试不重复发布，回滚不复活撤权。 | UPD-01–05、PLG-01–04、CFG-05–12、UX-04 |
| AC-51 | 同一提交及交付版本由 Actions 云端完成移动双端、后端、后台、分享网页、AI/MCP 与插件的必需编译和功能 / 接口 / 权限安全 / 回归 / 端到端检查。实际启动相应服务、安装运行移动产物并连通隔离后端执行跨端流程；模拟接口、代码扫描或单独编译成功不能代替运行验收。本地项目运行记录不能充验收证据。 | TECH-05、CI-01–03、CI-06–08、TST-01–04 |
| AC-53 | 云端记录提交、版本、环境、Actions run、检查范围和结果，保留日志、测试报告、截图 / 差异 / 交互证据及适用构建产物；失败、取消、超时、跳过或缺证据不能伪报通过。AI 读取失败后仅修改代码 / 测试 / 工作流并推送，重新通过云端回归后才交付；生产服务独立运行，不以 Actions 长期进程充生产部署。 | TECH-05、CI-01、CI-05–08、UPD-01–05 |
