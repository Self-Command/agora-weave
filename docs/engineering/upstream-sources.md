# 固定官方来源

来源完整性不证明业务完成。实际运行状态见[当前状态](current-development-state.md)，当前冻结输入以根锁文件及infra/ci工具锁为准。

| 能力 | 固定来源与保全 |
| --- | --- |
| 移动 | Expo官方commit `58da4edafcb043872c3ed9bf8f5957e6544d0a9c` 模板及bundledNativeModules；Expo57.0.28/React19.2.3/RN0.86.3关联组，保端内依赖 |
| 后台 | Kiranism/next-shadcn-dashboard-starter commit `7705dfc0d13889e45c26a55ad5908da6a7a9a605`，tree `7ac574a2d4c2145c938e2f4ab5739320d551f7a0`；全部582原件及摘要映射在 `apps/admin/upstream-metadata/source-map.json` |
| 后端 | Supabase self-hosted/v0.8.2 commit `564eab8ad7840b13324f68b1bfac074ef8d51c21`，docker tree `c11bb48f7619a1224cfe107c275e4dc9953b967c`；完整源码在supabase/upstream/docker，来源清单infra/ci/supabase-source.json |

后台保完整布局/导航/主题/表格/表单/组件及许可，再接真实业务，使用官方同commit无Clerk适配，不恢复keyless或假管理员。安全边界、本地字体和最小差异见[后台集成说明](../../apps/admin/INTEGRATION.md)。Supabase项目隔离覆盖单独维护，不改官方源码掩盖差异；官方示例密钥禁止用于实际环境。

App新增免费Uniwind1.12.2/Tailwind4.3.3，由根锁文件冻结，样式消费同一原生token。普通JS/TS通过Metro，所有APK/AAB/IPA仅Actions构建；运行及按需验证规则见执行政策。旧“裁模板只留许可/依赖”与“所有本地执行禁止”均已被用户决定取代。
