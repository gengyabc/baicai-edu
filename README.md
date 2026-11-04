# dsh-edu

小学自学教学技能包，从 Pi 的 `xiaoxue/.pi` 配置迁移到 DeepSeek Harness 的原生 skill 体系。

## 包

| 目录 | 包名 | 作用 |
|---|---|---|
| [`learn/`](./learn/README.md) | `dsh-edu-learn` | 共享入口（`/start` `/learn` `/feynman` `/profile` `/save`）、教学底座、学生数据协议、错题处理 |
| [`math-low/`](./math-low/README.md) | `dsh-edu-math-low` | 小学数学：一回合教学、策略诊断、分层练习、学生出题考 AI |
| [`chinese-reading/`](./chinese-reading/README.md) | `dsh-edu-chinese-reading` | 完整语文：阅读、写作、读写迁移、出题、评改、经验桥接 |

`math-low` 与 `chinese-reading` 依赖 `learn` 提供的 `learn-core`、`learn-data`、`learn-errors`。

## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/math-low
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/chinese-reading
```

三个包已经安装到当前 `web` profile。安装后刷新 Web 会话：`/` 菜单会出现入口命令，模型目录只出现学科内部 skill；输入 `/start` 开始。

## 使用

1. `/start`：选数学或语文，识别已有学生或逐轮建档；会记录 `personal.interests`，供语文和数学选择例子、阅读角度和写作题目。
2. `/learn 分数减法`：进入自适应学习；也可以直接 `/learn` 从档案选目标。
3. `/feynman`：费曼模式，学生讲、AI 当学生提问。
4. `/profile`：查看或修改档案。
5. `/save`：手动保存当前会话。

入口 skill 分两档：`start` / `learn` 设置 `disable-model-invocation: true`，只能由用户主动输入 `/name` 发起；`feynman` / `profile` / `save` 保留模型入口，支持“我来给你讲”“看看我的档案”“保存一下”这类对话内自动加载。学科内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

`/teach` 已被本机全局 `teach` 技能占用，因此费曼入口使用 `/feynman`。

## 数据

学生数据写在**当前工作区**的 `outputs/students/`。`outputs/` 是通用输出根目录，后续可以在同级扩展 `outputs/reports/`、`outputs/lessons/` 等，不把教学产物混进代码目录。

```
outputs/students/
  session.json
  <student_id>/
    profile.json                 # 姓名、年级、personal.interests、经历
    math/{profile,memory,current_state,milestones,session_log}.json
    chinese/{profile,memory,current_state,milestones,session_log}.json
    <subject>/raw/               # 只读原始错题
    <subject>/extracted/         # 分析 md
    <subject>/backups/raw/       # 原件备份
```

`raw/` 只读，`extracted/` 放分析 Markdown，`backups/raw/` 放改名前的原件备份。会话进行中每轮写 `session_log.json`；`profile.json` / `memory.json` 只在 finalize 写。详细协议见 [`learn/skills/learn-data/SKILL.md`](./learn/skills/learn-data/SKILL.md)。

## 设计文档

- [Pi → DSH 迁移映射](./docs/migration/pi-to-dsh-skills.md)
- [DSH 教学插件产品方案](./docs/DSH教学插件_最终技术与产品方案.md)
- [跨 Harness 技能与多用户 Agent 平台方案](./docs/跨Harness技能与多用户Agent平台总体实施方案_v1.1_Python优先.md)

## 验证

```bash
# 三个包都应出现在 bundles 与 dependencies 中
cat ~/.dsh/profiles/web/package.json

# 每个包的 skills 目录应被解析为独立 provider
find learn/skills math-low/skills chinese-reading/skills -name SKILL.md

# 静态检查：frontmatter、名称、内部入口、失效引用、旧字段/Pi 残留
node scripts/check-skills.mjs
```

当前会话已确认 20 个 skill 定义：2 个纯用户入口（`start`、`learn`）+ 3 个双开入口（`feynman`、`profile`、`save`）+ 15 个内部 skill（`user-invocable: false`，模型可加载）。
