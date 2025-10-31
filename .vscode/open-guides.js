// .vscode/open-guides.js
// 🔹 Automatically opens and pins Markdown reference guides when VS Code starts
// Designed for LegalOps + Augment + Claude Sonnet 4.5 environment

const vscode = require('vscode');

/**
 * This function runs automatically when the workspace activates.
 * It opens AUGMENT_COMMAND_CHEATSHEET.md and RUN_SEQUENCE_GUIDE.md
 * and pins them in the editor for quick access.
 */
function activate(context) {
  const guides = [
    'AUGMENT_COMMAND_CHEATSHEET.md',
    'RUN_SEQUENCE_GUIDE.md'
  ];

  guides.forEach(async (fileName) => {
    try {
      const uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, fileName);
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, { preview: false });
      await vscode.commands.executeCommand('workbench.action.pinEditor');
      console.log(`📌 Pinned guide: ${fileName}`);
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
