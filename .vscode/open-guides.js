// .vscode/open-guides.js
// 🔹 Automatically opens and pins Markdown reference guides in preview mode when VS Code starts
// Designed for LegalOps + Augment + Claude Sonnet 4.5 environment

const vscode = require('vscode');

/**
 * This function runs automatically when the workspace activates.
 * It opens AUGMENT_COMMAND_CHEATSHEET.md and RUN_SEQUENCE_GUIDE.md
 * side-by-side in Markdown preview mode, and pins them for quick access.
 */
function activate(context) {
  const guides = [
    'AUGMENT_COMMAND_CHEATSHEET.md',
    'RUN_SEQUENCE_GUIDE.md'
  ];

  vscode.commands.executeCommand('workbench.action.closeAllEditors'); // optional: start clean

  guides.forEach(async (fileName, index) => {
    try {
      const uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, fileName);
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: index === 0 ? vscode.ViewColumn.One : vscode.ViewColumn.Two
      });

      // Open Markdown Preview beside each file
      await vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
      await vscode.commands.executeCommand('workbench.action.pinEditor');

      console.log(`📘 Opened + pinned preview: ${fileName}`);
    } catch (err) {
      console.warn(`⚠️ Could not open or pin ${fileName}:`, err.message);
    }
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
