import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Check if we should configure file icons
    const config = vscode.workspace.getConfiguration('pico');
    const autoConfigIcons = config.get('autoConfigureFileIcons', true);
    
    if (autoConfigIcons) {
        configureFileIcons();
    }
    
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
                const newAssociations = { ...currentAssociations, '*.pico': 'html' };
                
                await config.update('files.associations', newAssociations, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Pico: Configured Material Icon Theme for .pico files. Reload window to apply.');
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

export function deactivate() {}
