// One entry with two tabs. The quantity page and the geometry page keep their own
// canvases, draft keys, undo histories, selections and viewports; they share only this
// dialog frame, the question strip and the "add to answer" button, and each tab attaches
// its own file.
import { boardQuestionReferences } from './question-reference.js';

/**
 * Build the tabbed board. Both pages are created once and stay mounted while the dialog
 * is open, so switching tabs never resets a draft or a history. With one page this is
 * exactly the old single-page board.
 */
export function createTabbedBoardView(React, t, css, quantityPage, geometryPage) {
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
    const tabs = h('div', { className: 'eb-tabs', role: 'tablist', 'aria-label': t('tabs') },
      [['quantity', 'tabQuantity'], ['geometry', 'tabGeometry']].map(([name, label]) => h('button', {
        key: name, type: 'button', role: 'tab', id: `eb-tab-${name}`, className: 'eb-tab', 'data-tab': name,
        'aria-selected': tab === name, 'aria-controls': `eb-tabpanel-${name}`,
        onClick: () => setTab(name),
      }, t(label))));
    const panel = (name, node) => h('div', {
      id: `eb-tabpanel-${name}`, role: 'tabpanel', 'aria-labelledby': `eb-tab-${name}`,
      className: 'eb-tabpanel', hidden: tab !== name,
    }, node);
    return h(React.Fragment, null,
      h('style', null, css),
      h('button', {
        type: 'button', className: 'edu-board-launch', title: t('title'),
        'aria-label': t('title'), 'aria-haspopup': 'dialog', onClick: () => setOpened(true),
      }, h('span', null, t('title'))),
      h('dialog', {
        ref: dialog, className: 'eb-dialog', 'aria-label': t('title'),
        onClose: () => setOpened(false),
        onCancel: (event) => { event.preventDefault(); setOpened(false); },
      }, h('div', { className: 'eb-workbench' },
        h('header', { className: 'eb-topbar' }, h('span', null, t('title')), tabs, h('span', { className: 'eb-grow' })),
        panel('quantity', h(QuantityPage, { ...props, split: true, question, close: () => setOpened(false) })),
        GeometryPage && panel('geometry', h(GeometryPage, { ...props, split: true, question, close: () => setOpened(false) })))));
  };
}
