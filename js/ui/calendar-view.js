// Gerenciador de visualização de calendário
// Exibe um calendário mensal com indicadores visuais de progresso de planejamento

let calendarState = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null
};

// Abrir modal de calendário
function openCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (!modal) {
    console.error('Calendar modal not found');
    return;
  }

  // Resetar para mês atual
  const now = new Date();
  calendarState.currentMonth = now.getMonth();
  calendarState.currentYear = now.getFullYear();

  // Renderizar calendário
  renderCalendar();

  // Mostrar modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Fechar modal de calendário
function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Mudar mês do calendário
function changeCalendarMonth(direction) {
  calendarState.currentMonth += direction;

  if (calendarState.currentMonth > 11) {
    calendarState.currentMonth = 0;
    calendarState.currentYear++;
  } else if (calendarState.currentMonth < 0) {
    calendarState.currentMonth = 11;
    calendarState.currentYear--;
  }

  renderCalendar();
}

// Ir para hoje pelo calendário
function goToTodayFromCalendar() {
  const today = new Date();
  const todayKey = getDateKey(today);

  closeCalendarModal();
  goToSpecificDate(todayKey);
}

// Ir para data específica
function goToSpecificDate(dateKey) {
  // Se a data não existir nos cronogramas atuais, criar um vazio
  if (!appState.userData.dailySchedules[dateKey]) {
    const date = parseDateKey(dateKey);
    appState.userData.dailySchedules[dateKey] = {
      date: dateKey,
      dayName: getDayName(date),
      formattedDate: getFormattedDate(date),
      activities: [],
      isEmpty: true
    };
    saveToStorage();
  }

  // Converter data para objeto Date
  const targetDate = parseDateKey(dateKey);

  // Calcular a semana da data selecionada (segunda a domingo)
  const dayOfWeek = targetDate.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStartDate = new Date(targetDate);
  weekStartDate.setDate(weekStartDate.getDate() + diffToMonday);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  // Gerar cronogramas para a semana da data selecionada
  const schedules = [];
  const currentDate = new Date(weekStartDate);

  while (currentDate <= weekEndDate) {
    const currentDateKey = getDateKey(currentDate);
    const dailySchedules = appState.userData.dailySchedules || {};

    if (dailySchedules[currentDateKey]) {
      schedules.push(dailySchedules[currentDateKey]);
    } else {
      schedules.push({
        date: currentDateKey,
        dayName: getDayName(currentDate),
        formattedDate: getFormattedDate(currentDate),
        activities: [],
        isEmpty: true
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Atualizar estado do carrossel
  carouselState.schedules = schedules;
  carouselState.filter = 'week';

  // Encontrar índice da data selecionada
  const targetIndex = schedules.findIndex(s => s.date === dateKey);
  if (targetIndex >= 0) {
    carouselState.currentIndex = targetIndex;
  }

  // Renderizar cronogramas
  const container = document.getElementById('schedule-display');
  const todayKey = getDateKey(new Date());

  const html = schedules.map(schedule => {
    if (schedule.isEmpty) {
      return renderEmptyDayCard(schedule);
    } else {
      const isToday = schedule.date === todayKey;
      return renderScheduleDayCard(schedule, isToday);
    }
  }).join('');

  container.innerHTML = html;

  // Renderizar indicadores e atualizar posição
  renderCarouselIndicators();
  updateCarouselPosition();

  // Mostrar tela de cronograma
  showScreen('schedule');
}

// Renderizar calendário completo
function renderCalendar() {
  // Atualizar título do mês/ano
  const monthYearEl = document.getElementById('calendar-month-year');
  if (monthYearEl) {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    monthYearEl.textContent = `${monthNames[calendarState.currentMonth]} ${calendarState.currentYear}`;
  }

  // Renderizar dias
  const daysGrid = document.getElementById('calendar-days-grid');
  if (!daysGrid) return;

  // Calcular primeiro dia do mês e total de dias
  const firstDay = new Date(calendarState.currentYear, calendarState.currentMonth, 1);
  const lastDay = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

  // Limpar grid
  daysGrid.innerHTML = '';

  // Adicionar células vazias para dias antes do início do mês
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    daysGrid.appendChild(emptyCell);
  }

  // Adicionar dias do mês
  const today = new Date();
  const todayKey = getDateKey(today);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calendarState.currentYear, calendarState.currentMonth, day);
    const dateKey = getDateKey(date);
    const isToday = dateKey === todayKey;

    // Calcular progresso de planejamento
    const progress = calculateDayProgress(dateKey);

    // Criar célula do dia
    const dayCell = document.createElement('div');
    dayCell.className = `calendar-day ${isToday ? 'today' : ''}`;
    dayCell.onclick = () => selectCalendarDate(dateKey);

    // Número do dia
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    // Indicador de progresso (pizza circle)
    const progressIndicator = createProgressIndicator(progress);
    dayCell.appendChild(progressIndicator);

    daysGrid.appendChild(dayCell);
  }
}

// Calcular progresso de planejamento de um dia
function calculateDayProgress(dateKey) {
  const schedule = appState.userData.dailySchedules[dateKey];

  if (!schedule || schedule.isEmpty || !schedule.activities || schedule.activities.length === 0) {
    return 0;
  }

  // Categorias principais que contam para o progresso
  const mainCategories = [
    'sleep',      // Sono
    'work',       // Trabalho
    'study',      // Estudo
    'exercise',   // Exercício
    'meal',       // Refeições (contam como 1 categoria mesmo tendo várias)
    'hydration',  // Hidratação
    'cleaning',   // Limpeza
    'hygiene',    // Higiene (nova categoria)
    'project',    // Projetos
    'hobby'       // Hobbies
  ];

  // Contar quantas categorias foram configuradas
  const configuredCategories = new Set();

  schedule.activities.forEach(activity => {
    if (mainCategories.includes(activity.type)) {
      configuredCategories.add(activity.type);
    }
  });

  // Calcular porcentagem (considerando 10 categorias possíveis)
  const progress = (configuredCategories.size / mainCategories.length) * 100;
  return Math.round(progress);
}

// Criar indicador visual de progresso (pizza circle)
function createProgressIndicator(progress) {
  const container = document.createElement('div');
  container.className = 'progress-indicator';

  if (progress === 0) {
    // Sem progresso - círculo vazio cinza
    container.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" stroke-width="3"/>
            </svg>
        `;
  } else {
    // Com progresso - círculo colorido
    const circumference = 2 * Math.PI * 16; // raio = 16
    const offset = circumference - (progress / 100) * circumference;

    // Cor baseada no progresso
    let color = '#ef4444'; // Vermelho (baixo)
    if (progress >= 75) {
      color = '#10b981'; // Verde (alto)
    } else if (progress >= 40) {
      color = '#f59e0b'; // Amarelo (médio)
    }

    container.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 36 36">
                <!-- Círculo de fundo -->
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <!-- Círculo de progresso -->
                <circle cx="18" cy="18" r="16" fill="none" 
                        stroke="${color}" 
                        stroke-width="3"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"
                        stroke-linecap="round"
                        transform="rotate(-90 18 18)"/>
            </svg>
        `;
  }

  return container;
}

// Selecionar data do calendário
function selectCalendarDate(dateKey) {
  closeCalendarModal();
  goToSpecificDate(dateKey);
}

// Inicializar calendário quando a página carregar
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // O modal será aberto quando o usuário clicar no botão
    console.log('Calendar view initialized');
  });
}
