// What every page of the workbench draws with the same code: the bottom dock's buttons,
// the zoom pair, the more-actions menu row and the status toast, plus the board's colours.
// The quantity, geometry and teacher-demo pages differ in what they put in the dock and
// what a click does, never in how those parts look or behave; a control is fixed here once
// so the three pages cannot drift apart.
//
// build.mjs inlines the factories with toString(), so they use only their own arguments
// and declarations, and return objects instead of importing: the live React and `t` arrive
// from the host.

/**
 * The buttons of a page dock. Takes the live React and `t` and returns the controls as an
 * object, so the pages call the same code instead of each keeping a copy.
 *
 * @returns {{
 *   button: function, iconButton: function, backButton: function, divider: function,
 *   menuItem: function, moreMenu: function, zoomPair: function, status: function, colors: object,
 * }}
 */
export function createBoardControls(React, t) {
  const h = React.createElement;
  // Declared here, not at module scope: build.mjs inlines only this function's source, so
  // a module-level constant would be undefined in client.js. Every page draws with these
  // colours, so all three share one ink and one selection blue.
  const BOARD_COLORS = {
    ink: '#1E293B',
    selection: '#2563EB',
    derived: '#475569',
    preview: '#93C5FD',
  };

  /** A plain button. */
  function button(label, handler, props = {}) {
    return h('button', { type: 'button', onClick: handler, ...props }, label);
  }
  /** A square icon button used by both student docks. */
  function iconButton(handler, label, props = {}) {
    return button(undefined, handler, { title: label, 'aria-label': label, className: 'eb-icon-button', ...props });
  }
  /**
   * The one dock control that leaves the board: the same markup, style class and words on
   * all three pages. `props.icon` is the page's icon factory; a page that has none passes
   * nothing and the control stays text-only.
   */
  function backButton(close, props = {}) {
    const label = t('backToChat');
    return button(h(React.Fragment, null, props.icon?.(16), h('span', { className: 'eb-label' }, label)),
      () => close?.(), { className: 'eb-dock-return', title: label, 'aria-label': label });
  }
  /** The separator between groups of dock controls. */
  function divider() {
    return h('span', { className: 'eb-divider' });
  }
  /** A menu row: icon plus words, the shape every more-actions command uses. */
  function menuItem(drawIcon, label, handler, props = {}) {
    // Always a fragment: the row reads the same whether or not a page draws an icon.
    const parts = typeof drawIcon === 'function' ? [drawIcon(16), h('span', null, label)] : [h('span', null, label)];
    return button(h(React.Fragment, null, ...parts), handler, { role: 'menuitem', ...props });
  }
  /** The more-actions trigger; `toggle` opens or closes the menu the page renders. */
  function moreMenu(open, toggle) {
    return iconButton(toggle, t('moreActions'), {
      className: 'eb-icon-button eb-menu-trigger', 'aria-expanded': open, title: t('moreActions'), 'aria-label': t('moreActions'),
    });
  }
  /**
   * The zoom pair every page docks: − , the fit label, ＋ . A press leaves the fit and steps
   * the zoom inside [min, max]; the label returns to the fit. The step is fixed here so the
   * three pages cannot drift apart, while each page passes the range its canvas supports.
   */
  function zoomPair(state, options = {}) {
    const { min = 1, max = 4, step = 0.25 } = options;
    const { zoom, fit } = state;
    return [
      button('−', () => state.setFit(false, Math.max(min, zoom - step)), {
        className: 'eb-zoom-button eb-zoom-out', 'aria-label': t('zoomOut'), title: t('zoomOut'),
        disabled: zoom <= min,
      }),
      button(fit ? t('fitView') : `${Math.round(zoom * 100)}%`, () => state.setFit(!fit), {
        className: 'eb-zoom-label', 'aria-label': t('fitView'), 'aria-pressed': fit, title: t('fitView'),
      }),
      button('＋', () => state.setFit(false, Math.min(max, zoom + step)), {
        className: 'eb-zoom-button eb-zoom-in', 'aria-label': t('zoomIn'), title: t('zoomIn'),
        disabled: zoom >= max,
      }),
    ];
  }

  /** The status line every page shows for the same few seconds. */
  function status(text) {
    return text ? h('div', { className: 'eb-status-toast', role: 'status', 'aria-live': 'polite' }, text) : null;
  }
  return { ...BOARD_COLORS, colors: BOARD_COLORS, button, iconButton, backButton, divider, menuItem, moreMenu, zoomPair, status };
}
