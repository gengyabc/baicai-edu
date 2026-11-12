# 隔离持久化回放（本次分阶段执行已完成）

## 环境与边界

- 2026-11-12T00:38:32Z；Node v24.15.0；workspace `/Users/yugeng/programming/dsh-edu`。
- 执行者：单个 gpt-6.1-sol 编码 agent，沿已加载的新 learning-plan/lifecycle/finalize 文档人工承担教学 owner 与 lifecycle 角色；没有第二个学生模型、独立审阅者或宿主自动调度。采样参数未暴露。文件工具可用，未使用 DSH 内部接口。
- 虚构学生 fixture，无真实学生数据；所有写入仅此目录。初始四个最小学科文件与 session_log 由 write 工具实际创建。后续一次性 Node 命令只是显式执行本阶段 fixture 操作/断言，不是新建运行时引擎。
- 规则来源为仓库当前 learning-plan.md、session-lifecycle.md、finalize-session.md；末尾已保存三个 rule-*.md原文快照及environment.json（逐文件SHA-256、模型、Node、workspace、捕获墙钟）。provider/采样参数未暴露。父并行修改其他文件，未固定提交版本，不宣称严格旧/新对照。
- 故障将在 current_state 提交前注入人工信号“本次current_state写入失败”；不是实际文件工具异常。

## S0：原题与初始位置

输入（合成学生）：题设红蓝绿一直重复，第100颗是什么颜色？“我数到第10颗是红，不知道100怎么数。”

实际本阶段回复（本agent生成）：“你已经找到了前面的位置。先看11个物品每3个放一组，能放几组，还剩几个？”

操作：write 初始 profile/memory/milestones/current_state/session_log，均返回 Created file。根 scope_cycle_fixture；原题回答和 pending 分开保存在 root.task.turn_state。segments=[]。S0/S1 的诊断回答作为 fixture 起始历史注入，不是本执行会话新收集的表现；未将历史注入再生成新 segment。后续真实合成分阶段输入分别记录。

## S1：三级待答（起始上下文注入）

合成历史输入依次为：余数探查“我把11个放成3堆：4、4、3，所以没有剩下。”；完整组探查“我放成3、2、2，觉得三盒都算一组。”

owner阶段回复：“每3个是每一组必须有3个，不是总共分3组。先看看7个圆片每3个放一盒，哪盒是完整组？”随后暂定待答“这里一组规定是3个，哪一盒符合？”

实际操作：读取日志；一次性 Node 显式同步父快照→写余数子层→同步余数父快照→写完整组孙层。写出00-root/01-remainder/02-three-level-wait和session_log。断言退出0：3层、仅grouping活动；root与remainder保留不同答案/待答；scope/owner不变。未调用其他技能或创建provider。

## S2：懂了不返回，再独立证据只返一层

输入1（合成学生）：“懂了”。

实际回复：“先试一个不同数量的：10个圆片每3个装一盒，请你自己分并说明哪些完整、哪些剩下。”本阶段教师只说明一组必须恰好3个，明确记录来源，不算学生发现。

操作：保持grouping活动，revision4，pending改为新题；写03-understood-no-return。断言无return、根仍parked、没有新segment。

输入2（合成学生，能力设定仅本层分组）：“3、3、3，外面剩1个；盒里每盒都是3，外面的1个不够再装一盒。”

实际回复：“你在这个新数量上自己分出了完整组。先回到11个那一步：每一组都必须正好3个，分完后哪些算完整组？原来的周期题保留；我们先学完整组，再解释余数，最后才研究周期位置。现在只证明这一步会分组，余数位置与原题还没有证明。”

操作：grouping完成且保存独立动作与先前支持条件；只恢复remainder原题/原回答/原pending，root仍parked。revision5；一个合并segment，ability_evidence归grouping，无confirmed_skills/current_levels。上述已展示中性计划后写learning_plan_authorization（owner=math-high-session，同root，provided_to_student=true），不创建support_events。写04-one-level-return-authorized和session_log。Node断言退出0：懂了不返回；新题证据只返一层；父答案/pending未被新答案覆盖；segments长度1。

## S3：实际混合镜像提交、合成故障与一次 learn-save 重试

输入：阶段S2已展示的中性计划自动checkpoint；随后注入合成存储信号“本次current_state写入失败”。

