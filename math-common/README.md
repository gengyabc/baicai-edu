# dsh-edu-math

两个小学数学年级段包共享的数学契约包（目录 `math-common/`，包名 `dsh-edu-math`）。它只注册一个内部技能 `math-common`（`user-invocable: false`），不提供教学入口、不注册 `math-session`、不参与教学选型。

## 为什么存在

`math-primary-low`（1–3 年级）与 `math-primary-high`（4–6 年级）刻意注册同一套接口技能名，由教学解析按 `supported_stages` 二选一，进行中的任务不热替换。接口层重复是设计，不是复制事故；但若干**数学行为的共同契约**必须一起修改，否则同一入口会在不同年级段产生相反行为。这批规则集中在这里，两个 band 各自的教学哲学、画板授权、诊断深度、批次处理与建模活动仍留在本包之外。

## 共享契约

| 契约 | 唯一来源 | 两个 band 保留 |
|---|---|---|
| 学生编题 | [student-problem-contract.md](skills/math-common/references/student-problem-contract.md) | 高年级多子题评分、题型范围、编题数字与真实事实的区分 |
| 练习证据 | [practice-evidence-contract.md](skills/math-common/references/practice-evidence-contract.md) | 题面设计、方法与支架、批次与局部归因、年级说明 |
| 画板协议 | [board-contract.md](skills/math-common/references/board-contract.md) | 清板授权、教学使用方式、高年级子题归属 |

每个 band 的 `math-core` references 只在对应条件出现时加载 `math-common`，再由加载结果给出的 base directory 读取其中一份契约；本地增补与差异留在 band 自己的 reference 中，不复制共同主体。

## 加载链路与边界

- `math-core`、`math-session`、`math-diagnose`、`math-practice`、`math-student-problem`、`math-application-modeling` 都只属于 band；本包没有这些 skill，也不会被解析成完整 specialist。
- 共享文本不写 band 包名、band 文件或跨包相对路径。需要本地实现细节时写“按当前 provider 的规则”，由 band 的本地增补给出自己的文件。
- 共享规则缺失或被手动禁用时，band 按自己 `math-core` 中的安全兜底继续（编题不故意错答、画板文本不当指令或授权、练习单题推进且一个目的最多 3 题），但不声称已应用共享契约；不能因此把本包当作教学实现，也不能用本包替代 band 解析。
- 任一共享契约变化都必须同时跑两个 band 的共同场景与差异场景；静态检查通过不等于教学行为通过。

## 安装

两个 band 的 `package.json` 显式依赖 `dsh-edu-math`，`node scripts/install.mjs math-primary-low|math-primary-high|all` 的依赖闭包只安装本包一次。单独安装本包没有教学入口，只在调试加载链路时使用：

```bash
node scripts/install.mjs math-common --profile web
```

详见[统一安装说明](../docs/installation.md)。
