# 发布、技能渲染与发布后验收

维护者文档。接收方怎么装、本地 checkout 怎么装、依赖闭包与失败处理见[安装说明](installation.md)；本页只覆盖「把包发出去」以及「技能如何随包注册」。

## 发布命令

发布从仓库根目录用 `scripts/publish.mjs` 驱动，不依赖任何根 `package.json`（根没有 `package.json`，也不要加）：

```bash
node scripts/publish.mjs check          # 干跑：校验 7 个包可发布、resources/ 与源码一致、README 链接可解析
node scripts/publish.mjs pack           # 只打包到临时目录，产出的就是要发的 tarball；从不上传
node scripts/publish.mjs publish        # check → pack → 按依赖顺序逐个 npm stage publish（上暂存区，不上线）
node scripts/publish.mjs publish learn math-primary-low   # 只发指定的包（目录名或 npm 包名都行）
node scripts/publish.mjs approve <stage-id> [<stage-id> ...]   # 批准暂存版本，这一步才真正上线
node scripts/publish.mjs publish --dry-run   # 只报告将上传什么
node scripts/build-resources.mjs        # 由 skills/ 重建六个包的 resources/（改技能后必须跑）
```

- **可以只发一部分包。** `check`/`pack`/`publish` 后面可以列包名（目录名 `math-common` 或 npm 名 `baicai-edu-math`），列谁就只处理谁，`check` 也只校验这几个包；顺序仍按依赖走，不按输入顺序。不列包名才是全部 7 个。**已经在线且版本号没动的包不要放进列表**——npm 会以 `E403` 拒绝同版本重发，脚本会停在那一个包、后面都没发；常见情形是某个包这轮只有 `CHANGELOG.md` 之类的非实质改动，决定不补发时直接不列它。包名拼错会以 `unknown package` 报错退出，不会悄悄变成「发全部」。

- **发版是两步：`publish` 上暂存区，`approve` 才上线。** npm 自 2025 起要求新包名的首版走 `npm stage publish`，直发会报 `E_STAGE_REQUIRED`；同时 npm 在收紧「跳过 2FA 的 token」做直发（`gh.io/npm-gat-bypass2fa-deprecation`），所以脚本只保留暂存路径，不再调用 `npm publish`。
- **只有 `publish` 会写暂存区，只有 `approve` 会让版本上线**，两者都要求不带 `--dry-run`。这条由 `scripts/publish.test.mjs` 钉住，因为早期版本的 `pack` 会直接走到 `npm publish`。
- **只有 `approve` 需要一次性密码**；`publish`（暂存）不需要。用 `NPM_OTP=123456 node scripts/publish.mjs approve <stage-id> …` 传入，每个 stage id 各跑一次 `npm stage approve`，中途失败会打印「批准到第几个」——已批准的已经是公开版本，剩下的还没有。
- **暂存会给新包名发布占位版本 `0.0.0-stage`**：包名当场被占住，但真实内容在批准前不可见。所以「npm 页面能看到包」不等于「已上线」，验收要看 `npm view <包名> version` 是否返回真实版本。
- **npm 版本下限 `11.15.0`**：`npm stage` 从这一版才有，`node scripts/publish.mjs publish` 会在上传前直接拒绝更老的 npm（`check`/`pack` 不受影响，仍可跑）。
- 发布顺序写死在脚本里：`learn` → `math-common` / `math-board` → 两个 band → `chinese-reading` / `english`；依赖范围没变时，先发的共享包不必等后面。
- 脚本自己用一个临时 npm 缓存（`NPM_CONFIG_CACHE` 优先），因为默认的 `~/.npm` 在沙箱里或含有旧 npm 留下的 root 文件时会让 `npm pack` 直接 EPERM，这与包本身无关。
- **registry 写在包里**：七个包的 `publishConfig.registry` 固定为 `https://registry.npmjs.org/`，不跟随本机 `npm config`（国内镜像通常只读，`publish` 会失败或落到错误目标）。`access` 为 `public`。
- 暂存中途失败会打印「停在第几个包」，此时暂存区里可能已有几个版本；先用 `npm stage list` 看清现状再重试，避免重复暂存同一版本。
- `check` 会打包校验每个包是否带 `cordis.patch.yml`、`skills/`、`resources/`、`build.json` 与 `README.md`、`LICENSE`（`math-board` 无技能，只要求 patch 与客户端），并检查 README 里每个相对链接都能在 tarball 里找到目标、没有 `../` 出包链接。CI 跑同一条命令。
- **认证**：`~/.npmrc` 里的 registry token 必须是 `//registry.npmjs.org/:_authToken=…`——**开头少了 `//` 整行会被 npm 忽略**，症状是 `npm whoami` 报 `need auth`。账号开了 `auth-and-writes` 2FA 时，凭 token 能暂存但不能直发，批准必须走真实 OTP 或 npmjs.com 的 Staged Packages 页面。

## 技能注册方式：每个包只有一行激活，逻辑只有一份

