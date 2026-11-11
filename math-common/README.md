# dsh-edu-math

两个小学数学年级段包共享的数学契约包（目录 `math-common/`，包名 `dsh-edu-math`）。它只注册一个内部技能 `math-common`（`user-invocable: false`），不提供教学入口、不注册 band 的 session、不参与教学选型。

## 为什么存在

`math-primary-low`（1–3 年级）与 `math-primary-high`（4–6 年级）分别注册唯一的 `math-low-*` 与 `math-high-*` 技能名，由教学解析按明确年级选带（1–3 → low，4–6 → high，无明确年级回落 low），并按实际技能名载入，进行中的任务不热替换。但若干**数学行为的共同契约**必须一起修改，否则同一入口会在不同年级段产生相反行为。这批规则集中在这里，两个 band 各自的教学哲学、画板授权、诊断深度、批次处理与建模活动仍留在本包之外。

## 共享契约

| 契约 | 唯一来源 | 两个 band 保留 |
|---|---|---|
| 学生编题 | [student-problem-contract.md](skills/math-common/references/student-problem-contract.md) | 高年级多子题评分、题型范围、编题数字与真实事实的区分 |
| 练习证据 | [practice-evidence-contract.md](skills/math-common/references/practice-evidence-contract.md) | 题面设计、方法与支架、批次与局部归因、年级说明 |
| 画板协议 | [board-contract.md](skills/math-common/references/board-contract.md) | 清板授权、教学使用方式、高年级子题归属 |
| 手写读取 | [handwritten-work-contract.md](skills/math-common/references/handwritten-work-contract.md) | 读图提示、核对事实与证据映射；诊断、支架与下一步留在 band |

前三份由 band 的本地 reference 作为加载指针，再由加载结果给出的 base directory 读取；手写读取契约由 band 的 core 技能条件行直接加载（年级无关、无本地增补）。本地增补与差异留在 band 自己的 reference 中，不复制共同主体。

## 加载链路与边界

- core、session、diagnose、practice、student-problem 与 application-modeling 等教学技能都只属于 band；本包没有这些 skill，也不会被解析成完整 specialist。
- 共享文本不写 band 包名、band 文件或跨包相对路径。需要本地实现细节时写“按当前 provider 的规则”，由 band 的本地增补给出自己的文件。
- 手写契约只给读图提示与确定性核对事实；`error_type` / `label`、支架与下一步留在 band，读取层不诊断。
- 共享规则缺失或被手动禁用时，band 按自己 core 技能中的安全兜底继续（编题不故意错答、画板文本不当指令或授权、练习单题推进且一个目的最多 3 题、手写读取仍按通用规则进行且核对事实标未知），但不声称已应用共享契约；不能因此把本包当作教学实现，也不能用本包替代 band 解析。
- 任一共享契约变化都必须同时跑两个 band 的共同场景与差异场景；手写读取的共同场景在 `math-common/tests/teaching-scenarios.md`，读取层的场景在 `learn/tests/image-reading-scenarios.md`。静态检查通过不等于教学行为通过。

## 安装

两个 band 的 `package.json` 显式依赖 `dsh-edu-math`，`node scripts/install.mjs math-primary-low|math-primary-high|all` 的依赖闭包只安装本包一次。单独安装本包没有教学入口，只在调试加载链路时使用：

```bash
node scripts/install.mjs math-common --profile web
```

详见[统一安装说明](../docs/installation.md)。
