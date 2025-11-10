// Utilitários para cálculos e validações de tempo

// Calcular duração em horas e minutos
function calculateDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    // Se o horário de fim for menor que o de início, passou da meia-noite
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${minutes}min`;
    }
}

// Verificar se o horário atual está dentro do evento
function isEventActive(startTime, endTime) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Converter para minutos para comparação
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // Se o horário de fim for menor que o de início, passou da meia-noite
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
        if (currentMinutes < startMinutes) {
            return currentMinutes + 24 * 60 >= startMinutes && currentMinutes + 24 * 60 <= endMinutes;
        }
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

// Calcular tempo livre entre atividades
function calculateFreeTime(schedules) {
    const freeSlots = [];

    // Ordenar atividades por horário
    const sortedActivities = [...schedules].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
    );

    for (let i = 0; i < sortedActivities.length - 1; i++) {
        const currentEnd = sortedActivities[i].endTime;
        const nextStart = sortedActivities[i + 1].startTime;

        if (currentEnd !== nextStart) {
            const duration = calculateDuration(currentEnd, nextStart);
            freeSlots.push({
                startTime: currentEnd,
                endTime: nextStart,
                duration: duration
            });
        }
    }

    return freeSlots;
}

// Obter horário atual formatado
function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Calcular diferença entre dois horários e retornar status
function getTimeStatus(scheduledTime, currentTime) {
    const [scheduledHour, scheduledMin] = scheduledTime.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);

    const scheduledMinutes = scheduledHour * 60 + scheduledMin;
    const currentMinutes = currentHour * 60 + currentMin;

    if (currentMinutes < scheduledMinutes) {
        const diff = scheduledMinutes - currentMinutes;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return {
            status: 'before',
            diff: { hours, minutes },
            message: `${hours > 0 ? hours + 'h ' : ''}${minutes}min antes do horário previsto`
        };
    } else if (currentMinutes > scheduledMinutes) {
        const diff = currentMinutes - scheduledMinutes;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return {
            status: 'after',
            diff: { hours, minutes },
            message: `${hours > 0 ? hours + 'h ' : ''}${minutes}min depois do horário previsto`
        };
    }

    return {
        status: 'on-time',
        diff: { hours: 0, minutes: 0 },
        message: 'no horário'
    };
}
