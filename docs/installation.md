# 教育包依赖与安装

## 两种安装来源

- **registry 发布**：每个包声明发布版本范围（如 `"baicai-edu-learn": "^0.1.0"`），不声明 `"private": true`。接收方只需装 **DSH**，用自己的 dsh 命令按包名安装；不需要你的 checkout、profile 或任何本机路径。
- **本地 checkout**：`scripts/install.mjs` 按 `package.json` 的必需依赖遍历同仓库 bundle，把依赖闭包**逐个 `npm pack` 成 tarball**，再把这批 tarball 一次交给 `dsh` 安装。本地与 registry 因而得到同一种 `node_modules` 布局：闭包里每个包都是 profile 的直接依赖，也正是单份技能 provider 能解析全部包的前提。**不要再用 `link:` 装本地 checkout**：pnpm 不会安装被链接包的依赖，profile 只会得到闭包的一部分。技能仍从安装处读取，本地改动重装一次即生效；宿主代码修改按 DSH 重载或重启诊断生效。

## 接收方怎么装（DSH 已装好）

一个学科一条命令，**只写学科包名**：

```bash
dsh plugin --profile web add baicai-edu-math-primary-low     # 低年级数学
dsh plugin --profile web add baicai-edu-math-primary-high    # 高年级数学（画板可选，见下）
dsh plugin --profile web add baicai-edu-chinese-reading      # 语文
dsh plugin --profile web add baicai-edu-english              # 英语
```

`dsh plugin` 是 pnpm 的透传入口（`dsh plugin --help`：「pnpm arguments, forwarded verbatim」）。装完一个包后，DSH 的 `reconcile` 会把**本次新增**且声明了 `dsh.bundle` 的依赖一并写进 `dsh.profile.bundles`：它按依赖名遍历当前 `dependencies`，跳过安装前就存在的（`beforeDeps`），把新出现的 bundle 追加进选择。因此 `add baicai-edu-math-primary-low` 一条命令就会启用 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board` 和它自己，**不需要把依赖再列一遍**。

- 按需加载：只装哪个学科，就只有那个学科的技能注册；共享的 `baicai-edu-learn` 随依赖装入并启用，因为学科包需要它的生命周期与数据协议。
- 高年级数学不依赖画板，要画板就**另外**装一次：`dsh plugin --profile web add baicai-edu-math-board`。低年级数学已在依赖里声明画板，会自动带上。
- 已手动禁用的 bundle 不会被重装强行启用；要恢复它，先在 DSH 插件管理里明确启用。
- 这条自动启用行为来自 DSH 0.2.2-rc.1 的 `dsh-plugin-manager`（`reconcile`），属于上游行为而非本仓库保证；换 DSH 版本后请以实际安装结果为准。

装完按 DSH 的提示重启或刷新 Web 页面即可，**不需要再配置模型**：插件不注册、不改写任何模型 provider，会话继续使用接收方 DSH 里已经选好的模型与凭据。插件本身也不发网络请求、不带 API key。要求 DSH 的模型路由已能在接收方机器上正常对话（这与插件无关）。

本仓库的安装器在两种模式下都显式展开必需 bundle；`--from registry` 按发布包名安装（预览不修改 profile）：

```bash
node scripts/install.mjs all --profile web --from registry --dry-run
```

（该入口仅在本仓库内可用，接收方直接执行上面的 `dsh plugin ... add`。）

## 发布者侧

发布从仓库根目录用 `scripts/publish.mjs` 驱动，不依赖任何根 `package.json`（根没有 `package.json`，也不要加）：

```bash
node scripts/publish.mjs check          # 干跑：校验 7 个包可发布、resources/ 与源码一致
node scripts/publish.mjs pack            # 打包到临时目录，产出的就是要发的 tarball
node scripts/publish.mjs publish         # check → pack → 按依赖顺序 npm publish
node scripts/build-resources.mjs        # 由 skills/ 重建六个包的 resources/（改技能后必须跑）
```

- 发布顺序写死在脚本里：`learn` → `math-common` / `math-board` → 两个 band → `chinese-reading` / `english`；依赖范围没变时，先发的共享包不必等后面。
- 脚本自己用一个临时 npm 缓存（`NPM_CONFIG_CACHE` 优先），因为默认的 `~/.npm` 在沙箱里或含有旧 npm 留下的 root 文件时会让 `npm pack` 直接 EPERM，这与包本身无关。
- `check` 会打包校验每个包是否带 `cordis.patch.yml`、`skills/`、`resources/` 与 `build.json`（`math-board` 无技能，只要求 patch），并比对 `resources/` 是否与源码重建结果一致。CI 跑同一条命令。
- OTP 走环境变量：`NPM_OTP=123456 node scripts/publish.mjs publish`。

**技能注册方式：每个包只有一行激活，逻辑只有一份。** provider 由 `learn` 携带（`learn/skill-provider.mjs` + `learn/lib/skill-resources.mjs`），六个技能包的 `cordis.patch.yml` 都激活它：

```yaml
- insert:
    - id: edu-skills
      name: !!js …createRequire(baseUrl + 'x').resolve('baicai-edu-learn/package.json') → skill-provider.mjs
      config:
        packages: [ … 闭包里每个包的 package.json 路径 … ]
