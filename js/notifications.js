// Sistema de Notificações

// Estado das notificações
const notificationState = {
    permission: 'default',
    enabled: false,
    sound: true,
    activeTimers: []
};

/**
 * Verificar suporte a notificações
 */
function isNotificationSupported() {
    return 'Notification' in window;
}

/**
 * Solicitar permissão para notificações
 */
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        alert('❌ Seu navegador não suporta notificações.');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        notificationState.permission = permission;

        if (permission === 'granted') {
            alert('✅ Notificações ativadas!\n\nVocê receberá lembretes antes das suas atividades.');
            saveNotificationSettings();
            return true;
        } else if (permission === 'denied') {
            alert('❌ Notificações bloqueadas.\n\nPara ativar, vá nas configurações do navegador.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
        return false;
    }
}

/**
 * Enviar notificação
 */
function sendNotification(title, options = {}) {
    if (!isNotificationSupported() || notificationState.permission !== 'granted') {
        return;
    }

    const defaultOptions = {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%237c3aed"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">⏰</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%237c3aed"/></svg>',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options
    };

    try {
        const notification = new Notification(title, defaultOptions);

        // Som (se habilitado)
        if (notificationState.sound) {
            playNotificationSound();
        }

        // Auto-fechar após 10 segundos
        setTimeout(() => notification.close(), 10000);

        return notification;
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
}

/**
 * Tocar som de notificação
 */
function playNotificationSound() {
    try {
        // Usar Web Audio API para criar som
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error('Erro ao tocar som:', error);
    }
}

/**
 * Programar notificações para o cronograma do dia
 */
function scheduleNotificationsForToday() {
    // Limpar timers anteriores
    clearAllNotifications();

    if (!notificationState.enabled || notificationState.permission !== 'granted') {
        return;
    }

    const todayKey = getDateKey();
    const schedule = appState.userData.dailySchedules?.[todayKey];

    if (!schedule || !schedule.activities) {
        return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let scheduled = 0;

    schedule.activities.forEach(activity => {
        // Pular sono
        if (activity.type === 'sleep') return;

        // Calcular tempo até a atividade
        const [hours, minutes] = activity.startTime.split(':').map(Number);
        const activityTime = hours * 60 + minutes;

        const emoji = getActivityEmoji(activity.type);

        // 1. Notificação 5 minutos antes
        const notificationTime5min = activityTime - 5;
        if (notificationTime5min > currentTime) {
            const delay5min = (notificationTime5min - currentTime) * 60 * 1000;

            const timer5min = setTimeout(() => {
                sendNotification(
                    `${emoji} Em 5 minutos: ${activity.name}`,
                    {
                        body: `Começa às ${activity.startTime}`,
                        tag: `activity-5min-${activity.startTime}`,
                        data: activity
                    }
                );
            }, delay5min);

            notificationState.activeTimers.push({
                timer: timer5min,
                activity: activity.name,
                time: activity.startTime,
                type: '5min'
            });
            scheduled++;
        }

        // 2. Notificação na hora do evento
        if (activityTime > currentTime) {
            const delayNow = (activityTime - currentTime) * 60 * 1000;

            const timerNow = setTimeout(() => {
                sendNotification(
                    `${emoji} Agora: ${activity.name}`,
                    {
                        body: `Começou às ${activity.startTime}!`,
                        tag: `activity-now-${activity.startTime}`,
                        data: activity
                    }
                );
            }, delayNow);

            notificationState.activeTimers.push({
                timer: timerNow,
                activity: activity.name,
                time: activity.startTime,
                type: 'now'
            });
            scheduled++;
        }
    });
}

/**
 * Limpar todas as notificações agendadas
 */
function clearAllNotifications() {
    notificationState.activeTimers.forEach(({ timer }) => clearTimeout(timer));
    notificationState.activeTimers = [];
}

/**
 * Obter emoji da atividade
 */
function getActivityEmoji(type) {
    const emojis = {
        work: '💼',
        study: '📚',
        cleaning: '🧹',
        free: '⏰',
        sleep: '😴'
    };
    return emojis[type] || '⏰';
}

/**
 * Ativar/desativar notificações
 */
async function toggleNotifications(enabled) {
    if (enabled && notificationState.permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) return false;
    }

    notificationState.enabled = enabled;
    saveNotificationSettings();

    if (enabled) {
        scheduleNotificationsForToday();
    } else {
        clearAllNotifications();
    }

    return true;
}

/**
 * Atualizar configurações de notificação
 */
function updateNotificationSettings(settings) {
    if (settings.sound !== undefined) {
        notificationState.sound = settings.sound;
    }

    saveNotificationSettings();

    // Re-agendar se estiver ativo
    if (notificationState.enabled) {
        scheduleNotificationsForToday();
    }
}

/**
 * Salvar configurações de notificação
 */
function saveNotificationSettings() {
    if (!appState.userData.notificationSettings) {
        appState.userData.notificationSettings = {};
    }

    appState.userData.notificationSettings = {
        enabled: notificationState.enabled,
        sound: notificationState.sound,
        permission: notificationState.permission
    };

    saveToStorage();
}

/**
 * Carregar configurações de notificação
 */
function loadNotificationSettings() {
    const settings = appState.userData.notificationSettings;

    if (settings) {
        notificationState.enabled = settings.enabled || false;
        notificationState.sound = settings.sound !== false;
        notificationState.permission = settings.permission || 'default';
    }

    // Verificar permissão atual
    if (isNotificationSupported()) {
        notificationState.permission = Notification.permission;
    }

    // Agendar se estiver habilitado
    if (notificationState.enabled && notificationState.permission === 'granted') {
        scheduleNotificationsForToday();
    }
}

/**
 * Testar notificação
 */
function testNotification() {
    if (notificationState.permission !== 'granted') {
        alert('Por favor, ative as notificações primeiro.');
        return;
    }

    sendNotification(
        '🔔 Notificação de Teste',
        {
            body: 'As notificações estão funcionando corretamente!',
            tag: 'test-notification'
        }
    );
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    loadNotificationSettings();

    // Re-agendar notificações diariamente à meia-noite
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 1, 0);
    const msUntilMidnight = tomorrow - now;

    setTimeout(() => {
        scheduleNotificationsForToday();
        // Re-programar para próximo dia
        setInterval(scheduleNotificationsForToday, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
});
