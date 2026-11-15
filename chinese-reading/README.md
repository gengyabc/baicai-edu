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
```

## 六个技能

| 技能 | 作用 |
|---|---|
| `chinese-core` | 语文规则底座：阅读核心与六种深读方法、写作核心与六圈展开、反馈流程、出题规则、批改量规、统一错误标签。子 skill 按需读取 `references/` 下的文件。 |
| `chinese-session` | 语文路由器。接收 `target_context`、`mode`、`focus`，按表传入 `task_mode`，只决定本轮进阅读、写作、读写迁移还是出题，不复述学科教学动作。 |
| `chinese-reading-session` | 阅读教学与诊断。按 `task_mode`：`learn` 用六种深读方法拆文本，`diagnose` 按统一阅读标签诊断，`feynman` 让学生讲证据。segment 的 `mode` 沿用调用方。 |
| `chinese-writing-session` | 写作教学。按 `task_mode`：`start` 用六圈展开搭定格，`revise` 只做局部升格，`assess` 用六步量规给档位与最值得改的 3 处，`feynman` 讲写作选择。segment 的 `mode` 沿用调用方。 |
| `chinese-read-write-transfer` | 读写迁移。提炼 1-3 个有原文证据的写法，换主题出题，陪写，按六步量规评改（技巧运用必查），最多两轮。 |
| `chinese-generate-tasks` | 出题。阅读题与写作题，匹配年级难度，给参考答案、命题意图、判分标准；句子填空题说明合理边界。 |

经验桥接不单独注册：阅读教学按 `chinese-core` 的“内部动作”表读取 `references/experience-gap-bridging.md`，接回原文证据。调用方不拼跨包路径。

## 个性化

语文不是只读年级。`/learn-start` 会把兴趣写进共享档案的 `personal.interests`，语文 skill 会用它来：

- 阅读：选一个与文本情感/情境相近的具体经验打开话题，再回到原文证据。
- 写作：从兴趣里找具体素材和题目角度，不硬塞。
- 出题：写作题和阅读材料优先贴近兴趣；没有合适材料时用年级段默认题型。
- 读写迁移：迁移主题优先选兴趣相关的情境。
- 经验桥接：优先用兴趣、日常物件、熟悉角落做低风险替代经验。

偏好与易/难也参与呈现和支架。学科用法见 `skills/chinese-core/references/chinese-personalization.md`；共享边界见 `learn` 包的 `learn-core/references/prestart-settings-interpretation.md`。

## 安装

```bash
# 在仓库根目录运行，自动安装 learn 与本包
node scripts/install.mjs chinese-reading --profile web
```

安装后刷新 Web 会话，模型目录中会出现上述 skill。它们都是内部 skill（`user-invocable: false`），从 `/learn` 进入语文后由模型自动按需加载。

## 依赖

本包在 `dependencies` 中声明依赖 `dsh-edu-learn`，上述统一入口会自动补齐；不需要单独再安装共享包。此前手动禁用的 bundle 保持禁用，需在 DSH 插件管理中明确启用。详见[统一安装说明](<../docs/installation.md>)。

- `chinese-session` 路由前加载 `learn-core` 与 `learn-data`。
- 各子 skill 用 `learn-core` 的共享语气、按需确认、年级段、结束信号、费曼规则。
- 读写学生数据时用 `learn-data` 的 `outputs/students/` JSON 协议。
- 处理错题图片或 Markdown 时加载 `learn-errors`，语文标签由本包 `chinese-core` 提供。

缺少 `dsh-edu-learn` 时，语文教学所需的共享规则与数据协议不可用。

## 数据目录

系统状态在 `outputs/students/`；用户投放原件在 `data/students/.../raw/`：

```
data/students/<student_id>/chinese/raw/  # 用户投放原件，只读

outputs/students/
  session.json                         # 当前学生与科目
  <student_id>/
    profile.json                       # 跨科目共享档案
    chinese/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                 # 当前会话 segment，每轮写，finalize 清空
      extracted/                       # 提取出的分析 md
      backups/raw/                     # 改名前的原件备份
```

- 学科固定为 `chinese`；`data/.../raw/` 只读，只能 `mv` 改名；改名前后备到 `outputs/.../backups/raw/`。
- 每轮由入口把 `session_segment` 追加到 `session_log.json`；会话结束由入口按 `learn-data` 的 finalize 规则写回四个科目文件。
- 诊断标签写在 `session_segment.diagnosis`（`label` + `evidence`），finalize 写成 `error_history` 诊断条目，不再塞进 `skill_errors`。
- 协议细节见 `learn` 包的 `skills/learn-data/SKILL.md`。

## 说明

- 本包是纯技能包：没有插件运行时、没有额外工具，全部行为由 `SKILL.md` 指令与文件读写构成。
- `cordis.patch.yml` 只有一行：激活 `dsh-edu-learn` 携带的那一个技能 provider（条目 `edu-skills`），它从各已安装包的 `resources/` 注册全部技能。安装时读的是渲染后的 `resources/`，`skills/` 是技能来源；改完技能先跑 `node scripts/build-resources.mjs`。
