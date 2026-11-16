// What both board tabs share with the browser rather than with each other: the line-icon
// map, the File System Access pickers, and the "last file" memory. Neither page keeps its
// own copy, so a saved or opened board behaves the same in the quantity and geometry tabs.
//
// These factories return runtime objects (functions and refs), so build.mjs cannot inline
// them; client.js calls them with the live `React` and `t`.

/** Single source for the 24×24 stroke icons drawn by the toolbars of both tabs. */
export const BOARD_ICONS = {
  // Toolbar and menu actions both tabs draw.
  undo: 'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',
  redo: 'm15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12',
  note: 'M20 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 18 0ZM7 10h8M7 14h5',
  trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
  clear: 'm18 3-7 9m-3-2 7 4-4 7H3l2-10 3-1Zm-1 6-2 5m6-3-2 3M2 21h13',
  // Quantity page.
  back: 'M19 12H5m6-6-6 6 6 6',
  group: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z',
  ungroup: 'M3 3h5v5H3zM16 16h5v5h-5zM3 16h5v5H3zM16 3h5v5h-5z',
  copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
  merge: 'M4 18 10 12M4 12h6v6M20 6l-6 6M14 12h6V6',
  split: 'M10 4 4 10M4 4h6v6M14 20l6-6M20 20h-6v-6',
  cross: 'M4 12h16',
  name: 'm4 16 11-11 4 4L8 20H4Zm9-9 4 4',
  multi: 'M3 3h8v8H3zM13 13h8v8h-8zM17 3v8M13 7h8',
  check: 'm5 12 4 4L19 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  open: 'M3 7h6l2 3h10l-3 10H3ZM3 7V4h6l2 3h8v3',
  save: 'M4 3h13l3 3v15H4ZM8 3v6h8V3M8 21v-7h8v7',
  insert: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  library: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  // Geometry page.
  select: 'M5 3l14 8-6 1.5L11 19z',
  point: 'M12 6a6 6 0 1 0 .01 0',
  segment: 'M5 19 19 5',
  triangle: 'M12 3 21 20H3z',
  polygon: 'M12 3 21 9.5 18 20H6L3 9.5z',
  circle: 'M12 4a8 8 0 1 1 0 16a8 8 0 1 1 0-16',
  parallelogram: 'M3 18 8 6h13l-5 12z',
  rectangle: 'M4 6h16v12H4z',
  midpoint: 'M5 17 19 7',
};

