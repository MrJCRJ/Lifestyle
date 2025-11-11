// Dashboard de Estatísticas

/**
 * Mostrar dashboard
 */
function showDashboard() {
    const stats = calculateAllStats();
    renderDashboard(stats);
    showScreen('dashboard');
}

/**
 * Calcular todas as estatísticas
 */
function calculateAllStats() {
    const schedules = appState.userData.dailySchedules || {};
    const scheduleKeys = Object.keys(schedules);

    if (scheduleKeys.length === 0) {
        return null;
    }

    let totalWorkMinutes = 0;
    let totalStudyMinutes = 0;
    let totalSleepMinutes = 0;
    let totalFreeMinutes = 0;
    let daysWithSchedule = 0;

    const weeklyWork = Array(7).fill(0);
    const weeklyStudy = Array(7).fill(0);
    const weeklySleep = Array(7).fill(0);

    scheduleKeys.forEach(dateKey => {
        const schedule = schedules[dateKey];
        if (!schedule.activities) return;

        daysWithSchedule++;

        const date = parseDateKey(dateKey);
        const dayOfWeek = date.getDay();

        schedule.activities.forEach(activity => {
            const duration = calculateActivityDurationMinutes(activity);

            if (activity.type === 'work') {
                totalWorkMinutes += duration;
                weeklyWork[dayOfWeek] += duration;
            } else if (activity.type === 'study') {
                totalStudyMinutes += duration;
                weeklyStudy[dayOfWeek] += duration;
            } else if (activity.type === 'sleep') {
                totalSleepMinutes += duration;
                weeklySleep[dayOfWeek] += duration;
            }
        });

        // Calcular tempo livre
        const freeTime = calculateFreeTime(schedule.activities);
        totalFreeMinutes += freeTime.reduce((sum, slot) => sum + slot.duration, 0);
    });

    return {
        total: {
            work: {
                minutes: totalWorkMinutes,
                hours: (totalWorkMinutes / 60).toFixed(1),
                average: daysWithSchedule > 0 ? (totalWorkMinutes / daysWithSchedule / 60).toFixed(1) : 0
            },
            study: {
                minutes: totalStudyMinutes,
                hours: (totalStudyMinutes / 60).toFixed(1),
                average: daysWithSchedule > 0 ? (totalStudyMinutes / daysWithSchedule / 60).toFixed(1) : 0
            },
            sleep: {
                minutes: totalSleepMinutes,
                hours: (totalSleepMinutes / 60).toFixed(1),
                average: daysWithSchedule > 0 ? (totalSleepMinutes / daysWithSchedule / 60).toFixed(1) : 0
            },
            freeTime: {
                minutes: totalFreeMinutes,
                hours: (totalFreeMinutes / 60).toFixed(1),
                average: daysWithSchedule > 0 ? (totalFreeMinutes / daysWithSchedule / 60).toFixed(1) : 0
            }
        },
        weekly: {
            work: weeklyWork,
            study: weeklyStudy,
            sleep: weeklySleep
        },
        daysTracked: daysWithSchedule,
        totalSchedules: scheduleKeys.length
    };
}

/**
 * Renderizar dashboard
 */
