// One entry with two tabs. The quantity page and the geometry page keep their own
// canvases, draft keys, undo histories, selections and viewports; they share only this
// dialog frame, the question strip and the "add to answer" button, and each tab attaches
// its own file.
import { boardQuestionReferences } from './question-reference.js';

/**
 * Build the tabbed board. Both pages are created once and stay mounted while the dialog
 * is open, so switching tabs never resets a draft or a history.
 *
 * The shell draws the chrome both pages used to draw for themselves (launcher, dialog,
 * brand mark, title). It still has no quantity-board knowledge: the quantity page passes
 * its `mark(size)` in, so the shell paints the same level-coloured mark without knowing
 * what a level is.
 */
export function createTabbedBoardView(React, t, css, quantityPage, geometryPage, mark) {
  const h = React.createElement;
  const QuantityPage = quantityPage();
  const GeometryPage = geometryPage ? geometryPage() : null;
  return function TabbedBoard(props) {
    const [tab, setTab] = React.useState('quantity');
    const [opened, setOpened] = React.useState(false);
    const dialog = React.useRef(null);
    const referenceList = (() => {
      if (!props.useChat) return [];
      try {
        const value = props.useChat((chat) => JSON.stringify(boardQuestionReferences(chat)));
        const parsed = JSON.parse(typeof value === 'string' ? value : '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })();
    const [questionKey, setQuestionKey] = React.useState(null);
    const [questionExpanded, setQuestionExpanded] = React.useState(false);
    const reference = referenceList.find((item) => item.key === questionKey) || referenceList.at(-1);
    React.useEffect(() => { setQuestionExpanded(false); }, [reference?.key]);
    React.useEffect(() => {
      const node = dialog.current;
      if (opened && node && !node.open) node.showModal();
      if (!opened && node && node.open) node.close();
    }, [opened]);
    React.useEffect(() => () => { if (dialog.current?.open) dialog.current.close(); }, []);

    const question = h('aside', { className: 'eb-question', 'aria-label': t('questionTeacher') },
      reference ? h('div', { id: `eb-question-${props.sessionId}`, className: `eb-question-text${questionExpanded ? '' : ' eb-collapsed'}` },
        props.renderFactorySlot?.('conversation.chat.reasoning.content', { text: reference.text, running: false }) ?? reference.text)
        : h('p', { className: 'eb-question-empty' }, t('questionEmpty')),
      reference && h('div', { className: 'eb-question-controls' },
        h('select', {
          'aria-label': t('questionSource'), title: t('questionSource'), value: reference.key,
          onChange: (event) => { setQuestionKey(event.target.value); setQuestionExpanded(false); },
        }, [...referenceList].reverse().map((item) => h('option', { key: item.key, value: item.key },
          item.text.replace(/\s+/g, ' ').slice(0, 48)))),
        h('button', {
          type: 'button', className: 'eb-question-toggle', 'aria-expanded': questionExpanded,
          'aria-controls': `eb-question-${props.sessionId}`, onClick: () => setQuestionExpanded(!questionExpanded),
        }, questionExpanded ? t('questionCollapse') : t('questionExpand'))));
    const brand = (size) => (typeof mark === 'function' ? mark(size) : null);
    // Each page registers the same close 返回对话 uses. A backdrop press calls the
    // visible tab's close, so a note or menu on that tab is put away with the dialog.
    const closers = React.useRef({});
    function requestClose() {
      const closePage = closers.current[tab];
      if (closePage) closePage();
      else setOpened(false);
    }
    // The backdrop hit is delivered to the dialog element, with a point outside its box.
    // A press that starts on the board keeps the dialog up, even if it later ends outside.
    function dismissFromBackdrop(event) {
      if (event.button != null && event.button !== 0) return;
      const node = event.currentTarget;
      if (!node || event.target !== node || typeof node.getBoundingClientRect !== 'function') return;
      const box = node.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientX <= box.right
        && event.clientY >= box.top && event.clientY <= box.bottom;
      if (!inside) requestClose();
    }
    const tabs = h('div', { className: 'eb-tabs', role: 'tablist', 'aria-label': t('tabs') },
      [['quantity', 'tabQuantity'], ['geometry', 'tabGeometry']].map(([name, label]) => h('button', {
        key: name, type: 'button', role: 'tab', id: `eb-tab-${name}`, className: 'eb-tab', 'data-tab': name,
        'aria-selected': tab === name, 'aria-controls': `eb-tabpanel-${name}`,
        onClick: () => setTab(name),
      }, t(label))));
    // The panels carry no `data-tab`: that attribute belongs to the tab buttons alone,
    // so a lookup for a single tab control never matches a panel too.
    const panel = (name, node) => h('div', {
      id: `eb-tabpanel-${name}`, role: 'tabpanel', 'aria-labelledby': `eb-tab-${name}`,
      className: 'eb-tabpanel', hidden: tab !== name,
    }, node);
    return h(React.Fragment, null,
      h('style', null, css),
      h('button', {
        type: 'button', className: 'edu-board-launch', title: t('title'),
        'aria-label': t('title'), 'aria-haspopup': 'dialog', onClick: () => setOpened(true),
      }, brand(18), h('span', null, t('title'))),
      h('dialog', {
        ref: dialog, className: 'eb-dialog', 'aria-label': t('title'),
        onClose: () => setOpened(false),
        onPointerDown: dismissFromBackdrop,
        // Escape never closes the board. The browser fires `cancel` after the page's
        // keydown handler, which drops the current operation (an unfinished line, a
        // drag, a menu, a note). 返回对话 and a primary press on the dimmed area
        // outside this dialog close it.
        onCancel: (event) => { event.preventDefault(); },
      }, h('div', { className: 'eb-workbench' },
        // The pages below were built for a top bar already at the top of the workbench,
        // so the shell's bar keeps that one and hides the page's own copy.
        h('header', { className: 'eb-topbar' }, brand(27), h('span', null, t('title')), tabs, h('span', { className: 'eb-grow' })),
        panel('quantity', h(QuantityPage, {
          ...props, split: true, question, close: () => setOpened(false),
          bindClose: (fn) => { closers.current.quantity = fn; },
          tabActive: opened && tab === 'quantity',
        })),
        GeometryPage && panel('geometry', h(GeometryPage, {
          ...props, split: true, question, close: () => setOpened(false),
          bindClose: (fn) => { closers.current.geometry = fn; },
          tabActive: opened && tab === 'geometry',
        })))));
  };
}
