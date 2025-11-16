/**
 * Renderizador Especializado de Hidratação para Focus Mode
 * Exibe meta de água, consumo atual, progresso e ações rápidas
 */

FocusRenderers.hydration = function (activity, state) {
  const isActive = FocusMode.isActiveNow();
  const scheduleDate = state.scheduleDate;

  // Obter dados de hidratação do dia
  const hydrationData = appState.userData.hydrationTracking?.[scheduleDate] || null;

  // Meta de água do perfil
  const waterGoal = appState.userData.userProfile?.dailyWaterGoal || 2000;
  const waterGoalLiters = (waterGoal / 1000).toFixed(1);

  // Consumo atual
  const consumed = hydrationData?.consumed || 0;
  const consumedLiters = (consumed / 1000).toFixed(2);

  // Calcular progresso
  const progress = Math.min(100, Math.round((consumed / waterGoal) * 100));
  const remaining = Math.max(0, waterGoal - consumed);
  const remainingLiters = (remaining / 1000).toFixed(2);

  // Logs de consumo
  const logs = hydrationData?.logs || [];

  // Status
  const isComplete = progress >= 100;
  const statusClass = isComplete ? 'complete' : progress >= 75 ? 'good' : progress >= 50 ? 'medium' : 'low';

  // Peso atual
  const currentWeight = getCurrentWeight ? getCurrentWeight() : null;
  const height = appState.userData.userProfile?.height;

  return `
    <div class="focus-modal focus-hydration">
      <div class="focus-header">
        <h2>💧 ${activity.name || 'Hidratação'}</h2>
        <button class="focus-close" onclick="FocusMode.close()">✕</button>
      </div>

      <div class="focus-body">
        <!-- Meta e Progresso Principal -->
        <div class="hydration-main-progress">
          <div class="hydration-goal-info">
            <div class="goal-label">Meta diária de água</div>
            <div class="goal-value">${waterGoal}ml (${waterGoalLiters}L)</div>
            ${currentWeight && height ? `
              <div class="goal-basis">
                <small>Baseado em ${currentWeight}kg e ${height}cm</small>
              </div>
            ` : ''}
          </div>
          
          <!-- Progresso circular ou barra -->
          <div class="hydration-progress-display">
            <div class="progress-circle ${statusClass}">
              <svg viewBox="0 0 100 100">
                <circle class="progress-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  class="progress-fill" 
                  cx="50" 
                  cy="50" 
                  r="45"
                  style="stroke-dasharray: ${progress * 2.827}, 282.7"
                ></circle>
              </svg>
              <div class="progress-text">
                <div class="progress-percent">${progress}%</div>
                <div class="progress-amount">${consumedLiters}L</div>
              </div>
            </div>
          </div>
          
          <div class="hydration-summary">
            ${isComplete ? `
              <div class="status-badge complete">
                ✅ Meta alcançada!
              </div>
            ` : `
              <div class="status-badge ${statusClass}">
                ${remaining}ml faltando (${remainingLiters}L)
              </div>
            `}
          </div>
        </div>

        <!-- Ações Rápidas de Registro -->
        <div class="hydration-quick-actions">
          <h3>➕ Registrar Consumo Rápido:</h3>
          <div class="quick-buttons">
            <button class="btn-quick-water" onclick="FocusHydration.addWater(250, '${scheduleDate}')">
              <span class="icon">🥤</span>
              <span class="amount">250ml</span>
            </button>
            <button class="btn-quick-water" onclick="FocusHydration.addWater(500, '${scheduleDate}')">
              <span class="icon">💧</span>
              <span class="amount">500ml</span>
            </button>
            <button class="btn-quick-water" onclick="FocusHydration.addWater(750, '${scheduleDate}')">
              <span class="icon">🍶</span>
              <span class="amount">750ml</span>
            </button>
            <button class="btn-quick-water" onclick="FocusHydration.showCustomInput()">
              <span class="icon">⚙️</span>
              <span class="amount">Outro</span>
            </button>
          </div>
          
          <!-- Input customizado (hidden por padrão) -->
          <div id="custom-water-input" class="custom-input-section" style="display: none;">
            <input 
              type="number" 
              id="custom-water-amount" 
              placeholder="Quantidade (ml)"
              min="50"
              max="2000"
              step="50"
            />
            <button class="btn btn-primary btn-sm" onclick="FocusHydration.addCustomWater('${scheduleDate}')">
              Adicionar
            </button>
            <button class="btn btn-outline btn-sm" onclick="FocusHydration.hideCustomInput()">
              Cancelar
            </button>
          </div>
        </div>

        <!-- Histórico de Consumo do Dia -->
        <div class="hydration-logs-section">
          <h3>📋 Histórico de Hoje:</h3>
          ${logs.length > 0 ? `
            <div class="hydration-logs">
              ${logs.map((log, index) => `
                <div class="log-item">
                  <span class="log-time">🕐 ${log.time}</span>
                  <span class="log-amount">${log.amount}ml</span>
                  <button 
                    class="btn-delete-log" 
                    onclick="FocusHydration.removeLog(${index}, '${scheduleDate}')"
                    title="Remover"
                  >
                    🗑️
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="empty-logs">Nenhum consumo registrado ainda hoje.</p>
          `}
        </div>

        <!-- Dicas e Informações -->
        <div class="hydration-tips">
          <h3>💡 Dicas:</h3>
          <ul>
            ${progress < 25 ? '<li>⚠️ Você está bem abaixo da meta. Comece a beber água!</li>' : ''}
            ${progress >= 25 && progress < 50 ? '<li>📈 Continue bebendo água ao longo do dia.</li>' : ''}
            ${progress >= 50 && progress < 75 ? '<li>👍 Você está no caminho certo!</li>' : ''}
            ${progress >= 75 && progress < 100 ? '<li>🎯 Quase lá! Falta pouco para alcançar sua meta.</li>' : ''}
            ${progress >= 100 ? '<li>🎉 Parabéns! Você alcançou sua meta de hidratação!</li>' : ''}
            <li>💧 Beba água regularmente, mesmo sem sede.</li>
            <li>🏃 Durante exercícios, aumente a ingestão de água.</li>
          </ul>
        </div>

        <!-- Ações -->
        <div class="focus-actions">
          <button class="btn btn-outline" onclick="openSettings()">
            ⚙️ Ajustar Meta
          </button>
          <button class="btn btn-outline" onclick="FocusMode.close()">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Funções auxiliares para o renderizador de hidratação
 */
const FocusHydration = {
  // Adicionar quantidade de água
  addWater(amount, date) {
    if (!amount || amount <= 0) {
      alert('❌ Quantidade inválida');
      return;
    }

    // Inicializar tracking se não existir
    if (!appState.userData.hydrationTracking) {
      appState.userData.hydrationTracking = {};
    }

    if (!appState.userData.hydrationTracking[date]) {
      const waterGoal = appState.userData.userProfile?.dailyWaterGoal || 2000;
      appState.userData.hydrationTracking[date] = {
        goal: waterGoal,
        consumed: 0,
        logs: []
      };
    }

    const tracking = appState.userData.hydrationTracking[date];

    // Adicionar ao consumo
    tracking.consumed = (tracking.consumed || 0) + amount;

    // Adicionar log
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    tracking.logs.push({
      time: time,
      amount: amount
    });

    // Calcular restante e percentual
    tracking.remaining = Math.max(0, tracking.goal - tracking.consumed);
    tracking.percentage = Math.min(100, Math.round((tracking.consumed / tracking.goal) * 100));

    // Salvar
    saveToStorage();

    // Feedback
    const remainingLiters = (tracking.remaining / 1000).toFixed(2);
    if (tracking.percentage >= 100) {
      showNotification('🎉 Meta de hidratação alcançada!', 'success');
    } else {
      showNotification(`✅ ${amount}ml adicionado! Faltam ${remainingLiters}L`, 'success');
    }

    // Re-renderizar
    FocusMode.render();

    // Atualizar schedule view se visível
    if (typeof showScheduleView === 'function') {
      setTimeout(() => showScheduleView(carouselState.filter || 'week'), 100);
    }
  },

  // Mostrar input customizado
  showCustomInput() {
    const customDiv = document.getElementById('custom-water-input');
    if (customDiv) {
      customDiv.style.display = 'block';
      document.getElementById('custom-water-amount')?.focus();
    }
  },

  // Esconder input customizado
  hideCustomInput() {
    const customDiv = document.getElementById('custom-water-input');
    if (customDiv) {
      customDiv.style.display = 'none';
    }
    const input = document.getElementById('custom-water-amount');
    if (input) input.value = '';
  },

  // Adicionar água customizada
  addCustomWater(date) {
    const input = document.getElementById('custom-water-amount');
    const amount = parseInt(input?.value);

    if (!amount || amount <= 0) {
      alert('❌ Por favor, insira uma quantidade válida');
      return;
    }

    if (amount > 2000) {
      const confirm = window.confirm(`⚠️ ${amount}ml é uma quantidade grande. Confirmar?`);
      if (!confirm) return;
    }

    this.addWater(amount, date);
    this.hideCustomInput();
  },

  // Remover log de consumo
  removeLog(logIndex, date) {
    const tracking = appState.userData.hydrationTracking?.[date];
    if (!tracking || !tracking.logs[logIndex]) {
      alert('❌ Log não encontrado');
      return;
    }

    const log = tracking.logs[logIndex];
    const confirm = window.confirm(`⚠️ Remover registro de ${log.amount}ml às ${log.time}?`);

    if (!confirm) return;

    // Subtrair do consumo
    tracking.consumed -= log.amount;

    // Remover log
    tracking.logs.splice(logIndex, 1);

    // Recalcular
    tracking.remaining = Math.max(0, tracking.goal - tracking.consumed);
    tracking.percentage = Math.min(100, Math.round((tracking.consumed / tracking.goal) * 100));

    // Salvar
    saveToStorage();

    // Re-renderizar
    FocusMode.render();

    // Feedback
    showNotification('✅ Registro removido', 'success');
  }
};

// Expor globalmente
window.FocusHydration = FocusHydration;

// Função auxiliar de notificação
function showNotification(message, type = 'info') {
  // Usar notificação do navegador se disponível
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Lifestyle', {
      body: message,
      icon: '/icon-192.png'
    });
  }

  // Fallback: alert simples
  console.log(`[${type.toUpperCase()}] ${message}`);
}
