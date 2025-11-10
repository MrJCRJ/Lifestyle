// Sistema de Tempo Livre Automático

/**
 * Calcular tempo livre entre atividades
 */
function calculateFreeTime(activities) {
    if (!activities || activities.length === 0) return [];

    const freeTimeSlots = [];
    const sortedActivities = [...activities].sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    // Pular o sono (primeiro item geralmente)
    const nonSleepActivities = sortedActivities.filter(act => act.type !== 'sleep');

    for (let i = 0; i < nonSleepActivities.length - 1; i++) {
        const current = nonSleepActivities[i];
        const next = nonSleepActivities[i + 1];

        const currentEnd = timeToMinutes(current.endTime);
        const nextStart = timeToMinutes(next.startTime);

        // Se há intervalo maior que 15 minutos
        const gap = nextStart - currentEnd;
        if (gap >= 15) {
            freeTimeSlots.push({
                type: 'free',
                name: getFreeTimeLabel(gap),
                startTime: current.endTime,
                endTime: next.startTime,
                duration: gap,
                suggestion: suggestActivity(gap)
            });
        }
    }

    return freeTimeSlots;
}

/**
 * Obter label do tempo livre
 */
function getFreeTimeLabel(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
        return `⏰ Tempo Livre (${hours}h ${mins}min)`;
    } else if (hours > 0) {
        return `⏰ Tempo Livre (${hours}h)`;
    } else {
        return `⏰ Tempo Livre (${mins}min)`;
    }
}

/**
 * Sugerir atividade baseada na duração
 */
function suggestActivity(minutes) {
    if (minutes < 20) {
        return 'Break curto - Café, alongamento';
    } else if (minutes < 45) {
        return 'Break médio - Lanche, caminhada';
    } else if (minutes < 90) {
        return 'Tempo livre - Refeição, hobby';
    } else if (minutes < 180) {
        return 'Intervalo longo - Exercícios, lazer';
    } else {
        return 'Tempo livre extenso - Atividades pessoais';
    }
}

/**
 * Inserir tempo livre no cronograma
 */
function insertFreeTimeInSchedule(schedule) {
    if (!schedule || !schedule.activities) return schedule;

    const freeTimeSlots = calculateFreeTime(schedule.activities);

    // Combinar atividades com tempo livre
    const combinedActivities = [...schedule.activities, ...freeTimeSlots];

    // Ordenar por horário
    combinedActivities.sort((a, b) =>
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    return {
        ...schedule,
        activities: combinedActivities,
        hasFreeTime: freeTimeSlots.length > 0,
        freeTimeCount: freeTimeSlots.length,
        totalFreeMinutes: freeTimeSlots.reduce((sum, slot) => sum + slot.duration, 0)
    };
}

/**
 * Obter estatísticas de tempo livre do dia
 */
function getFreeTimeStats(dateKey) {
    const schedule = appState.userData.dailySchedules?.[dateKey];
    if (!schedule) return null;

    const freeTimeSlots = calculateFreeTime(schedule.activities);
    const totalMinutes = freeTimeSlots.reduce((sum, slot) => sum + slot.duration, 0);

    return {
        slots: freeTimeSlots.length,
        totalMinutes: totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1),
        longestSlot: freeTimeSlots.length > 0
            ? Math.max(...freeTimeSlots.map(s => s.duration))
            : 0,
        shortestSlot: freeTimeSlots.length > 0
            ? Math.min(...freeTimeSlots.map(s => s.duration))
            : 0
    };
}

/**
 * Calcular tempo de trabalho total do dia
 */
function getWorkTimeTotal(activities) {
    if (!activities) return 0;

    return activities
        .filter(act => act.type === 'work')
        .reduce((total, act) => {
            const start = timeToMinutes(act.startTime);
            const end = timeToMinutes(act.endTime);
            return total + (end - start);
        }, 0);
}

/**
 * Calcular tempo de estudo total do dia
 */
function getStudyTimeTotal(activities) {
    if (!activities) return 0;

    return activities
        .filter(act => act.type === 'study')
        .reduce((total, act) => {
            const start = timeToMinutes(act.startTime);
            const end = timeToMinutes(act.endTime);
            return total + (end - start);
        }, 0);
}

/**
 * Calcular horas de sono
 */
function getSleepHours(activities) {
    if (!activities) return 0;

    const sleep = activities.find(act => act.type === 'sleep');
    if (!sleep) return 0;

    const start = timeToMinutes(sleep.startTime);
    let end = timeToMinutes(sleep.endTime);

    // Se o fim é menor que o início, atravessa meia-noite
    if (end < start) {
        end += 1440; // adiciona 24 horas
    }

    return ((end - start) / 60).toFixed(1);
}

/**
 * Obter resumo do dia
 */
function getDaySummary(dateKey) {
    const schedule = appState.userData.dailySchedules?.[dateKey];
    if (!schedule || !schedule.activities) return null;

    const workMinutes = getWorkTimeTotal(schedule.activities);
    const studyMinutes = getStudyTimeTotal(schedule.activities);
    const sleepHours = getSleepHours(schedule.activities);
    const freeTimeStats = getFreeTimeStats(dateKey);

    return {
        work: {
            minutes: workMinutes,
            hours: (workMinutes / 60).toFixed(1)
        },
        study: {
            minutes: studyMinutes,
            hours: (studyMinutes / 60).toFixed(1)
        },
        sleep: {
            hours: sleepHours
        },
        freeTime: freeTimeStats,
        busyMinutes: workMinutes + studyMinutes,
        busyHours: ((workMinutes + studyMinutes) / 60).toFixed(1)
    };
}

/**
 * Renderizar badge de tempo livre
 */
function renderFreeTimeBadge(freeTimeSlots) {
    if (!freeTimeSlots || freeTimeSlots.length === 0) return '';

    const totalMinutes = freeTimeSlots.reduce((sum, slot) => sum + slot.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let timeLabel = '';
    if (hours > 0 && mins > 0) {
        timeLabel = `${hours}h ${mins}min`;
    } else if (hours > 0) {
        timeLabel = `${hours}h`;
    } else {
        timeLabel = `${mins}min`;
    }

    return `
        <span class="free-time-badge" title="${freeTimeSlots.length} intervalos de tempo livre">
            ⏰ ${timeLabel} livre
        </span>
    `;
}

/**
 * Sugerir melhor horário para nova atividade
 */
function suggestBestTimeSlot(duration, dateKey) {
    const schedule = appState.userData.dailySchedules?.[dateKey];
    if (!schedule) return null;

    const freeSlots = calculateFreeTime(schedule.activities);

    // Encontrar slots que cabem a atividade
    const suitableSlots = freeSlots.filter(slot => slot.duration >= duration);

    if (suitableSlots.length === 0) return null;

    // Retornar o maior slot disponível
    return suitableSlots.reduce((best, current) =>
        current.duration > best.duration ? current : best
    );
}

/**
 * Verificar se horário está livre
 */
function isTimeSlotFree(startTime, endTime, dateKey) {
    const schedule = appState.userData.dailySchedules?.[dateKey];
    if (!schedule || !schedule.activities) return true;

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const activity of schedule.activities) {
        if (activity.type === 'sleep') continue;

        const actStart = timeToMinutes(activity.startTime);
        const actEnd = timeToMinutes(activity.endTime);

        // Verificar sobreposição
        if (newStart < actEnd && newEnd > actStart) {
            return false;
        }
    }

    return true;
}