provider 由 `learn` 携带（`learn/skill-provider.mjs` + `learn/lib/skill-resources.mjs`），六个技能包的 `cordis.patch.yml` 都激活它：

```yaml
- insert:
    - id: edu-skills
      name: !!js …createRequire(baseUrl + 'x').resolve('baicai-edu-learn/package.json') → skill-provider.mjs
      config:
        packages: [ … 闭包里每个包的 package.json 路径 … ]
```

- **只有一份 provider 代码**：任何学科包都依赖 `baicai-edu-learn`，所以任何安装都能解析到同一个模块；不再有各包内的副本，也没有 `sync` 与副本比对。设计理由见 [ADR-0004](adr/0004-single-skill-provider.md)。
- **闭包整份列出**：`name` 是包内路径（各次激活完全相同），`config.packages` 列出闭包中的七个包。DSH 把同 id 的插入行组合成一个条目，而各 bundle 层**后写入者生效**；因此每一行都列出完整闭包，无论最终留下的是哪一行的最后一层，provider 都拿得到全部根路径。装不上或未安装的包保留为未解析路径，provider 跳过它（本地半装不会凭空注册不存在的包）。
- **代码与文档分离**：技能正文渲染进各包的 `resources/`（每个技能一个文件，附它引用的资源文件），所以只有代码、没有 `skills/` 的安装同样能注册完整技能。`skills/` 仍随包发布，供阅读与维护。
- **目录数据不内联**：`references/locales/*.json` 是查表数据而非散文，正文里内联会按每个键占上下文，还得让模型去解析一份文档。因此 catalog 按散文引用的相对路径原样落进 `resources/references/locales/`，由 provider 把 `resources/` 发布为技能的 base directory，模型据此用 read 工具读取。两个技能同名 catalog 会让路径二义，构建直接报错。
- **自包含**：`baicai-edu-learn` 单独安装时，`learn-general-*` 的引用都在 `learn/resources/` 里，不依赖其他学科包。
- **引用按「归属 + 搜索」解析**：正文引用写的是 `references/<name>.md`（源码包内的相对路径）。归属技能的写法有六种（相邻反引号、`'s`、`的`、表格两列、代词 "its"、普通链接），任何只认其中一种的正则都会漏，而漏掉是静默的——文件既不内联也不拷贝，安装后的技能就指着一条不存在的路径。因此 `sharedCitations` 先取路径前最近、且确实拥有该文件的技能名，退回到「搜索路径里唯一拥有者」。解析不出来的引用进 `problems` 并在构建时 warn，不再被丢弃。
- **渲染正文自带路径说明**：安装后的树只有 `<name>.md` 摆在 base directory 里，没有 `references/` 这一层（catalog 除外）。`build-resources.mjs` 给每个带资源的技能在正文末尾追加一句说明讲清这个对应关系；改渲染逻辑时别把它当成可删的装饰。测试同时检查路径说明与引用文件是否随包安装。
- **分支资源按需读**：默认仍内联。技能可在源文件 frontmatter 加 `resource-loading: on-demand`；构建照常收录引用，但 provider 只加载技能正文。多分支技能可用这一选项避免把整套规则交给每一轮；正文须保留每个分支的触发条件、必读项和归属技能。单一流程若每次都需要某份参考，可继续内联。
- **大小上限是自家保护网**：`skill-provider.mjs` 的 512 KiB 上限并非 DSH 限制。超过 200 KiB 的注册内容会记录 `large but whole` 供审查；需要省上下文时优先精简正文、按分支加载。超上限时整份略过个别内联资源并逐个点名，文件仍可在 base directory 中读取。

## 每次发版的清单

1. **版本**：改过哪个包就升哪个包的 `version`；`0.x` 阶段 `^0.1.0` 只接受 `0.1.x`，所以 `learn` 或 `math-common` 一旦跳 `0.2.0`，六个包里的依赖范围要同时改，否则接收方装不上。`math-board` 现在领跑到 `0.6.1`，`math-primary-low` 的 `^0.6.1` 跟着它走（范围下限已抬到新版本，理由见下一小点）。
   - **依赖范围的下限要跟着新版本走，不只是跨 minor 时才改。** `^0.1.0` 在语义上接受 `0.1.1`，但「接受」不等于「解析到」：pnpm 的 `minimumReleaseAge` 会把刚发布的 `0.1.1` 判定为太新，实际装出来是 `0.1.0`（2026-11-19 真实发生过：只装学科包 `baicai-edu-math-primary-low@0.1.1`，闭包里 `learn`/`math` 全是 `0.1.0`，新加的 locale 目录根本没被加载）。凡依赖方与被依赖方同批发布，依赖范围要写成新版本的下限（如 `^0.1.1`），因为 `0.x` 的 caret 拒绝 `0.1.0`，解析器没有回退空间。改完记得同步 `scripts/skill-contracts.test.mjs` 里的范围断言。`math-board` 0.6.1 同理：`math-primary-low` 已从 `^0.6.0` 抬到 `^0.6.1`，否则装出来的可能仍是带教师演示引导的 0.6.0。