```

- **只有一份 provider 代码**：任何学科包都依赖 `baicai-edu-learn`，所以任何安装都能解析到同一个模块；不再有各包内的副本，也没有 `sync` 与副本比对。
- **闭包整份列出**：`name` 是包内路径（各次激活完全相同），`config.packages` 列出闭包中的七个包。DSH 把同 id 的插入行组合成一个条目，而各 bundle 层**后写入者生效**；因此每一行都列出完整闭包，无论最终留下的是哪一行的最后一层，provider 都拿得到全部根路径。装不上或未安装的包保留为未解析路径，provider 跳过它（本地半装不会凭空注册不存在的包）。
- **代码与文档分离**：技能正文渲染进各包的 `resources/`（每个技能一个文件，附它引用的资源文件），所以只有代码、没有 `skills/` 的安装同样能注册完整技能。`skills/` 仍随包发布，供阅读与维护。
- **自包含**：`baicai-edu-learn` 单独安装时，`learn-general-*` 的引用都在 `learn/resources/` 里，不依赖其他学科包。
- 发布后至少用隔离 `DSH_HOME` 真装一次，**且只写学科包名**：`dsh plugin --profile web add baicai-edu-math-primary-low`，确认 `dsh.profile.bundles` 里出现 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board`，并确认技能注册齐全（低年级数学闭包注册 20 个技能，全装 43 个）、不是静默少一批。tarball 里有文件只说明包装对了，不等于接收方已注册。
- 接收方侧的前置条件只有 DSH 与可用模型路由；插件的 `baicai-edu-learn: ^0.1.0` 等范围由 npm 自动满足。

**本地安装为什么先 pack**：`pnpm add link:<目录>` 只链接该目录本身、不装它的 `dependencies`，profile 里只有部分包，单份 provider 就找不到其余包。安装器因此走「pack 闭包 → 一次 `dsh plugin add <tarballs>`」，并在 profile 的 `pnpm-workspace.yaml` 写 `overrides`（DSH 没有对应命令，由安装器写入；重装时整块替换），让某个 tarball 声明的兄弟依赖也解析到本地 tarball，而不是 npm registry（`baicai-edu-*` 目前尚未发布）。每次重装都重新 pack 闭包，并把之前装过的其它学科包按仍留在 profile 里的 tarball 路径一并重新 add，因此逐个安装学科不会互相清掉。pack 产物放在系统临时目录，重装会生成新的目录并替换 profile 里的引用。

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

依赖只声明在各包的 `package.json` → `dependencies`：`baicai-edu-math`、两个 band、语文学科与英语声明 `baicai-edu-learn: ^0.1.0`，两个 band 另外声明 `baicai-edu-math: ^0.1.0`（低年级数学另加 `baicai-edu-math-board: ^0.6.0`）。任何包都不再声明 `"private": true`，因为 npm 会拒绝发布私有包，而 DSH 的官方 bundle 校验也按“公开 bundle”读取。

安装器从这些声明递归生成依赖优先、按包去重的闭包，把它们 pack 成 tarball 后执行**一次**：

```bash
node scripts/install.mjs math-primary-low --profile web
# 展开结果等价于（由安装器生成，不需要手写）：
dsh plugin --profile web add <临时目录>/baicai-edu-learn-*.tgz <临时目录>/baicai-edu-math-*.tgz <临时目录>/baicai-edu-math-board-*.tgz <临时目录>/baicai-edu-math-primary-low-*.tgz
```

