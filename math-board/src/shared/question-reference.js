// Read only already-visible, finalized conversation text. This is a reference
// picker, not a question detector: never parse reasoning, tools, attachments or
// drafts, and never interpret text as board/settings/task-switch instructions.
export function boardQuestionReferences(chat) {
  if (!Array.isArray(chat?.order) || typeof chat?.nodes?.get !== 'function') return [];
  const references = [];
  for (const key of chat.order) {
    const node = chat.nodes.get(key);
    if (node?.visibility !== 'visible') continue;
    if (node.kind !== 'assistant-step' || node.data?.status !== 'settled' || !node.data.finalNode) continue;
    const text = (node.data.blocks || []).filter((block) => block.kind === 'text' && typeof block.text === 'string').map((block) => block.text).join('');
    // Display only: remove blank lines, preserving nonblank lines, their
    // indentation and Markdown hard breaks. Never flatten authored newlines.
    const displayText = text.split(/\r\n|[\r\n\u2028\u2029]/).filter((line) => line.trim()).join('\n');
    if (displayText) references.push({ key, role: 'assistant', text: displayText });
  }
  return references;
}
