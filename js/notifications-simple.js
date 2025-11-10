// Notifications Simple - Sistema de notificações simplificado e funcional
// Lifestyle App

class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.registration = null;

    console.log('🔔 NotificationManager inicializado');
    console.log('   Suporte:', this.isSupported);
    console.log('   Permissão:', this.permission);

    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('⚠️ Notificações não suportadas neste navegador');
      return;
    }

    // Aguarda o Service Worker estar pronto
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker pronto para notificações');
      } catch (error) {
        console.error('❌ Erro ao obter Service Worker:', error);
      }
    }
  }

  /**
   * Solicita permissão para enviar notificações
   * @returns {Promise<boolean>} true se a permissão foi concedida
   */
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('⚠️ Notificações não suportadas');
      return false;
    }

    if (this.permission === 'granted') {
      console.log('✅ Permissão de notificações já concedida');
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('❌ Permissão de notificações negada anteriormente');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        console.log('✅ Permissão de notificações concedida');
        return true;
      } else {
        console.warn('❌ Permissão de notificações negada');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }

  /**
   * Envia uma notificação simples
   * @param {string} title - Título da notificação
   * @param {Object} options - Opções da notificação
   */
  async show(title, options = {}) {
    // Solicita permissão se necessário
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const defaultOptions = {
      body: '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'lifestyle-notification',
      requireInteraction: false,
      data: {
        url: '/',
        dateTime: new Date().toISOString()
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Tenta usar Service Worker primeiro (mais confiável)
      if (this.registration && this.registration.showNotification) {
        await this.registration.showNotification(title, finalOptions);
        console.log('✅ Notificação enviada via Service Worker:', title);
      } else {
        // Fallback para Notification API direta
        const notification = new Notification(title, finalOptions);

        // Adiciona click handler
        notification.onclick = () => {
          window.focus();
          if (finalOptions.data?.url) {
            window.location.href = finalOptions.data.url;
          }
          notification.close();
        };

        console.log('✅ Notificação enviada via Notification API:', title);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
    }
  }

  /**
   * Agenda uma notificação para um horário específico
   * @param {string} title - Título da notificação
   * @param {Object} options - Opções da notificação
   * @param {Date|number} time - Data/hora ou timestamp para enviar
   */
  schedule(title, options = {}, time) {
    const now = Date.now();
    const targetTime = time instanceof Date ? time.getTime() : time;
    const delay = targetTime - now;

    if (delay <= 0) {
      console.warn('⚠️ Horário da notificação já passou');
      return null;
    }

    console.log(`⏰ Notificação agendada para ${new Date(targetTime).toLocaleString()}`);

    const timeoutId = setTimeout(() => {
      this.show(title, options);
    }, delay);

    return timeoutId;
  }

  /**
   * Cancela uma notificação agendada
   * @param {number} timeoutId - ID retornado por schedule()
   */
  cancel(timeoutId) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      console.log('❌ Notificação cancelada');
    }
  }

  /**
   * Notificação de lembrete de atividade
   * @param {string} activityName - Nome da atividade
   * @param {string} time - Horário da atividade
   */
  async notifyActivity(activityName, time) {
    await this.show(`⏰ ${activityName}`, {
      body: `Sua atividade começa em breve (${time})`,
      tag: 'activity-reminder',
      requireInteraction: true,
      data: {
        url: '/?view=schedule',
        type: 'activity-reminder'
      }
    });
  }

  /**
   * Notificação de pausa/descanso
   */
  async notifyBreak() {
    await this.show('☕ Hora da pausa!', {
      body: 'Faça uma pausa de 5-10 minutos para descansar',
      tag: 'break-reminder',
      vibrate: [200, 100, 200, 100, 200]
    });
  }

  /**
   * Notificação de conclusão de tarefa
   * @param {string} taskName - Nome da tarefa
   */
  async notifyTaskComplete(taskName) {
    await this.show('✅ Tarefa concluída!', {
      body: `Parabéns! Você concluiu: ${taskName}`,
      tag: 'task-complete',
      icon: '/icons/icon-192x192.png'
    });
  }

  /**
   * Notificação de objetivo diário alcançado
   */
  async notifyDailyGoal() {
    await this.show('🎉 Objetivo diário alcançado!', {
      body: 'Parabéns! Você completou todas as suas atividades de hoje',
      tag: 'daily-goal',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 400]
    });
  }

  /**
   * Verifica o status das permissões
   */
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.permission === 'granted'
    };
  }
}

// Instância global do gerenciador de notificações
const notificationManager = new NotificationManager();

// Exporta para uso global
window.notificationManager = notificationManager;

// Funções helper globais para compatibilidade
window.requestNotificationPermission = () => notificationManager.requestPermission();
window.showNotificationSimple = (title, body, options = {}) => {
  return notificationManager.show(title, { body, ...options });
};

// Auto-solicita permissão ao carregar (opcional, pode ser movido para configurações)
// Descomente se quiser solicitar permissão automaticamente
/*
window.addEventListener('load', () => {
  setTimeout(() => {
    notificationManager.requestPermission();
  }, 5000); // Aguarda 5s após carregar
});
*/

console.log('🔔 Notifications Simple module loaded');
