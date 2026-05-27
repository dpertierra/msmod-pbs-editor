import { PbsEditor } from './editor.js';

let _dialog = null;
let _cleanup = null;
let _editor = null;
let _ctx = null;

function interceptClose(dialog, ctx) {
  const doClose = dialog.close.bind(dialog);
  const checkAndClose = () => {
    if (_editor && _editor.dirty.size > 0) {
      ctx.ui.showConfirmDialog({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Close anyway?',
        danger: true,
      }).then(confirmed => {
        if (confirmed) { _editor = null; doClose(); }
      });
      return;
    }
    _editor = null;
    doClose();
  };
  dialog.close = checkAndClose;

  requestAnimationFrame(() => {
    const dialogEl = document.querySelector('[data-dialog-role="close"]') ||
      document.querySelector('.pbs-root')?.closest('.dialog-overlay, [role="dialog"]')?.querySelector('[class*="close"]');
    if (dialogEl) {
      dialogEl.addEventListener('click', (e) => { e.stopPropagation(); checkAndClose(); });
    }
  });
}

function openPbsEditor(ctx) {
  if (_dialog) return;
  _ctx = ctx;
  _dialog = ctx.ui.showCustomDialog({
    title: 'PBS Editor',
    width: '92vw',
    height: '88vh',
    render(body) {
      _editor = new PbsEditor(ctx, body);
      _cleanup = () => {};
      return () => { _editor = null; _cleanup = null; _dialog = null; };
    },
  });
  interceptClose(_dialog, ctx);
}

export function activate(ctx) {
  ctx.menu.registerMenuItem({
    menu: 'Mods',
    label: 'PBS Editor...',
    shortcut: 'Ctrl+Shift+P',
    handler: () => openPbsEditor(ctx),
  });
}

export function deactivate() {
  if (_dialog) { _dialog.close(); _dialog = null; }
  _cleanup = null;
  _editor = null;
}
