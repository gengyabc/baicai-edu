# ADR-0004：单份技能 provider 与随包渲染的 resources

- 状态：已接受
- 日期：2026-11-15
- 相关：[安装说明](../installation.md)、[发布与技能渲染](../publishing.md)、[技能 provider](../../learn/skill-provider.mjs)、[渲染脚本](../../scripts/build-resources.mjs)

## 背景

六个技能包各自带一份 `skill-provider.js`（源码在 `scripts/skill-provider.js`，由 `publish.mjs sync` 复制）。这样做的原因是：每个包的 `cordis.patch.yml` 以 `<包名>/skill-provider.js` 激活插件，安装后必须能立刻解析到文件，pack 时生成保证不了。

代价有三点：

1. **六份逻辑副本**：改一行要跑 `sync`，另设「副本比对」与静态守卫两道防线防止漂移。
2. **跨包引用发现不了**：provider 只读本包的 `skills/`，`english-core`、`math-low-*` 等对 `learn-core`/`learn-data` 的引用从来不会被内联，靠模型按 `<skill>/references/<file>` 自行推断，且没有任何检查。
3. **注册完整性不在任何一层保证**：少一个包就少一批技能，界面只能看出「没有」。

## 关键事实（实测）

- DSH 启用由 `dsh.profile.bundles` 决定；仅被 pnpm 下载的间接依赖不一定启用。使用安装器或显式列出必需 bundle，让它们成为 profile 的直接依赖。
- 本地 `link:` **不安装**被链接包的依赖，`file:` 指向 checkout 目录同理；因此本地 `link:` 安装的布局永远是「只有一部分包」，这是旧设计里六份副本存在的根本原因之一。
- `npm pack` 出的 tarball 互相依赖时，pnpm 会去 registry 找兄弟包（尚未发布）；在 profile 的 `pnpm-workspace.yaml` 写 `overrides` 可以让它们解析到本地 tarball（pnpm 11 不再读 `package.json.pnpm`）。
- 旧版复用同一条目 ID 并读取所有已安装学科；禁用其中一包并不会移除它的技能。共享实现不应意味着共享启用生命周期。

## 决策

1. **只有一份 provider**：`learn/skill-provider.mjs`（代码）与 `learn/lib/skill-resources.mjs`（读取渲染结果）。六个技能包的 `cordis.patch.yml` 只保留一行激活，指向 `baicai-edu-learn/skill-provider.mjs`；不再复制 provider，`sync` 与副本比对随之删除。
2. **各 bundle 独立启用**：每个激活行使用唯一 ID，`config.packages` 只配置自己。DSH 可以单独回收此行注册的技能；仍由 `learn` 提供同一份 provider 代码。
3. **技能正文随包渲染**：`scripts/build-resources.mjs` 把 `skills/` 渲染成各包的 `resources/`（每个技能一个文件，外加它引用的资源文件，含跨包引用），安装与运行只读 `resources/`。这样只有代码的安装也能注册完整技能，直接引用默认内联；标记 `resource-loading: on-demand` 的技能只加载正文，按正文的分支路由从已安装的 `resources/` 读取对应文件。两种方式均随包构建引用文件。`resources/` 必须提交，`publish.mjs check` 与契约测试会比对重建结果。
4. **本地安装改为 pack**：`scripts/install.mjs` 把闭包逐个 `npm pack` 后一次 `dsh plugin add`，并在 profile 写临时 `overrides`。本地与 registry 因此共用同一种布局，单份 provider 才能解析全部包。重装会重新 pack 闭包，并把之前装过的其它学科包按 profile 中仍登记的 tarball 路径一并重新 add。

## 影响

- 每个包的 `skills/` 仍是技能的唯一来源，但**改完技能必须重建 `resources/`**；忘记重建会被测试拦下。
- 包的 `files` 增加 `resources`、`build.json`（learn 另有 `lib`），不再有 `skill-provider.js`。
- `scripts/skill-contracts.test.mjs` 的守卫从「六份副本逐字比对」改为「只有一份 provider、每行激活都指向它且只加载本包、`resources/` 与源码重建一致且引用的文件都在」。
