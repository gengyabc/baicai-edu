// Wire-level tool schemas for hosts that are not the DSH tool registry.
//
// The handler suite the board ships in cannot depend on DSH's own tool module:
// DSH loads every plugin from its installation, which is not on the profile's
// module path, so importing `@deepseek-ai/dsh-tools` would make the bundle fail
// to activate wherever DSH was installed somewhere else. Instead the schemas
// keep DSH's own keyword subset here and carry no bounds; the models
// (`model.js`, `reference-model.js`, `geometry/model.js`) enforce sizes, ids,
// containment and duplicates on execute and on replay.
//
// One rule goes beyond plain JSON Schema: OpenAI-compatible gateways
// (Volcengine Ark among them) reject a request whose `tools[i].function.parameters`
// is not an object-rooted schema with 400 InvalidParameter ("must be a JSON
// Schema of type object"). Action unions are therefore flattened to
// `type: "object"` plus an `action` enum plus every per-action field, and the
// node accepts a recorded root-level `oneOf` from older tool-call logs without
// rewriting it. Each action's exact fields are still enforced by its bridge's
// `request()`. `tool-schema.test.js` pins both the object root and the subset.

/** Prefer a root-level `oneOf` only when a recorded tool call already used one. */
export function withActionUnion(wire, invoke) {
  return invoke?.parameters?.oneOf === undefined ? wire : { oneOf: invoke.parameters.oneOf };
}

const referenceNumber = { type: 'number', description: '有限非负数，须位于参考图 viewbox 内。' };
const referenceShape = (type, properties) => ({
  type: 'object', additionalProperties: false, required: ['type', ...Object.keys(properties)],
  properties: { type: { type: 'string', const: type }, ...properties },
});

export const referenceSchema = {
  type: 'object', additionalProperties: false, required: ['title', 'description', 'width', 'height', 'shapes'],
  properties: {
    title: { type: 'string', description: '老师参考图标题，最多 120 字符。' },
    description: { type: 'string', description: '已知条件的说明，最多 1000 字符；不是答案或学生证据。' },
    width: { type: 'number', description: 'viewbox 宽度，有限数 100–1200。' },
    height: { type: 'number', description: 'viewbox 高度，有限数 100–800。' },
    shapes: { type: 'array', description: '1–40 个只读示意图元素；矩形宽高、圆半径严格为正且整体不超出 viewbox。', items: { oneOf: [
      referenceShape('rect', { x: referenceNumber, y: referenceNumber, width: referenceNumber, height: referenceNumber }),
      referenceShape('line', { x1: referenceNumber, y1: referenceNumber, x2: referenceNumber, y2: referenceNumber }),
      referenceShape('circle', { cx: referenceNumber, cy: referenceNumber, r: referenceNumber }),
      referenceShape('text', { x: referenceNumber, y: referenceNumber, text: { type: 'string', description: '最多 120 字符，仅作为纯文本；不解析 SVG、HTML 或 URL。' } }),
    ] } },
  },
};

export const REFERENCE_ACTION_UNION = [
  { type: 'object', additionalProperties: false, required: ['action'], properties: { action: { type: 'string', const: 'get' } } },
  { type: 'object', additionalProperties: false, required: ['action', 'expectedRevision', 'reference'], properties: {
    action: { type: 'string', const: 'show' }, expectedRevision: { type: 'integer' }, reference: referenceSchema,
  } },
  { type: 'object', additionalProperties: false, required: ['action', 'expectedRevision'], properties: {
    action: { type: 'string', const: 'hide' }, expectedRevision: { type: 'integer' },
  } },
];

/**
 * Object-rooted parameters for `math_board_reference`.
 * `show` must carry `expectedRevision` and `reference`, `hide` `expectedRevision`,
 * `get` only `action`; `reference` is the only action-shaped field that can sit
 * at the root, so the other actions' payload never appears there.
 */
export function referenceParameters() {
  return {
    type: 'object', additionalProperties: false, required: ['action'],
    properties: {
      action: { type: 'string', enum: ['get', 'show', 'hide'], description: 'get 读取当前参考图；show 用 expectedRevision 和 reference 替换；hide 用 expectedRevision 收起。' },
      expectedRevision: { type: 'integer', description: 'show 或 hide 必填：上一次 get 返回的 revision；get 不要带。' },
      reference: { ...referenceSchema, description: '仅 show 必填：老师参考图内容。' },
    },
  };
}

