# 开发与安装

[English](development.md) | [中文](development.zh.md)

## 源码布局

```text
math-board/
├── index.js / client.js       # 稳定的宿主入口 / 生成的浏览器入口
├── build.mjs / preview.mjs    # 构建与图案预览
├── locale/                   # 界面字典
├── src/
│   ├── quantity/             # 数量模型、修改记录、数量页面
│   ├── geometry/             # 几何模型、绘制、标签、视口与几何页面
│   ├── teacher-demo/         # 教师演示模型与页面
│   ├── reference/            # 独立老师参考图模型与视图
│   ├── host/                 # 宿主同步桥、工具 schema 与投影协议
│   ├── shared/               # 共享控件、文件选择与题目参考
│   ├── shell/                # tab 外壳、教程与样式
│   └── testing/              # React / 浏览器测试替身，不发布
└── tests/                    # 生成客户端与发布包回归
```

源码按职责归属组织，单模块测试与实现相邻；跨模块的客户端与发布检查放在 `tests/`。公开入口与导出路径不随内部目录变化。发布清单按源码扩展名收录，排除测试与测试替身；新增运行时 JS 或 CSS 无需逐项追加。直接修改 `src/` 或字典后运行构建，不手改生成的 [client.js](<../client.js>)。构建仍使用自包含工厂的 `toString()` 内联，移动文件不改变其依赖传入规则。

## 模块职责

[model.js](<../src/quantity/model.js>) 是数量画板状态的领域实现，[geometry/model.js](<../src/geometry/model.js>) 是几何画板状态的领域实现，[trace.js](<../src/quantity/trace.js>) 独立处理修改事实及有界保留，[config-bridge.js](<../src/host/config-bridge.js>) 是宿主设置同步桥（工具、命令、会话投影共用同一操作）；[view-component.js](<../src/quantity/view-component.js>) 是数量页，[geometry-view.js](<../src/geometry/geometry-view.js>) 是几何页，[geometry-demo-view.js](<../src/teacher-demo/geometry-demo-view.js>) 是教师演示页，[board-shell.js](<../src/shell/board-shell.js>) 组合三个 tab 与共享对话框，[tool-projection.js](<../src/host/tool-projection.js>) 是几何演示与老师参考图共用的工具投影协议。三个页面共用同一套控件：[board-kit.js](<../src/shared/board-kit.js>) 提供底部「返回对话」、图标按钮、缩放按钮对、更多菜单行、状态提示和调色常量，[geometry/caption.js](<../src/geometry/caption.js>) 决定短标签画在哪、写多大、点哪儿算点中它，[geometry/draw.js](<../src/geometry/draw.js>) 提供圆的隐藏半径点、按同一标签框画出图形与短标签、点标签、点与线面的着色规则，[geometry/frame.js](<../src/geometry/frame.js>) 决定画布怎样装进可见区域（适应缩放、留白与可滚动范围）。图形的边只由 [geometry/model.js](<../src/geometry/model.js>) 命名和解析；任一控件只在这里定义一次，页面不再各画一份。教程扩展接口见[首次教程与安全练习](tutorials.zh.md)。

## 构建与测试命令

```bash
node math-board/build.mjs
node --check math-board/client.js
npm --prefix math-board test
# 视图测试共用 math-board/src/testing/test-harness.js 里的 React/浏览器替身
node scripts/check-skills.mjs
node math-board/preview.mjs /tmp/math-board-shapes.html   # 可选：在无头 Chrome 或浏览器里目视检查图案
# 安装数学会自动配齐画板和共享学习包：
node scripts/install.mjs math-primary-low --profile web
# 画板也可独立安装：
node scripts/install.mjs math-board --profile web
```

数学包将本包列为必需依赖，但画板不反向依赖教学技能。

## 单独安装与注入

**单独安装**（没有教学包、也没有配置模型路由）：`dsh plugin --profile web add baicai-edu-math-board`。插件入口不声明必需服务（`export const inject = []`）。Cordis 的扁平数组条目和对象键**都是必需服务**，没有 `{ required, optional }` 或数组式可选声明。可选能力由子 `ctx.inject(...)` 生命周期实现：投影注册表到达后挂载画板宿主；工具、命令和系统提示分别等待各自注册表，缺失时不阻塞投影，服务迟到或替换后自动注册／重新注册。没有投影注册表时入口仍激活，但不注册宿主能力；客户端本地画布不因此被清空。`scripts/board-boot.test.mjs` 用真实 Cordis loader 与 DSH ToolsService 验证完整、缺失、迟到和替换服务，避免直接调用 `apply` 的 mock 测试掩盖注入错误。注册表存在并不证明配置了模型路由；插件仅按宿主能力接线，不自行判断模型配置。回归命令：`node --test scripts/board-boot.test.mjs`。画板从不自己调用大模型，也不注册或改写任何模型 provider；只有对话里的教师演示、对话改设置、以及把画板放进回答后需要 AI 回应时才用当前会话已选的模型，不需要另外配置。完整安装与启用机制见[统一安装说明](<../../docs/installation.md>)。纯 JavaScript 包，无第三方依赖、无安装脚本。提交生成的 `client.js`；修改模型、视图、样式或字典后运行 build。`preview.mjs` 用最小 React→SVG 适配器渲染全部图案，便于对比猫、狗等小尺寸辨识度；它不进入运行时包。首次安装支持 live activation，替换已安装模块是否需要重启以安装结果为准。

## 图案素材

图案是本项目用 SVG 基本图元绘制的原创图形；`build.mjs` 将视图与图案工厂一起内联进 `client.js`，运行时不需要外部图片。

## 发布清单

`package.json` 的 `files` 收录生成入口、源码、字典、图标、构建脚本与 `README.md`、`LICENSE`、`CHANGELOG.md`，并包含本 `docs/` 目录，使安装页上的深入阅读链接可用。新增运行时资源时按扩展名规则核对清单，不要逐项追加测试或测试替身。
