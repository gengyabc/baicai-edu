# Grade Band Defaults

教育阶段和年级是可选配置，不是能力标签。阶段/情境影响表达或支持时，加载 `learn-support` 的 `references/learner-stage.md`；当前任务证据优先。学科领域、任务类型、偏好键和初始水平由教学契约提供。

## 阶段与兼容

`education_stage` 可选值：

| 值 | 阶段 |
|---|---|
| `lower_primary` | 小学低段 |
| `upper_primary` | 小学高段 |
| `junior_secondary` | 初中 |
| `senior_secondary` | 高中 |
| `higher_education` | 大学及高职 |
| `adult` | 成人 |

旧档案没有 `education_stage`，但有明确小学 `grade` 时可在快照中推导：grades 1-3 -> `lower_primary`，grades 4-6 -> `upper_primary`。保留旧 `grade` 与 `grade_band`，无需批量迁移。缺少阶段和可用小学年级时按 unknown（未知）处理，不强迫补填；未知是缺省语义，不新增枚举值。显式阶段与旧年级冲突时只澄清必要信息，不按数字把非小学误归小学。

新建/修改时 `grade` 可缺省；非小学不填小学年级，不由年龄、职业或课程难度猜阶段。小学已知年级的 `grade_band` 沿用以上映射；非小学/未知没有小学年级段，不套最低年级模板。

## 默认值的来源

建档、补档或阶段修改前读 `references/teaching-resolver.md`，再取其 `core_skill` 契约的默认 `learning_state.active_domain`、`profile.current_levels` 与 `profile.preferences`。小学包当前适配范围为 `lower_primary` / `upper_primary`；其他阶段无声明适配时用通用任务教学。阶段未知不强迫选择，不凭包已安装就宣称适用；按解析协议回退。小学学生可以探究超年级内容，具体任务与证据决定支架，不以阶段封顶。

改阶段不自动重置水平、转换证据或热替换未完成任务；按生命周期先处理旧任务，再由解析协议确定后续实现。示例档案值不是初始化默认值。
