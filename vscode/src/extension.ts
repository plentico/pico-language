import * as vscode from 'vscode';
import * as path from 'path';
import * as html from 'vscode-html-languageservice';
import * as css from 'vscode-css-languageservice';

let extensionPath = '';
let htmlLanguageService: html.LanguageService;
let cssLanguageService: css.LanguageService;

export function activate(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;

    // Initialize language services
    htmlLanguageService = html.getLanguageService();
    cssLanguageService = css.getCSSLanguageService();

    // Check if we should configure file icons
    const config = vscode.workspace.getConfiguration('pico');
    const autoConfigIcons = config.get('autoConfigureFileIcons', true);

    if (autoConfigIcons) {
        configureFileIcons();
    }

    // Configure word-based suggestions
    configureWordBasedSuggestions();

    // Configure HTML/CSS language features for Pico files
    configureLanguageFeatures();

    // Register completion providers
    registerFrontmatterCompletions(context);
    registerControlFlowCompletions(context);
    registerHTMLProviders(context);
    registerCSSProviders(context);

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
        'i', 'p'
    );

    context.subscriptions.push(frontmatterProvider);
}

/**
 * Check if position is inside a <style> block
 */
function isInStyleBlock(document: vscode.TextDocument, position: vscode.Position): boolean {
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
function registerControlFlowCompletions(context: vscode.ExtensionContext) {
    const controlFlowProvider = vscode.languages.registerCompletionItemProvider(
        'pico',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // Don't show control flow snippets inside style blocks or frontmatter
                if (isInStyleBlock(document, position) || isInFrontmatter(document, position)) {
                    return undefined;
                }

                const lineText = document.lineAt(position).text;
                const textBeforeCursor = lineText.substring(0, position.character);

                // Only provide completions if the character immediately before cursor is '{'
                const lastChar = textBeforeCursor.slice(-1);
                if (lastChar !== '{') {
                    return undefined;
                }

                const completions: vscode.CompletionItem[] = [];

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
        '{'
    );

    context.subscriptions.push(controlFlowProvider);
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
                const materialPath = materialIconTheme.extensionPath;
                const ourIconPath = path.join(extensionPath, 'icons', 'pico');

                const relativePath = path.relative(
                    path.join(materialPath, 'dist'),
                    ourIconPath
                ).replace(/\\/g, '/');

                const newAssociations = {
                    ...currentAssociations,
                    '*.pico': relativePath
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

    if (currentValue !== targetValue) {
        try {
            await editorConfig.update('wordBasedSuggestions', targetValue, vscode.ConfigurationTarget.Global, true);
        } catch (err) {
            console.error('Pico: Failed to configure word-based suggestions', err);
        }
    }
}

/**
 * Register HTML completion providers for Pico files.
 * This provides HTML tag suggestions and closing tag completion.
 */
function registerHTMLProviders(context: vscode.ExtensionContext) {
    // Register HTML completion provider
    const htmlCompletionProvider = vscode.languages.registerCompletionItemProvider(
        'pico',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                console.log('HTML completion provider triggered at position:', position.line, position.character);
                
                // Don't provide completions in frontmatter or style blocks
                if (isInFrontmatter(document, position)) {
                    console.log('In frontmatter, skipping HTML completions');
                    return undefined;
                }
                
                if (isInStyleBlock(document, position)) {
                    console.log('In style block, skipping HTML completions');
                    return undefined;
                }

                const lineText = document.lineAt(position).text;
                const textBeforeCursor = lineText.substring(0, position.character);
                
                // Check if we're typing a closing tag first
                const typingClosingTag = textBeforeCursor.endsWith('</');
                const justTypedLessThan = textBeforeCursor.match(/<\s*$/);
                
                if (typingClosingTag || justTypedLessThan) {
                    const openTag = findOpenHTMLTag(document, position);
                    if (openTag) {
                        const completion = new vscode.CompletionItem(
                            typingClosingTag ? openTag : `/${openTag}`,
                            vscode.CompletionItemKind.Property
                        );
                        completion.detail = `Close <${openTag}> tag`;
                        completion.insertText = typingClosingTag ? `${openTag}>` : `/${openTag}>`;
                        completion.sortText = '!';
                        completion.preselect = true;
                        
                        // Also return HTML completions alongside closing tag
                        const text = document.getText();
                        const htmlDocument = htmlLanguageService.parseHTMLDocument(
                            html.TextDocument.create(document.uri.toString(), 'html', document.version, text)
                        );

                        const htmlCompletions = htmlLanguageService.doComplete(
                            html.TextDocument.create(document.uri.toString(), 'html', document.version, text),
                            position,
                            htmlDocument
                        );

                        const results = [completion];
                        
                        if (htmlCompletions && htmlCompletions.items.length > 0) {
                            const htmlItems = htmlCompletions.items.map(item => {
                                const comp = new vscode.CompletionItem(
                                    item.label,
                                    item.kind as unknown as vscode.CompletionItemKind
                                );
                                comp.detail = item.detail;
                                if (item.documentation) {
                                    if (typeof item.documentation === 'string') {
                                        comp.documentation = new vscode.MarkdownString(item.documentation);
                                    } else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
                                        comp.documentation = new vscode.MarkdownString(item.documentation.value);
                                    }
                                }
                                comp.sortText = item.sortText;
                                comp.filterText = item.filterText;
                                comp.insertText = item.insertText || item.label;
                                return comp;
                            });
                            results.push(...htmlItems);
                        }
                        
                        return results;
                    }
                }

                // Regular HTML completions
                const text = document.getText();
                const htmlDocument = htmlLanguageService.parseHTMLDocument(
                    html.TextDocument.create(document.uri.toString(), 'html', document.version, text)
                );

                // Get completions from HTML language service
                const htmlCompletions = htmlLanguageService.doComplete(
                    html.TextDocument.create(document.uri.toString(), 'html', document.version, text),
                    position,
                    htmlDocument
                );

                console.log('HTML completions found:', htmlCompletions?.items.length || 0);

                if (!htmlCompletions || htmlCompletions.items.length === 0) {
                    console.log('No HTML completions available');
                    return undefined;
                }

                // Convert HTML language service completions to VS Code completions
                const results = htmlCompletions.items.map(item => {
                    const completion = new vscode.CompletionItem(
                        item.label,
                        item.kind as unknown as vscode.CompletionItemKind
                    );
                    completion.detail = item.detail;
                    if (item.documentation) {
                        if (typeof item.documentation === 'string') {
                            completion.documentation = new vscode.MarkdownString(item.documentation);
                        } else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
                            completion.documentation = new vscode.MarkdownString(item.documentation.value);
                        }
                    }
                    completion.sortText = item.sortText;
                    completion.filterText = item.filterText;
                    completion.insertText = item.insertText || item.label;
                    return completion;
                });
                
                console.log('Returning', results.length, 'HTML completion items');
                return results;
            }
        },
        '<', '/', 'd', 'h', 'p', 's', 'a', 'b', 'i', 'u', 'l', 'f', 't', 'm', 'n', 'o', 'c', 'e', 'g', 'r', 'v', 'w'
    );

    console.log('HTML completion provider registered');
    context.subscriptions.push(htmlCompletionProvider);
}

