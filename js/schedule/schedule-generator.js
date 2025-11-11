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

    let meals = [];
    const hasMeals = document.querySelector('input[name="hasMeals"]:checked');
    if (hasMeals && hasMeals.value === 'yes') {
        try {
            meals = collectMealsData('meals-times-container');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    let exercise = null;
    const hasExercise = document.querySelector('input[name="hasExercise"]:checked');
    if (hasExercise && hasExercise.value === 'yes') {
        const exerciseStart = document.getElementById('exerciseStartTime').value;
        const exerciseEnd = document.getElementById('exerciseEndTime').value;
        const exerciseType = document.getElementById('exerciseType').value;

        if (!exerciseStart || !exerciseEnd) {
            alert('Por favor, preencha os horários de exercício!');
            return;
        }

        exercise = {
            start: exerciseStart,
            end: exerciseEnd,
            type: exerciseType || 'Exercício'
        };
    }

    // Criar planData do dia atual
    const planData = {
        sleep: sleepTime,
        wake: wakeTime,
        jobs: jobs,
        studies: studies,
        cleaning: cleaning,
        meals: meals,
        exercise: exercise
    };

    // Adicionar sono dividido em duas partes: Dormir e Acordar
    const sleepMinutes = timeToMinutes(planData.sleep);
    const wakeMinutes = timeToMinutes(planData.wake);

    // Se wake < sleep, significa que atravessa a meia-noite
    if (wakeMinutes < sleepMinutes) {
        // Parte 1: Dormir (do horário de sono até 23:59)
        schedule.push({
            id: 'sleep-dormir',
            type: 'sleep',
            name: '😴 Dormir',
            startTime: planData.sleep,
            endTime: '23:59'
        });

        // Parte 2: Acordar (de 00:00 até horário de acordar)
        schedule.push({
            id: 'sleep-acordar',
            type: 'sleep',
            name: '😴 Acordar',
            startTime: '00:00',
            endTime: planData.wake
        });
    } else {
        // Sono no mesmo dia (raro, mas possível para cochilos)
        schedule.push({
            id: 'sleep-dormir',
            type: 'sleep',
            name: '😴 Dormir',
            startTime: planData.sleep,
            endTime: planData.wake
        });
    }

    // Adicionar trabalhos
    if (planData.jobs && Array.isArray(planData.jobs)) {
        planData.jobs.forEach((job, jobIndex) => {
            job.times.forEach((time, timeIndex) => {
                schedule.push({
                    id: `work-${jobIndex}-${timeIndex}`,
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
        planData.studies.forEach((study, studyIndex) => {
            study.times.forEach((time, timeIndex) => {
                schedule.push({
                    id: `study-${studyIndex}-${timeIndex}`,
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
            id: 'cleaning-0',
            type: 'cleaning',
            name: 'Limpeza / Organização',
            startTime: planData.cleaning.start,
            endTime: planData.cleaning.end,
            notes: planData.cleaning.notes
        });
    }

    // Adicionar refeições
    if (planData.meals && Array.isArray(planData.meals)) {
        planData.meals.forEach((mealTime, index) => {
            schedule.push({
                id: `meal-${index}`,
                type: 'meal',
                name: `🍽️ Refeição ${index + 1}`,
                startTime: mealTime,
                endTime: mealTime, // Refeições são pontuais
                duration: 0
            });
        });
    }

    // Adicionar exercício
    if (planData.exercise) {
        schedule.push({
            id: 'exercise-0',
            type: 'exercise',
            name: `💪 ${planData.exercise.type}`,
            startTime: planData.exercise.start,
            endTime: planData.exercise.end
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

    // Adicionar hidratação no final (meta diária - não tem horário fixo)
    if (appState.userData.userProfile && appState.userData.userProfile.waterNeeds) {
        schedule.push({
            id: 'hydration-daily',
            type: 'hydration',
            name: '💧 Hidratação Diária',
            startTime: '23:59',
            endTime: '23:59',
            waterGoal: appState.userData.userProfile.waterNeeds,
            duration: 0
        });
    }

    // Preservar status de atividades existentes
    const existingSchedule = appState.userData.dailySchedules?.[todayKey];
    if (existingSchedule && existingSchedule.activities) {
        schedule.forEach(newActivity => {
            // Encontrar atividade correspondente pelo ID (mais confiável) ou pelo tipo e nome
            const existingActivity = existingSchedule.activities.find(
                act => (act.id && act.id === newActivity.id) ||
                    (act.type === newActivity.type && act.name === newActivity.name)
            );

            if (existingActivity) {
                // Preservar rastreamento simples
                if (existingActivity.simpleTracking) {
                    newActivity.simpleTracking = { ...existingActivity.simpleTracking };
                }

                // Preservar tracking de água
                if (existingActivity.waterTracking) {
                    newActivity.waterTracking = { ...existingActivity.waterTracking };
                }

                // Preservar ajustes de horário
                if (existingActivity.originalTime) {
                    newActivity.originalTime = { ...existingActivity.originalTime };
                    newActivity.timeAdjusted = existingActivity.timeAdjusted;
                }
            }
        });
    }    // Salvar no objeto de cronogramas diários
    if (!appState.userData.dailySchedules) {
        appState.userData.dailySchedules = {};
    }

    appState.userData.dailySchedules[todayKey] = {
        date: todayKey,
        dayName: getTodayName(),
        formattedDate: getFormattedDate(),
        planData: planData,
        activities: schedule,
        createdAt: existingSchedule?.createdAt || new Date().toISOString(),
        lastSaved: new Date().toISOString(),
        isPlanned: false
    };

    saveToStorage();
}

// Gerar cronograma a partir de dados
function generateScheduleFromData(planData) {
    const schedule = [];

    // Adicionar sono dividido em duas partes: Dormir e Acordar
    const sleepMinutes = timeToMinutes(planData.sleep);
    const wakeMinutes = timeToMinutes(planData.wake);

    // Se wake < sleep, significa que atravessa a meia-noite
    if (wakeMinutes < sleepMinutes) {
        // Parte 1: Dormir (do horário de sono até 23:59)
        schedule.push({
            id: 'sleep-dormir',
            type: 'sleep',
            name: '😴 Dormir',
            startTime: planData.sleep,
            endTime: '23:59'
        });

        // Parte 2: Acordar (de 00:00 até horário de acordar)
        schedule.push({
            id: 'sleep-acordar',
            type: 'sleep',
            name: '😴 Acordar',
            startTime: '00:00',
            endTime: planData.wake
        });
    } else {
        // Sono no mesmo dia (raro, mas possível para cochilos)
        schedule.push({
            id: 'sleep-dormir',
            type: 'sleep',
            name: '😴 Dormir',
            startTime: planData.sleep,
            endTime: planData.wake
        });
    }

    // Adicionar trabalhos
    if (planData.jobs && Array.isArray(planData.jobs)) {
        planData.jobs.forEach((job, jobIndex) => {
            job.times.forEach((time, timeIndex) => {
                schedule.push({
                    id: `work-${jobIndex}-${timeIndex}`,
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
        planData.studies.forEach((study, studyIndex) => {
            study.times.forEach((time, timeIndex) => {
                schedule.push({
                    id: `study-${studyIndex}-${timeIndex}`,
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
            id: 'cleaning-0',
            type: 'cleaning',
            name: 'Limpeza / Organização',
            startTime: planData.cleaning.start,
            endTime: planData.cleaning.end,
            notes: planData.cleaning.notes
        });
    }

    // Adicionar refeições
    if (planData.meals && Array.isArray(planData.meals)) {
        planData.meals.forEach((mealTime, index) => {
            schedule.push({
                id: `meal-${index}`,
                type: 'meal',
                name: `🍽️ Refeição ${index + 1}`,
                startTime: mealTime,
                endTime: mealTime, // Refeições são pontuais
                duration: 0
            });
        });
    }

    // Adicionar exercício
    if (planData.exercise) {
        schedule.push({
            id: 'exercise-0',
            type: 'exercise',
            name: `💪 ${planData.exercise.type}`,
            startTime: planData.exercise.start,
            endTime: planData.exercise.end
        });
    }

    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Adicionar hidratação no final (meta diária - não tem horário fixo)
    if (appState.userData.userProfile && appState.userData.userProfile.waterNeeds) {
        schedule.push({
            id: 'hydration-daily',
            type: 'hydration',
            name: '💧 Hidratação Diária',
            startTime: '23:59',
            endTime: '23:59',
            waterGoal: appState.userData.userProfile.waterNeeds,
            duration: 0
        });
    }

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
