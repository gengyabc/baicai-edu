# dsh-edu-chinese-reading

dsh-edu 的语文教学技能包：阅读、写作、读写迁移、出题、评改，以及经验缺口桥接。全部为模型内部 skill，不占用 `/` 入口；入口与共享规则由 `dsh-edu-learn` 提供。

## 包结构

```
chinese-reading/
  package.json
  cordis.patch.yml
  README.md
  skills/
    chinese-core/SKILL.md + references/
    chinese-session/SKILL.md
    chinese-reading-session/SKILL.md
    chinese-writing-session/SKILL.md
    chinese-read-write-transfer/SKILL.md
    chinese-generate-tasks/SKILL.md
    experience-gap-bridging/SKILL.md
```

## 七个技能

| 技能 | 作用 |
|---|---|
| `chinese-core` | 语文规则底座：阅读核心与六种深读方法、写作核心与六圈展开、反馈流程、出题规则、批改量规、统一错误标签。子 skill 按需读取 `references/` 下的文件。 |
| `chinese-session` | 语文路由器。接收 `target_context`、`mode`、`focus`，只决定本轮进阅读、写作、读写迁移还是出题，不复述学科教学动作。 |
| `chinese-reading-session` | 阅读教学与诊断。learn 模式用六种深读方法拆文本，diagnose 模式按统一阅读标签诊断，费曼模式让学生讲证据。 |
| `chinese-writing-session` | 写作教学。start 用六圈展开搭定格，revise 只做局部升格，assess 用六步量规给档位与最值得改的 3 处，费曼模式讲写作选择。 |
| `chinese-read-write-transfer` | 读写迁移。提炼 1-3 个有原文证据的写法，换主题出题，陪写，按六步量规评改（技巧运用必查），最多两轮。 |
| `chinese-generate-tasks` | 出题。阅读题与写作题，匹配年级难度，给参考答案、命题意图、判分标准；句子填空题说明合理边界。 |
| `experience-gap-bridging` | 经验缺口桥接。学生进不去文本情感时，用低风险的替代经验搭桥，再回到原文证据。 |

## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/chinese-reading
```

安装后刷新 Web 会话，模型目录中会出现上述 skill。它们都是内部 skill（`user-invocable: false`），从 `/learn` 进入语文后由模型自动按需加载。

## 依赖

本包依赖 `dsh-edu-learn`：

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
```

- `chinese-session` 路由前加载 `learn-core` 与 `learn-data`。
- 各子 skill 用 `learn-core` 的共享语气、三步确认、年级段、结束信号、费曼规则。
- 读写学生数据时用 `learn-data` 的 `outputs/students/` JSON 协议。
- 处理错题图片或 Markdown 时加载 `learn-errors`，语文标签由本包 `chinese-core` 提供。

缺少 `dsh-edu-learn` 时，语文教学所需的共享规则与数据协议不可用。

## 数据目录

所有学生数据在当前工作区根目录：

```
outputs/students/
  session.json                         # 当前学生与科目
  <student_id>/
    profile.json                       # 跨科目共享档案
    chinese/
      profile.json
      memory.json
      current_state.json
      milestones.json
      raw/                             # 只读原始错题
      extracted/                       # 提取出的分析 md
```

- 学科固定为 `chinese`；`raw/` 只读，只能 `mv` 改名。
- 会话结束由入口按 `learn-data` 的 finalize 规则写回四个科目文件；语文子 skill 只在内存中产出 `session_segment`。
- 协议细节见 `learn` 包的 `skills/learn-data/SKILL.md`。

## 说明

- 本包是纯技能包：没有插件运行时、没有额外工具，全部行为由 `SKILL.md` 指令与文件读写构成。
- `cordis.patch.yml` 为包内 `skills/` 注册独立的 filesystem skill provider（`providerName: edu-chinese-reading`），root 从安装后的包位置解析，`link:` / `file:` / git 安装行为一致。