实际操作：read工具读取日志及四学科文件；Node在内存合并一个真实合成表现摘要和revision5计划，实际先写session_log.finalize_plan与05-prepared快照。使用student_id=stu_fixture_a001、subject=math、session_id=sess_fixture_01；record_kind=mixed。profile只追加本次局部表现摘要；memory只记录已有performance路线的recent_focus，不加能力标签；无diagnosis/confirmed_skills/current_levels提升。按顺序read后write profile、memory、milestones；故意不调用current_state写入，注入合成故障信号。

原始工具结果（bash exit0）：

```text
write profile OK
write memory OK
write milestones OK
INJECTED SYNTHETIC SIGNAL: 本次current_state写入失败 (write intentionally not attempted; not tool exception)
S3 failure assertions passed: marker unchanged; exact finalize_plan + segment retained; STOP new teaching
```

实际失败反馈：“计划已经提供，但这次长期保存还没完成。原来的任务位置还在，我先不继续出题，可以重试保存。”

输入（合成学生）：“/learn-save”。

实际操作：read工具重新读取日志/四文件；只取原finalize_plan.target_files，按profile→memory→milestones→current_state实际重写，不重新聚合。不更改镜像时间戳/摘要/计数。每个非current_state写后断言旧marker仍null，current_state最后写。成功后才写清理日志（无context/finalize_plan，segments=[]）。实际反馈：“计划和这次局部分组表现已保存。”没有继续出题。

原始工具结果（bash exit0）：

```text
retry write profile OK
retry write memory OK
retry write milestones OK
retry write current_state OK
S3/S4 assertions passed: original mirrors replayed; marker last; summary dedup 1; clean then new session empty; immediate-parent pending/root owner restored
```

实时断言还核对：重试前后日志finalize_plan序列化完全一致；profile.session_history始终1项；support plans=0；confirmed_skills=0。05-prepared保存原镜像，06-clean-after-retry保存清日志，两个trace保存操作顺序。故障是人工信号，未声称OS异常或权限问题，也未改写真实学生文件。

## S4：Finalize后从耐久链继续

输入（合成学生）：“继续刚才的计划。”

实际回复：“从11个物品每3个分组那一步接着来。每一组都必须正好3个，分完后哪些算完整组？”未重发周期题、未把10个新题的答案覆盖余数层原答案。

实际操作：只从current_state.learning_plan读取活动remainder.task；创建sess_fixture_02，空segments，root_scope/teaching沿用。写07-restored-parent与session_log。与S3同次命令分阶段执行，保存独立前后快照；这不是两个独立模型会话。实时断言父层pending与原回答精确匹配、scope_cycle_fixture/math-high-session不变；已提交摘要仍1，无旧表现重提交。

## S5：暂停plan-only与明确放弃tombstone

输入1（合成学生）：“今天先停，下次接着来。”

实际回复：“今天暂停，保留周期原题和11个分组的待答位置，下次明确继续时从这里接着来。”

实际操作：revision6/status parked，active_frame_id保留remainder；只将当前活动frame/step停为parked，不清链。已展示上述中性更新后写owner authorization，准备record_kind=learning_plan、final_summary=null四镜像，profile/memory/milestones照原样。实际read→write四镜像顺序同上，marker最后；成功才清context。写08-parked-prepared和08-park-trace。实时断言current_state中scope_id/teaching/active_focus/source/submode全部未变（仍代表上次真实完整组表现，不将活动余数任务伪装性能cursor），memory未变，摘要数仍1。

原始工具结果（bash exit0）：

```text
park write profile OK
park write memory OK
park write milestones OK
park write current_state OK
S5 pause assertions passed: plan-only four mirrors; no cursor/memory/summary changes; chain remains parked
```

输入2（合成学生）：“不做原来的周期题了，放弃这条计划。”

实际回复：“按你的选择结束这条计划，不再自动返回原题；这不表示你已经会了原题。”

实际操作：创建仅终止写入的sess_fixture_03；revision7/status abandoned，保留version/id/root_scope_id/teaching/updated_at/summary，去掉frames和材料。使用相同owner匹配的provided_to_student授权；准备09-abandoned-prepared，实际顺序写四镜像、marker最后、清日志。没有开启新题，也没有新segment、summary、能力或里程碑。

原始工具结果（bash exit0）：

```text
abandon write profile OK
abandon write memory OK
abandon write milestones OK
abandon write current_state OK
S5/S6 assertions passed: abandoned tombstone has no frames; no stale chain selected; legacy task unchanged without invented plan
```

旧revision5活动链仍留在07快照作为检验材料；最终日志没有恢复context。这里只验证终止快照和未复活的fixture结果，没有独立向宿主发送“继续旧计划”检验自动拦截。

## S6：旧单题兼容

