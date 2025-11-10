// Exemplo de integração das notificações no Lifestyle App
// Adicione este código aos seus módulos existentes

// ============================================
// EXEMPLO 1: Solicitar permissão na configuração
// ============================================
// Adicione no settings.js ou crie um botão nas configurações

function setupNotificationSettings() {
  const settingsContainer = document.querySelector('.settings-modal-content');

  if (!settingsContainer) return;

  const notificationSection = document.createElement('div');
  notificationSection.className = 'settings-section';
  notificationSection.innerHTML = `
    <h3>🔔 Notificações</h3>
    <div class="setting-item">
      <label>Permitir notificações</label>
      <button id="enable-notifications" class="btn btn-primary">
        Ativar Notificações
      </button>
      <p id="notification-status" class="text-secondary"></p>
    </div>
  `;

  settingsContainer.appendChild(notificationSection);

  // Atualiza status
  updateNotificationStatus();

  // Evento do botão
  document.getElementById('enable-notifications')?.addEventListener('click', async () => {
    const granted = await notificationManager.requestPermission();
    if (granted) {
      showMessage('Notificações ativadas! ✅', 'success');
    } else {
      showMessage('Permissão negada ❌', 'error');
    }
    updateNotificationStatus();
  });
}

function updateNotificationStatus() {
  const statusEl = document.getElementById('notification-status');
  if (!statusEl) return;

  const status = notificationManager.getStatus();

  if (status.enabled) {
    statusEl.textContent = '✅ Notificações ativadas';
    statusEl.style.color = 'var(--success-color)';
    document.getElementById('enable-notifications').style.display = 'none';
  } else if (status.permission === 'denied') {
    statusEl.textContent = '❌ Permissão negada. Habilite nas configurações do navegador.';
    statusEl.style.color = 'var(--danger-color)';
  } else {
    statusEl.textContent = '⚠️ Notificações desativadas';
    statusEl.style.color = 'var(--warning-color)';
  }
}

// ============================================
// EXEMPLO 2: Notificar 5 minutos antes de evento
// ============================================
// Adicione no schedule-events.js ou schedule-planner.js

function scheduleEventReminders(schedule) {
  // Limpa lembretes anteriores
  if (window.scheduledReminders) {
    window.scheduledReminders.forEach(id => notificationManager.cancel(id));
  }
  window.scheduledReminders = [];

  schedule.forEach(event => {
    const eventTime = parseEventTime(event.start); // Função sua de parse
    const reminderTime = eventTime - (5 * 60 * 1000); // 5 min antes

    if (reminderTime > Date.now()) {
      const reminderId = notificationManager.schedule(
        `⏰ ${event.activity}`,
        {
          body: `Começa em 5 minutos (${event.start})`,
          tag: `event-${event.id}`,
          requireInteraction: true,
          data: { url: '/?view=schedule' }
        },
        reminderTime
      );

      window.scheduledReminders.push(reminderId);
      console.log(`Lembrete agendado: ${event.activity} às ${new Date(reminderTime).toLocaleTimeString()}`);
    }
  });
}

// ============================================
// EXEMPLO 3: Notificar ao completar tarefa
// ============================================
// Adicione no tracking-actions.js

function onTaskComplete(taskName, taskType) {
  // Sua lógica existente...

  // Adicione notificação
  notificationManager.notifyTaskComplete(taskName);

  // Verifica se completou todas tarefas do dia
  const allTasksComplete = checkAllTasksComplete(); // Sua função
  if (allTasksComplete) {
    notificationManager.notifyDailyGoal();
  }
}

// ============================================
// EXEMPLO 4: Lembrete de pausa (técnica Pomodoro)
// ============================================
// Adicione em um novo módulo ou no main.js

let workTimer = null;
let workDuration = 25 * 60 * 1000; // 25 minutos
let breakDuration = 5 * 60 * 1000; // 5 minutos

function startWorkSession() {
  if (workTimer) clearTimeout(workTimer);

  console.log('Sessão de trabalho iniciada (25 min)');

  workTimer = setTimeout(() => {
    notificationManager.notifyBreak();
    startBreakSession();
  }, workDuration);
}

