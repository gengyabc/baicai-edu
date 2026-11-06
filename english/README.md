# dsh-edu-english

dsh-edu 的英语教学技能包：故事与可理解输入、对话协商、输出尝试、支架退让、任务驱动、用法积累、间隔提取，以及适合孩子的新闻阅读。全部为模型内部 skill，不占用 `/` 入口；入口与服务由 `dsh-edu-learn` 提供。

方法 skill 保留各自的理论来源和做法；学科契约、目标分类、年级默认、档案字段、错误标签和记录字段集中在 `skills/english-core/references/`。

## 包结构

```
english/
  package.json
  cordis.patch.yml
  README.md
  skills/
    english-core/SKILL.md + references/
    english-session/SKILL.md
    child-english-coach/SKILL.md
    comprehensible-input/SKILL.md
    interaction-hypothesis/SKILL.md
    output-hypothesis/SKILL.md
    scaffolding-zpd/SKILL.md
    task-based-language-learning/SKILL.md
    usage-based-language-learning/SKILL.md
    spaced-retrieval/SKILL.md
    child-news-reader/SKILL.md
  tests/teaching-scenarios.md
```

## 技能

| 技能 | 理论来源 | 职责 |
|---|---|---|
| `english-session` | — | 英语教学主线：定焦点、选方法、推进一轮、回传唯一 segment；支持 learn 与 feynman |
| `english-core` | — | 共享规则、开始与输入、按条件读取、学科契约、记录字段 |
| `child-english-coach` | 自适应语言教学 | 自由活动或组合方法的编排；不另产记录 |
| `comprehensible-input` | Krashen 输入假说 | 可理解输入：用熟悉语境承载少量新语言 |
| `interaction-hypothesis` | Long 互动假说 | 对话协商：澄清、确认、协商意义 |
| `output-hypothesis` | Swain 输出假说 | 输出尝试：给表达理由，接受半词半句与支架 |
| `scaffolding-zpd` | Vygotsky 最近发展区 | 最近发展区与逐级提示、退让 |
| `task-based-language-learning` | 任务型语言教学 | 任务驱动：为一个具体结果使用英语 |
| `usage-based-language-learning` | Tomasello / Ellis 用法基础 | 用法积累：同一功能换内容、换场景 |
| `spaced-retrieval` | 提取练习与间隔效应 | 间隔提取：先回忆再给答案，区分独立与提示 |
| `child-news-reader` | 可理解输入、互动与广泛阅读 | 儿童新闻：来源核对、年龄筛选、分级改写与互动阅读 |

`english-session` 与 `english-core` 是学科契约入口；其余为方法 skill，由 `english-session` 按条件加载。全部 skill 都是 `user-invocable: false`，从 `/` 菜单隐藏，由 `/learn`、`/feynman` 或本包主线按名加载。

### 儿童新闻阅读

`child-news-reader` 按可理解输入、ZPD、互动假说、输出假说、广泛阅读与用法基础组织一轮新闻阅读：

1. **配置变量**：年龄、英语水平、兴趣、阅读目标、学习时间、解释语言等。
2. **可靠来源**：TIME for Kids、BBC Newsround、DOGOnews、Science News Explores、Newsela、British Council。
3. **处理流程**：检索 → 事实核验 → 适龄筛选 → 分级改写 → 质量检查。
4. **英语分级**：支持 Pre-A1、A1、A2、B1 及更高水平的文本调整。
5. **互动阅读**：阅读前准备、分段阅读、理解提问、表达练习、词汇复习。
6. **安全与质量**：不虚构新闻事实、保护儿童隐私、筛除不适龄内容。

## 进入方式

先安装共享包并安装本包：

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/english
```

刷新 Web 会话后：

1. `/start`：选科目时选「英语」，识别或创建学生。
2. `/learn`：可以带主题（如「颜色」「动物」「读一个短故事」），也可以不带主题，从档案选目标。
3. `/feynman`：让学生当小老师讲英语，AI 当同龄听众提问。

学科路由由入口按 `subject: english` 找到 `english-session`；不会从 `/` 菜单直接看到英语子 skill。

## 教学边界

- 英语是交流工具，不先讲语法体系，不连续默写或测验。可理解输入、短回合、选择性重述和支架退让优先。
- 接受中文、单词、半句和手势作为参与；不强迫完整句子，不逐句纠错，不因一次答对升级水平。
- 默认只做文本交互；没有真实音频或图片能力时，不假装能听发音、看动作或评口语。
- 不给分数、百分比或没有证据的等级结论；一次正确回答最多说明当前语境下的表现。
- 新闻只走 `child-news-reader` 的来源核对与年龄筛选，没有可靠来源时不编造标题、日期、引语或链接。
- 学生出现危机信号时按 `learn-core` 的 `references/llm-safety-boundaries.md` 停教学。

## 数据目录

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/english/raw/`：

```
data/students/<student_id>/english/raw/   # 用户投放原件，只读

outputs/students/
  session.json
  <student_id>/
    profile.json                          # 跨科目共享档案
    english/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                     # 每轮追加，finalize 清空
      extracted/
      backups/raw/
```

- 学科固定为 `english`；`/start` 初始化 `profile.current_levels` 的 `listening`、`speaking`、`reading`、`writing` 四项为 `pre_a1`。
- 年级只决定任务形式、句子长度和中文支持比例，不决定英语水平；水平按实际表现一项一项更新。
- 每轮由入口把唯一 `session_segment` 追加到 `session_log.json`；会话结束由入口按 `learn-data` 的 finalize 规则写回。
- 协议细节见 `learn` 包的 `skills/learn-data/SKILL.md`。

## 依赖

本包依赖 `dsh-edu-learn`：

- `english-session` 路由前加载 `learn-core` 与 `learn-data`。
- 各方法 skill 用 `learn-core` 的共享语气、确认、无响应、年级段、结束信号、费曼规则与安全边界。
- 读写学生数据时用 `learn-data` 的 `outputs/students/` JSON 协议。
- 处理投放文件时由入口调用 `learn-errors`；本包不直接调用。

缺少 `dsh-edu-learn` 时，英语教学所需的共享规则、会话循环与数据协议不可用。

## 验证

```bash
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
git diff --check
```

[教学行为对照场景](tests/teaching-scenarios.md)用于人工审阅与模型回放；静态检查不等于行为实测。
