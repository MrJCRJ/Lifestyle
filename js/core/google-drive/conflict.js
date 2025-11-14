(function (global) {
  function formatDate(date) {
    if (!date || Number.isNaN(date.getTime())) {
      return 'desconhecida';
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function summarize(data) {
    if (!data) {
      return {
        schedulesCount: 0,
        lastModified: null
      };
    }

    const dailySchedules = data.userData?.dailySchedules || {};
    return {
      schedulesCount: Object.keys(dailySchedules).length,
      lastModified: data.lastModified ? new Date(data.lastModified) : null
    };
  }

  function shouldResolveConflict(summaryA, summaryB) {
    if (!summaryA.lastModified || !summaryB.lastModified) {
      return false;
    }

    return summaryA.lastModified.getTime() !== summaryB.lastModified.getTime();
  }

  function promptUserResolution({ driveSummary, localSummary, context }) {
    const contextMessages = {
      pull: 'Clique OK para carregar os dados do Google Drive. Clique Cancelar para manter os dados deste dispositivo.',
      push: 'Clique OK para enviar os dados deste dispositivo ao Google Drive. Clique Cancelar para manter o arquivo atual do Drive.'
    };

    const message = [
      '⚠️ Diferença detectada entre os dados locais e o Google Drive.',
      '',
      `Google Drive: ${driveSummary.schedulesCount} cronogramas | Última alteração: ${formatDate(driveSummary.lastModified)}`,
      `Este dispositivo: ${localSummary.schedulesCount} cronogramas | Última alteração: ${formatDate(localSummary.lastModified)}`,
      '',
      contextMessages[context] || contextMessages.pull
    ].join('\n');

    const userAccepted = window.confirm(message);

    if (context === 'pull') {
      return userAccepted ? 'drive' : 'local';
    }

    return userAccepted ? 'local' : 'drive';
  }

  global.GoogleDriveConflictResolver = {
    summarize,
    shouldResolveConflict,
    promptResolution: promptUserResolution
  };
})(window);
