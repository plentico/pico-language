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
