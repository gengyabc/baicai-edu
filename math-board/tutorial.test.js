import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  TUTORIAL_VERSION, advanceTutorial, createTutorialOverlay, geometryTutorialSteps,
  isTutorialSeen, markTutorialSeen, measureTourTarget, quantityTutorialSteps,
  tourHoldsNotePanel, tourInsertMode, tourMaskPads, tutorialStorageKey,
} from './tutorial.js';

const zh = JSON.parse(await readFile(new URL('./locale/zh.json', import.meta.url), 'utf8'));
const en = JSON.parse(await readFile(new URL('./locale/en.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => {
  assert.equal(typeof zh[key], 'string', `Missing zh locale key: ${key}`);
  return zh[key].replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match);
};

test('tutorial storage keys are mode-specific and versioned', () => {
  assert.equal(tutorialStorageKey('quantity'), `dsh-edu-math-board:tutorial:${TUTORIAL_VERSION}:quantity`);
  assert.equal(tutorialStorageKey('geometry'), `dsh-edu-math-board:tutorial:${TUTORIAL_VERSION}:geometry`);
  assert.notEqual(tutorialStorageKey('quantity'), tutorialStorageKey('geometry'));
});

test('seen flags are independent per mode', () => {
  const storage = new Map();
  const api = {
    getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => storage.set(name, String(value)),
  };
  assert.equal(isTutorialSeen('quantity', api), false);
  assert.equal(isTutorialSeen('geometry', api), false);
  markTutorialSeen('quantity', api);
  assert.equal(isTutorialSeen('quantity', api), true);
  assert.equal(isTutorialSeen('geometry', api), false);
  markTutorialSeen('geometry', api);
  assert.equal(isTutorialSeen('geometry', api), true);
});

test('advanceTutorial only moves on the matching completeOn signal', () => {
  const steps = quantityTutorialSteps();
  let tour = { mode: 'quantity', index: 0, steps };
  assert.equal(advanceTutorial(tour, 'quantity-color'), tour);
  tour = advanceTutorial(tour, 'quantity-add');
  assert.equal(tour.index, 1);
  assert.equal(tour.steps[tour.index].completeOn, 'quantity-color');
  tour = advanceTutorial(tour, 'quantity-color');
  assert.equal(tour.index, 2);
});

test('finishing the last step leaves index past the end for the host to close', () => {
  const steps = quantityTutorialSteps();
  let tour = { mode: 'quantity', index: steps.length - 1, steps };
  tour = advanceTutorial(tour, steps.at(-1).completeOn);
  assert.equal(tour.index, steps.length);
  assert.equal(advanceTutorial(tour, 'quantity-add'), tour);
});

test('quantity and geometry step tables cover required targets and locale keys', () => {
  const q = quantityTutorialSteps();
  const g = geometryTutorialSteps();
  assert.ok(q.length >= 5);
  assert.ok(g.length >= 5);
  for (const step of [...q, ...g]) {
    assert.equal(typeof step.id, 'string');
    assert.equal(typeof step.target, 'string');
    assert.equal(typeof step.completeOn, 'string');
    assert.equal(typeof zh[step.titleKey], 'string', step.titleKey);
    assert.equal(typeof zh[step.bodyKey], 'string', step.bodyKey);
    assert.equal(typeof en[step.titleKey], 'string', step.titleKey);
    assert.equal(typeof en[step.bodyKey], 'string', step.bodyKey);
  }
  assert.deepEqual(q.map((step) => step.completeOn), [
    'quantity-add', 'quantity-color', 'quantity-add', 'quantity-note-open',
    'quantity-note-save', 'quantity-insert',
  ]);
  assert.deepEqual(g.map((step) => step.completeOn), [
    'geometry-tool-point', 'geometry-add-point', 'geometry-tool-segment',
    'geometry-add-segment', 'geometry-note-open', 'geometry-note-save', 'geometry-insert',
  ]);
});

test('locale tutorial chrome keys match across languages', () => {
  for (const key of ['tutorialReplay', 'tutorialSkip', 'tutorialProgress', 'tutorialDone', 'tutorialInsertPractice']) {
    assert.equal(typeof zh[key], 'string', key);
    assert.equal(typeof en[key], 'string', key);
  }
  assert.match(t('tutorialProgress', { step: 2, total: 6 }), /2/);
  assert.match(t('tutorialProgress', { step: 2, total: 6 }), /6/);
});

test('measureTourTarget reads data-tour-id boxes', () => {
  const node = {
    getBoundingClientRect: () => ({ top: 10, left: 20, width: 54, height: 200 }),
  };
  const root = {
    querySelector(selector) {
      assert.equal(selector, '[data-tour-id="quantity-palette"]');
      return node;
    },
  };
  assert.deepEqual(measureTourTarget(root, 'quantity-palette'), {
    top: 10, left: 20, width: 54, height: 200, node,
  });
  assert.equal(measureTourTarget(null, 'quantity-palette'), null);
  assert.equal(measureTourTarget({ querySelector: () => null }, 'missing'), null);
});

test('tourMaskPads leave a click-through gap over the hole', () => {
  const pads = tourMaskPads({ top: 100, left: 50, width: 80, height: 40 }, 0, { width: 400, height: 300 });
  assert.deepEqual(pads.map((pad) => pad.key).sort(), ['bottom', 'left', 'right', 'top']);
  const top = pads.find((pad) => pad.key === 'top');
  const left = pads.find((pad) => pad.key === 'left');
  const right = pads.find((pad) => pad.key === 'right');
  const bottom = pads.find((pad) => pad.key === 'bottom');
  assert.equal(top.height, 100);
  assert.equal(left.width, 50);
  assert.equal(right.left, 130);
  assert.equal(bottom.top, 140);
  // No pad covers the hole interior.
  for (const pad of pads) {
    const overlapsHole = pad.left < 130 && pad.left + Number(pad.width) > 50
      && pad.top < 140 && pad.top + Number(pad.height) > 100;
    assert.equal(overlapsHole, false, pad.key);
  }
});

test('createTutorialOverlay renders tip copy, skip and pad masks', () => {
  const React = {
    createElement(type, props, ...children) {
      return { type, props: props || {}, children };
    },
    useRef(current) { return { current }; },
    useEffect() {},
  };
  const Overlay = createTutorialOverlay(React);
  const step = quantityTutorialSteps()[0];
  const previous = globalThis.window;
  globalThis.window = { innerWidth: 800, innerHeight: 600 };
  try {
    const tree = Overlay({
      step, stepIndex: 0, stepCount: 6, t,
      hole: { top: 40, left: 12, width: 60, height: 120 },
      onSkip: () => {},
    });
    const walk = (node) => !node || typeof node !== 'object' ? []
      : [node, ...(node.children || []).flat(Infinity).flatMap(walk)];
    const nodes = walk(tree);
    assert.ok(nodes.filter((node) => node.props?.className === 'eb-tour-mask').length >= 3);
    assert.ok(nodes.some((node) => node.props?.className === 'eb-tour-hole'));
    assert.ok(nodes.some((node) => node.props?.className === 'eb-tour-tip'));
    const root = nodes.find((node) => node.props?.className === 'eb-tour');
    assert.ok(root?.props?.ref, 'tour root receives a focus-trap ref');
    const skip = nodes.find((node) => node.props?.className === 'eb-tour-skip');
    assert.equal(skip?.children?.[0], zh.tutorialSkip);
    assert.ok(skip?.props?.ref, 'skip receives a focus ref');
    assert.ok(nodes.some((node) => node.type === 'h2' && node.children?.[0] === zh[step.titleKey]));
  } finally {
    globalThis.window = previous;
  }
});

test('tourHoldsNotePanel and tourInsertMode are step-scoped', () => {
  const steps = quantityTutorialSteps();
  assert.equal(tourHoldsNotePanel(null), false);
  assert.equal(tourHoldsNotePanel({ index: 0, steps }), false);
  assert.equal(tourHoldsNotePanel({ index: steps.findIndex((step) => step.id === 'note-save'), steps }), true);
  assert.equal(tourInsertMode(null), null);
  assert.equal(tourInsertMode({ index: 0, steps }), 'block');
  assert.equal(tourInsertMode({ index: steps.findIndex((step) => step.id === 'insert'), steps }), 'practice');
  assert.equal(tourInsertMode({ index: 0, steps: geometryTutorialSteps() }), 'block');
});
