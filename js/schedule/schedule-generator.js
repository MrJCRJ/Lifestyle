// Funções de geração de cronogramas

// Gerar cronograma do dia de hoje
function generateTodaySchedule() {
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

    let projects = [];
    const hasProject = document.querySelector('input[name="hasProject"]:checked');
    if (hasProject && hasProject.value === 'yes') {
        try {
            projects = collectProjectsData('projects', 'project');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    let hobbies = [];
    const hasHobby = document.querySelector('input[name="hasHobby"]:checked');
    if (hasHobby && hasHobby.value === 'yes') {
        try {
            hobbies = collectHobbiesData('hobbies', 'hobby');
        } catch (error) {
            alert(error.message);
            return;
        }
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
        hobbies: hobbies,
        projects: projects,
        meals: meals,
        exercise: exercise
    };

    // Construir cronograma usando o módulo centralizado
    const waterGoal = appState.userData.userProfile?.waterNeeds;
    const schedule = buildScheduleFromPlanData(planData, waterGoal);

    // Validar conflitos de horários
    const conflicts = validateScheduleConflicts(schedule, todayKey);
    if (conflicts.length > 0) {
        const message = formatConflictsMessage(conflicts);
        alert(message);
        return;
    }

    // Preservar status de atividades existentes
    const existingSchedule = appState.userData.dailySchedules?.[todayKey];
    if (existingSchedule && existingSchedule.activities) {
        preserveTrackingStatus(schedule, existingSchedule.activities);
    }

    // Salvar no objeto de cronogramas diários
    if (!appState.userData.dailySchedules) {
        appState.userData.dailySchedules = {};
    }

    appState.userData.dailySchedules[todayKey] = {
        date: todayKey,
        dayName: getTodayName(),
        formattedDate: getFormattedDate(new Date()),
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
    // Usar dados de hidratação do planData se disponível, senão pegar do perfil
    let hydrationData = planData.hydration;

    if (!hydrationData && appState.userData.userProfile) {
        hydrationData = {
            weight: appState.userData.userProfile.weight,
            height: appState.userData.userProfile.height,
            waterNeeds: appState.userData.userProfile.waterNeeds
        };
    }

    return buildScheduleFromPlanData(planData, hydrationData);
}
