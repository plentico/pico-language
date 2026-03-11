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
const html = __importStar(require("vscode-html-languageservice"));
const css = __importStar(require("vscode-css-languageservice"));
let extensionPath = '';
let htmlLanguageService;
let cssLanguageService;
function activate(context) {
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
    // Register CSS diagnostics for unused selectors
    registerCSSDiagnostics(context);
    // Register auto-indent fixer for closing tags
    registerAutoIndentFixer(context);
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
/**
 * Register HTML completion providers for Pico files.
 * This provides HTML tag suggestions and closing tag completion.
 */
function registerHTMLProviders(context) {
    // Register HTML completion provider
    const htmlCompletionProvider = vscode.languages.registerCompletionItemProvider('pico', {
        provideCompletionItems(document, position) {
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
                    const completion = new vscode.CompletionItem(typingClosingTag ? openTag : `/${openTag}`, vscode.CompletionItemKind.Property);
                    completion.detail = `Close <${openTag}> tag`;
                    completion.insertText = typingClosingTag ? `${openTag}>` : `/${openTag}>`;
                    completion.sortText = '!';
                    completion.preselect = true;
                    // Also return HTML completions alongside closing tag
                    const text = document.getText();
                    const htmlDocument = htmlLanguageService.parseHTMLDocument(html.TextDocument.create(document.uri.toString(), 'html', document.version, text));
                    const htmlCompletions = htmlLanguageService.doComplete(html.TextDocument.create(document.uri.toString(), 'html', document.version, text), position, htmlDocument);
                    const results = [completion];
                    if (htmlCompletions && htmlCompletions.items.length > 0) {
                        const htmlItems = htmlCompletions.items.map(item => {
                            const comp = new vscode.CompletionItem(item.label, item.kind);
                            comp.detail = item.detail;
                            if (item.documentation) {
                                if (typeof item.documentation === 'string') {
                                    comp.documentation = new vscode.MarkdownString(item.documentation);
                                }
                                else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
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
            const htmlDocument = htmlLanguageService.parseHTMLDocument(html.TextDocument.create(document.uri.toString(), 'html', document.version, text));
            // Get completions from HTML language service
            const htmlCompletions = htmlLanguageService.doComplete(html.TextDocument.create(document.uri.toString(), 'html', document.version, text), position, htmlDocument);
            console.log('HTML completions found:', htmlCompletions?.items.length || 0);
            if (!htmlCompletions || htmlCompletions.items.length === 0) {
                console.log('No HTML completions available');
                return undefined;
            }
            // Convert HTML language service completions to VS Code completions
            const results = htmlCompletions.items.map(item => {
                const completion = new vscode.CompletionItem(item.label, item.kind);
                completion.detail = item.detail;
                if (item.documentation) {
                    if (typeof item.documentation === 'string') {
                        completion.documentation = new vscode.MarkdownString(item.documentation);
                    }
                    else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
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
    }, '<', '/', 'd', 'h', 'p', 's', 'a', 'b', 'i', 'u', 'l', 'f', 't', 'm', 'n', 'o', 'c', 'e', 'g', 'r', 'v', 'w');
    console.log('HTML completion provider registered');
    context.subscriptions.push(htmlCompletionProvider);
}
/**
 * Register CSS completion providers for Pico files.
 * This provides CSS property and value suggestions inside style blocks.
 */
function registerCSSProviders(context) {
    const cssCompletionProvider = vscode.languages.registerCompletionItemProvider('pico', {
        provideCompletionItems(document, position) {
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
            const cssPosition = new vscode.Position(position.line - lineOffset, position.character);
            // Create CSS document
            const cssDocument = css.TextDocument.create(document.uri.toString() + '.css', 'css', document.version, styleContent);
            const stylesheet = cssLanguageService.parseStylesheet(cssDocument);
            // Get CSS completions
            const cssCompletions = cssLanguageService.doComplete(cssDocument, cssPosition, stylesheet);
            if (!cssCompletions || cssCompletions.items.length === 0) {
                return undefined;
            }
            // Convert CSS completions to VS Code completions
            return cssCompletions.items.map((item) => {
                const completion = new vscode.CompletionItem(item.label, item.kind);
                completion.detail = item.detail;
                if (item.documentation) {
                    if (typeof item.documentation === 'string') {
                        completion.documentation = new vscode.MarkdownString(item.documentation);
                    }
                    else if ('kind' in item.documentation && item.documentation.kind === 'markdown') {
                        completion.documentation = new vscode.MarkdownString(item.documentation.value);
                    }
                }
                completion.sortText = item.sortText;
                completion.filterText = item.filterText;
                completion.insertText = item.insertText || item.label;
                return completion;
            });
        }
    }, ':', ' ', '\n' // Trigger characters for CSS
    );
    context.subscriptions.push(cssCompletionProvider);
}
/**
 * Find the most recent unclosed HTML tag before the current position
 */
function findOpenHTMLTag(document, position) {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    // Stack to track open tags
    const stack = [];
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
        }
        else {
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
        const includeLanguages = emmetConfig.get('includeLanguages') || {};
        // Remove pico from Emmet if it was added
        if (includeLanguages['pico']) {
            delete includeLanguages['pico'];
            await emmetConfig.update('includeLanguages', includeLanguages, vscode.ConfigurationTarget.Global);
        }
    }
    catch (err) {
        console.error('Pico: Failed to configure language features', err);
    }
}
/**
 * Parse HTML content and build a DOM tree
 */
function parseHTMLTree(htmlContent) {
    const root = [];
    const stack = [];
    // Remove Pico control flow syntax to simplify parsing
    const cleanedContent = htmlContent
        .replace(/\{[/#]?\w+[^}]*\}/g, '')
        .replace(/\{[^}]+\}/g, '');
    // Match opening tags, closing tags, and void elements
    const tagRegex = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi;
    let match;
    const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr']);
    while ((match = tagRegex.exec(cleanedContent)) !== null) {
        const isClosing = match[1] === '/';
        const tagName = match[2].toLowerCase();
        const attributes = match[3];
        if (isClosing) {
            // Find matching opening tag and close it
            const index = stack.findIndex(el => el.tag === tagName);
            if (index !== -1) {
                stack.splice(index);
            }
        }
        else {
            // Extract classes and id from attributes
            const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
            const idMatch = attributes.match(/id\s*=\s*["']([^"']*)["']/i);
            const element = {
                tag: tagName,
                classes: classMatch ? classMatch[1].split(/\s+/).filter(c => c) : [],
                id: idMatch ? idMatch[1] : null,
                children: []
            };
            // Add to parent's children or root
            if (stack.length > 0) {
                stack[stack.length - 1].children.push(element);
            }
            else {
                root.push(element);
            }
            // Push to stack if not a void element
            if (!voidElements.has(tagName) && !attributes.endsWith('/')) {
                stack.push(element);
            }
        }
    }
    return root;
}
/**
 * Check if a selector part matches an element
 * Handles compound selectors like ".class1.class2" or "tag.class"
 */
function elementMatchesSelector(element, selectorPart) {
    // Universal selector
    if (selectorPart === '*') {
        return true;
    }
    // Handle compound selectors by splitting on class/id boundaries
    // e.g., "span.myclass" -> ["span", ".myclass"], ".myclass1.myclass2" -> [".myclass1", ".myclass2"]
    const parts = [];
    let current = '';
    for (let i = 0; i < selectorPart.length; i++) {
        const char = selectorPart[i];
        if (char === '.' || char === '#') {
            if (current) {
                parts.push(current);
            }
            current = char;
        }
        else {
            current += char;
        }
    }
    if (current) {
        parts.push(current);
    }
    // If no parts were found, treat as tag selector
    if (parts.length === 0) {
        return element.tag === selectorPart.toLowerCase();
    }
    // Check each part
    for (const part of parts) {
        if (part.startsWith('.')) {
            // Class selector
            if (!element.classes.includes(part.substring(1))) {
                return false;
            }
        }
        else if (part.startsWith('#')) {
            // ID selector
            if (element.id !== part.substring(1)) {
                return false;
            }
        }
        else {
            // Tag selector
            if (element.tag !== part.toLowerCase()) {
                return false;
            }
        }
    }
    return true;
}
/**
 * Get all elements in the tree (flat list)
 */
function getAllElements(elements) {
    const result = [];
    function traverse(els) {
        for (const el of els) {
            result.push(el);
            traverse(el.children);
        }
    }
    traverse(elements);
    return result;
}
/**
 * Register CSS diagnostics to warn about unused selectors
 */
function registerCSSDiagnostics(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('pico-css');
    context.subscriptions.push(diagnosticCollection);
    // Function to update diagnostics
    function updateDiagnostics(document) {
        if (document.languageId !== 'pico') {
            return;
        }
        const diagnostics = [];
        const text = document.getText();
        const lines = text.split('\n');
        // Extract HTML content (everything outside frontmatter and style/script blocks)
        let htmlContent = '';
        let inFrontmatter = false;
        let inStyle = false;
        let inScript = false;
        for (const line of lines) {
            const trimmed = line.trim();
            // Track frontmatter
            if (trimmed === '---') {
                inFrontmatter = !inFrontmatter;
                continue;
            }
            // Track style blocks
            if (/<style[^>]*>/i.test(line)) {
                inStyle = true;
                continue;
            }
            if (/<\/style>/i.test(line)) {
                inStyle = false;
                continue;
            }
            // Track script blocks
            if (/<script[^>]*>/i.test(line)) {
                inScript = true;
                continue;
            }
            if (/<\/script>/i.test(line)) {
                inScript = false;
                continue;
            }
            // Collect HTML content
            if (!inFrontmatter && !inStyle && !inScript) {
                htmlContent += line + '\n';
            }
        }
        // Parse HTML into a tree structure
        const htmlTree = parseHTMLTree(htmlContent);
        // Extract CSS content and line numbers
        const cssBlocks = [];
        let styleStart = -1;
        let styleContent = '';
        for (let i = 0; i < lines.length; i++) {
            if (/<style[^>]*>/i.test(lines[i])) {
                styleStart = i + 1;
                styleContent = '';
                continue;
            }
            if (styleStart !== -1) {
                if (/<\/style>/i.test(lines[i])) {
                    cssBlocks.push({ content: styleContent, startLine: styleStart });
                    styleStart = -1;
                }
                else {
                    styleContent += lines[i] + '\n';
                }
            }
        }
        // Extract all HTML tags, classes, and IDs from the content
        const htmlTags = new Set();
        const htmlClasses = new Set();
        const htmlIds = new Set();
        const allElements = getAllElements(htmlTree);
        for (const el of allElements) {
            htmlTags.add(el.tag);
            el.classes.forEach(c => htmlClasses.add(c));
            if (el.id)
                htmlIds.add(el.id);
        }
        // Analyze each CSS block
        for (const block of cssBlocks) {
            const cssLines = block.content.split('\n');
            for (let i = 0; i < cssLines.length; i++) {
                const line = cssLines[i];
                const lineNumber = block.startLine + i;
                // Match CSS selectors (simple approach - matches selector before {)
                const selectorMatch = line.match(/^\s*([^{]+?)\s*\{/);
                if (selectorMatch) {
                    const fullSelector = selectorMatch[1].trim();
                    // Split by comma for multiple selectors
                    const selectors = fullSelector.split(',').map(s => s.trim());
                    for (const selector of selectors) {
                        // Skip pseudo-classes, pseudo-elements, and attribute selectors for now
                        if (selector.includes(':') || selector.includes('[')) {
                            continue;
                        }
                        // Split selector by combinators (space, >, +, ~)
                        // For now, we focus on descendant selectors (space)
                        const selectorParts = selector.split(/\s+/).map(s => s.trim()).filter(s => s.length > 0);
                        if (selectorParts.length === 0) {
                            continue;
                        }
                        // For simple single-part selectors, check if they exist anywhere
                        if (selectorParts.length === 1) {
                            const selectorPart = selectorParts[0];
                            let found = false;
                            if (selectorPart === '*') {
                                found = allElements.length > 0;
                            }
                            else if (selectorPart.startsWith('.')) {
                                // For compound class selectors like ".myclass.otherclass", check if any element matches
                                if (selectorPart.includes('.', 1)) {
                                    found = allElements.some(el => elementMatchesSelector(el, selectorPart));
                                }
                                else {
                                    found = htmlClasses.has(selectorPart.substring(1));
                                }
                            }
                            else if (selectorPart.startsWith('#')) {
                                found = htmlIds.has(selectorPart.substring(1));
                            }
                            else {
                                // For compound selectors like "span.myclass", check if any element matches
                                if (selectorPart.includes('.') || selectorPart.includes('#')) {
                                    found = allElements.some(el => elementMatchesSelector(el, selectorPart));
                                }
                                else {
                                    found = htmlTags.has(selectorPart.toLowerCase());
                                }
                            }
                            if (!found) {
                                createDiagnostic(diagnostics, line, lineNumber, selectorPart, `CSS selector '${selectorPart}' does not match any element in this component`);
                            }
                        }
                        else {
                            // For multi-part selectors, check if the structure exists
                            const unmatchedPart = findUnmatchedPart(htmlTree, selectorParts);
                            if (unmatchedPart) {
                                createDiagnostic(diagnostics, line, lineNumber, unmatchedPart.part, `CSS selector '${unmatchedPart.part}' does not match any ${unmatchedPart.type} in this component's structure`);
                            }
                        }
                    }
                }
            }
        }
        diagnosticCollection.set(document.uri, diagnostics);
    }
    /**
     * Create a diagnostic for an unmatched selector part
     */
    function createDiagnostic(diagnostics, line, lineNumber, selectorPart, message) {
        // Use lastIndexOf to highlight the last occurrence for cases like "span span"
        const selectorIndex = line.lastIndexOf(selectorPart);
        if (selectorIndex !== -1) {
            const range = new vscode.Range(new vscode.Position(lineNumber, selectorIndex), new vscode.Position(lineNumber, selectorIndex + selectorPart.length));
            const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
            diagnostic.source = 'pico-css';
            diagnostic.code = 'unused-selector';
            diagnostics.push(diagnostic);
        }
    }
    /**
     * Find which part of a selector chain doesn't match the HTML structure
     * Returns the unmatched part or null if all parts match
     */
    function findUnmatchedPart(htmlTree, selectorParts) {
        if (selectorParts.length === 0)
            return null;
        // Get all elements
        const allElements = getAllElements(htmlTree);
        // Check if each part exists individually first
        for (const part of selectorParts) {
            if (part === '*')
                continue;
            let exists = false;
            if (part.startsWith('.')) {
                // For compound selectors like ".myclass1.myclass2", use elementMatchesSelector
                // For simple class selectors, check if any element has the class
                if (part.substring(1).includes('.') || part.substring(1).includes('#')) {
                    exists = allElements.some(el => elementMatchesSelector(el, part));
                }
                else {
                    exists = allElements.some(el => el.classes.includes(part.substring(1)));
                }
            }
            else if (part.startsWith('#')) {
                // For compound selectors like "#myid.myclass", use elementMatchesSelector
                if (part.substring(1).includes('.') || part.substring(1).includes('#')) {
                    exists = allElements.some(el => elementMatchesSelector(el, part));
                }
                else {
                    exists = allElements.some(el => el.id === part.substring(1));
                }
            }
            else {
                // For compound selectors like "span.myclass", use elementMatchesSelector
                if (part.includes('.') || part.includes('#')) {
                    exists = allElements.some(el => elementMatchesSelector(el, part));
                }
                else {
                    exists = allElements.some(el => el.tag === part.toLowerCase());
                }
            }
            if (!exists) {
                return { part, type: 'element' };
            }
        }
        // Now check if the hierarchical structure exists
        // Find elements matching the last part and check if they have proper ancestors
        const lastPart = selectorParts[selectorParts.length - 1];
        const candidates = allElements.filter(el => elementMatchesSelector(el, lastPart));
        if (candidates.length === 0) {
            return { part: lastPart, type: 'element' };
        }
        // Build parent-child relationships
        const parentMap = buildParentMap(htmlTree);
        // For each candidate, check if it has the required ancestor chain
        for (const candidate of candidates) {
            if (hasMatchingAncestors(candidate, selectorParts.slice(0, -1), parentMap)) {
                return null; // Found a match
            }
        }
        // No complete match found - find which part of the chain is missing
        // Start from the beginning of the chain
        return findMissingAncestorChain(selectorParts, candidates, parentMap, allElements);
    }
    /**
     * Build a map of element to its parent
     */
    function buildParentMap(elements) {
        const map = new Map();
        function traverse(els, parent) {
            for (const el of els) {
                map.set(el, parent);
                traverse(el.children, el);
            }
        }
        traverse(elements, null);
        return map;
    }
    /**
     * Check if an element has all required ancestors in order
     */
    function hasMatchingAncestors(element, ancestorParts, parentMap) {
        let current = element;
        // Go through ancestors in reverse order (closest to farthest)
        for (let i = ancestorParts.length - 1; i >= 0; i--) {
            const part = ancestorParts[i];
            // Move up the tree until we find a match
            while (current) {
                current = parentMap.get(current) || null;
                if (current && elementMatchesSelector(current, part)) {
                    break;
                }
            }
            if (!current) {
                return false;
            }
        }
        return true;
    }
    /**
     * Find which part of the ancestor chain is missing
     */
    function findMissingAncestorChain(selectorParts, candidates, parentMap, allElements) {
        // Check each position in the chain
        // selectorParts[0] is the first (outermost) part, selectorParts[n-1] is the target
        const ancestorParts = selectorParts.slice(0, -1);
        for (let chainIndex = ancestorParts.length - 1; chainIndex >= 0; chainIndex--) {
            const part = ancestorParts[chainIndex];
            const isFirstInChain = chainIndex === ancestorParts.length - 1;
            // Find if any element matching this part has proper descendants
            const matchingElements = allElements.filter(el => elementMatchesSelector(el, part));
            if (matchingElements.length === 0) {
                return { part, type: 'ancestor' };
            }
            if (isFirstInChain) {
                // This is the direct ancestor of the target
                // Check if any matching element has a child that matches the target
                const targetPart = selectorParts[selectorParts.length - 1];
                let hasValidChild = false;
                for (const el of matchingElements) {
                    if (el.children.some(child => elementMatchesSelector(child, targetPart))) {
                        hasValidChild = true;
                        break;
                    }
                }
                if (!hasValidChild) {
                    // Highlight the target (child) instead of the ancestor - 
                    // the child doesn't exist in this context
                    return { part: targetPart, type: 'element' };
                }
            }
            else {
                // This is a higher-level ancestor
                // Check if any matching element has a descendant chain that works
                const nextPart = ancestorParts[chainIndex - 1];
                let hasValidDescendant = false;
                for (const el of matchingElements) {
                    if (hasDescendantMatching(el, nextPart)) {
                        hasValidDescendant = true;
                        break;
                    }
                }
                if (!hasValidDescendant) {
                    // Highlight the descendant that doesn't exist in this context
                    return { part: nextPart, type: 'element' };
                }
            }
        }
        // If we get here, check the first part
        const firstPart = selectorParts[0];
        const firstMatching = allElements.filter(el => elementMatchesSelector(el, firstPart));
        if (firstMatching.length === 0) {
            return { part: firstPart, type: 'element' };
        }
        return { part: firstPart, type: 'ancestor' };
    }
    /**
     * Check if an element has a descendant matching the selector part
     */
    function hasDescendantMatching(element, selectorPart) {
        function traverse(els) {
            for (const el of els) {
                if (elementMatchesSelector(el, selectorPart)) {
                    return true;
                }
                if (traverse(el.children)) {
                    return true;
                }
            }
            return false;
        }
        return traverse(element.children);
    }
    // Update diagnostics on document change
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'pico') {
            updateDiagnostics(e.document);
        }
    }));
    // Update diagnostics on document open
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId === 'pico') {
            updateDiagnostics(document);
        }
    }));
    // Update diagnostics for all open pico files
    vscode.workspace.textDocuments.forEach(document => {
        if (document.languageId === 'pico') {
            updateDiagnostics(document);
        }
    });
}
/**
 * Register auto-indent fixer for closing tags inserted by completions
 */
function registerAutoIndentFixer(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId !== 'pico' || event.contentChanges.length === 0) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return;
        }
        // Use setTimeout to let the completion finish
        setTimeout(() => {
            const document = editor.document;
            const position = editor.selection.active;
            const line = document.lineAt(position.line);
            const lineText = line.text;
            // Check if this line has a closing tag
            const closingTagMatch = lineText.match(/^(\s*)<\/([a-z][a-z0-9]*)\>$/i);
            if (!closingTagMatch) {
                return;
            }
            const currentIndent = closingTagMatch[1];
            const tagName = closingTagMatch[2].toLowerCase();
            // Find matching opening tag's indentation
            let openingIndent = null;
            const stack = [];
            for (let i = position.line - 1; i >= 0; i--) {
                const scanLine = document.lineAt(i).text;
                const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
                let match;
                const matches = [];
                while ((match = tagRegex.exec(scanLine)) !== null) {
                    const fullMatch = match[0];
                    const tag = match[1].toLowerCase();
                    if (fullMatch.endsWith('/>'))
                        continue;
                    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                        'link', 'meta', 'param', 'source', 'track', 'wbr'];
                    if (voidElements.includes(tag))
                        continue;
                    matches.push({ isClosing: fullMatch.startsWith('</'), tag });
                }
                for (let j = matches.length - 1; j >= 0; j--) {
                    const { isClosing, tag } = matches[j];
                    if (isClosing) {
                        stack.push(tag);
                    }
                    else {
                        if (stack.length > 0 && stack[stack.length - 1] === tag) {
                            stack.pop();
                        }
                        else if (tag === tagName) {
                            openingIndent = scanLine.match(/^(\s*)/)?.[1] || '';
                            break;
                        }
                    }
                }
                if (openingIndent !== null)
                    break;
            }
            // Fix indentation if needed
            if (openingIndent !== null && openingIndent !== currentIndent) {
                editor.edit(editBuilder => {
                    const range = new vscode.Range(new vscode.Position(position.line, 0), new vscode.Position(position.line, currentIndent.length));
                    editBuilder.replace(range, openingIndent);
                }, { undoStopBefore: false, undoStopAfter: false });
            }
        }, 10); // Small delay to ensure completion has finished
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map