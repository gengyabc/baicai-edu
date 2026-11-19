# 教育包依赖与安装

## 两种安装来源

- **registry 发布**：每个包声明发布版本范围（如 `"baicai-edu-learn": "^0.1.4"`），不声明 `"private": true`，并声明 `engines.dsh: ">=0.2.2-rc.1 <0.3.0"`——DSH 不满足这个范围时会直接拒绝安装与激活，不会装上一个跑不起来的插件。接收方只需装 **DSH**，用自己的 dsh 命令按包名安装；不需要你的 checkout、profile 或任何本机路径。**当前状态**：七个 `baicai-edu-*` 包已发布到 npm（技能包 `0.1.4`、`chinese-reading` 为 `0.1.2`、`math-board` 为 `0.6.2`）；依赖由 pnpm 装入，启用则要在命令里逐个列出（见下节）。发布与发布后验收见[发布与技能渲染](publishing.md)。
- **本地 checkout**：`scripts/install.mjs` 按 `package.json` 的必需依赖遍历同仓库 bundle，把依赖闭包**逐个 `npm pack` 成 tarball**，再把这批 tarball 一次交给 `dsh` 安装。本地与 registry 因而得到同一种 `node_modules` 布局：闭包里每个包都是 profile 的直接依赖，也正是单份技能 provider 能解析全部包的前提。**不要再用 `link:` 装本地 checkout**：pnpm 不会安装被链接包的依赖，profile 只会得到闭包的一部分。技能仍从安装处读取，本地改动重装一次即生效；宿主代码修改按 DSH 重载或重启诊断生效。

## 接收方怎么装（DSH 已装好）

每条命令显式安装并选择该学科的必需 bundle：

```bash
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-board baicai-edu-math-primary-low
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-primary-high
dsh plugin --profile web add baicai-edu-learn baicai-edu-chinese-reading
dsh plugin --profile web add baicai-edu-learn baicai-edu-english
```

pnpm 下载间接依赖不等于 DSH 启用对应 bundle。Electron 桌面端请在插件管理中安装并启用同一组包。

- 按需加载：只装哪个学科，就只有那个学科的技能注册；学科包需要共享的 `baicai-edu-learn` 提供生命周期与数据协议，因此需要同时启用。
- 高年级数学不依赖画板，要画板就**另外**装一次：`dsh plugin --profile web add baicai-edu-math-board`。低年级数学已在依赖里声明画板，会自动带上。
- 已手动禁用的 bundle 不会被重装强行启用；要恢复它，先在 DSH 插件管理里明确启用。

装完按 DSH 的提示重启或刷新 Web 页面即可，**不需要再配置模型**：插件不注册、不改写任何模型 provider，会话继续使用接收方 DSH 里已经选好的模型与凭据。插件本身也不发网络请求、不带 API key。要求 DSH 的模型路由已能在接收方机器上正常对话（这与插件无关）。

本仓库的安装器在两种模式下都显式展开必需 bundle；`--from registry` 按发布包名安装（预览不修改 profile）：

```bash
node scripts/install.mjs all --profile web --from registry --dry-run
```

（该入口仅在本仓库内可用，接收方直接执行上面对应的 `dsh plugin ... add`。）

## 本地 checkout 安装

在此仓库中运行（需要 Node.js、可用的 `dsh` 及其 pnpm）：

```bash
# 低年级数学：安装 learn、math-common、math-board、math-primary-low
node scripts/install.mjs math-primary-low --profile web
# 高年级数学：安装 learn、math-common、math-primary-high，不自动安装画板
node scripts/install.mjs math-primary-high --profile web
# 高年级也可显式选装画板
node scripts/install.mjs math-primary-high math-board --profile web

# 语文或英语：同时安装 learn 和所选学科；不额外安装画板
node scripts/install.mjs chinese-reading --profile web
node scripts/install.mjs english --profile web

# 一次装齐三个学科（数学含两个年级段包），共享包与画板各一份
node scripts/install.mjs all --profile web

# 也可以组合选择，或独立安装共享包/画板
node scripts/install.mjs chinese-reading english --profile web
node scripts/install.mjs math-board --profile web
node scripts/install.mjs learn --profile web
# 只装共享数学契约（调试加载链路用；没有教学入口）
node scripts/install.mjs math-common --profile web

# 只预览，不修改 profile，也不执行 dsh
node scripts/install.mjs math-primary-low --profile web --dry-run
```

