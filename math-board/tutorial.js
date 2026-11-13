// Shared first-run coach: storage helpers, step tables, pure advance, and overlay UI.
// Embedded into client.js by build.mjs (toString); keep this file free of imports.

export const TUTORIAL_VERSION = 'v1';

// build.mjs inlines these with toString() beside `const TUTORIAL_VERSION = …`, so the
// free name resolves in client.js. Keep every key path on TUTORIAL_VERSION / this helper
// so a version bump cannot leave a stale literal behind.
export function tutorialStorageKey(mode) {
  return `dsh-edu-math-board:tutorial:${TUTORIAL_VERSION}:${mode}`;
}

export function isTutorialSeen(mode, storage = globalThis.localStorage) {
  try {
    return storage?.getItem?.(tutorialStorageKey(mode)) === '1';
  } catch { return false; }
}

export function markTutorialSeen(mode, storage = globalThis.localStorage) {
  try {
    storage?.setItem?.(tutorialStorageKey(mode), '1');
  } catch { /* draft storage may be blocked */ }
}

/** True when Cancel/Escape would remove the note panel the current tour step spotlights. */
export function tourHoldsNotePanel(tour) {
  return tour?.steps?.[tour.index]?.id === 'note-save';
}

/**
 * Insert under an active tour: `practice` advances without attaching, `block` ignores
 * the click (including keyboard activation under the mask), `null` allows a real insert.
 */
export function tourInsertMode(tour) {
  if (!tour?.steps || tour.index < 0 || tour.index >= tour.steps.length) return null;
  const step = tour.steps[tour.index];
  if (!step) return null;
  return step.id === 'insert' ? 'practice' : 'block';
}

/** Pure step advance: returns the next tour state, or the same state when the signal does not match. */
export function advanceTutorial(tour, signal) {
  if (!tour || !Array.isArray(tour.steps) || tour.index < 0 || tour.index >= tour.steps.length) return tour;
  const step = tour.steps[tour.index];
  if (!step || step.completeOn !== signal) return tour;
  return { ...tour, index: tour.index + 1 };
}

export function quantityTutorialSteps() {
  return [
    {
      id: 'add', target: 'quantity-palette', completeOn: 'quantity-add',
      titleKey: 'tutorialQAddTitle', bodyKey: 'tutorialQAddBody',
    },
    {
      id: 'color', target: 'quantity-color', completeOn: 'quantity-color',
      titleKey: 'tutorialQColorTitle', bodyKey: 'tutorialQColorBody',
    },
    {
      id: 'group', target: 'quantity-palette', completeOn: 'quantity-add',
      titleKey: 'tutorialQAddMoreTitle', bodyKey: 'tutorialQAddMoreBody',
    },
    {
      id: 'note', target: 'quantity-note', completeOn: 'quantity-note-open',
      titleKey: 'tutorialQNoteTitle', bodyKey: 'tutorialQNoteBody',
    },
    {
      id: 'note-save', target: 'quantity-note-panel', completeOn: 'quantity-note-save',
      titleKey: 'tutorialQNoteSaveTitle', bodyKey: 'tutorialQNoteSaveBody',
    },
    {
      id: 'insert', target: 'quantity-insert', completeOn: 'quantity-insert',
      titleKey: 'tutorialQInsertTitle', bodyKey: 'tutorialQInsertBody',
    },
  ];
}

export function geometryTutorialSteps() {
  return [
    {
      id: 'tool-point', target: 'geometry-tool-point', completeOn: 'geometry-tool-point',
      titleKey: 'tutorialGPointToolTitle', bodyKey: 'tutorialGPointToolBody',
    },
    {
      id: 'place-point', target: 'geometry-canvas', completeOn: 'geometry-add-point',
      titleKey: 'tutorialGPlacePointTitle', bodyKey: 'tutorialGPlacePointBody',
    },
    {
      id: 'tool-segment', target: 'geometry-tool-segment', completeOn: 'geometry-tool-segment',
      titleKey: 'tutorialGSegmentToolTitle', bodyKey: 'tutorialGSegmentToolBody',
    },
    {
      id: 'draw-segment', target: 'geometry-canvas', completeOn: 'geometry-add-segment',
      titleKey: 'tutorialGDrawSegmentTitle', bodyKey: 'tutorialGDrawSegmentBody',
    },
    {
      id: 'note', target: 'geometry-note', completeOn: 'geometry-note-open',
      titleKey: 'tutorialGNoteTitle', bodyKey: 'tutorialGNoteBody',
    },
    {
      id: 'note-save', target: 'geometry-note-panel', completeOn: 'geometry-note-save',
      titleKey: 'tutorialGNoteSaveTitle', bodyKey: 'tutorialGNoteSaveBody',
    },
    {
      id: 'insert', target: 'geometry-insert', completeOn: 'geometry-insert',
      titleKey: 'tutorialGInsertTitle', bodyKey: 'tutorialGInsertBody',
    },
  ];
}

/**
 * Measure a `[data-tour-id]` target inside `root` for the spotlight hole.
 * Returns null when the node is missing or not laid out yet.
 */
export function measureTourTarget(root, targetId) {
  if (!root || !targetId || typeof root.querySelector !== 'function') return null;
  const node = root.querySelector(`[data-tour-id="${targetId}"]`);
  if (!node || typeof node.getBoundingClientRect !== 'function') return null;
  const rect = node.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  return {
    top: rect.top, left: rect.left, width: rect.width, height: rect.height, node,
  };
}

