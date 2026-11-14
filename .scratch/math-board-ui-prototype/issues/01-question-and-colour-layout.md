# 画板题目位置与底部颜色平铺

Type: prototype
Status: resolved

## Question

学生无需退出画板即可看到题目，题目应该在哪里？能否利用底部留白把颜色／数值直接展开？

## Answer

用户选择 A：画布上方显示两行可展开的题目参考，底部平铺颜色／数值。用户随后明确要求原型中的新顶栏也进入正式版。仅带入画板标志与标题，不带入“布局原型”、模拟题目选择和重置示例。其他工具顺序、图案轨、画布图案／选择操作、弹窗尺寸、提交与记录协议不变。

窄屏颜色独立为一行；更多自定义档位可横向滚动。颜色仍然只影响新建图形，不修改已有对象或设置。

## Prototype primary source

- Throwaway branch: `prototype/math-board-question-layout`
- Commit: `e2eb42cc8b9df92dbce7e47c173553e686f8cd33`
- 此分支保存三个变体、切换器、HTML 模板及生成脚本。运行 `node math-board/ui-prototype.mjs` 后用浏览器打开生成文件，`?variant=A|B|C` 切换。
- 原型不连接真实会话／学生数据、不持久化、不提交。
- 已从 main 工作区移除原型文件及临时运行命令；没有切换当前分支或提交正式改动，也没有包含其他未提交文件。

## Implementation

- [视图](../../../math-board/view-component.js)、[样式](../../../math-board/board.css)、[对话正文读取](../../../math-board/question-reference.js)。
- DSH 的 `useChat` 通过已加载消息的 `order` 与 `nodes.get(key)` 读取可见正文；没有独立的结构化“当前题目”接口。
- 因此文案是“题目参考”，不声称自动识别了当前题目。默认显示最近一条已完成老师消息，没有时回退到学生文字；选择器允许固定更早的题目，随后新反馈不替换显式选择。
- 仅纳入可见用户 text 与 settled、finalized 的 assistant text；隐藏内容、思考、工具、附件、未完成输出、输入草稿均不读取。正文沿用宿主的 compact Markdown factory（虽命名 reasoning.content，只接收已筛选的普通正文）；无 factory 时退回 React 纯文本。
- 题目和 UI 选择不写入画板快照、设置、修改记录或回答，不触发发送／清空。
- 所选消息限当前会话内存，切换会话由现有 sessionId key 隔离；不额外抓取历史。

## Checks

- 原型生成与内联脚本语法检查通过。
- `node math-board/build.mjs`、`node --check math-board/client.js` 通过。
- `node --test math-board/*.test.js`：123 项通过。覆盖正文白名单、不可见／未完成消息排除、live reader 更新、展开／消息固定、Markdown 正文传递、颜色不改已有图形，以及现有草稿、提交、清空、修改记录回归。
- `git diff --check` 通过。
- 未安装或变更任何 profile，未启动替代服务器；当前 GUI `http://127.0.0.1:3080/` 无凭据请求返回 HTTP 401，所以尚未完成真实页面刷新／目视验收。进程列表受到沙箱限制，无法确认 dev:web watcher；没有承诺 HMR 自动更新。