输入fixture：旧日志无learning_plan，题目“8÷2是多少？”，已有回答“4”，pending“你怎样验证？”。

实际回复：“你怎样验证？”

操作：实际创建10-legacy-single-task并保存原样恢复的10-legacy-restored；read-only深比较相等。没有补造父层/新计划，不重测先修。此处只是本agent按协议选择原样恢复，不是宿主自动迁移实现验证。

## 可重跑文件断言

执行命令：`node .scratch/math-strategy-recursion/replays/persistence-fixture/verify.mjs`，exit0。脚本仅readFileSync读取已保存结果，不写入、不教学、不模拟调度器。

原始输出：

```text
PASS R1/P3 three distinct task positions, stable owner and root scope
PASS R3 self-report does not return or add performance
PASS R4/P9 independent new-task action returns only one level with one segment
PASS P1/P8 owner authorization and snapshot have no fake support event
PASS P2 synthetic failure trace stops before marker, retry writes marker last
PASS P4 finalize clears temporary contents, new session resumes parent without evidence replay
PASS P7 parked plan-only save preserves performance cursor and memory
PASS R7 terminal tombstone, no old frames/materials or long-term mastery inflation
PASS P5 legacy restore remains one task without synthetic parents
9/9 fixture assertion groups passed; no host end-to-end claim
```

## 场景覆盖与结论分层

| 场景 | 本次结果 | 证据/限制 |
|---|---|---|
| R1 | 部分通过 | 三级链实际保存、父状态互不覆盖；依赖诊断起点为人工注入，未独立验证数学诊断 |
| R2 | 部分通过 | 已加载说明后仍留新题动作；没有完整子任务讲授模型回放 |
| R3 | 通过（合成分阶段） | 03保留grouping；懂了无独立证据、无return |
| R4 | 通过（合成分阶段） | 04仅返remainder，root仍parked |
| R5/R6 | 部分通过 | 暂停保留父链与计划；没有实际过深判断和接受近期目标变更对话 |
| R7 | 部分通过 | abandoned快照真实提交；未自动开新题；旧链宿主拦截未测 |
| R8/R10/R11/R12 | 未测试 | 拒绝调整/循环/自报可用/替代路线不在本回放 |
| R9 | 部分通过 | 尊重今天停止并parked；未测试同时拒绝必要子任务协商 |
| P1 | 通过（合成分阶段） | 先实际生成并记录学生可见计划，再日志授权，实际镜像写入和反馈区分 |
| P2 | 部分通过 | 实际三写/一不写后保留计划和segment，实际重试四写去重；合成故障信号而非工具异常 |
| P3/P4 | 通过（合成分阶段） | 三级待答快照保存，Finalize后新session从活动父层pending恢复；不是宿主端到端 |
| P5 | 部分通过 | 实际旧单题fixture原样保存/恢复；无自动系统迁移 |
| P6 | 部分通过 | 全链scope/owner不变；未测试画图或跨band工具加载 |
| P7 | 通过（合成分阶段） | park/abandon纯计划无segment，four mirrors，不改性能cursor/能力/memory |
| P8 | 部分通过 | 自动owner授权没有support_events或fake student_requested_save；显式支持计划原分支由既有单测覆盖，未再回放 |
| P9 | 部分通过 | 子题独立表现一个segment且不升级父题；同轮返回父题后学生又回应未测试 |

这些结果是文件实操与协议执行观察，不是再次通过文档关键词的协议自评。仍由同一agent生成输入、执行及断言，缺少独立审阅和学生模型，因此不据此判整体教学有效。

## 限制与保留问题

- 中间fixture使用固定的合成时间序列00:38:32→00:46:00Z，不是工具实际墙钟。S1/S2部分中间updated_at沿初始fixture未逐次递增，未验证时间戳写入规则；这是本回放执行缺口，不将其记为时间戳验收通过。准备后重试镜像时间固定，确已检查不重新生成。
- 未测准备日志写失败、真正OS写错误、清理失败、外部编辑冲突、损坏JSON、多进程、stale revision实际拒绝、无变化revision no-op、completed终止、明确新目标同时到达等异常。
- 未实现通用运行时/持久化引擎，没有新增宿主代码；所有Node写操作仅为这次fixture的显式阶段动作。read-only verify不能证明宿主会自动执行这些动作。
- 未测三类数学方法18条旧/新配对、独立学生监控、真实学生学习效果。本回放不替代父的数学教学对照。
- 未发现必须扩展接口的协议缺陷；上述未测/执行限制保留，不以9组文件断言全部通过代替整体场景通过。