每个 bundle 成为 profile 的顶层依赖，由 DSH 原生处理安装与启用。技能由 `learn` 携带的唯一 provider 从各包的 `resources/` 注册；学科 patch 不复制共享规则，不重复插入画板，六个技能包激活的是同一个 `edu-skills` 条目。`all` 只是三个已交付学科（数学两个年级段包）的快捷选择，不扫描实验目录为新学科。两个数学包互不依赖：科目 id 都是 `math`，使用唯一技能名 `math-low-*` / `math-high-*`，由[教学解析](../learn/skills/learn-data/references/teaching-resolver.md)统一选择：已知 1–3 年级优先 low、4–6 年级优先 high，缺年级默认 low；优先级不是内容门槛，low 也可教高阶内容，已安装但未被选中的包不影响正在进行的任务。共享数学契约由 `baicai-edu-math` 提供，闭包中只出现一次；它不含 band 的 core / session 教学技能，不会被解析成第三个数学实现。

## registry 安装为什么只写学科包

`dsh plugin add <包名>` 由 pnpm 真实安装该包**及其 `dependencies`**，随后 DSH 的 `reconcile` 把本次新增、且声明了 `dsh.bundle` 的依赖补进 `dsh.profile.bundles`。所以 registry 装法只写学科包名即可，依赖不必重列。

本地安装走同一个 `dsh plugin ... add`，只是参数是安装器 pack 出来的 tarball，因此依赖同样整份装在 profile 顶层。`link:` 与 `file:<目录>` 都不要用：pnpm 不安装被链接/目录依赖的间接依赖，闭包不会展开。

- 想让两个年级段的首选实现都可用，需各自安装，或使用 `all`。
- 首选年级段包不可用时，解析可选另一个完整且兼容的数学 band；仍不适配时回退通用任务教学，而不是拒绝继续。
- 已被手动禁用的 bundle 不会因重装自动重新启用。

## 已有 profile、重复安装与失败

- 已经安装了学科但缺依赖：用统一入口重装该学科，会补齐缺失的顶层依赖。不会移除其他学科、用户配置或学生数据。
- 多学科和重复输入先去重；再次安装任意学科都会把之前装过的包按 profile 里登记的 tarball 路径一并重新 add，所以逐学科安装不会互相清掉，共享包、画板仍各只有一份。
- **尊重手动禁用**：当前 DSH CLI 不会因重装自动启用此前已安装但被禁用的 bundle。脚本不绕过该行为；要恢复它，先在 DSH 插件管理中明确启用对应 bundle。脚本返回零只表示 DSH 命令完成，不能当成所有插件均已激活或界面已目视验证。
- 依赖不存在、包名不匹配、循环、非本地依赖或参数错误会在调用 DSH 前失败。执行失败会返回非零，保留原始 DSH 输出；不声称事务回滚，修复具体错误后重试。
- pack 产物在系统临时目录，profile 的依赖与 `pnpm-workspace.yaml` 的 `overrides` 指向那里；重装会重新 pack 并改写这些引用。临时目录被系统清理后，先重装一次即可，不需要改 profile。
- 安装不负责构建画板，画板源码修改后仍须执行它的 build；技能（`skills/` 与 `references/`）修改后先跑 `node scripts/build-resources.mjs` 再重装，否则装的是旧的 `resources/`（`publish.mjs check` 与契约测试会拦下未重建的情况）。

## 验证

```bash
node --test scripts/install.test.mjs
# 可选：真实 DSH CLI 隔离集成测试（使用临时 DSH_HOME，自动清理）
DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs
node scripts/install.mjs all --dry-run
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
npm --prefix math-board test
```

隔离实测时可指定临时 `DSH_HOME`，避免修改正在使用的 profile。新建 profile 只安装高年级数学后，dependencies 与 `dsh.profile.bundles` 中应同时看到 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-primary-high`，没有 `baicai-edu-math-board`；显式选装画板后才增加它。低年级数学仍同时安装 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board`、`baicai-edu-math-primary-low`。重复安装或组合安装时 `baicai-edu-math` 仍只出现一次。重装及加入其他学科后，每个教育 bundle 仍只出现一次。通过配置展开确认各技能 provider 及已选装的画板各注册一次；实际工具栏显示与交互仍需在真实 Web 页面验收。
