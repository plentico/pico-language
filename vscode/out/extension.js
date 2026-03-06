"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let extensionPath = '';
function activate(context) {
    extensionPath = context.extensionPath;
    // Check if we should configure file icons
    const config = vscode.workspace.getConfiguration('pico');
    const autoConfigIcons = config.get('autoConfigureFileIcons', true);
    if (autoConfigIcons) {
        configureFileIcons();
    }
    // Configure word-based suggestions
    configureWordBasedSuggestions();
    // Register completion providers
    registerFrontmatterCompletions(context);
    registerControlFlowCompletions(context);
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('pico.enableWordBasedSuggestions')) {
            configureWordBasedSuggestions();
        }
    }));
    // Register command to manually configure icons
    context.subscriptions.push(vscode.commands.registerCommand('pico.configureFileIcons', configureFileIcons));
}
/**
 * Register completion provider for frontmatter-specific snippets (import, prop)
 * These should only appear when cursor is inside the frontmatter section (between --- lines)
 */
function registerFrontmatterCompletions(context) {
    const frontmatterProvider = vscode.languages.registerCompletionItemProvider('pico', {
        provideCompletionItems(document, position) {
            if (!isInFrontmatter(document, position)) {
                return undefined;
            }
            const completions = [];
            // Import snippet
            const importItem = new vscode.CompletionItem('import', vscode.CompletionItemKind.Snippet);
            importItem.detail = 'Pico import statement';
            importItem.documentation = new vscode.MarkdownString('Import a component from another file');
            importItem.insertText = new vscode.SnippetString('import ${1:Component} from "./${2:component}.pico";');
            completions.push(importItem);
            // Prop snippet
            const propItem = new vscode.CompletionItem('prop', vscode.CompletionItemKind.Snippet);
            propItem.detail = 'Pico prop declaration';
            propItem.documentation = new vscode.MarkdownString('Declare a component prop with optional default value');
            propItem.insertText = new vscode.SnippetString('prop ${1:name}${2: = ${3:default}};');
            completions.push(propItem);
            return completions;
        }
    }, 
    // Trigger characters
    'i', 'p');
    context.subscriptions.push(frontmatterProvider);
}
/**
 * Check if position is inside a <style> block
 */
function isInStyleBlock(document, position) {
    const text = document.getText();
    const lines = text.split('\n');
    let inStyle = false;
    for (let i = 0; i <= position.line; i++) {
        const line = lines[i];
        // Simple check for style tag open/close
        if (/<style[^>]*>/i.test(line)) {
            inStyle = true;
        }
        if (/<\/style>/i.test(line)) {
            inStyle = false;
        }
    }
    return inStyle;
}
/**
 * Register completion provider for control flow snippets
 * These only trigger when typing '{' followed by specific letters
 */
function registerControlFlowCompletions(context) {
    const controlFlowProvider = vscode.languages.registerCompletionItemProvider('pico', {
        provideCompletionItems(document, position) {
            // Don't show control flow snippets inside style blocks
            if (isInStyleBlock(document, position)) {
                return undefined;
            }
            const lineText = document.lineAt(position).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            // Only provide completions if the character immediately before cursor is '{'
            const lastChar = textBeforeCursor.slice(-1);
            if (lastChar !== '{') {
                return undefined;
            }
            const completions = [];
            // {if snippet - use {if as label so it matches when typing {i
            const ifItem = new vscode.CompletionItem('{if', vscode.CompletionItemKind.Snippet);
            ifItem.detail = 'Pico if block';
            ifItem.documentation = new vscode.MarkdownString('Create an if control flow block');
            ifItem.insertText = new vscode.SnippetString('if ${1:condition}}\n\t$0\n{/if');
            completions.push(ifItem);
            // {ife snippet
            const ifeItem = new vscode.CompletionItem('{ife', vscode.CompletionItemKind.Snippet);
            ifeItem.detail = 'Pico if-else block';
            ifeItem.documentation = new vscode.MarkdownString('Create an if-else control flow block');
            ifeItem.insertText = new vscode.SnippetString('if ${1:condition}}\n\t$2\n{else}\n\t$0\n{/if');
            completions.push(ifeItem);
            // {ifeif snippet
            const ifeifItem = new vscode.CompletionItem('{ifeif', vscode.CompletionItemKind.Snippet);
            ifeifItem.detail = 'Pico if-else if-else block';
            ifeifItem.documentation = new vscode.MarkdownString('Create an if-else if-else control flow block');
            ifeifItem.insertText = new vscode.SnippetString('if ${1:condition}}\n\t$2\n{else if ${3:condition}}\n\t$4\n{else}\n\t$0\n{/if');
            completions.push(ifeifItem);
            // {for snippet
            const forItem = new vscode.CompletionItem('{for', vscode.CompletionItemKind.Snippet);
            forItem.detail = 'Pico for loop';
            forItem.documentation = new vscode.MarkdownString('Create a for loop');
            forItem.insertText = new vscode.SnippetString('for let ${1:item} of ${2:items}}\n\t$0\n{/for');
            completions.push(forItem);
            // {e snippet
            const exprItem = new vscode.CompletionItem('{e', vscode.CompletionItemKind.Snippet);
            exprItem.detail = 'Pico expression';
            exprItem.documentation = new vscode.MarkdownString('Create an expression block');
            exprItem.insertText = new vscode.SnippetString('${1:expression}');
            completions.push(exprItem);
            return completions;
        }
    }, 
    // Only trigger on '{' character
    '{');
    context.subscriptions.push(controlFlowProvider);
}
/**
 * Check if the current cursor position is inside the frontmatter section.
 * Frontmatter is defined as content between two --- lines at the start of the file.
 */
