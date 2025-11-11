// Exportação e Importação de Dados

/**
 * Exportar dados para arquivo JSON
 */
function exportDataToJSON() {
    try {
        const data = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            appName: 'Lifestyle App',
            userData: appState.userData
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `lifestyle-backup-${getDateKey()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('✅ Dados exportados com sucesso!\n\nArquivo: ' + link.download);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('❌ Erro ao exportar dados. Verifique o console para detalhes.');
    }
}

/**
 * Importar dados de arquivo JSON
 */
function importDataFromJSON(file) {
    if (!file) {
        alert('❌ Nenhum arquivo selecionado.');
        return;
    }

    if (!file.name.endsWith('.json')) {
        alert('❌ Por favor, selecione um arquivo JSON válido.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validar estrutura do arquivo
            if (!importedData.userData) {
                throw new Error('Arquivo JSON inválido: estrutura de dados não encontrada.');
            }

            if (!importedData.version) {
                throw new Error('Arquivo JSON inválido: versão não identificada.');
            }

            // Confirmar importação com o usuário
            const confirmMsg = `📥 Importar Dados\n\n` +
                `Versão: ${importedData.version}\n` +
                `Data de Exportação: ${new Date(importedData.exportDate).toLocaleString('pt-BR')}\n` +
                `Cronogramas: ${Object.keys(importedData.userData.dailySchedules || {}).length}\n\n` +
                `⚠️ ATENÇÃO: Isso substituirá TODOS os seus dados atuais!\n\n` +
                `Deseja continuar?`;

            if (!confirm(confirmMsg)) {
                alert('❌ Importação cancelada.');
                return;
            }

            // Fazer backup dos dados atuais antes de importar
            const backupKey = 'lifestyleData_backup_' + Date.now();
            localStorage.setItem(backupKey, JSON.stringify(appState.userData));

            // Importar dados
            appState.userData = importedData.userData;
            saveToStorage();

            alert(`✅ Dados importados com sucesso!\n\n` +
                `Cronogramas importados: ${Object.keys(importedData.userData.dailySchedules || {}).length}\n\n` +
                `Um backup dos dados anteriores foi salvo.\n` +
                `A página será recarregada.`);

            // Recarregar página para aplicar mudanças
            location.reload();

        } catch (error) {
            console.error('Erro ao importar dados:', error);
            alert(`❌ Erro ao importar dados:\n\n${error.message}\n\nVerifique se o arquivo é um backup válido do Lifestyle App.`);
        }
    };

    reader.onerror = function () {
        alert('❌ Erro ao ler o arquivo. Tente novamente.');
    };

    reader.readAsText(file);
}

/**
 * Trigger para input de arquivo (chamado pelo botão)
 */
function triggerImportFile() {
    const input = document.getElementById('import-file-input');
    if (input) {
        input.click();
    }
}

/**
 * Handler para mudança no input de arquivo
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        importDataFromJSON(file);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
}


