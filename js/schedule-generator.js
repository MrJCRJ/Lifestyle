// Funções de geração de cronogramas

// Gerar cronograma do dia de hoje
function generateTodaySchedule() {
    const schedule = [];
    const todayKey = getDateKey();

    // Coletar dados dos formulários
    const sleepTime = document.getElementById('sleepTime').value;
    const wakeTime = document.getElementById('wakeTime').value;

    let jobs = [];
    const hasWork = document.querySelector('input[name="hasWork"]:checked');
    if (hasWork && hasWork.value === 'yes') {
        try {
            jobs = collectJobsData('jobs', 'job');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    let studies = [];
    const hasStudy = document.querySelector('input[name="hasStudy"]:checked');
    if (hasStudy && hasStudy.value === 'yes') {
        try {
            studies = collectStudiesData('studies', 'study');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    let cleaning = null;
    const hasCleaning = document.querySelector('input[name="hasCleaning"]:checked');
    if (hasCleaning && hasCleaning.value === 'yes') {
        const cleaningStart = document.getElementById('cleaningStartTime').value;
        const cleaningEnd = document.getElementById('cleaningEndTime').value;
        const cleaningNotes = document.getElementById('cleaningNotes').value;

        if (!cleaningStart || !cleaningEnd) {
            alert('Por favor, preencha os horários de limpeza!');
            return;
        }

        cleaning = {
            start: cleaningStart,
            end: cleaningEnd,
            notes: cleaningNotes
        };
    }

    // Criar planData do dia atual
    const planData = {
        sleep: sleepTime,
        wake: wakeTime,
        jobs: jobs,
        studies: studies,
        cleaning: cleaning
    };

    // Adicionar sono
    schedule.push({
        type: 'sleep',
        name: 'Dormir',
        startTime: planData.sleep,
        endTime: planData.wake
    });

    // Adicionar trabalhos
    if (planData.jobs && Array.isArray(planData.jobs)) {
        planData.jobs.forEach(job => {
            job.times.forEach(time => {
                schedule.push({
                    type: 'work',
                    name: job.name,
                    startTime: time.start,
                    endTime: time.end
                });
            });
        });
    }

    // Adicionar estudos
    if (planData.studies && Array.isArray(planData.studies)) {
        planData.studies.forEach(study => {
            study.times.forEach(time => {
                schedule.push({
                    type: 'study',
                    name: study.name,
                    startTime: time.start,
                    endTime: time.end
                });
            });
        });
    }

    // Adicionar limpeza
    if (planData.cleaning) {
        schedule.push({
            type: 'cleaning',
            name: 'Limpeza / Organização',
            startTime: planData.cleaning.start,
            endTime: planData.cleaning.end,
            notes: planData.cleaning.notes
        });
    }

    // Validar conflitos de horários ANTES de ordenar
    const conflicts = validateScheduleConflicts(schedule, todayKey);
    if (conflicts.length > 0) {
        let message = '⚠️ Conflitos de horário detectados:\n\n';
        conflicts.forEach(conflict => {
            message += `• ${conflict.event1.name} (${conflict.event1.startTime}-${conflict.event1.endTime}) conflita com ${conflict.event2.name} (${conflict.event2.startTime}-${conflict.event2.endTime})\n`;
        });
        message += '\nPor favor, ajuste os horários para evitar sobreposições.';
        alert(message);
        return;
    }

    // Ordenar por horário
    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Salvar no objeto de cronogramas diários
    if (!appState.userData.dailySchedules) {
        appState.userData.dailySchedules = {};
    }

    appState.userData.dailySchedules[todayKey] = {
        date: todayKey,
        dayName: getTodayName(),
        formattedDate: getFormattedDate(),
        planData: planData,
        activities: schedule,
        createdAt: new Date().toISOString(),
        isPlanned: false
    };

    saveToStorage();
}

// Gerar cronograma a partir de dados
function generateScheduleFromData(planData) {
    const schedule = [];

    schedule.push({
        type: 'sleep',
        name: 'Dormir',
        startTime: planData.sleep,
        endTime: planData.wake
    });

    // Adicionar trabalhos
    if (planData.jobs && Array.isArray(planData.jobs)) {
        planData.jobs.forEach(job => {
            job.times.forEach(time => {
                schedule.push({
                    type: 'work',
                    name: job.name,
                    startTime: time.start,
                    endTime: time.end
                });
            });
        });
    }

    // Adicionar estudos
    if (planData.studies && Array.isArray(planData.studies)) {
        planData.studies.forEach(study => {
            study.times.forEach(time => {
                schedule.push({
                    type: 'study',
                    name: study.name,
                    startTime: time.start,
                    endTime: time.end
                });
            });
        });
    }

    // Adicionar limpeza se existir
    if (planData.cleaning) {
        schedule.push({
            type: 'cleaning',
            name: 'Limpeza / Organização',
            startTime: planData.cleaning.start,
            endTime: planData.cleaning.end,
            notes: planData.cleaning.notes
        });
    }

    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return schedule;
}

// Validar conflitos de horários
function validateScheduleConflicts(schedule, currentDateKey) {
    const conflicts = [];

    // 1. Verificar conflitos com sono do dia anterior
    if (currentDateKey && appState.userData.dailySchedules) {
        // Calcular data do dia anterior
        const currentDate = parseDateKey(currentDateKey);
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateKey = getDateKey(previousDate);

        const previousSchedule = appState.userData.dailySchedules[previousDateKey];

        if (previousSchedule && previousSchedule.planData) {
            const previousSleep = previousSchedule.planData;
            const sleepEnd = timeToMinutes(previousSleep.wake);

            // Verificar conflitos com eventos de madrugada (antes das 12:00)
            schedule.forEach(event => {
                if (event.type === 'sleep') return; // Pular o sono do dia atual

                const eventStart = timeToMinutes(event.startTime);
                const eventEnd = timeToMinutes(event.endTime);

                // Se o evento é de madrugada (horário menor que 12:00 = 720 min)
                if (eventStart < 720 || eventEnd <= 720) {
                    // Verificar se conflita com o fim do sono do dia anterior
                    if (eventStart < sleepEnd) {
                        conflicts.push({
                            event1: {
                                name: `Dormir (${previousSchedule.dayName})`,
                                startTime: previousSleep.sleep,
                                endTime: previousSleep.wake
                            },
                            event2: event
                        });
                    }
                }
            });
        }
    }

    // 2. Verificar conflitos entre eventos do mesmo dia
    for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
            const event1 = schedule[i];
            const event2 = schedule[j];

            // Pular sono na validação entre eventos do mesmo dia
            if (event1.type === 'sleep' || event2.type === 'sleep') {
                continue;
            }

            // Converter horários para minutos
            const start1 = timeToMinutes(event1.startTime);
            let end1 = timeToMinutes(event1.endTime);
            const start2 = timeToMinutes(event2.startTime);
            let end2 = timeToMinutes(event2.endTime);

            // Se fim < início, o evento atravessa meia-noite (adicionar 24h)
            if (end1 < start1) end1 += 1440;
            if (end2 < start2) end2 += 1440;

            // Verificar sobreposição
            const overlaps = (start1 < end2 && end1 > start2);

            if (overlaps) {
                conflicts.push({
                    event1: event1,
                    event2: event2
                });
            }
        }
    }

    return conflicts;
}

// Converter horário HH:MM para minutos
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