function renderDashboard(stats) {
    const container = document.getElementById('dashboard-content');

    if (!stats) {
        container.innerHTML = `
            <div class="empty-dashboard">
                <h3>📊 Sem Dados Ainda</h3>
                <p>Crie alguns cronogramas para ver suas estatísticas aqui!</p>
                <button onclick="showScheduleView('today')" class="btn btn-primary">
                    Ver Cronogramas
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <!-- Resumo Geral -->
        <div class="stats-summary">
            <h3>📊 Resumo Geral</h3>
            <p class="subtitle">${stats.daysTracked} dias rastreados</p>
            
            <div class="stats-grid">
                <div class="stat-card work-card">
                    <div class="stat-icon">💼</div>
                    <div class="stat-info">
                        <h4>Trabalho</h4>
                        <div class="stat-value">${stats.total.work.hours}h</div>
                        <div class="stat-label">Média: ${stats.total.work.average}h/dia</div>
                    </div>
                </div>
                
                <div class="stat-card study-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h4>Estudo</h4>
                        <div class="stat-value">${stats.total.study.hours}h</div>
                        <div class="stat-label">Média: ${stats.total.study.average}h/dia</div>
                    </div>
                </div>
                
                <div class="stat-card sleep-card">
                    <div class="stat-icon">😴</div>
                    <div class="stat-info">
                        <h4>Sono</h4>
                        <div class="stat-value">${stats.total.sleep.hours}h</div>
                        <div class="stat-label">Média: ${stats.total.sleep.average}h/dia</div>
                    </div>
                </div>
                
                <div class="stat-card free-card">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-info">
                        <h4>Tempo Livre</h4>
                        <div class="stat-value">${stats.total.freeTime.hours}h</div>
                        <div class="stat-label">Média: ${stats.total.freeTime.average}h/dia</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Gráficos Semanais -->
        <div class="weekly-charts">
            <h3>📅 Distribuição Semanal</h3>
            
            <div class="chart-container">
                <h4>💼 Trabalho por Dia da Semana</h4>
                ${renderBarChart(stats.weekly.work, 'work')}
            </div>
            
            <div class="chart-container">
                <h4>📚 Estudo por Dia da Semana</h4>
                ${renderBarChart(stats.weekly.study, 'study')}
            </div>
            
            <div class="chart-container">
                <h4>😴 Sono por Dia da Semana</h4>
                ${renderBarChart(stats.weekly.sleep, 'sleep')}
            </div>
        </div>
        
        <!-- Insights -->
        <div class="insights-section">
            <h3>💡 Insights</h3>
            ${renderInsights(stats)}
        </div>
    `;
}

/**
 * Renderizar gráfico de barras simples
 */
function renderBarChart(data, type) {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const maxValue = Math.max(...data, 1);
    const colors = {
        work: '#fed7aa',
        study: '#a7f3d0',
        sleep: '#c7d2fe'
    };

    return `
        <div class="bar-chart">
            ${data.map((minutes, index) => {
        const hours = (minutes / 60).toFixed(1);
        const percentage = (minutes / maxValue) * 100;
        return `
                    <div class="bar-item">
                        <div class="bar-label">${dayNames[index]}</div>
                        <div class="bar-wrapper">
                            <div class="bar" style="height: ${percentage}%; background: ${colors[type]};">
                                <span class="bar-value">${hours}h</span>
                            </div>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

/**
 * Renderizar insights
 */
function renderInsights(stats) {
    const insights = [];

    // Insight sobre trabalho
    if (stats.total.work.average > 8) {
        insights.push({
            icon: '⚠️',
            text: `Você está trabalhando em média ${stats.total.work.average}h por dia. Considere balancear melhor seu tempo.`,
            type: 'warning'
        });
    } else if (stats.total.work.average > 0) {
        insights.push({
            icon: '👍',
            text: `Trabalho balanceado: média de ${stats.total.work.average}h por dia.`,
            type: 'success'
        });
    }

    // Insight sobre sono
    if (stats.total.sleep.average < 7) {
        insights.push({
            icon: '😴',
            text: `Atenção! Você está dormindo apenas ${stats.total.sleep.average}h por dia. O recomendado é 7-9h.`,
            type: 'warning'
        });
    } else if (stats.total.sleep.average >= 7 && stats.total.sleep.average <= 9) {
        insights.push({
            icon: '✅',
            text: `Padrão de sono saudável: ${stats.total.sleep.average}h por dia.`,
            type: 'success'
        });
    }

    // Insight sobre estudo
    if (stats.total.study.hours > 0) {
        insights.push({
            icon: '📚',
            text: `Você dedicou ${stats.total.study.hours}h ao estudo. Continue assim!`,
            type: 'info'
        });
    }

    // Insight sobre tempo livre
    if (stats.total.freeTime.average < 2) {
        insights.push({
            icon: '⏰',
            text: `Pouco tempo livre: apenas ${stats.total.freeTime.average}h/dia. Considere reservar mais tempo para lazer.`,
            type: 'warning'
        });
    }

    if (insights.length === 0) {
        return '<p>Continue registrando seus cronogramas para receber insights personalizados!</p>';
    }

    return insights.map(insight => `
        <div class="insight-card insight-${insight.type}">
            <span class="insight-icon">${insight.icon}</span>
            <p>${insight.text}</p>
        </div>
    `).join('');
}

/**
 * Obter estatísticas da semana atual
 */
function getWeekStats() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Domingo

    let totalWork = 0;
    let totalStudy = 0;
    let totalSleep = 0;
    let daysCount = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateKey = getDateKey(date);

        const schedule = appState.userData.dailySchedules?.[dateKey];
        if (schedule && schedule.activities) {
            daysCount++;

            schedule.activities.forEach(activity => {
                const duration = calculateActivityDurationMinutes(activity);

                if (activity.type === 'work') totalWork += duration;
                if (activity.type === 'study') totalStudy += duration;
                if (activity.type === 'sleep') totalSleep += duration;
            });
        }
    }

    return {
        work: (totalWork / 60).toFixed(1),
        study: (totalStudy / 60).toFixed(1),
        sleep: (totalSleep / 60).toFixed(1),
        daysTracked: daysCount
    };
}