/**
 * Register CSS completion providers for Pico files.
 * This provides CSS property and value suggestions inside style blocks.
 */
function registerCSSProviders(context: vscode.ExtensionContext) {
    const cssCompletionProvider = vscode.languages.registerCompletionItemProvider(
        'pico',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // Only provide completions inside style blocks
                if (!isInStyleBlock(document, position)) {
                    return undefined;
                }

                // Extract just the CSS content from the style block
                const text = document.getText();
                const lines = text.split('\n');
                let styleStart = -1;
                let styleContent = '';
                let lineOffset = 0;

                for (let i = 0; i < lines.length; i++) {
                    if (/<style[^>]*>/i.test(lines[i])) {
                        styleStart = i;
                        lineOffset = i + 1;
                        continue;
                    }
                    if (styleStart !== -1) {
                        if (/<\/style>/i.test(lines[i])) {
                            break;
                        }
                        styleContent += lines[i] + '\n';
                    }
                }

                if (styleStart === -1) {
                    return undefined;
                }

                // Adjust position relative to CSS content
                const cssPosition = new vscode.Position(
                    position.line - lineOffset,
                    position.character
                );

                // Create CSS document
                const cssDocument = css.TextDocument.create(
                    document.uri.toString() + '.css',
                    'css',
                    document.version,
                    styleContent
                );

                const stylesheet = cssLanguageService.parseStylesheet(cssDocument);

                // Get CSS completions
                const cssCompletions = cssLanguageService.doComplete(
                    cssDocument,
                    cssPosition,
                    stylesheet
                );

                if (!cssCompletions || cssCompletions.items.length === 0) {
                    return undefined;
                }

                // Convert CSS completions to VS Code completions
                return cssCompletions.items.map((item: css.CompletionItem) => {
                    const completion = new vscode.CompletionItem(
                        item.label,
                        item.kind as unknown as vscode.CompletionItemKind
                    );
                    completion.detail = item.detail;
                    if (item.documentation) {
                        if (typeof item.documentation === 'string') {
                            completion.documentation = new vscode.MarkdownString(item.documentation);
                        } else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
                            completion.documentation = new vscode.MarkdownString(item.documentation.value);
                        }
                    }
                    completion.sortText = item.sortText;
                    completion.filterText = item.filterText;
                    completion.insertText = item.insertText || item.label;
                    return completion;
                });
            }
        },
        ':', ' ', '\n' // Trigger characters for CSS
    );

    context.subscriptions.push(cssCompletionProvider);
}

