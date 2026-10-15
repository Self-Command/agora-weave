# Phase 2 开发证据与边界

2026-10-15。执行目标为现有 Foundational T028–T051，按宪法 3.1.0 与 ED-20 继续；未完成任务保持未勾选，不代表完整首版、正式 CI、合并或生产准入。

## 业务开始与工程回归

`29f64c468df445ae395d67a66851b07f2b3baa6a` 的 development-ready 原报告来自 run `38764668986/1`；实际私有业务 start run `38765601439/1` 已完成上传及读回核验，随后本地只运行桥接生命周期工具读取真实准入收据。该步骤没有本地项目运行。

依赖通过现有 Actions 冻结入口取得 `postgres@3.4.7`、`unicode-segmenter@0.17.3`。run `38767859481/1` 的 artifact `11989983229` 原 ZIP SHA-256 为 `2f6d43de53d32a2b71df11fc7e3f0a345338287640fb01fbc96de3dec59a58d0`，已核验并读取。精确锁回传提交 `ed6989e9e5fae795c4e5fef34734490746100c44`；包条目差异仅根声明及这两个包。无本地依赖安装。

BR01 旧夹具复制业务 HEAD 后，正确的 bootstrap 路径拒绝使其失效。修正只隔离测试夹具：固定原 scope base，叠入执行 SHA 的当前实际工程实现，所有原断言保持不变。历史 preimplementation 源 `a27fe04d4c9548723793cd92ad39c96d1ee84b05` 在 run `38768401636/1`、artifact `11990278247` 中重新观察到 ready 生命周期拒绝。原 Red／实现／Green 保留在目录的 historical_sources，不把夹具维护说成重新首次实现生产行为。

`3c3d7021e562e3ac1f2827175d3bf1dd04d4110e` 的 run `38768723855/1`、artifact `11989948477` 已核 ZIP 并读取原 TAP：227 执行、227 通过、0 失败／跳过／取消／todo。该工程 Green 包括 BR01 与 CFZ01，不表示尚未实现的业务通过。

## 首批核心行为

最初 Auth 夹具得到 500，不能计业务 Red。真实诊断 run `38767710442/1`、artifact `11990555255` 显示 GoTrue 在 confirmation_token 扫描 NULL 失败。按固定官方 v2.196.0 用户模型补齐受控合成用户的非 nullable 字符串；未声称完成真实短信注册。

有效核心 Red 为 `ed6989e9e5fae795c4e5fef34734490746100c44`、run `38768329771/1`：dev/test 都有真实11服务健康与清理，Auth／SQL基线通过，38 用例完整执行，37 项目标 ERR_ASSERTION，0 跳过／取消／todo。schema 28 个目标因权威表缺失失败；9 个契约目标因可调用实现缺失失败。原 ZIP 均已按 GitHub digest 验证，原 TAP 与失败因果已读取。

既有 tdd-cycle dispatch run `38768886611/1` 认证该源，artifact `11989369156` 原 ZIP SHA-256 `f5df879df0342dc69a62daa952aee116eec315a4799e9d0599f36e1c225ee946`。observation 绑定每个测试／fixture 摘要、实际服务 job、两环境原 archive 与完整执行数；private-source-receipts artifact `11989803950` 已读取为 archived_and_readback_verified。它只记录观察，不授 task complete。

实现提交 `e733d756e71c220a585e0f1cc638504c207c256b` 对应 run `38769415167/1`：已读取 test 核心 artifact `11990394207`，9 个契约用例全部通过、0 跳过／取消／todo，Auth基线继续通过；schema 28 项仍因未实现而失败。尚待同提交 dev 原报告及受影响回归的完整读取与核心完整 Green 链消费，不将局部 Green 当作 T042/T051 验收完成。

## 当前未完成

新增 schema-invariants 的7项真实 SQL 目标已在 `3eb5a4b86e653524b7249aeb90d582700ba669dc` 注册激活；完整核心清单为45项。先取得并读取这些目标的有效云端 Red，之后才实现对应数据库约束。T029／T031／设计组件与客户端实际验证、当前授权及安全日志、配置消费者、全部核心 Green 链与 Phase2 最终审查仍待完成。


## 首批数据库约束的 Red

`3eb5a4b86e653524b7249aeb90d582700ba669dc`、run `38769946720/1` 的 dev/test 原 ZIP 已按 GitHub digest 核验并读取：核心45项完整执行，其中9项契约与Auth基线通过，28项表结构和新增7项约束均因权威表缺失出现 ERR_ASSERTION；无跳过／取消／todo。两环境实际11服务健康、安装与清理成功。目标原报告为dev `11991750556`、test `11991057312`，健康分别`11991850454`／`11990957570`。

现有 tdd-cycle run `38770843681/1` 已认证同一源，observation artifact `11992125540` ZIP SHA-256 `9e7f49ed57771255cbca5053db3fce5bdce7157187400c803be88fd08b53d318`，已读取完整观察与目标失败因果；私有原件收据`11991033106`已读为archived_and_readback_verified。随后才编写七组迁移，显式登记依赖；序号不是依赖排序。当前只落实已注册字段及约束，独立安全账本、当前授权、配置消费者与正式资料读写仍未完成。
