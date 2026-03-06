import * as vscode from 'vscode';
import * as path from 'path';

let extensionPath = '';

export function activate(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;

    // Check if we should configure file icons
    const config = vscode.workspace.getConfiguration('pico');
    const autoConfigIcons = config.get('autoConfigureFileIcons', true);

    if (autoConfigIcons) {
        configureFileIcons();
    }

    // Configure word-based suggestions
    configureWordBasedSuggestions();

    // Register frontmatter completion provider
    registerFrontmatterCompletions(context);

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('pico.enableWordBasedSuggestions')) {
                configureWordBasedSuggestions();
            }
        })
    );

    // Register command to manually configure icons
    context.subscriptions.push(
        vscode.commands.registerCommand('pico.configureFileIcons', configureFileIcons)
    );
}

/**
 * Register completion provider for frontmatter-specific snippets (import, prop)
 * These should only appear when cursor is inside the frontmatter section (between --- lines)
 */
function registerFrontmatterCompletions(context: vscode.ExtensionContext) {
    const frontmatterProvider = vscode.languages.registerCompletionItemProvider(
        'pico',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                if (!isInFrontmatter(document, position)) {
                    return undefined;
                }

                const completions: vscode.CompletionItem[] = [];

                // Import snippet
                const importItem = new vscode.CompletionItem('import', vscode.CompletionItemKind.Snippet);
                importItem.detail = 'Pico import statement';
                importItem.documentation = new vscode.MarkdownString('Import a component from another file');
                importItem.insertText = new vscode.SnippetString('import ${1:Component} from "./${2:component}.html";');
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
        'i', 'p'
    );

    context.subscriptions.push(frontmatterProvider);
}

/**
 * Check if the current cursor position is inside the frontmatter section.
 * Frontmatter is defined as content between two --- lines at the start of the file.
 */
function isInFrontmatter(document: vscode.TextDocument, position: vscode.Position): boolean {
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
            } else {
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
            const currentAssociations = config.get<Record<string, string>>('files.associations') || {};

            // Only add if not already configured
            if (!currentAssociations['*.pico']) {
                // Calculate relative path from Material Icons dist folder to our icons
                // Material Icons loads from: ~/.vscode/extensions/PKief.material-icon-theme-x.x.x/dist/
                // Our icon is at: ~/.vscode/extensions/plentico.pico-language-x.x.x/icons/pico.svg
                const materialPath = materialIconTheme.extensionPath;
                const ourIconPath = path.join(extensionPath, 'icons', 'pico');

                // Compute relative path from Material Icons dist folder to our icon
                const relativePath = path.relative(
                    path.join(materialPath, 'dist'),
                    ourIconPath
                ).replace(/\\/g, '/'); // Use forward slashes for cross-platform

                const newAssociations = {
                    ...currentAssociations,
                    '*.pico': relativePath  // e.g., "../../plentico.pico-language-0.0.5/icons/pico"
                };

                await config.update('files.associations', newAssociations, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Pico: Configured Material Icon Theme with custom Pico icon. Restart VS Code to apply.');
            }
        } catch (err) {
            console.error('Pico: Failed to configure Material Icon Theme', err);
        }
        return;
    }

    // Check for vscode-icons
    const vsCodeIcons = vscode.extensions.getExtension('vscode-icons-team.vscode-icons');

    if (vsCodeIcons) {
        try {
            const config = vscode.workspace.getConfiguration('vsicons');
            const associations = config.get<any[]>('associations.files') || [];

            // Only add if not already configured
            const hasPico = associations.some((a: any) => a.extensions?.includes('pico'));
            if (!hasPico) {
                associations.push({
                    icon: 'html',
                    extensions: ['pico'],
                    format: 'svg'
                });

                await config.update('associations.files', associations, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Pico: Configured vscode-icons for .pico files. Reload window to apply.');
            }
        } catch (err) {
            console.error('Pico: Failed to configure vscode-icons', err);
        }
        return;
    }

    // No supported icon theme found
    vscode.window.showInformationMessage(
        'Pico: No supported icon theme detected. Install Material Icon Theme or vscode-icons for .pico file icons.'
    );
}

async function configureWordBasedSuggestions() {
    const picoConfig = vscode.workspace.getConfiguration('pico');
    const enableWordBased = picoConfig.get('enableWordBasedSuggestions', false);

    const editorConfig = vscode.workspace.getConfiguration('editor', { languageId: 'pico' });
    const currentValue = editorConfig.get('wordBasedSuggestions');
    const targetValue = enableWordBased ? 'matchingDocuments' : 'off';

    // Only update if the value differs from what we want
    if (currentValue !== targetValue) {
        try {
            await editorConfig.update('wordBasedSuggestions', targetValue, vscode.ConfigurationTarget.Global, true);
        } catch (err) {
            console.error('Pico: Failed to configure word-based suggestions', err);
        }
    }
}

export function deactivate() {}