/**
 * Find the most recent unclosed HTML tag before the current position
 */
function findOpenHTMLTag(document: vscode.TextDocument, position: vscode.Position): string | null {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    
    // Stack to track open tags
    const stack: string[] = [];
    
    // Match opening and closing tags (ignore self-closing and Pico components)
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    let match;
    
    while ((match = tagRegex.exec(text)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1].toLowerCase();
        
        // Skip self-closing tags
        if (fullMatch.endsWith('/>')) {
            continue;
        }
        
        // Skip void/self-closing HTML elements
        const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                              'link', 'meta', 'param', 'source', 'track', 'wbr'];
        if (voidElements.includes(tagName)) {
            continue;
        }
        
        // Closing tag
        if (fullMatch.startsWith('</')) {
            // Pop from stack if it matches
            if (stack.length > 0 && stack[stack.length - 1] === tagName) {
                stack.pop();
            }
        } else {
            // Opening tag
            stack.push(tagName);
        }
    }
    
    // Return the most recent unclosed tag
    return stack.length > 0 ? stack[stack.length - 1] : null;
}

/**
 * Configure HTML and CSS language features for Pico files.
 * This enables HTML tag completion and CSS completions.
 */
async function configureLanguageFeatures() {
    try {
        // Disable Emmet for Pico files (users prefer regular HTML suggestions)
        const emmetConfig = vscode.workspace.getConfiguration('emmet');
        const includeLanguages = emmetConfig.get<Record<string, string>>('includeLanguages') || {};
        
        // Remove pico from Emmet if it was added
        if (includeLanguages['pico']) {
            delete includeLanguages['pico'];
            await emmetConfig.update('includeLanguages', includeLanguages, vscode.ConfigurationTarget.Global);
        }

    } catch (err) {
        console.error('Pico: Failed to configure language features', err);
    }
}

export function deactivate() {}