const demoNumber = { type: 'number', description: '画板坐标，落在 800×600 画布边距 24 以内。' };
const demoPoint = {
  type: 'object', additionalProperties: false, required: ['id', 'label', 'kind', 'x', 'y'],
  properties: {
    id: { type: 'string', description: '这幅图内部的点 id。' },
    label: { type: 'string', description: '点标签，最多 30 字，同一幅图内不重复。' },
    kind: { type: 'string', enum: ['free', 'derived'] },
    x: demoNumber,
    y: { type: 'number', description: '画板纵坐标，向下增大。' },
    note: { type: 'string', description: '点的说明。画布上不另画。' },
    construction: { type: 'object', additionalProperties: false, required: ['op', 'inputs'], properties: {
      op: { type: 'string', enum: ['midpoint', 'parallelogram', 'rectangle'] },
      inputs: { type: 'array', items: { type: 'string' }, description: '自由点 id。中点两个，平行四边形和矩形三个。' },
    } },
  },
};
const demoElement = (type, properties) => ({
  type: 'object', additionalProperties: false, required: ['id', 'type', 'role', 'note', ...Object.keys(properties)],
  properties: {
    id: { type: 'string' }, type: { type: 'string', const: type },
    role: { type: 'string', enum: ['main', 'auxiliary'] },
    note: { type: 'string', description: '不超过 20 字时画在图形旁，例如 9 cm。更长的说明不画在画布上。' },
    ...properties,
  },
});

export const demoFigureSchema = {
  type: 'object', additionalProperties: false, required: ['title', 'description', 'board'],
  properties: {
    title: { type: 'string', description: '教师演示标题，最多 120 字。' },
    description: { type: 'string', description: '已知条件说明，最多 1000 字。不写入学生草稿。' },
    board: { type: 'object', additionalProperties: false, required: ['schemaVersion', 'points', 'elements', 'note'], properties: {
      schemaVersion: { type: 'integer', const: 1 },
      kind: { type: 'string', const: 'geometry-board' },
      points: { type: 'array', description: '0–40 个点；只放文字时可以为空。', items: demoPoint },
      elements: { type: 'array', description: '1–40 个图形。', items: { oneOf: [
        demoElement('segment', { points: { type: 'array', items: { type: 'string' }, description: '两个点 id。' } }),
        demoElement('polygon', { points: { type: 'array', items: { type: 'string' }, description: '三到六十个点 id。' } }),
        demoElement('parallelogram', { points: { type: 'array', items: { type: 'string' }, description: '四个点 id，按顺序排列，最后一个是由前三个自由点构造出的派生点。' } }),
        demoElement('rectangle', { points: { type: 'array', items: { type: 'string' }, description: '四个点 id，按顺序排列，最后一个是由前三个自由点构造出的派生点。' } }),
        demoElement('circle', { centerPointId: { type: 'string' }, radiusPointId: { type: 'string' } }),
        demoElement('text', {
          x: { type: 'number', description: '文字锚点横坐标（左侧基线），0–800。' },
          y: { type: 'number', description: '文字基线纵坐标，24–576。' },
          text: { type: 'string', description: '教师写的文字，最多 200 字，可含换行；学生复制后可自行修改。' },
        }),
      ] } },
      note: { type: 'string', const: '', description: '必须是空字符串。整板说明不从教师图写入学生草稿。' },
    } },
  },
};

export const DEMO_ACTION_UNION = [
  { type: 'object', additionalProperties: false, required: ['action'], properties: { action: { type: 'string', const: 'get' } } },
  { type: 'object', additionalProperties: false, required: ['action', 'expectedRevision', 'figure'], properties: {
    action: { type: 'string', const: 'show' }, expectedRevision: { type: 'integer' }, figure: demoFigureSchema,
  } },
  { type: 'object', additionalProperties: false, required: ['action', 'expectedRevision'], properties: {
    action: { type: 'string', const: 'hide' }, expectedRevision: { type: 'integer' },
  } },
];

/**
 * Object-rooted parameters for `geometry_board_draw`.
 * `show` must carry `expectedRevision` and `figure`, `hide` `expectedRevision`,
 * `get` only `action`.
 */
export function demoParameters() {
  return {
    type: 'object', additionalProperties: false, required: ['action'],
    properties: {
      action: { type: 'string', enum: ['get', 'show', 'hide'], description: 'get 读取当前教师演示图；show 用 expectedRevision 和 figure 替换；hide 用 expectedRevision 收起。' },
      expectedRevision: { type: 'integer', description: 'show 或 hide 必填：上一次 get 返回的 revision；get 不要带。' },
      figure: { ...demoFigureSchema, description: '仅 show 必填：教师演示图内容。' },
    },
  };
}
