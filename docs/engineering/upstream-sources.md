# 当前来源与初始化历史

2026-10-17现行依据宪法7.0.0与[执行政策](execution-policy.md)：后台完整导入
Kiranism/next-shadcn-dashboard-starter@7705dfc0d13889e45c26a55ad5908da6a7a9a605，
tree7ac574a2d4c2145c938e2f4ab5739320d551f7a0；全部582原文件与SHA256映射保存于
apps/admin/upstream-metadata/source-map.json。当前完整布局、导航、主题、表格、表单及样例源码保留，
不再采用下文历史“仅保留必要依赖/组件”的精简方式。活动代码采用同commit官方无Clerk适配，
完整差异、安全边界与本地字体来源见[后台集成说明](../../apps/admin/INTEGRATION.md)。
Supabase仍使用下文固定官方完整Docker源码；各端实际完成与测试只见当前状态，不由来源完整性推断。

## 以下为初始化历史

> 历史资料：本文保留所记日期／提交的决定、结果或资源事实，不作为当前开发入口。现行执行见宪法5.0.0、[ED-22](business-first-development-decision.md)及[执行政策](execution-policy.md)；旧状态不能推断当前或其他分支已通过。

移动依赖来自 Expo 官方 commit `58da4edafcb043872c3ed9bf8f5957e6544d0a9c` 的默认模板与 bundledNativeModules，保留 Expo57.0.28／React19.2.3／RN0.86.3 关联组合。无业务壳只提供可加载入口；不能作为已完成产品页面或视觉基准。

后台固定 Kiranism/next-shadcn-dashboard-starter commit `7705dfc0d13889e45c26a55ad5908da6a7a9a605`。保留其 MIT LICENSE、components.json、TypeScript配置、shadcn Button和cn工具；删除无关formatBytes，按src目录修正components CSS路径。仅带入当前必要依赖，不带Clerk、演示身份、数据和业务。React19.2.4和TS5.7.2保持该端版本，移动单独解析。分享是独立只读Next表面。

官方Supabase完整docker子树来自self-hosted/v0.8.2 commit `564eab8ad7840b13324f68b1bfac074ef8d51c21`，tree `c11bb48f7619a1224cfe107c275e4dc9953b967c`。原文件和blob清单保留在supabase/upstream/docker与infra/ci/supabase-source.json；项目隔离覆盖单独存infra/ci，不修改官方Compose来掩盖差异。官方样例密钥只属公开示例，禁止用于实际测试或生产。

所有依赖解析、源摘要核验、安装、编译、运行与采集仅在GitHub Actions。首次云端生成lockfile并回传新提交，随后同新SHA immutable install；当前壳不证明任何业务验收。

初始化服务覆盖仅关闭宿主端口发布、置内部网络、禁注册／短信／邮件及Studio AI外部调用。dev／test分别调度独立GitHub-hosted runner、独立checkout／Docker卷和独立Actions secrets，不能共享生产身份或数据。尚未提供原生访问入口前，仅证明runner内部真实官方服务健康，不宣称原生跨端联通。
