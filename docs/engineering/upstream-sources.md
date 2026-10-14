# 初始化来源

移动依赖来自 Expo 官方 commit `58da4edafcb043872c3ed9bf8f5957e6544d0a9c` 的默认模板与 bundledNativeModules，保留 Expo57.0.28／React19.2.3／RN0.86.3 关联组合。无业务壳只提供可加载入口；不能作为已完成产品页面或视觉基准。

后台固定 Kiranism/next-shadcn-dashboard-starter commit `7705dfc0d13889e45c26a55ad5908da6a7a9a605`。保留其 MIT LICENSE、components.json、TypeScript配置、shadcn Button和cn工具；删除无关formatBytes，按src目录修正components CSS路径。仅带入当前必要依赖，不带Clerk、演示身份、数据和业务。React19.2.4和TS5.7.2保持该端版本，移动单独解析。分享是独立只读Next表面。

官方Supabase完整docker子树来自self-hosted/v0.8.2 commit `564eab8ad7840b13324f68b1bfac074ef8d51c21`，tree `c11bb48f7619a1224cfe107c275e4dc9953b967c`。原文件和blob清单保留在supabase/upstream/docker与infra/ci/supabase-source.json；项目隔离覆盖单独存infra/ci，不修改官方Compose来掩盖差异。官方样例密钥只属公开示例，禁止用于实际测试或生产。

所有依赖解析、源摘要核验、安装、编译、运行与采集仅在GitHub Actions。首次云端生成lockfile并回传新提交，随后同新SHA immutable install；当前壳不证明任何业务验收。

初始化服务覆盖仅关闭宿主端口发布、置内部网络、禁注册／短信／邮件及Studio AI外部调用。dev／test分别调度独立GitHub-hosted runner、独立checkout／Docker卷和独立Actions secrets，不能共享生产身份或数据。尚未提供原生访问入口前，仅证明runner内部真实官方服务健康，不宣称原生跨端联通。
