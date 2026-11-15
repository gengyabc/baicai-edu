# ADR-0004：单份技能 provider 与随包渲染的 resources

- 状态：已接受
- 日期：2026-11-15
- 相关：[安装说明](../installation.md)、[技能 provider](../../learn/skill-provider.mjs)、[渲染脚本](../../scripts/build-resources.mjs)

## 背景

六个技能包各自带一份 `skill-provider.js`（源码在 `scripts/skill-provider.js`，由 `publish.mjs sync` 复制）。这样做的原因是：每个包的 `cordis.patch.yml` 以 `<包名>/skill-provider.js` 激活插件，安装后必须能立刻解析到文件，pack 时生成保证不了。

代价有三点：

1. **六份逻辑副本**：改一行要跑 `sync`，另设「副本比对」与静态守卫两道防线防止漂移。
2. **跨包引用发现不了**：provider 只读本包的 `skills/`，`english-core`、`math-low-*` 等对 `learn-core`/`learn-data` 的引用从来不会被内联，靠模型按 `<skill>/references/<file>` 自行推断，且没有任何检查。
3. **注册完整性不在任何一层保证**：少一个包就少一批技能，界面只能看出「没有」。

## 关键事实（实测）

- 新版本 DSH 的 `reconcile` 把本次新增、声明了 `dsh.bundle` 的依赖**全部**加进 `dsh.profile.bundles`，所以 registry 安装后七个包都成为 profile 的直接依赖，全部提升到 `profile/node_modules` 顶层。
- 本地 `link:` **不安装**被链接包的依赖，`file:` 指向 checkout 目录同理；因此本地 `link:` 安装的布局永远是「只有一部分包」，这是旧设计里六份副本存在的根本原因之一。
- `npm pack` 出的 tarball 互相依赖时，pnpm 会去 registry 找兄弟包（尚未发布）；在 profile 的 `pnpm-workspace.yaml` 写 `overrides` 可以让它们解析到本地 tarball（pnpm 11 不再读 `package.json.pnpm`）。
- 同 id 的插入行会组合成一个 loader 条目，config 取**最后一个** bundle 层的行。

## 决策

1. **只有一份 provider**：`learn/skill-provider.mjs`（代码）与 `learn/lib/skill-resources.mjs`（读取渲染结果）。六个技能包的 `cordis.patch.yml` 只保留一行激活，指向 `baicai-edu-learn/skill-provider.mjs`；不再复制 provider，`sync` 与副本比对随之删除。
2. **闭包整份列出**：每次激活的 `config.packages` 都列出闭包中七个包（`baicai-edu-learn` 加各学科与画板）。因为组合时最后一行生效，每一行都必须能独立覆盖全部根路径；未安装的包保留为未解析路径并由 provider 跳过，而不是猜。
3. **技能正文随包渲染**：`scripts/build-resources.mjs` 把 `skills/` 渲染成各包的 `resources/`（每个技能一个文件，外加它引用的资源文件，含跨包引用），安装与运行只读 `resources/`。这样只有代码的安装也能注册完整技能，跨包引用被内联，引用文件缺失在构建期就报错。`resources/` 必须提交，`publish.mjs check` 与契约测试会比对重建结果。
4. **本地安装改为 pack**：`scripts/install.mjs` 把闭包逐个 `npm pack` 后一次 `dsh plugin add`，并在 profile 写临时 `overrides`。本地与 registry 因此共用同一种布局，单份 provider 才能解析全部包。重装会重新 pack 闭包，并把之前装过的其它学科包按 profile 中仍登记的 tarball 路径一并重新 add。

## 影响

- 每个包的 `skills/` 仍是技能的唯一来源，但**改完技能必须重建 `resources/`**；忘记重建会被测试拦下。
- 包的 `files` 增加 `resources`、`build.json`（learn 另有 `lib`），不再有 `skill-provider.js`。
- `scripts/skill-contracts.test.mjs` 的守卫从「六份副本逐字比对」改为「只有一份 provider、每行激活都指向它并列全闭包、`resources/` 与源码重建一致且引用的文件都在」。
