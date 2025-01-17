// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

function isHeaderFile(fileName: string): boolean {
	if(fileName.endsWith('.h') || fileName.endsWith('.hpp')) {
		return true;
	}
	return false;
}

function getPairedFile(currentFile: string, isHeader: boolean): string {
	if(isHeader) {
		return currentFile.replace('.h', '.c');
	} else {
		return currentFile.replace('.c', '.h');
	}
}

async function openPairs(textDocument: vscode.TextDocument) {
	const currentFile = textDocument.fileName;

	console.log(`Opening ${textDocument.fileName}`);
	const isHeader: boolean = isHeaderFile(currentFile);
	const pairedFile: string = getPairedFile(currentFile, isHeader);

	let headerFile: string = currentFile;
	let sourceFile: string = pairedFile;

	if(fs.existsSync(pairedFile)) {
		if(!isHeader) {
			headerFile = pairedFile;
			sourceFile = currentFile;
		}

		const headerDoc = await vscode.workspace.openTextDocument(headerFile);
		await vscode.window.showTextDocument(headerDoc, {
			viewColumn: vscode.ViewColumn.One,
			preserveFocus: true
		});

		const sourceDoc = await vscode.workspace.openTextDocument(sourceFile);
		await vscode.window.showTextDocument(sourceDoc, {
			viewColumn: vscode.ViewColumn.Two,
			preserveFocus: false
		});
	}
	console.log(`Current: ${currentFile}, Paired: ${pairedFile}, IsHeader:${isHeader}`);
}

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('cpp-header-source-pair.openPairs', async () => {
		const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        await openPairs(editor.document);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
