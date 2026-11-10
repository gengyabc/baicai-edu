import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { boardQuestionReferences } from './question-reference.js';

const chat = (nodes) => ({ order: nodes.map((node) => node.key), nodes: new Map(nodes.map((node) => [node.key, node])) });
const assistant = (key, text, extra = {}) => ({ key, kind: 'assistant-step', visibility: 'visible',
  data: { status: 'settled', finalNode: {}, blocks: [{ kind: 'text', text }], ...extra } });

test('reference choices include only teacher messages, never student text', () => {
  assert.deepEqual(boardQuestionReferences(chat([
    { key: 'problem', kind: 'user', visibility: 'visible', data: { content: [
      { type: 'text', text: '有 8 辆车。' }, { type: 'image', data: 'not text' }, { type: 'text', text: '又来 5 辆，求总数。' },
    ] } },
    assistant('teacher', '用 $8+5$ 表示。'),
  ])), [
    { key: 'teacher', role: 'assistant', text: '用 $8+5$ 表示。' },
  ]);
});

test('hidden, unfinished, reasoning, tools, attachments and unknown nodes never become reference text', () => {
  const safe = assistant('safe', '题目正文', { blocks: [
    { kind: 'reasoning', text: 'private reasoning' }, { kind: 'text', text: '题目正文' },
    { kind: 'tool-call', argsRaw: '{"secret":true}' }, { kind: 'image', attachment: { name: 'draft.json' } },
  ] });
  assert.deepEqual(boardQuestionReferences(chat([
    { ...assistant('hidden', 'hidden text'), visibility: 'hidden' },
    assistant('stream', 'partial', { status: 'running' }),
    assistant('interrupt', 'partial', { status: 'interrupted' }),
    assistant('not-final', 'step text', { finalNode: undefined }),
    { key: 'tool', kind: 'tool-call', visibility: 'visible', data: { text: 'secret' } },
    { key: 'draft', kind: 'context', visibility: 'visible', data: { text: 'not sent' } }, safe,
  ])), [{ key: 'safe', role: 'assistant', text: '题目正文' }]);
});

test('reads updated keyed values even when order and store identities do not change', () => {
  const value = chat([assistant('a', '旧文字')]);
  assert.equal(boardQuestionReferences(value)[0].text, '旧文字');
  value.nodes.set('a', assistant('a', '新文字'));
  assert.equal(boardQuestionReferences(value)[0].text, '新文字');
  value.nodes.set('a', { ...assistant('a', '新文字'), visibility: 'hidden' });
  assert.deepEqual(boardQuestionReferences(value), []);
});

test('display text removes empty and whitespace-only lines without changing the sent message', () => {
  const sentText = '\n  第一段。\r\n\r\n \t \r\n第二段。\n\n\u2028  \u2029 第三段。 \n';
  const node = assistant('compact', sentText);
  assert.equal(boardQuestionReferences(chat([node]))[0].text, '  第一段。\n第二段。\n 第三段。 ');
  assert.equal(node.data.blocks[0].text, sentText);
  assert.deepEqual(boardQuestionReferences(chat([assistant('empty', '\n \t\r\n\u2028')])), []);
});

test('nonblank lines preserve Markdown list indentation, hard breaks and formula newlines', () => {
  const content = '先读题。  \n再摆图。\n\n- 第一步\n  - 第二步\n\n$$\na+b\n=c\n$$';
  assert.equal(boardQuestionReferences(chat([assistant('lines', content)]))[0].text,
    '先读题。  \n再摆图。\n- 第一步\n  - 第二步\n$$\na+b\n=c\n$$');
});

test('teacher panel limits collapsed content to three lines and expanded scrolling content to five', async () => {
  const css = await readFile(new URL('./board.css', import.meta.url), 'utf8');
  const expanded = css.match(/\.eb-question-text\{([^}]+)\}/)[1];
  const collapsed = css.match(/\.eb-question-text\.eb-collapsed\{([^}]+)\}/)[1];
  assert.match(expanded, /line-height:1\.65/);
  assert.match(expanded, /max-height:8\.25em/);
  assert.match(expanded, /overflow-y:auto/);
  assert.match(expanded, /white-space:pre-line/);
  assert.doesNotMatch(css, /\.eb-question-text br\{display:none\}/);
  assert.doesNotMatch(css, /\.eb-question-text :is\([^}]+display:inline/);
  assert.match(collapsed, /-webkit-line-clamp:3/);
  assert.match(collapsed, /max-height:4\.95em/);
  assert.match(collapsed, /overflow:hidden/);
});

test('no chat API or loaded messages produces an empty reference list', () => {
  assert.deepEqual(boardQuestionReferences(undefined), []);
  assert.deepEqual(boardQuestionReferences({}), []);
  assert.deepEqual(boardQuestionReferences(chat([])), []);
  assert.deepEqual(boardQuestionReferences(chat([{ key: 'student', kind: 'user', visibility: 'visible',
    data: { content: [{ type: 'text', text: '只存在学生消息' }] } }])), []);
});
