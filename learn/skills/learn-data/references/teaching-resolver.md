# 教学实现解析

开始学习、初始化、目标分类、推荐、恢复和实际教学共用本解析；调用者复用一次解析结果，不各自试探包是否可用。先处理安全与待完成 `finalize_plan`，再解析。解析不执行教学、不写掌握证据。

## 身份与结果

`subject` 表示真实科目/任务身份，不表示教学实现。沿用已有稳定 id；明确新领域用简短中性 `[a-z][a-z0-9_]*` id，禁止路径分隔符和 `..`。未知或跨领域目标创建 `task_<随机hex>`，用目标描述供学生识别，不暴露 id。相同未完成任务复用身份，不逐轮新建。

每个选定目标的 `scope_id` 为 `scope_<随机hex>`，恢复沿用、不同目标另建；同名 focus 不代表同一目标。新身份先确认学生意愿；跨科切换先保存旧科目，再激活新身份。没有目标而只有支持讨论时沿用当前身份，尚无身份时创建中性 task 身份，不强猜学科。

结果 `teaching` 保存到日志 context，推荐尚无 context 时存于 recommendation：

```json
{
  "provider": "general",
  "core_skill": "learn-general-core",
  "session_skill": "learn-general-session",
  "evidence_namespace": "general_v1"
}
```

专门包结果为 `provider: specialist`、对应 `<subject>-core` / `<subject>-session`、`evidence_namespace: specialist`。两者都保留真实 subject，不创建所有记录共用的 general 科目。旧段没有 teaching 视为原 specialist 证据，不重新分类。

## 选择与恢复

1. 日志有未提交计划先恢复，不借缺包回退绕过保存。
2. 未完成 context 已有 teaching：不热替换，不因安装新包重新解析当前任务。旧日志无 teaching 按原专门包恢复；原实现确实不可用时保留原证据并询问继续通用教学还是结束，不将旧段改写成通用。学生选择通用后先保存/中断旧任务，成功再新建。
3. 新任务尝试加载 `<subject>-core` 与 `<subject>-session`，二者和五个契约角色完整可用才构成专门实现。读取 core 的可选 `supported_stages` 声明；无声明的旧包只默认支持两个既有小学阶段。阶段未知时只有该包明确提供未知阶段起点才采用专门实现，否则用通用实现，不假造年级/水平；阶段已知但不适配时用通用实现。阶段表示教学表达/流程适配，不限制学生探究高年级内容。
4. 缺包、缺关键角色或明确不适配时，使用随基础包提供的 `learn-general-core` / `learn-general-session` 和其五角色参考，不停止帮助、不要求额外安装通用包。专门包只缺推荐角色时，正在进行的旧教学可继续；需要新任务时使用完整实现。
5. 调用者以解析结果的 `core_skill` 的 base directory 找契约角色；用 `session_skill` 做唯一教学交接。不得把通用文件注册为虚假的 `<subject>-core`。

## 证据隔离

同一科目四文件继续存在，不增加第二套保存入口：

- specialist 段沿用原有学科档案、技能和水平；general_v1 段的任务表现只进入 memory 的 `general_progress`，每项含 subject、scope_id、teaching、日期、实际表现和后续建议。
- 通用路径不更新专门包的 current_levels、mastered_topics、confirmed_skills、skill_errors、诊断标签或里程碑。不能给通用任务套小学初始等级。
- 解析前先读已有文件，不清空、不初始化覆盖旧专门证据。通用新档案的 preferences/current_levels 为空、active_domain 为空；已有科目文件保留。
- 给 specialist 的快照过滤掉通用段派生的能力判断；通用历史仅作为注明来源的参考。general_v1 的恢复/推荐按当前 scope_id 过滤，不混用不相关任务。
- 以后安装专门包，只能在任务结束或显式保存/中断后的新任务采用；旧通用记录不自动映射为专门等级。需要确认掌握时由专门包按其规则重新验证。