默认 profile 是 `web`。脚本根据自身位置解析仓库，不依赖固定 checkout 路径；从其他工作目录调用时传入脚本的实际路径。安装完成后按 DSH 输出决定是否重启，再刷新原有 Web 页面；脚本不会启动替代服务器。

**本地安装为什么先 pack**：`pnpm add link:<目录>` 只链接该目录本身、不装它的 `dependencies`，profile 里只有部分包，单份 provider 就找不到其余包。安装器因此走「pack 闭包 → 一次 `dsh plugin add <tarballs>`」，并在 profile 的 `pnpm-workspace.yaml` 写 `overrides`（DSH 没有对应命令，由安装器写入；重装只更新本次使用的教育包规则，保留其他规则），让某个 tarball 声明的兄弟依赖也解析到本地 tarball，而不是 registry 上同名已发布版本（`baicai-edu-*` 已发布，本地调试仍需这层 overrides 才吃得到未发布的改动）。每次重装都重新 pack 闭包，并把之前装过的其它学科包按仍留在 profile 里的 tarball 路径一并重新 add，因此逐个安装学科不会互相清掉。pack 产物放在系统临时目录，重装会生成新的目录并替换 profile 里的引用。

## 依赖关系与唯一来源

| 包 | 必需的本仓库依赖 |
|---|---|
| `learn` | 无 |
| `math-common` | `learn`（共享数学契约包；只给两个数学 band 按条件加载，不是教学实现） |
| `math-board` | 无，可以独立使用 |
| `math-primary-low` | `learn`、`math-common`、`math-board` |
| `math-primary-high` | `learn`、`math-common`（`math-board` 可选，不自动安装） |
| `chinese-reading` | `learn` |
| `english` | `learn` |

`learn` 自带 `learn-general-core`、`learn-general-session` 与 `learn-support`，单独安装即可使用通用任务教学和五类支持；不按年龄另装包，不反向安装所有学科。专门包仍提供各自教学方法，缺包不妨碍通用路径。此源码变更本身不表示正在使用的 profile 已更新或启用。

依赖只声明在各包的 `package.json` → `dependencies`：`baicai-edu-math`、两个 band、语文学科与英语声明 `baicai-edu-learn: ^0.1.4`，两个 band 另外声明 `baicai-edu-math: ^0.1.4`（低年级数学另加 `baicai-edu-math-board: ^0.6.2`）。任何包都不再声明 `"private": true`，因为 npm 会拒绝发布私有包，而 DSH 的官方 bundle 校验也按“公开 bundle”读取。

安装器从这些声明递归生成依赖优先、按包去重的闭包，把它们 pack 成 tarball 后执行**一次**：

```bash
node scripts/install.mjs math-primary-low --profile web
# 展开结果等价于（由安装器生成，不需要手写）：
dsh plugin --profile web add <临时目录>/baicai-edu-learn-*.tgz <临时目录>/baicai-edu-math-*.tgz <临时目录>/baicai-edu-math-board-*.tgz <临时目录>/baicai-edu-math-primary-low-*.tgz
```

每个 bundle 成为 profile 的顶层依赖，由 DSH 原生处理安装与启用。技能由 `learn` 携带的唯一 provider 从各包的 `resources/` 注册；学科 patch 不复制共享规则，不重复插入画板，六个技能包各有自己的启用条目，复用同一份 provider 实现。`all` 只是三个已交付学科（数学两个年级段包）的快捷选择，不扫描实验目录为新学科。两个数学包互不依赖：科目 id 都是 `math`，使用唯一技能名 `math-low-*` / `math-high-*`，由[教学解析](../learn/skills/learn-data/references/teaching-resolver.md)统一选择：已知 1–3 年级优先 low、4–6 年级优先 high，缺年级默认 low；优先级不是内容门槛，low 也可教高阶内容，已安装但未被选中的包不影响正在进行的任务。共享数学契约由 `baicai-edu-math` 提供，闭包中只出现一次；它不含 band 的 core / session 教学技能，不会被解析成第三个数学实现。

## 安装与启用是两件事

`dsh plugin add <包名>` 也会下载该包的依赖，但仅下载的依赖不一定进入 `dsh.profile.bundles`。使用仓库脚本会自动列出必需 bundle；直接调用 DSH 时请按上面的示例显式列出。