/**
 * Four dim panels around a viewport hole. The hole itself has no overlay node, so
 * clicks reach the real control underneath (z-index raise cannot escape palette/dock
 * stacking contexts under a full-screen mask).
 */
export function tourMaskPads(hole, pad = 8, viewport = null) {
  const width = viewport?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const height = viewport?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 0);
  if (!hole || !(width > 0) || !(height > 0)) {
    return [{ key: 'full', top: 0, left: 0, width: '100%', height: '100%' }];
  }
  const top = Math.max(0, hole.top - pad);
  const left = Math.max(0, hole.left - pad);
  const right = Math.min(width, hole.left + hole.width + pad);
  const bottom = Math.min(height, hole.top + hole.height + pad);
  const pads = [];
  if (top > 0) pads.push({ key: 'top', top: 0, left: 0, width, height: top });
  if (left > 0) pads.push({ key: 'left', top, left: 0, width: left, height: Math.max(0, bottom - top) });
  if (right < width) pads.push({ key: 'right', top, left: right, width: width - right, height: Math.max(0, bottom - top) });
  if (bottom < height) pads.push({ key: 'bottom', top: bottom, left: 0, width, height: height - bottom });
  return pads;
}

/**
 * Coach overlay: dimmed pads around a click-through hole, plus a tip bubble.
 */
export function createTutorialOverlay(React) {
  const h = React.createElement;
  return function TutorialOverlay(props) {
    const {
      step, stepIndex, stepCount, t, hole, onSkip, pad = 8,
    } = props;
    const skipRef = React.useRef(null);
    const rootRef = React.useRef(null);
    // Focus: Skip on ordinary steps (note-save keeps the textarea caret). Trap Tab inside
    // the tip, and on note-save inside the tip plus the spotlighted note card, so dock
    // controls under the mask cannot open Clear and replace the tour target.
    React.useEffect(() => {
      if (!step) return undefined;
      const holdsNote = String(step.target || '').endsWith('-note-panel');
      if (!holdsNote) skipRef.current?.focus?.();
      const root = rootRef.current;
      const doc = root?.ownerDocument || (typeof document !== 'undefined' ? document : null);
      if (!doc?.addEventListener) return undefined;
      const notePanel = holdsNote && root?.parentElement?.querySelector
        ? root.parentElement.querySelector(`[data-tour-id="${step.target}"]`)
        : null;
      const focusables = () => {
        const list = [];
        const push = (scope) => {
          if (!scope?.querySelectorAll) return;
          for (const node of scope.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )) list.push(node);
        };
        push(notePanel);
        push(root?.querySelector?.('.eb-tour-tip'));
        return list;
      };
      const onKeyDown = (event) => {
        if (event.key !== 'Tab') return;
        const nodes = focusables();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = doc.activeElement;
        const inside = nodes.includes(active)
          || Boolean(notePanel?.contains?.(active))
          || Boolean(root?.contains?.(active));
        if (event.shiftKey) {
          if (!inside || active === first) { event.preventDefault(); last.focus?.(); }
        } else if (!inside || active === last) {
          event.preventDefault();
          first.focus?.();
        }
      };
      doc.addEventListener('keydown', onKeyDown, true);
      return () => doc.removeEventListener('keydown', onKeyDown, true);
    }, [stepIndex, step?.id, step?.target]);
    if (!step) return null;
    const title = t(step.titleKey);
    const body = t(step.bodyKey);
    const holeStyle = hole ? {
      top: Math.max(0, hole.top - pad),
      left: Math.max(0, hole.left - pad),
      width: hole.width + pad * 2,
      height: hole.height + pad * 2,
    } : null;
    const pads = tourMaskPads(hole, pad);
    // Prefer placing the tip below the hole; fall back above when near the bottom.
    const tipStyle = (() => {
      if (!holeStyle) return { top: '20%', left: '50%', transform: 'translateX(-50%)' };
      const below = holeStyle.top + holeStyle.height + 14;
      const spaceBelow = (typeof window !== 'undefined' ? window.innerHeight : 800) - below;
      if (spaceBelow < 140) {
        return {
          top: Math.max(12, holeStyle.top - 12),
          left: Math.min(holeStyle.left, (typeof window !== 'undefined' ? window.innerWidth : 800) - 320),
          transform: 'translateY(-100%)',
        };
      }
      return {
        top: below,
        left: Math.min(holeStyle.left, (typeof window !== 'undefined' ? window.innerWidth : 800) - 320),
      };
    })();
    return h('div', {
      className: 'eb-tour', ref: rootRef, role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
    },
      pads.map((panel) => h('div', {
        key: panel.key, className: 'eb-tour-mask', 'aria-hidden': true,
        style: {
          top: panel.top, left: panel.left, width: panel.width, height: panel.height,
        },
      })),
      holeStyle && h('div', { className: 'eb-tour-hole', style: holeStyle, 'aria-hidden': true }),
      h('div', { className: 'eb-tour-tip', style: tipStyle },
        h('p', { className: 'eb-tour-progress' }, t('tutorialProgress', { step: stepIndex + 1, total: stepCount })),
        h('h2', null, title),
        h('p', null, body),
        h('div', { className: 'eb-tour-actions' },
          h('button', {
            type: 'button', className: 'eb-tour-skip', ref: skipRef, onClick: onSkip,
          }, t('tutorialSkip')))));
  };
}
