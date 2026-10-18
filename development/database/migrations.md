# 数据库迁移、隔离与恢复

实际 schema 的权威是当前环境迁移账本已应用的 [原始 SQL](../../supabase/migrations/)、依赖图及各文件摘要；[schema 字典](schema.md)只帮助定位，[逻辑模型](domain-model.md)包含未来设计。不得从文件名大小或旧报告推断当前数据库版本。

## 原始输入与执行顺序

仓库当前含0001–0044和0101–0112共56份SQL；编号不是完整依赖排序。0034等会修改0107创建的otp_challenge，须使用现有迁移工具读取声明依赖，不能按字典序直接执行。新迁移显式申请编号与主控协调；已应用文件不原地改字节，修复追加迁移。0039、0043和0044体现已有修复模式。

查看 `tools/ci/core-entry.ts` 的migrate分支、`tools/ci/validation-manifest.json`内core_migrations依赖及 `ci_control.migrations` 实际应用账本。运行通过 [quickstart](../quickstart.md) 的显式 `local.ps1 -Up -Services supabase -Migrate`，复用唯一 dev 组和原数据卷；不自动reset/seed，不因重装前端依赖清库。迁移日志须给环境、真实新增数、已应用摘要核验、失败和未执行项。

0044 `auth_session_retirement`移除session_registry到auth.sessions的删除阻挡，保留不可变归属/撤销时钟与epoch。官方Auth MFA删除较低AAL会话时，BEFORE DELETE触发器退休核心会话，耐久安全日志失败则整个Auth删除回滚。Auth记录缺失不能授资格。不要为兼容官方生命周期重写已应用0001或停用安全账本。

## schema与访问责任

`auth`和`storage`等官方schema由官方服务维护，产品核心扩展使用`core`及必要独立安全日志。`core.protect_table`落实RLS/FORCE RLS/最小grants，底层函数只给必要受限运行角色。service_role不是通用业务权限；客户端、AI及插件没有原始SQL或对象源站权限。

开发、测试和生产使用独立Compose、数据库、凭据、网络、bucket、账号及副作用。环境字段用于受控记录，不作为唯一隔离。共享DB与夹具操作串行，尤其seed、迁移、恢复与安全日志状态测试；独立工作树不隔离这些资源。

## 备份与恢复

DB快照不含全部Storage实体；备份清单须分别关联数据库/对象摘要、schema/config版本、安全watermark与加密引用。安全日志独立耐久保留，拒绝意图先归档，未知结果保守拒绝并对账。

恢复在隔离且关闭读取的环境重放最新删除、注销、会话/关系/用途撤权、处罚和隐私事实，重建索引/派生投影后验证，再显式开放。日志缺口、版本未知或验证失败保持关闭，不因旧备份中的grant/对象重现复活。核心作业保留责任不随业务模块/插件停卸中断。

初始恢复验证目标RPO≤1小时、RTO≤4小时；安全账本仍必须追到当前撤权事实。90天轮转与该目标均需实际恢复验证，不能把配置存在写成完成。物理purge逐DB/对象/派生/索引/缓存登记真实阶段，先核共享保留需求、恢复副本与授权期限。生产迁移、恢复或高影响数据动作仍须具体版本/对象/范围授权。
