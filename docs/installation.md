# 教育包依赖与安装

## 一条命令，补齐依赖

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

依赖只声明在各包的 `package.json` → `dependencies`。所有包目前都是私有的相邻目录包，使用 `file:../learn`、`file:../math-common`、`file:../math-board`；这不是可直接发布到 registry 的版本依赖。未来发布前必须替换为已发布版本并重新验证安装，不要把带相邻目录依赖的单独 tarball 当成自包含发行物。

安装器从这些声明递归生成依赖优先、按包去重的闭包，然后执行**一次**：

```bash
dsh plugin --profile web add link:<checkout>/learn link:<checkout>/math-common link:<checkout>/math-board link:<checkout>/math-primary-low [link:<checkout>/math-primary-high]
```

每个 bundle 成为 profile 的顶层依赖，由 DSH 原生处理安装与启用。各包仍只注册自己的技能或插件；学科 patch 不复制共享规则，不重复插入画板。`all` 只是三个已交付学科（数学两个年级段包）的快捷选择，不扫描实验目录为新学科。两个数学包互不依赖：科目 id 都是 `math`，使用唯一技能名 `math-low-*` / `math-high-*`，由[教学解析](../learn/skills/learn-data/references/teaching-resolver.md)统一选择：已知 1–3 年级优先 low、4–6 年级优先 high，缺年级默认 low；优先级不是内容门槛，low 也可教高阶内容，已安装但未被选中的包不影响正在进行的任务。共享数学契约由 `dsh-edu-math` 提供，闭包中只出现一次；它不含 band 的 core / session 教学技能，不会被解析成第三个数学实现。

## 为什么不能只写 dependencies

当前验证版本 DSH `0.2.2-rc.1` 的安装流程只为**新增的 profile 顶层依赖**自动选择 bundle；读取配置时也只加载 `dsh.profile.bundles` 中选择的 patch。npm 间接依赖的代码可解析，不意味着该包的 patch 或 Web 插件已经启用。

因此：

- 首选年级段包不可用时，解析可选另一个完整且兼容的数学 band；仍不适配时回退通用任务教学，而不是拒绝继续。想让两个年级段的首选实现都可用，需分别安装或使用 `all`。
- `dsh plugin ... add link:<checkout>/math-primary-low` **不是完整数学安装入口**：pnpm 的 `link:` 本身不安装目标目录的间接依赖，DSH 也不递归启用它们。
- 改用 `file:` 让 pnpm 安装间接依赖，仍不能替代 bundle 启用。
- 推荐使用上面的统一入口；手工安装时必须显式列出依赖闭包中的所有包。

## 已有 profile、重复安装与失败

- 已经安装了学科但缺依赖：用统一入口重装该学科，会补齐缺失的顶层依赖。不会移除其他学科、用户配置或学生数据。
- 多学科和重复输入先去重；重复运行交给 pnpm 更新同名依赖，DSH 不会再次向 bundle 列表追加同名新增项。共享包、画板各使用原本唯一的 patch 注册。
- **尊重手动禁用**：当前 DSH CLI 不会因重装自动启用此前已安装但被禁用的 bundle。脚本不绕过该行为；要恢复它，先在 DSH 插件管理中明确启用对应 bundle。脚本返回零只表示 DSH 命令完成，不能当成所有插件均已激活或界面已目视验证。
- 依赖不存在、包名不匹配、循环、非本地依赖或参数错误会在调用 DSH 前失败。执行失败会返回非零，保留原始 DSH 输出；不声称事务回滚，修复具体错误后重试。
- 本方案使用本地 `link:`，开发目录必须持续存在；移动 checkout 后重新运行安装入口。安装不负责构建画板，画板源码修改后仍须执行它的 build。

## 验证

```bash
node --test scripts/install.test.mjs
# 可选：真实 DSH CLI 隔离集成测试（使用临时 DSH_HOME，自动清理）
DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs
node scripts/install.mjs all --dry-run
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
node --test math-board/*.test.js
```

隔离实测时可指定临时 `DSH_HOME`，避免修改正在使用的 profile。新建 profile 只安装高年级数学后，dependencies 与 `dsh.profile.bundles` 中应同时看到 `dsh-edu-learn`、`dsh-edu-math`、`dsh-edu-math-primary-high`，没有 `dsh-edu-math-board`；显式选装画板后才增加它。低年级数学仍同时安装 `dsh-edu-learn`、`dsh-edu-math`、`dsh-edu-math-board`、`dsh-edu-math-primary-low`。重复安装或组合安装时 `dsh-edu-math` 仍只出现一次。重装及加入其他学科后，每个教育 bundle 仍只出现一次。通过配置展开确认各技能 provider 及已选装的画板各注册一次；实际工具栏显示与交互仍需在真实 Web 页面验收。
