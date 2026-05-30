import { PbsEditor } from './editor.js';

let _dialog = null;
let _editor = null;

function openPbsEditor(ctx) {
  if (_dialog) return;

  _dialog = ctx.ui.showCustomDialog({
    title: 'PBS Editor',
    width: '92vw',
    height: '88vh',
    render(body) {
      _editor = new PbsEditor(ctx, body);
      return () => { _editor = null; _dialog = null; };
    },
    onCloseRequest: async () => {
      if (!(_editor && _editor.dirty.size > 0)) {
        _dialog.close();
        return;
      }

      const result = await ctx.ui.showUnsavedChangesDialog({
        message: 'You have unsaved changes in the PBS Editor.',
      });

      if (result === 'save') {
        try {
          await _editor.saveAllDirty();
        } catch {
          return;
        }
        _dialog.close();
      } else if (result === 'discard') {
        _dialog.close();
      }
      // 'cancel' → no hacer nada
    },
  });
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
  _editor = null;
}
