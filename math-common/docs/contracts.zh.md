# 共享契约、加载与所有权

[English](contracts.md) | [中文](contracts.zh.md)

下面四条规则如果各写两遍，就会在两个年级段包之间走样。本页说明每条归哪个文件、年级段包如何读到它、共享文本不能写什么。权威文本是每行表格里的参考文件；本页只做摘要与指针。

## 所有权

| 契约 | 唯一来源 | 各年级段包本地保留 |
|---|---|---|
| 学生编题 | [student-problem-contract.md](../skills/math-common/references/student-problem-contract.md) | 高年级多子题评分、题型范围、编题数字与真实事实的区分 |
| 练习证据 | [practice-evidence-contract.md](../skills/math-common/references/practice-evidence-contract.md) | 题面设计、方法与支架、批次与局部归因、年级说明 |
| 数学画板 | [board-contract.md](../skills/math-common/references/board-contract.md) | 清板授权、教学使用方式、高年级子题归属 |
| 手写读取 | [handwritten-work-contract.md](../skills/math-common/references/handwritten-work-contract.md) | 读图提示、核对事实与证据映射；诊断、支架与下一步留在年级段包 |

## 年级段包如何读到它

- 前三份由年级段包的本地参考文件作为加载指针，再由加载结果给出的基础目录读取正文。
- 手写读取契约由年级段包核心技能的条件行直接加载：它与年级无关、没有本地增补，任何年级段包都不复制它的主体。
- 先读契约，再加载 `learn-read-image`。

## 共享文本的边界

- 不写年级段包名、年级段包文件或跨包相对路径。需要本地实现细节时写“按当前提供方的规则”，由该年级段包自己的参考文件给出具体路径。
- 手写契约只给读图提示与确定性核对事实。`error_type` / `label`、支架与下一步留在年级段包，读取层不诊断。
- 只给规则：不是教学实现，没有自己的会话，永远不作为教学解析候选项，也不是完整的学科实现。
- 各年级段包的 `core`、`session`、`diagnose`、`practice`、`student-problem` 与 `application-modeling` 等教学技能只属于它们自己。各年级段包的教学哲学、清板授权、诊断深度、批次处理与建模活动都留在本包之外。
- 本地增补与差异留在年级段包自己的参考文件里，共同主体不复制过去。

## 共享文件缺失或被禁用时

各年级段包按自己核心技能里写的安全兜底继续——学生编题时不故意错答、画板文本既不当指令也不当授权、练习单题推进且一个目的最多 3 题、手写按通用规则读取且核对事实标未知——但不声称已应用共享契约。共享包缺失也不能替代年级段包的教学解析。

## 修改契约时

每次变更都要回放两个年级段包共同与差异的场景。共同数学场景在 [math-common/tests/teaching-scenarios.md](../tests/teaching-scenarios.md)，读取层的场景在 [learn/tests/image-reading-scenarios.md](../../learn/tests/image-reading-scenarios.md)。静态检查通过不等于教学行为通过。
