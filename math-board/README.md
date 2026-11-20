# baicai-edu-math-board 白菜数学画板

[English](#english) | [中文](#中文)

## English

An expression workspace for math, not a calculator. The plugin adds a button to the DSH Web input toolbar beside the model selector; it opens a wide workbench with three tabs — a quantity board (shapes, each with a value and a colour, groupable and mergeable), a geometry board (points, segments, polygons, circles, parallelograms, rectangles) and a teacher demo page. What the board expresses is which shapes there are, what each one stands for, and how they are placed and grouped; adding, subtracting, multiplying and dividing stay in the student's own note. It carries the student's own thinking only: no operation mode, no auto-solving, no image recognition, and it never submits an answer for the student. The math packages require it; it does not depend on any teaching skill.

### Where to start

Open a DSH Web session and click the board button beside the model selector. For a lesson, run `/learn <topic>` first and open the board from the same toolbar. The student places shapes or points, writes a note, then uses "Put into answer" and sends the message themselves.

### Install, and what success looks like

```bash
node scripts/install.mjs math-primary-low --profile web   # the repository installer adds the board to low-band math
node scripts/install.mjs math-board --profile web         # or install the board alone
dsh plugin --profile web add baicai-edu-math-board        # no teaching package, no model routing
```

From the registry the low band declares the board as a dependency, so pnpm downloads it, but DSH enables only the bundles the call names — list `baicai-edu-math-board` in the same command.

Restart if DSH says so, then refresh the Web session. When it worked, the toolbar shows a coloured board mark to the left of the model selector at 28 px (narrow windows show the mark only, and hover or a screen reader still reports the board name), and clicking it opens the workbench with the 算数 / 几何 / 教师演示 tabs. The board never calls a model itself, so no provider configuration is needed; a model is used only when the conversation needs a reply about what was submitted.

### Where the data goes

The canvas, the notes and the edit trace live in browser-local storage, isolated per DSH session, and survive a refresh, a closed workbench or a browser restart. Nothing here ships in the package: this repository holds source, `docs/` and generated `client.js` only. "Put into answer" uploads a read-only snapshot to the local host and attaches `我的画板.json` (plus the optional trace) to the draft; it enters the conversation only when the student sends it.

### What is irreversible

- Clearing the canvas wipes shapes, every note, the edit trace and the undo history at once, and cannot be undone. Attachments already put into the answer or already sent are not deleted.
- The grade 1–3 teaching rule may record an automatic clear before a genuinely new task; the tool records the request and is not proof that the client applied it.
- Sent attachments persist with the session; the trace is not a temporary read-once file.

### Further reading

| To learn about | Go to |
|---|---|
| Quantity board: pattern rail, topic reference, selection, grouping, merging, colour levels, student path | [Interface and interaction](docs/interface.md) |
| Geometry tab and teacher demo page | [Geometry mode](docs/geometry.md) |
| First-run tours, the safe practice system, and the chapter extension interface | [First-run tutorials](docs/tutorials.md) |
| Snapshot and trace formats, storage, version migration, save/open | [Data and submission](docs/data.md) |
| Who may clear the board, and how a clear request travels and fails | [Task-boundary clearing](docs/clearing.md) |
| Source layout, module ownership, build, checks, install and injection | [Development and install](docs/development.md) |
| Manual acceptance scenarios and the offline same-end-state comparison | [Acceptance scenarios](docs/acceptance-scenarios.md) |
| What changed between versions | [CHANGELOG](CHANGELOG.md) |

The teaching rules that own how the board is used live in the shared [board contract](https://github.com/gengyabc/baicai-edu/blob/main/math-common/skills/math-common/references/board-contract.md); the grade-band entry points are in [structured drawing](https://github.com/gengyabc/baicai-edu/blob/main/math-primary-low/skills/math-low-core/references/structured-drawing.md). This package is AGPL-3.0-or-later.

## 中文

数学的表达工作台，不是计算器。插件在 DSH Web 输入框工具栏、模型选择按钮旁加一个按钮，点开是宽屏工作台，含三个 tab：数量画板（图案各带数值与颜色，可圈组、可同形合并）、几何画板（点、线段、多边形、圆、平行四边形、矩形）与教师演示页。画板表达「有什么图案、每个代表多少、怎么摆放和分组」；加减乘除由学生自己在说明里讲，画板不提供运算模式，也不做对错判断。它只承载学生自己的思路：不自动解题、不用图片识别，也不替学生提交答案。数学包将它列为必需依赖，它不反向依赖任何教学技能。

### 入口

打开 DSH Web 会话，点模型选择按钮旁的画板按钮。要在课程中使用，先 `/learn 加减法`（其他主题也可以），再从同一条工具栏打开画板。学生摆图案或落点、写说明，然后「放入回答」并**自己**发送消息。

### 安装与装好的表现

```bash
node scripts/install.mjs math-primary-low --profile web   # 仓库安装器会把画板随低年级数学一起装上
node scripts/install.mjs math-board --profile web         # 也可只装画板
dsh plugin --profile web add baicai-edu-math-board        # 没有教学包、也没有配置模型路由
```

从 registry 装时，低年级数学包把画板声明为依赖，所以 pnpm 会下载它，但 DSH 只启用本次命令选中的 bundle——请在同一个命令里写出 `baicai-edu-math-board`。

按 DSH 输出决定是否重启，再刷新 Web 会话。装好后，工具栏在模型选择按钮左侧显示彩色画板标志，高 28 px（窄窗口只显示标志，悬停或读屏仍报出「数学画板」），点开是含算数／几何／教师演示三个 tab 的工作台。画板从不自己调用大模型，所以不需要模型配置；只有对话需要就提交内容回应时才用当前会话已选的模型。

### 数据放在哪

画布、说明与修改记录都在浏览器本地、按 DSH 会话隔离存储，刷新页面、关闭工作台或关闭浏览器再打开仍保留。本仓库只放源码、`docs/` 和生成的 `client.js`，这些状态不随包发布。「放入回答」把只读快照上传到本机 Host，把「我的画板.json」（以及可选的修改记录）作为附件放进草稿；学生自己发送后才进入会话。

### 不可逆的部分

- 清空画布会同时清掉图形、全部说明、修改记录与撤销历史，且不可撤销。已经放入回答或已经发送的附件不会被删除。
- 低年级教学规则在真正的新任务开始前可能记录一次自动清空；工具只记录请求，不代表客户端已经执行。
- 已发送附件随会话保留；修改记录不是阅后即失的临时文件。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 数量画板：图案轨、题目参考、选择、分组、合并、颜色阶梯、学生操作路径 | [界面与交互](docs/interface.zh.md) |
| 几何 tab 与教师演示页 | [几何模式](docs/geometry.zh.md) |
| 首次导览、安全练习系统与章节扩展接口 | [首次教程与安全练习](docs/tutorials.zh.md) |
| 快照与修改记录格式、存储、版本迁移、保存与打开 | [数据与提交](docs/data.zh.md) |
| 谁能清空画板，清空请求怎样传递、怎样失败 | [任务切换清空](docs/clearing.zh.md) |
| 源码布局、模块职责、构建、检查、安装与注入 | [开发与安装](docs/development.zh.md) |
| 手工验收场景与相同终态的离线对照 | [手工验收场景](docs/acceptance-scenarios.zh.md) |
| 各版本改了什么 | [更新记录](CHANGELOG.md) |

画板该怎么用由共享契约拥有：[画板契约](https://github.com/gengyabc/baicai-edu/blob/main/math-common/skills/math-common/references/board-contract.md)；年级段入口见[结构化数学画板](https://github.com/gengyabc/baicai-edu/blob/main/math-primary-low/skills/math-low-core/references/structured-drawing.md)。本包许可为 AGPL-3.0-or-later。
