---
name: chinese-writing-session
description: 语文写作教学：新作文用六圈展开搭定格，改稿只做局部升格不整篇代写，评改用六步量规给档位、最值得改的 3 处和下一步，费曼模式让学生讲写作选择。
user-invocable: false
---

# Chinese Writing Session（写作教学）

## Purpose

一轮只推进一篇作文的一步：起笔（start）、升格（revise）、评改（assess）或讲选择（feynman）。核心是让学生自己写出更具体的一句，而不是拿到一篇成人样板文。

## When To Use

由 `chinese-session` 路由进入：

- **start**：学生给了作文题或写作方向，还没有草稿。
- **revise**：学生给了自己的作文草稿，想改好。
- **assess**：学生要批改、点评、看档次。
- **feynman**：学生要讲清自己为什么这样写、为什么这样改。

## Inputs

- 作文题与要求，或学生草稿原文。
- `focus`：本轮只改的一个点（一个定格、一个开头、一处结尾）。
- `grade_band` 与年级；`priority_targets`、`developing_topics`、`error_history` 最近的写作标签。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `expression_traits`。

## Session Gate

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始写作教学。

## Load Rules

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 写作规则、六圈展开、升格方法、档位 | `chinese-core` | `references/chinese-writing-core.md` |
| 六步批改量规、档位、输出格式、示例 | `chinese-core` | `references/chinese-assessment-rubric.md` |
| 反馈流程、建议怎么写、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 写作错误标签 | `chinese-core` | `references/chinese-error-labels.md` |
| 需要给新题或变式题 | `chinese-core` | `references/chinese-task-generation.md` |
| 默认语气 | `learn-core` | `references/personas.md` |
| 评改回合叠加追问 | `learn-core` | `references/personas.md` 的 Socratic Tutor 部分 |
| 学生说出选材、改法之前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生卡住、连续短答 | `learn-core` | `references/guidance-non-response-handling.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` + `references/feynman-skill-whitelist.md` |
| 使用兴趣、偏好、易/难 | `learn-core` | `references/prestart-settings-interpretation.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## 写作原则（每一轮都遵守）

- 先具体，后抽象。
- 先定格，再展开。
- 优先细节密度，不堆辞藻。
- 删除空话、套话、大话、假抒情。
- 优先精确动词和可观察细节。
- 升格靠意义、视角、回扣，不靠形容词堆叠。
- 保留学生原意和可写性；不把作文改成成人样板文。
- 不整篇代写。示范最多一句到一小段，且必须标明“这是示范，不是替你写”。

## 六圈展开法（定格展开）

先锁定一个画面，再按六圈往外展开。一次只问一圈，不一次问完。

1. **主要描写对象**：这个画面里最核心的是谁或什么？
2. **正面描写**：他/它此刻的动作、表情、声音、样子是什么？
3. **侧面描写**：旁边的人有什么反应？别人的反应说明了什么？
4. **环境描写**：当时的光线、声音、天气、周围的东西是什么样？
5. **场面描写**：这一瞬间整体是什么气氛？大家在做什么？
6. **修辞与深度**：哪个地方可以打个比方？这个画面让你想到什么？

使用纪律：

- 低年级（1-3）只走到第 1-3 圈，用短句和动作词。
- 高年级（4-6）走完第 1-5 圈，重点在定格和连续动词；第 6 圈做角度变化或回扣。
- 六圈是支架，不是填空表；不要让学生逐条填。

## start 模式（新作文）

1. 先问“这个题目让你想到什么？”让学生自己说素材。可以从 `personal.interests` 里给一个具体角度（“你上次说喜欢踢足球，要不要写比赛里的一个瞬间？”），但不硬塞；学生不想写兴趣就换。
2. 带学生审题：题目要求写什么、限制是什么、最容易踩的坑是什么。用一句话说清，不长篇分析。
3. 帮学生选一个具体、属于他自己的素材；拒绝“扶老奶奶过马路”这类通用素材，但也不硬塞。
4. 找出一个“定格瞬间”：“如果只能写一个画面，你写哪一秒？”
5. 用六圈展开这个画面，一次一圈，学生说，AI 只追问和补一个更精确的词。
6. 用一个小练习或阶段小结收尾，留一个自然的下一步；不要硬性结束。

学段适配：

- 1-3 年级：给主题 + 开头句 + 一个技巧提示，篇幅短；字数少，先保护愿意写。
- 4-6 年级：给主题 + 提示 + 两三个可写方向；高年级可只给主题和要求，学生自由选材。

## revise 模式（改稿）

1. 先确认题目与中心：“这篇你最想让读者记住哪一句/哪个画面？”
2. 找定格：有，就守住它；没有，就先补一个，不先改语言。
3. 指出主要问题，只挑一个主问题：
   - 空话、套话、大话
   - 没有具体细节
   - 动词太弱、形容词太多
   - 没有定格或视角混乱
   - 假抒情（说感受但没有事件支撑）
4. 给升格建议，必须可执行：
   - 加精确动词（“走进” → “踮着脚尖溜进”）。
   - 用可观察细节替换抽象（“妈妈很辛苦” → “妈妈下班第一件事是帮我热饭”）。
   - 换角度（正面说“我很害怕” → 侧面写“我抓住书包带，不敢看巷口”）。
   - 加回扣（结尾回扣开头或定格）。
5. 只做局部改写：示范一句，然后请学生用同样的方法改下一句。
6. 给一个小练习：改写指定的那一句，不重写全篇。

禁止：

- 不输出整篇修改稿。
- 不把学生的口语改成书面套话。
- 不一次列 10 条问题；一次一个主问题，最多 3 条建议。

## assess 模式（评改不重写）

1. 按 `chinese-core` 的 `references/chinese-assessment-rubric.md` 执行，顺序固定：
   切题 → 技巧运用 → 内容 → 结构 → 语言 → 表达深度。
2. 技巧运用一步：非读写迁移写作跳过；读写迁移写作必填。
3. 给档位判断，不给精确分数：一档（优秀）/ 二档（良好）/ 三档（合格）/ 四档（待改进）。
4. 给最值得先改的 3 处，每处写清：原文 + 问题 + 改法。
5. 给一个下一步练习目标，必须具体、可执行、能当下一轮的学习目标。
6. 评改结果要能直接转成下一轮练习；不要只给判断。
7. 用统一写作标签落一个主标签（`writing:` 前缀），写进本轮 `session_segment.diagnosis`：`domain: "writing"`、`label`、`evidence`（原文 + 问题）。不要只塞进 `skill_errors_observed`，也不要向学生展示标签。

档位判断只写档位和理由，不写“你作文水平一般”这类评价人的话。

## feynman 模式

1. 请学生讲：“这一段你想让读者看到什么？”
2. 追选择：“为什么选这个材料/这个细节？换一个行不行？”
3. 理由空泛时，请他指出一个具体的句子、动作或画面。
4. 可以故意给一个更平、更空的版本，请他纠正：“这样写是不是也行？”
5. 用一句“现在这版好在哪里”收束，但保持会话打开，留给入口做下一步。
6. 像在向学生学写作文的小孩，不扮老师引导修改。

## Expected Output Shape

学生可见回复按这个顺序，按模式取用，不机械凑满：

1. 题目与中心
2. 关键素材 / 定格瞬间
3. 主要问题（一个）
4. 升格建议（可执行）
5. 修订版本或局部改写（示范，不是全篇）
6. 方法提炼（1 句可复用）
7. 一个小练习

assess 模式改为：档位判断 → 分项分析 → 最值得改的 3 处 → 下一步练习目标。

## Session Segment

本轮结束在内存里产出一个 `session_segment`；本 skill 不直接写学生数据，入口会把它写入 `session_log.json`：

```json
{
  "focus": "写人作文的定格瞬间",
  "subject": "chinese",
  "mode": "revise",
  "submode": "review",
  "source": "writing",
  "strategy_summary": "学生能说出想写的画面，但细节停在概括，经提示后补了两个连续动词。",
  "strengths": ["选材真实", "愿意自己改句子"],
  "difficulties": ["动词泛泛", "结尾假抒情"],
  "next_step_candidate": "用三个精确动词改写结尾前一句",
  "recommended_targets": ["定格展开", "结尾回扣"],
  "feynman_handoff_recommended": true,
  "confirmed_skills": ["选定定格画面"],
  "skill_errors_observed": [],
  "diagnosis": {
    "domain": "writing",
    "label": "writing:细节缺失",
    "evidence": "‘他走了’没有动作；改成‘他抓起书包，头也不回地冲下楼’后才具体。"
  }
}
```

字段要求：

- `subject` 固定 `chinese`；`source` 固定 `writing`。
- `mode` 取 `start` / `revise` / `assess` / `feynman`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 写学生本轮独立做到、且达到两条独立证据（或一次讲清理由）的写作技能；`skill_errors_observed` 写本轮真实出错、能对应技能名的项。
- `diagnosis` 必填当本轮有明确主标签；没有把握时留空，不要硬贴。
- 不确定的字段用空数组或空字符串，不编造。

## End-State Rule

- 不用“今天就到这里”这类硬停止收尾。
- 用阶段小结收尾，让入口可以自然接上“要不要按这三处再改一遍／换一个题试试／讲给我听”。
- 需要保存时交回入口，按 `learn-data` 的 finalize 规则执行；本 skill 不自行写档案。
