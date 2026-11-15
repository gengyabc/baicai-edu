# baicai-edu-english

baicai-edu 的英语教学技能包：故事与可理解输入、对话协商、输出尝试、支架退让、任务驱动、用法积累、间隔提取，以及适合孩子的新闻阅读。全部为模型内部 skill，不占用 `/` 入口；入口与服务由 `baicai-edu-learn` 提供。

方法 skill 保留各自的理论来源、做法与材料设计；公共规则通过 `english-core` 按需读取，避免每个方法另写一套难度、提示或证据标准：

- [教学规则](skills/english-core/references/english-teaching-core.md)：唯一方法选择表（目标类型 + 当前观察）与公共反馈规则。
- [输入适配](skills/english-core/references/english-input-adaptation.md)：语言难度、材料长度与理解后的调整。
- [支架与退让](skills/english-core/references/english-scaffolding.md)：唯一提示阶梯，一次一级支持。
- [记录字段](skills/english-core/references/english-segment-fields.md)：唯一学习证据映射；方法只提供观察建议。

学科契约、目标分类、年级默认、档案字段与错误标签也集中在 core references。

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
| `english-core` | — | 共享规则、方法选择依据、输入适配、支架退让、学科契约与证据映射 |
| `child-english-coach` | 自适应语言教学 | 自由活动的跨轮计划与方法建议；不自行调度或产记录 |
| `comprehensible-input` | Krashen 输入假说 | 可理解输入：用熟悉语境承载少量新语言 |
| `interaction-hypothesis` | Long 互动假说 | 对话协商：澄清、确认、协商意义 |
| `output-hypothesis` | Swain 输出假说 | 输出尝试：给表达理由，接受半词半句与支架 |
| `scaffolding-zpd` | Vygotsky 最近发展区 | 最近发展区与逐级提示、退让 |
| `task-based-language-learning` | 任务型语言教学 | 任务驱动：为一个具体结果使用英语 |
| `usage-based-language-learning` | Tomasello / Ellis 用法基础 | 用法积累：同一功能换内容、换场景 |
| `spaced-retrieval` | 提取练习与间隔效应 | 间隔提取：先回忆再给答案，区分独立与提示 |
| `child-news-reader` | 可理解输入、互动与广泛阅读 | 儿童新闻：来源核对、年龄筛选、分级改写与互动阅读 |

`english-session` 与 `english-core` 是学科契约入口。只有 session 加载方法：每轮一个主方法、必要时一个辅助方法，只留一个主要待答问题，产出唯一 segment；其余方法只提供做法、材料与证据建议，彼此不加载。日志与结束保存归 lifecycle。全部 skill 都是 `user-invocable: false`；这是模型遵循的调度约定，不是运行时隔离。新闻的来源层级、核验、适龄筛选、改写与配图规则见 `child-news-reader`。

## 进入方式

从 registry 安装时只写英语包名即可，`baicai-edu-learn` 作为依赖会被一并安装并启用：

```bash
dsh plugin --profile web add baicai-edu-english
```

本仓库本地 checkout 用统一入口（它把闭包 pack 成 tarball 安装，与 registry 布局一致）：

```bash
node scripts/install.mjs english --profile web
```

按 DSH 输出决定是否重启，再刷新页面。不要用 `link:` 装本仓库的 checkout：pnpm 不会带上它的依赖，单份 provider 也就找不到共享包；此前手动禁用的 bundle 也不会被重装强行启用。详见[统一安装说明](<../docs/installation.md>)。

刷新 Web 会话后：

1. `/learn-start`：选科目时选「英语」，识别或创建学生。
2. `/learn`：可以带主题（如「颜色」「动物」「读一个短故事」），也可以不带主题，从档案选目标。
3. `/learn-feynman`：让学生当小老师讲英语，AI 当同龄听众提问。

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

- 学科固定为 `english`；`/learn-start` 初始化 `profile.current_levels` 的 `listening`、`speaking`、`reading`、`writing` 四项为 `pre_a1`。
- 年级只调整任务形式、句子长度与支持方式，不决定英语水平或固定语言支持比例；学生可用中文参与，学生可见教学回复仍按 core 规则用英语。水平按实际表现一项一项更新。
- 每轮由入口把唯一 `session_segment` 追加到 `session_log.json`；会话结束由入口按 `learn-data` 的 finalize 规则写回。
- 协议细节见 `learn` 包的 `skills/learn-data/SKILL.md`。

## 依赖

本包依赖 `baicai-edu-learn`，缺少时共享规则、会话循环与数据协议不可用：入口加载 `learn-core` 与 `learn-data` 并处理投放文件（`learn-errors`），`english-session` 复用交接再加载 `english-core`；学生数据按 `learn-data` 的 JSON 协议读写。

## 验证

```bash
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
git diff --check
```

[教学行为对照场景](tests/teaching-scenarios.md)用于人工审阅与模型回放；静态检查不等于行为实测。