export function createBoardIcons(React, fallback = 'group') {
  const h = React.createElement;
  // Literal, not the module-level BOARD_ICONS: build.mjs inlines only this function's
  // source, so anything declared outside it would be undefined in client.js.
  const paths = {
    undo: 'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',
    redo: 'm15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12',
    note: 'M20 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 18 0ZM7 10h8M7 14h5',
    trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
    clear: 'm18 3-7 9m-3-2 7 4-4 7H3l2-10 3-1Zm-1 6-2 5m6-3-2 3M2 21h13',
    back: 'M19 12H5m6-6-6 6 6 6',
    group: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z',
    ungroup: 'M3 3h5v5H3zM16 16h5v5h-5zM3 16h5v5H3zM16 3h5v5h-5z',
    copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
    merge: 'M4 18 10 12M4 12h6v6M20 6l-6 6M14 12h6V6',
    split: 'M10 4 4 10M4 4h6v6M14 20l6-6M20 20h-6v-6',
    cross: 'M4 12h16',
    name: 'm4 16 11-11 4 4L8 20H4Zm9-9 4 4',
    multi: 'M3 3h8v8H3zM13 13h8v8h-8zM17 3v8M13 7h8',
    check: 'm5 12 4 4L19 6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    open: 'M3 7h6l2 3h10l-3 10H3ZM3 7V4h6l2 3h8v3',
    save: 'M4 3h13l3 3v15H4ZM8 3v6h8V3M8 21v-7h8v7',
    insert: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    library: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
    select: 'M5 3l14 8-6 1.5L11 19z',
    segment: 'M5 19 19 5',
    triangle: 'M12 3 21 20H3z',
    polygon: 'M12 3 21 9.5 18 20H6L3 9.5z',
    circle: 'M12 4a8 8 0 1 1 0 16a8 8 0 1 1 0-16',
    parallelogram: 'M3 18 8 6h13l-5 12z',
    rectangle: 'M4 6h16v12H4z',
    // A big A is the whole of the text tool: it names writing, not a shape.
    text: 'M5 20 12 4l7 16M8 14h8',
    edit: 'm4 20 1-5L16 4l4 4L9 19Z',
  };
  const frame = (size) => ({
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  });
  // Point and midpoint are not single strokes: a point is a solid disc, and a midpoint
  // is the segment itself with the middle marked, so the button reads as that action.
  const marks = {
    point: (size) => h('svg', { ...frame(size), fill: 'currentColor', stroke: 'none' },
      h('circle', { cx: 12, cy: 12, r: 6, fill: 'currentColor', stroke: 'none' })),
    midpoint: (size) => h('svg', frame(size),
      h('path', { d: 'M5 17 19 7' }),
      h('circle', { cx: 5, cy: 17, r: 1.6, fill: 'currentColor', stroke: 'none' }),
      h('circle', { cx: 19, cy: 7, r: 1.6, fill: 'currentColor', stroke: 'none' }),
      h('circle', { cx: 12, cy: 12, r: 3.2, fill: 'currentColor', stroke: 'none' })),
  };
  return function icon(name, size = 18) {
    if (marks[name]) return marks[name](size);
    return h('svg', frame(size), h('path', { d: paths[name] || paths[fallback] }));
  };
}


/**
 * The two tabs' shared side of file save/open, parameterised per tab. Everything that
 * differs (the JSON to write, the draft to replace, the locutions) arrives as a callback,
 * so the picker options, the abort/permission fallbacks, the 256 KB cap and the
 * remembered last file exist once.
 *
 * @param {object} options
 * @param {object}   options.React        host React (createElement, useRef, useState).
 * @param {function} options.t            locale lookup for this tab's copy.
 * @param {string}   options.dbName       IndexedDB database (both tabs share one store).
 * @param {string}   options.handleKey    IndexedDB key for this tab's last file handle.
 * @param {string}   [options.attachmentKey='attachmentName']  locale key for the suggested
 *   file name; the geometry tab passes its own.
 * @param {function} options.read         () => JSON text to save.
 * @param {function} options.load         async (file: File) => void; replace this tab's draft.
 *   Throw to report a failed import.
 * @param {function} [options.onLoaded]   () => boolean; after `load`, false to stop (a
 *   newer open or edit has landed meanwhile).
 * @param {function} [options.stale]     (revision) => boolean; true when the open was
 *   superseded while the browser dialog was up (the tab's revision counter).
 * @param {function} [options.canEdit]   () => boolean; false when the other tab owns
 *   the draft; then the ordinary file input is not used either.
 * @param {function} [options.canAcceptFile] (epoch) => boolean; false when a file chosen
 *   before a clear must not replace the newer draft.
 * @param {function} [options.describe]  (error) => string; the tab's failure sentence
 *   (`failed: message` for the quantity page; the geometry page names a cross-mode file).
 * @param {function} [options.beforeOpen] runs at the start of every open (close menus).
 * @param {object}   [options.anchor]    React ref for a rendered download `<a>`; without
 *   it the module creates and discards an anchor per download.
 * @returns {{
 *   fileInputRef: object, downloadAnchorRef: object | null, fileHandleRef: object,
 *   fileNameState: string,
 *   rememberName: () => Promise<void> | undefined,
 *   saveFile: () => Promise<{ok: boolean, message?: string}>,
 *   openFile: (options?: {revision?: *}) => Promise<{ok: boolean, message?: string}>,
 *   importInput: (event, options?: {revision?: *}) => Promise<{ok: boolean, message?: string}>,
 *   overlayBlocksKey: (overlay: *, event: *) => boolean,
 * }}
 */
