# 后端独立开发

先读本次[功能](../coverage.md)、app/core-admin OpenAPI、[架构](../architecture.md)和[数据规则](../database/README.md)。
完整复用官方Supabase Compose/Auth/Postgres/Storage/Realtime，在现有core函数、worker与SQL扩展点实现业务。

不等待App/后台页面完成；按确定的状态/权限/事务和wire契约实现。当前资格在服务端重新核对，幂等/CAS/外部未知结果遵守功能说明。
已应用迁移不改，新增编号由主控协调。共享库、夹具、迁移和运行区串行；不自动reset/seed，不接生产秘密。

已实现接口通过Specmatic对真实隔离服务校验，planned接口继续标待实现，不以模拟成功作后端完成。
关键权限、原子性/并发、撤权与缺陷用已有有效测试验证，不在三端重复写同一业务矩阵。
具体源码、依赖与运行命令见[公共指南](README.md)、[quickstart](../quickstart.md)、[验收](../acceptance.md)。
