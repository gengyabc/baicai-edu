# Development and installation

[English](development.md) | [中文](development.zh.md)

## Source layout

```text
math-board/
├── index.js / client.js       # stable host entry / generated browser entry
├── build.mjs / preview.mjs    # build and pattern preview
├── locale/                   # UI dictionaries
├── src/
│   ├── quantity/             # quantity model, modification trace, quantity page
│   ├── geometry/             # geometry model, drawing, labels, viewport and geometry page
│   ├── teacher-demo/         # teacher demo model and page
│   ├── reference/            # standalone teacher reference figure model and view
│   ├── host/                 # host sync bridge, tool schema and projection protocol
│   ├── shared/               # shared controls, file selection and problem reference
│   ├── shell/                # tab shell, tutorial and styles
│   └── testing/              # React / browser test doubles, not published
└── tests/                    # generated client and published package regression
```

Source is organized by responsibility, with single-module tests next to their implementation; cross-module client and publish checks live in `tests/`. Public entries and export paths do not change with internal directories. The publish list collects by source extension and excludes tests and test doubles; a new runtime JS or CSS file needs no item-by-item addition. After changing `src/` or a dictionary directly, run the build and do not hand-edit the generated [client.js](<../client.js>). The build still uses self-contained factory `toString()` inlining, so moving a file does not change its dependency-passing rules.

## Module responsibilities

[model.js](<../src/quantity/model.js>) is the domain implementation of quantity board state, [geometry/model.js](<../src/geometry/model.js>) is the domain implementation of geometry board state, [trace.js](<../src/quantity/trace.js>) handles modification facts and bounded retention on its own, [config-bridge.js](<../src/host/config-bridge.js>) is the host settings sync bridge (tools, commands and session projection share one operation); [view-component.js](<../src/quantity/view-component.js>) is the quantity page, [geometry-view.js](<../src/geometry/geometry-view.js>) is the geometry page, [geometry-demo-view.js](<../src/teacher-demo/geometry-demo-view.js>) is the teacher demo page, [board-shell.js](<../src/shell/board-shell.js>) assembles the three tabs and the shared dialogs, [tool-projection.js](<../src/host/tool-projection.js>) is the tool projection protocol shared by the geometry demo and the teacher reference figure. The three pages share one set of controls: [board-kit.js](<../src/shared/board-kit.js>) provides the bottom “Back to conversation”, icon buttons, zoom button pairs, more-menu rows, status hints and color constants, [geometry/caption.js](<../src/geometry/caption.js>) decides where a short label is drawn, how large it is written, and where a click counts as hitting it, [geometry/draw.js](<../src/geometry/draw.js>) provides the circle's hidden radius point, draws figures and short labels within the same label box, and the coloring rules for point labels, points and lines and faces, and [geometry/frame.js](<../src/geometry/frame.js>) decides how the canvas fits into the visible area (fit zoom, padding and scrollable range). A figure's edges are named and parsed only by [geometry/model.js](<../src/geometry/model.js>); any control is defined only once here, and pages no longer each draw one copy. For the tutorial extension interface see [First-run tutorial and safe practice](tutorials.md).

## Build and test commands

```bash
node math-board/build.mjs
node --check math-board/client.js
npm --prefix math-board test
# view tests share the React/browser test doubles in math-board/src/testing/test-harness.js
node scripts/check-skills.mjs
node math-board/preview.mjs /tmp/math-board-shapes.html   # optional: visually check patterns in headless Chrome or a browser
# installing math automatically provisions the board and the shared learning packages:
node scripts/install.mjs math-primary-low --profile web
# the board can also be installed on its own:
node scripts/install.mjs math-board --profile web
```

The math packages list this package as a required dependency, but the board does not depend on teaching skills in reverse.

## Standalone installation and injection

**Standalone installation** (no teaching package and no configured model routing): `dsh plugin --profile web add baicai-edu-math-board`. The plugin entry declares no required services (`export const inject = []`). Cordis flat array entries and object keys are **both required services**; there is no `{ required, optional }` or array-style optional declaration. Optional capabilities are implemented by child `ctx.inject(...)` lifecycles: once the projection registry arrives the board host mounts; tools, commands and the system prompt each wait for their own registry, do not block projection when missing, and register or re-register automatically after a service arrives late or is replaced. Without a projection registry the entry still activates, but registers no host capability; the client's local canvas is not cleared because of it. `scripts/board-boot.test.mjs` verifies complete, missing, late and replaced services with the real Cordis loader and the DSH ToolsService, so mock tests that call `apply` directly cannot hide injection errors. A registry being present does not prove that model routing is configured; the plugin wires only by host capability and does not judge model configuration itself. Regression command: `node --test scripts/board-boot.test.mjs`. The board never calls a large model itself, nor registers or rewrites any model provider; only the teacher demo in conversation, changing settings in conversation, and needing an AI reply after putting the board into an answer use the model already selected for the current session, and need no separate configuration. For the full installation and activation mechanism see [Unified installation guide](<../../docs/installation.md>). A pure JavaScript package, with no third-party dependencies and no install script. Commit the generated `client.js`; after changing the model, views, styles or a dictionary, run the build. `preview.mjs` renders every pattern through a minimal React→SVG adapter, making it easy to compare recognizability at small sizes such as cat and dog; it ships with the package but is never loaded at runtime. First installation supports live activation; whether replacing an installed module needs a restart is decided by the installation result.

## Pattern assets

Patterns are original figures drawn by this project with SVG primitives; `build.mjs` inlines the views and the pattern factories together into `client.js`, so the runtime needs no external images.

## Publish list

`files` in `package.json` collects the generated entry, source, dictionaries, icons, build scripts and `README.md`, `LICENSE`, `CHANGELOG.md`, and includes this `docs/` directory, so the in-depth reading links on the installation page work. When adding runtime resources, check the list by the extension rule; do not append tests or test doubles item by item.
