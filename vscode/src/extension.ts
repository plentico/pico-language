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
    // Check for Material Icon Theme
    const materialIconTheme = vscode.extensions.getExtension('PKief.material-icon-theme');
    
    if (materialIconTheme) {
        const config = vscode.workspace.getConfiguration('material-icon-theme');
        const fileAssociations = config.get<Record<string, string>>('files.associations') || {};
        
        // Only add if not already configured
        if (!fileAssociations['*.pico']) {
            fileAssociations['*.pico'] = 'html';
            
            await config.update('files.associations', fileAssociations, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Pico: Configured Material Icon Theme for .pico files');
        }
        return;
    }
    
    // Check for vscode-icons
    const vsCodeIcons = vscode.extensions.getExtension('vscode-icons-team.vscode-icons');
    
    if (vsCodeIcons) {
        const config = vscode.workspace.getConfiguration('vsicons');
        const associations = config.get<any>('associations.files') || [];
        
        // Only add if not already configured
        const hasPico = associations.some((a: any) => a.extensions?.includes('pico'));
        if (!hasPico) {
            associations.push({
                icon: 'html',
                extensions: ['pico'],
                format: 'svg'
            });
            
            await config.update('associations.files', associations, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Pico: Configured vscode-icons for .pico files');
        }
        return;
    }
}

export function deactivate() {}