本地安装走同一个 `dsh plugin ... add`，只是参数是安装器 pack 出来的 tarball，因此依赖同样整份装在 profile 顶层。`link:` 与 `file:<目录>` 都不要用：pnpm 不安装被链接/目录依赖的间接依赖，闭包不会展开。

- 想让两个年级段的首选实现都可用，需各自安装，或使用 `all`。
- 首选年级段包不可用时，解析可选另一个完整且兼容的数学 band；仍不适配时回退通用任务教学，而不是拒绝继续。
- 已被手动禁用的 bundle 不会因重装自动重新启用。

## 已有 profile、重复安装与失败

- 已经安装了学科但缺依赖：用统一入口重装该学科，会补齐缺失的顶层依赖。不会移除其他学科、用户配置或学生数据。
- 多学科和重复输入先去重；再次安装任意学科会一并重新 add 已登记的教育包 tarball。其他插件的本地依赖由 pnpm 原样处理，不会被安装器接管。
- **未安装或未启用的学科不会注册技能**：每个启用条目只读取自己的技能资源，缺少其他学科不影响它启动。更新时请一起更新已经安装的技能包，避免旧版共享激活条目继续加载其他学科。
- **app 管理的 profile 不能从 CLI 装**：Electron 桌面端自己管理 `desktop` 这类 profile，`dsh plugin --profile desktop add` 会被拒绝（`profile "desktop" is managed exclusively by the Electron application`）。脚本以前忽略这个退出码，最后只剩一句指向 `profiles/desktop/package.json` 的 ENOENT；现在直接报出 DSH 给的原因。这种 profile 请在桌面端的插件管理里安装。
- **尊重手动禁用**：当前 DSH CLI 不会因重装自动启用此前已安装但被禁用的 bundle。脚本不绕过该行为；要恢复它，先在 DSH 插件管理中明确启用对应 bundle。脚本返回零只表示 DSH 命令完成，不能当成所有插件均已激活或界面已目视验证。
- 依赖不存在、包名不匹配、循环、非本地依赖或参数错误会在调用 DSH 前失败。执行失败会返回非零，保留原始 DSH 输出；不声称事务回滚，修复具体错误后重试。
- pack 产物在系统临时目录，profile 的依赖与 `pnpm-workspace.yaml` 的 `overrides` 指向那里；重装会重新 pack 并改写这些引用。临时目录被系统清理后，直接重装一次即可：指向已消失 tarball 的依赖会从本 checkout 重新 pack，不需要改 profile。只有本 checkout 也没有那个包时才会失败，并给出明确的下一步（`dsh plugin --profile <名字> remove <包名>` 后重装），而不是让人「再装一次」——那一步本来就跑在同一个死路上。
- `npm pack` 使用紧挨产物的临时缓存（调用方设置过 `NPM_CONFIG_CACHE` 时以它为准），并从 JSON 输出读取 tarball 文件名。`pnpm-workspace.yaml` 的 `overrides` 使用块映射；安装器保留其它规则和 LF/CRLF 换行。如果现有写法无法安全合并，脚本报错且不改写该文件。
- 安装不负责构建画板，画板源码修改后仍须执行它的 build；技能（`skills/` 与 `references/`）修改后先跑 `node scripts/build-resources.mjs` 再重装，否则装的是旧的 `resources/`（`publish.mjs check` 与契约测试会拦下未重建的情况）。

## 验证

```bash
node --test scripts/install.test.mjs
# 可选：真实 DSH CLI 隔离集成测试（使用临时 DSH_HOME，自动清理）
DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs
node scripts/install.mjs all --dry-run
node --test scripts/skill-contracts.test.mjs
```

隔离实测时可指定临时 `DSH_HOME`，避免修改正在使用的 profile。新建 profile 只安装高年级数学后，dependencies 与 `dsh.profile.bundles` 中应同时看到 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-primary-high`，没有 `baicai-edu-math-board`；显式选装画板后才增加它。低年级数学仍同时安装 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board`、`baicai-edu-math-primary-low`。重复安装或组合安装时 `baicai-edu-math` 仍只出现一次。重装及加入其他学科后，每个教育 bundle 仍只出现一次。通过配置展开确认各技能 provider 及已选装的画板各注册一次；实际工具栏显示与交互仍需在真实 Web 页面验收。

技能本体、`resources/` 一致性、可发布性与画板测试的完整命令，以及发布后的隔离验收清单，见[发布与技能渲染](publishing.md#验证)。