function startBreakSession() {
  console.log('Pausa iniciada (5 min)');

  setTimeout(() => {
    notificationManager.show('✅ Pausa concluída!', {
      body: 'Pronto para a próxima sessão de trabalho?',
      requireInteraction: true
    });
  }, breakDuration);
}

// ============================================
// EXEMPLO 5: Notificação de início do dia
// ============================================
// Adicione no main.js ou dashboard.js

function notifyDayStart() {
  const schedule = getScheduleForToday(); // Sua função

  if (schedule && schedule.length > 0) {
    const firstEvent = schedule[0];

    notificationManager.show('☀️ Bom dia!', {
      body: `Sua primeira atividade: ${firstEvent.activity} às ${firstEvent.start}`,
      tag: 'day-start',
      requireInteraction: false
    });
  }
}

// Executa ao carregar a página
window.addEventListener('load', () => {
  const hour = new Date().getHours();
  // Notifica apenas entre 6h e 10h
  if (hour >= 6 && hour < 10) {
    setTimeout(notifyDayStart, 2000); // 2s após carregar
  }
});

// ============================================
// EXEMPLO 6: Exportar/Importar com feedback
// ============================================
// Adicione no data-transfer.js

async function exportDataWithNotification() {
  try {
    // Sua lógica de exportação...
    exportData();

    await notificationManager.show('💾 Dados exportados!', {
      body: 'Download iniciado com sucesso',
      icon: '/icons/icon-192x192.png'
    });
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
}

async function importDataWithNotification(file) {
  try {
    // Sua lógica de importação...
    await importData(file);

    await notificationManager.show('📥 Dados importados!', {
      body: 'Seus dados foram restaurados com sucesso',
      icon: '/icons/icon-192x192.png',
      requireInteraction: true
    });
  } catch (error) {
    console.error('Erro ao importar:', error);
  }
}

// ============================================
// EXEMPLO 7: Notificações recorrentes (diárias)
// ============================================

function scheduleDailyReminders() {
  // Limpa agendamentos anteriores
  if (window.dailyReminders) {
    window.dailyReminders.forEach(id => clearTimeout(id));
  }
  window.dailyReminders = [];

  // Configurações de lembretes diários
  const reminders = [
    { hour: 8, minute: 0, title: '☀️ Bom dia!', body: 'Hora de começar o dia!' },
    { hour: 12, minute: 0, title: '🍽️ Almoço', body: 'Hora de fazer uma pausa para almoçar' },
    { hour: 18, minute: 0, title: '🏠 Fim do expediente', body: 'Hora de relaxar!' },
    { hour: 22, minute: 0, title: '😴 Hora de dormir', body: 'Prepare-se para descansar' }
  ];

  reminders.forEach(reminder => {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(reminder.hour, reminder.minute, 0, 0);

    // Se já passou hoje, agenda para amanhã
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime - now;

    const reminderId = setTimeout(() => {
      notificationManager.show(reminder.title, {
        body: reminder.body,
        tag: `daily-${reminder.hour}-${reminder.minute}`
      });

      // Reagenda para o próximo dia
      setTimeout(() => scheduleDailyReminders(), 1000);
    }, delay);

    window.dailyReminders.push(reminderId);

    console.log(`Lembrete diário agendado: ${reminder.title} às ${reminderTime.toLocaleString()}`);
  });
}

// Inicia lembretes diários
// scheduleDailyReminders(); // Descomente para ativar

// ============================================
// FUNÇÕES HELPER
// ============================================

function parseEventTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const eventDate = new Date();
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate.getTime();
}

function showMessage(message, type = 'info') {
  // Sua implementação de toast/alert
  console.log(`[${type}] ${message}`);
}

function checkAllTasksComplete() {
  // Sua lógica para verificar se todas as tarefas estão completas
  return false;
}

function getScheduleForToday() {
  // Sua função para obter cronograma do dia
  return [];
}

// ============================================
// EXPORTAR FUNÇÕES (se usar módulos ES6)
// ============================================
/*
export {
  setupNotificationSettings,
  scheduleEventReminders,
  onTaskComplete,
  startWorkSession,
  notifyDayStart,
  exportDataWithNotification,
  importDataWithNotification,
  scheduleDailyReminders
};
*/

console.log('📋 Exemplos de notificações carregados!');