export function createBoardFilePicker(options) {
  // Declared here, not at module scope: build.mjs inlines only this function's source,
  // so a module-level constant would be a ReferenceError in client.js the first time a
  // student opened the dialog.
  const JSON_TYPES = [{ description: 'JSON', accept: { 'application/json': ['.json'] } }];
  const FALLBACK_ERRORS = ['NotAllowedError', 'SecurityError', 'NotSupportedError'];
  const MAX_FILE_BYTES = 262144;
  const { React, t, dbName, handleKey, attachmentKey = 'attachmentName', read, load } = options;
  const onLoaded = options.onLoaded || (() => true);
  const stale = options.stale || (() => false);
  const canEdit = options.canEdit || (() => true);
  const acceptFile = options.canAcceptFile || (() => true);
  const describe = options.describe || ((error) => `${t('failed')}: ${error.message}`);
  const beforeOpen = options.beforeOpen || (() => {});
  const saveName = () => t(attachmentKey);
  const [fileNameState, setFileNameState] = React.useState('');
  const fileInputRef = React.useRef(null);
  const downloadAnchorRef = React.useRef(null);
  const fileHandleRef = React.useRef(null);

  function openFileDb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('unsupported'));
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('files')) request.result.createObjectStore('files');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function readRememberedHandle() {
    const db = await openFileDb();
    try {
      return await new Promise((resolve, reject) => {
        const request = db.transaction('files', 'readonly').objectStore('files').get(handleKey);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  }
  async function rememberHandle(handle) {
    const db = await openFileDb();
    try {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('files', 'readwrite');
        transaction.objectStore('files').put(handle, handleKey);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
  }
  async function allowHandle(handle, mode) {
    try {
      const grant = { mode };
      if (await handle.queryPermission(grant) === 'granted') return true;
      return await handle.requestPermission(grant) === 'granted';
    } catch { return false; }
  }
  function useHandle(handle) {
    fileHandleRef.current = handle;
    setFileNameState(handle?.name || '');
  }

  // Remembering is best effort: a lost memory only changes where the next dialog starts.
  // It is awaited rather than raced, because the open picker may need it in the same tick.
  async function remember() {
    try {
      const handle = await readRememberedHandle();
      if (handle && !fileHandleRef.current) useHandle(handle);
    } catch { /* no IndexedDB, or no memory yet */ }
  }

  /**
   * Write the current draft to its remembered file, or ask for a new one, or download.
   * The memory is read right before the picker, so a save on a fresh mount still starts
   * at the student's file instead of losing that place.
   */
  async function saveFile() {
    // The text is read before any await so the save reflects the draft as it was when
    // the student asked; downloads below reuse it instead of re-reading a newer board.
    const text = await read();
    const picker = typeof window !== 'undefined' ? window.showSaveFilePicker : null;

    if (picker) {
      await remember();
      try {
        let handle = fileHandleRef.current;
        if (handle && await allowHandle(handle, 'readwrite')) {
          const writable = await handle.createWritable();
          await writable.write(text); await writable.close();
          return { ok: true, message: t('fileSaved') };
        }
        handle = await picker({ suggestedName: saveName(), types: JSON_TYPES });
        const writable = await handle.createWritable();
        await writable.write(text); await writable.close();
        useHandle(handle);
        try { await rememberHandle(handle); } catch { /* remembering is best effort */ }
        return { ok: true, message: t('fileSaved') };
      } catch (error) {
        if (error?.name === 'AbortError') return { ok: false };
        // A browser that exposes the API can still refuse it (permissions, embedded view).
      }
    }
    // A refused write already wrote nothing, so the text read before the attempt is the
    // draft; the download carries the same JSON the write would have.
    const plain = text;
    // createObjectURL is taken before any await: a page may stub the URL API for one
    // synchronous call, and the await above has already left that stack.
    const create = URL.createObjectURL;
    const url = create(new Blob([plain], { type: 'application/json' }));
    // The quantity page renders its own hidden anchor; the geometry page gets one per
    // download, because no anchor outlives a page that may be unmounted.
    const anchor = options.anchor ? downloadAnchorRef.current : globalThis.document?.createElement?.('a');


    if (anchor) {
      anchor.href = url; anchor.download = saveName(); anchor.click();
    }
    if (!options.anchor) URL.revokeObjectURL(url);

    return { ok: true, message: t('fileDownloaded') };
  }

  /**
   * Open a board JSON. `options.revision` is this tab's revision counter: a superseded
   * open never replaces a newer draft. The remembered handle is passed as `startIn`, so
   * both tabs resume from the student's last file instead of a plain dialog.
   */
  async function openFile({ revision = null, epoch = null } = {}) {
    // An open started before a clear belongs to the old draft and must not replace it.
    if (!acceptFile(epoch)) return { ok: false, message: t('failed') };
    // The pages' own open handler runs while the picker is up, so it settles before the
    // file can arrive (a menu closes at once; a draft write is queued under the lock).
    const opening = beforeOpen();
    const current = () => revision === null || !stale(revision);
    if (typeof window !== 'undefined' && window.showOpenFilePicker) {
      await remember();
      try {
        const choices = { multiple: false, types: JSON_TYPES };
        // startIn only accepts a handle the browser still knows; retry without it rather
        // than losing the open dialog to a TypeError.
        if (fileHandleRef.current) choices.startIn = fileHandleRef.current;
        let handles;
        try { handles = await window.showOpenFilePicker(choices); }
        catch (error) {
          if (error?.name === 'TypeError' && choices.startIn) { delete choices.startIn; handles = await window.showOpenFilePicker(choices); }
          else throw error;
        }
        const handle = handles?.[0];
        if (!handle || !current()) return { ok: false };
        const file = await handle.getFile();
        if (!current()) return { ok: false };
        await importFile(file, epoch);
        if (!onLoaded()) return { ok: false };
        useHandle(handle);
        try { await rememberHandle(handle); } catch { /* remembering is best effort */ }
        return { ok: true };
      } catch (error) {
        if (error?.name === 'AbortError') return { ok: false };
        // A failed import keeps the tab's own sentence; a refused picker falls back.
        if (!FALLBACK_ERRORS.includes(error?.name)) return { ok: false, message: describe(error) };
        // Permission denial must not prevent opening an ordinary local file.
      }
    }
    if (!current() || !canEdit()) return { ok: false };
    await opening;
    fileInputRef.current?.click();
    return { ok: false, message: t('fileOpenFallback') };
  }

  async function importFile(file, epoch = null) {
    if (file.size > MAX_FILE_BYTES) throw Error(t('fileTooLarge'));
    // The page validates and replaces its own draft; its epoch check may still refuse.
    await load(file, epoch);
  }

  async function importInput(event, { revision = null, epoch = null } = {}) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || (revision !== null && stale(revision))) return { ok: false };
    if (!acceptFile(epoch)) return { ok: false, message: t('failed') };
    try { await importFile(file); return { ok: true }; }
    catch (error) {
      // The page showed the loading error itself; the handoff hint, not, would replace it.
      if (error?.name === 'AbortError') return { ok: false };
      return { ok: false, message: describe(error) };
    }
  }

  // The focus guard both pages need: an overlay claims `aria-modal`, so Delete and
  // Backspace must not reach the canvas underneath it. The page marks the event handled.
  function overlayBlocksKey(overlay, event) {
    return Boolean(overlay) && (event.key === 'Delete' || event.key === 'Backspace');
  }

  return {
    fileInputRef, downloadAnchorRef, fileHandleRef,
    fileNameState, rememberName: remember, saveFile, openFile, importInput, overlayBlocksKey,
  };
}