2. **文档**：README 里新增的普通过程说明放进 `<包>/docs/`（双语成对），并确认 `docs` 在该包 `files` 里——`check` 会因为链接目标没打进 tarball 直接报错。跨包与仓库根文档只能写绝对 URL（`https://github.com/gengyabc/baicai-edu/blob/main/…`），`../` 在 npm 页面上没有任何父目录。
3. **变更记录**：七个包都维护 `CHANGELOG.md`，并在各自 `files` 里列出，随 tarball 一起发布；首次发布（0.1.0 / `math-board` 0.6.0）已记录，之后每次升级都要追加一节。未发布的工作写在 `Unreleased` 下，发版时再落到版本号标题。
4. **DSH 兼容范围**：七个包都声明 `engines.dsh: ">=0.2.2-rc.1 <0.3.0"`，未满足时 DSH 会拒绝安装与激活（机制见 `dsh-app-boot` 的 `evaluatePluginCompatibility`，比较用 `semver.satisfies(..., { includePrerelease: true })`，所以 rc 版本正常参与区间判断）。下限是**本仓库集成测试实际启动过的版本**，不是推测版本；上调或放宽前必须在那个 DSH 版本上真装一次。0.3.0 被挡在外面是故意的：它一旦破坏 API，未验证的安装会在运行时坏掉，而静默坏掉比装不上更难排查。
5. **checks**：`node scripts/publish.mjs check` 必须为绿，`node --test scripts/*.test.mjs` 全过；CI 与本地是同一条命令。
6. **发布**：`node scripts/publish.mjs publish`（首次发布前先 `publish` 带 `--dry-run` 看一遍清单）；它把 7 个 tarball 逐个上暂存区并打印 stage id，此时**还没有任何版本上线**。只发了部分包时，把要发的包名列在命令后面（见上），不要指望脚本替你跳过已在线版本。
7. **批准上线**：用 `NPM_OTP=<码> node scripts/publish.mjs approve <stage-id> …`，或到 npmjs.com 的 **Staged Packages** 页面勾选后批量 `Approve`（一次 2FA 覆盖全部）。批准完用 `npm view <包名> version` 确认拿到真实版本，`latest` 不再是 `0.0.0-stage`。
8. **发布后同步**：根 [README](../README.md) 与[安装说明](installation.md) 里「尚未发布到 npm / 只能走 checkout」的说法要改掉，否则接收方仍会绕远路；再打 git tag 标记这次发布（首版 `v0.1.0` 已于 `2026-11-18` 发布并打 tag，此后按发布版本递增，如 `v0.1.2`）。

## 发布后验收

- 至少用隔离 `DSH_HOME` 真装一次，**且只写学科包名**：`dsh plugin --profile web add baicai-edu-math-primary-low`，确认 `node_modules` 里出现 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board`（依赖闭包由 pnpm 自动补齐），并确认 `dsh --profile web --dump-config` 里 `edu-skills` 条目的 `config.packages` 列全闭包、技能注册齐全（低年级数学闭包注册 20 个技能，全装 43 个）、不是静默少一批。tarball 里有文件只说明包装对了，不等于接收方已注册。
- **`dsh.profile.bundles` 只记本次直接装的包**（上例只有 `baicai-edu-math-primary-low`），闭包其余成员作为依赖装进 `node_modules`、由那一行 patch 的 `config.packages` 指到绝对路径——所以「bundles 里没看到 `baicai-edu-learn`」不是故障，别据此判断装坏了。
- **闭包里每个包的版本都要看一眼，不只看目录里有没有它。** `node_modules` 出现 `baicai-edu-learn` 只证明闭包补齐了，不证明它是新版本；上面那次事故里目录都在、版本全是旧的。逐包 `node -p "require('./node_modules/<包>/package.json').version"`，确认共享包不低于本轮依赖范围的下限。刚发布的版本可能还在 pnpm 的 release-age 窗口内而解析成前一个 patch，这对同一 minor 的功能没有影响，但下限不符就是真的装错了。
- 接收方侧的前置条件只有 DSH 与可用模型路由；插件的 `baicai-edu-learn: ^0.1.1` 等范围由 npm 自动满足。
- 真实界面（工具栏、卡片、画布交互）仍需在 Web 页面上验收；命令返回零只表示 DSH 命令完成。

## 验证

```bash
node scripts/publish.mjs check                      # 可发布性、resources/ 一致性与 README 链接
node --test scripts/publish.test.mjs                # 发布路径与 README 链接回归
node --test scripts/install.test.mjs                # 安装规划与回归
DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs   # 真实 DSH CLI 隔离集成
node scripts/check-skills.mjs                       # 技能本身
node --test scripts/skill-contracts.test.mjs        # 契约、resources/ 与源码一致
npm --prefix math-board test                        # 画板
```
