// Estado global da aplicação
const appState = {
    currentScreen: 'welcome',
    todayDate: new Date(),
    todayName: '',
    userData: {
        dailySchedules: {} // Armazena cronogramas por data (YYYY-MM-DD)
    }
};

// Converter string YYYY-MM-DD para Date local (sem timezone)
function parseDateKey(dateKey) {
    if (typeof dateKey !== 'string') return null;
    const parts = dateKey.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

// Obter nome do dia atual
function getTodayName() {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[appState.todayDate.getDay()];
}

// Obter data formatada
function getFormattedDate(date) {
    // Se não passar data, usar a data de hoje
    if (!date) {
        date = appState.todayDate;
    }
    // Se for string no formato YYYY-MM-DD, converter para Date local
    if (typeof date === 'string') {
        const parsed = parseDateKey(date);
        if (parsed) {
            date = parsed;
        } else {
            date = new Date(date + 'T00:00:00');
        }
    }
    // Se não for Date válido, usar hoje
    if (!(date instanceof Date) || isNaN(date)) {
        date = appState.todayDate;
    }

    const day = date.getDate();
    const month = date.toLocaleString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
}

// Obter data no formato YYYY-MM-DD
function getDateKey(date) {
    // Se não passar data, usar a data de hoje
    if (!date) {
        date = appState.todayDate;
    }
    // Se for string, retornar direto
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
    }
    // Se não for Date válido, usar hoje
    if (!(date instanceof Date) || isNaN(date)) {
        date = appState.todayDate;
    }

    // Usar timezone local ao invés de UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Obter nome do dia (de uma data específica)
function getDayName(date) {
    // Se não passar data, usar a data de hoje
    if (!date) {
        date = appState.todayDate;
    }
    // Se for string no formato YYYY-MM-DD, converter para Date local
    if (typeof date === 'string') {
        const parsed = parseDateKey(date);
        if (parsed) {
            date = parsed;
        } else {
            date = new Date(date + 'T00:00:00');
        }
    }
    // Se não for Date válido, usar hoje
    if (!(date instanceof Date) || isNaN(date)) {
        date = appState.todayDate;
    }

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
}

// Salvar no localStorage
function saveToStorage() {
    const saveData = {
        ...appState.userData,
        activeFilter: appState.activeFilter,
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('lifestyleData', JSON.stringify(saveData));
}

// Carregar do localStorage
function loadFromStorage() {
    const saved = localStorage.getItem('lifestyleData');
    if (saved) {
        const data = JSON.parse(saved);

        // Remover campos obsoletos do nível raiz (migração)
        delete data.sleep;
        delete data.wake;
        delete data.jobs;
        delete data.studies;

        appState.userData = data;
        appState.activeFilter = data.activeFilter || 'today';
    }
}

// Obter próximo dia
function getNextDay() {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return days[tomorrow.getDay()];
}