function isInFrontmatter(document, position) {
    const text = document.getText();
    const lines = text.split('\n');
    // Find the first --- line
    let frontmatterStart = -1;
    let frontmatterEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '---') {
            if (frontmatterStart === -1) {
                frontmatterStart = i;
            }
            else {
                frontmatterEnd = i;
                break;
            }
        }
    }
    // If we didn't find both start and end markers, not in frontmatter
    if (frontmatterStart === -1 || frontmatterEnd === -1) {
        return false;
    }
    // Check if current position is between the two markers
    const currentLine = position.line;
    return currentLine > frontmatterStart && currentLine < frontmatterEnd;
}
async function configureFileIcons() {
    // Check for Material Icon Theme (most popular)
    const materialIconTheme = vscode.extensions.getExtension('PKief.material-icon-theme');
    if (materialIconTheme) {
        try {
            const config = vscode.workspace.getConfiguration('material-icon-theme');
            const currentAssociations = config.get('files.associations') || {};
            // Only add if not already configured
            if (!currentAssociations['*.pico']) {
                const materialPath = materialIconTheme.extensionPath;
                const ourIconPath = path.join(extensionPath, 'icons', 'pico');
                const relativePath = path.relative(path.join(materialPath, 'dist'), ourIconPath).replace(/\\/g, '/');
                const newAssociations = {
                    ...currentAssociations,
                    '*.pico': relativePath
                };
                await config.update('files.associations', newAssociations, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Pico: Configured Material Icon Theme with custom Pico icon. Restart VS Code to apply.');
            }
        }
        catch (err) {
            console.error('Pico: Failed to configure Material Icon Theme', err);
        }
        return;
    }
    // Check for vscode-icons
    const vsCodeIcons = vscode.extensions.getExtension('vscode-icons-team.vscode-icons');
    if (vsCodeIcons) {
        try {
            const config = vscode.workspace.getConfiguration('vsicons');
            const associations = config.get('associations.files') || [];
            const hasPico = associations.some((a) => a.extensions?.includes('pico'));
            if (!hasPico) {
                associations.push({
                    icon: 'html',
                    extensions: ['pico'],
                    format: 'svg'
                });
                await config.update('associations.files', associations, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Pico: Configured vscode-icons for .pico files. Reload window to apply.');
            }
        }
        catch (err) {
            console.error('Pico: Failed to configure vscode-icons', err);
        }
        return;
    }
    vscode.window.showInformationMessage('Pico: No supported icon theme detected. Install Material Icon Theme or vscode-icons for .pico file icons.');
}
async function configureWordBasedSuggestions() {
    const picoConfig = vscode.workspace.getConfiguration('pico');
    const enableWordBased = picoConfig.get('enableWordBasedSuggestions', false);
    const editorConfig = vscode.workspace.getConfiguration('editor', { languageId: 'pico' });
    const currentValue = editorConfig.get('wordBasedSuggestions');
    const targetValue = enableWordBased ? 'matchingDocuments' : 'off';
    if (currentValue !== targetValue) {
        try {
            await editorConfig.update('wordBasedSuggestions', targetValue, vscode.ConfigurationTarget.Global, true);
        }
        catch (err) {
            console.error('Pico: Failed to configure word-based suggestions', err);
        }
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map