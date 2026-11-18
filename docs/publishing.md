# 发布、技能渲染与发布后验收

维护者文档。接收方怎么装、本地 checkout 怎么装、依赖闭包与失败处理见[安装说明](installation.md)；本页只覆盖「把包发出去」以及「技能如何随包注册」。

## 发布命令

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
- **自包含**：`baicai-edu-learn` 单独安装时，`learn-general-*` 的引用都在 `learn/resources/` 里，不依赖其他学科包。

## 发布后验收

- 至少用隔离 `DSH_HOME` 真装一次，**且只写学科包名**：`dsh plugin --profile web add baicai-edu-math-primary-low`，确认 `dsh.profile.bundles` 里出现 `baicai-edu-learn`、`baicai-edu-math`、`baicai-edu-math-board`，并确认技能注册齐全（低年级数学闭包注册 20 个技能，全装 43 个）、不是静默少一批。tarball 里有文件只说明包装对了，不等于接收方已注册。
- 接收方侧的前置条件只有 DSH 与可用模型路由；插件的 `baicai-edu-learn: ^0.1.0` 等范围由 npm 自动满足。
- 真实界面（工具栏、卡片、画布交互）仍需在 Web 页面上验收；命令返回零只表示 DSH 命令完成。

## 验证

```bash
node scripts/publish.mjs check                      # 可发布性与 resources/ 一致性
node --test scripts/install.test.mjs                # 安装规划与回归
DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs   # 真实 DSH CLI 隔离集成
node scripts/check-skills.mjs                       # 技能本身
node --test scripts/skill-contracts.test.mjs        # 契约、resources/ 与源码一致
npm --prefix math-board test                        # 画板
```
