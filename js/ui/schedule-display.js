// Controlador principal de visualização de cronogramas
// Depende de: schedule-render.js, schedule-filters.js

// Estado do carrossel
let carouselState = {
    currentIndex: 0,
    schedules: [],
    filter: 'week' // Sempre mostra semana inteira
};

// Mostrar visualização de cronogramas com filtro
function showScheduleView(filter = 'week') {
    const container = document.getElementById('schedule-display');
    const schedules = getSchedulesByFilter(filter);

    // Salvar filtro ativo
    appState.activeFilter = filter;
    saveToStorage();

    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <strong>Nenhum cronograma encontrado para este período.</strong>
            </div>
        `;
        showScreen('schedule');
        return;
    }

    // Salvar cronogramas no estado do carrossel
    carouselState.schedules = schedules;
    carouselState.filter = filter;

    // Encontrar índice do dia atual
    const todayKey = getDateKey(new Date());
    const todayIndex = schedules.findIndex(s => s.date === todayKey);
    carouselState.currentIndex = todayIndex >= 0 ? todayIndex : 0;

    // Renderizar todos os cronogramas
    const html = schedules.map(schedule => {
        if (schedule.isEmpty) {
            return renderEmptyDayCard(schedule);
        } else {
            const isToday = schedule.date === todayKey;
            return renderScheduleDayCard(schedule, isToday);
        }
    }).join('');

    container.innerHTML = html;

    // Renderizar indicadores
    renderCarouselIndicators();

    // Mover para o dia atual
    updateCarouselPosition();

    showScreen('schedule');

    // Atualizar linha de hora atual a cada minuto
    if (filter === 'today' || filter === 'week') {
        // Limpar intervalo anterior se existir
        if (window.timeIndicatorInterval) {
            clearInterval(window.timeIndicatorInterval);
        }
        // Atualizar a cada 60 segundos
        window.timeIndicatorInterval = setInterval(() => {
            // Recarregar apenas se estiver visualizando a semana atual
            const currentSchedule = carouselState.schedules[carouselState.currentIndex];
            if (currentSchedule && currentSchedule.date === getDateKey(new Date())) {
                showScheduleView(carouselState.filter);
            }
        }, 60000);
    }
}

// Navegar no carrossel
function navigateCarousel(direction) {
    const newIndex = carouselState.currentIndex + direction;

    if (newIndex < 0 || newIndex >= carouselState.schedules.length) {
        return; // Não navegar além dos limites
    }

    carouselState.currentIndex = newIndex;
    updateCarouselPosition();
    updateCarouselIndicators();
}

// Ir para um índice específico
function goToCarouselIndex(index) {
    if (index < 0 || index >= carouselState.schedules.length) {
        return;
    }

    carouselState.currentIndex = index;
    updateCarouselPosition();
    updateCarouselIndicators();
}

// Ir para hoje
function goToToday() {
    const todayKey = getDateKey(new Date());
    const todayIndex = carouselState.schedules.findIndex(s => s.date === todayKey);

    if (todayIndex >= 0) {
        goToCarouselIndex(todayIndex);
    } else {
        // Se hoje não estiver na lista atual, recarregar com a semana
        showScheduleView('week');
    }
}

// Atualizar posição do carrossel
function updateCarouselPosition() {
    const track = document.getElementById('schedule-display');
    if (!track) return;

    const offset = -carouselState.currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
}

// Renderizar indicadores do carrossel
function renderCarouselIndicators() {
    const container = document.getElementById('carousel-indicators');
    if (!container) return;

    const html = carouselState.schedules.map((schedule, index) => {
        const isActive = index === carouselState.currentIndex;
        const { dayName } = resolveScheduleDayInfo(schedule);
        const shortDay = dayName.substring(0, 3);

        return `<div 
            class="carousel-indicator ${isActive ? 'active' : ''}" 
            onclick="goToCarouselIndex(${index})"
            title="${dayName}"
        ></div>`;
    }).join('');

    container.innerHTML = html;
}

// Atualizar indicadores do carrossel
function updateCarouselIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === carouselState.currentIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Suporte para gestos de swipe (touch)
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - próximo
            navigateCarousel(1);
        } else {
            // Swipe right - anterior
            navigateCarousel(-1);
        }
    }
}

// Adicionar listeners de swipe quando a página carregar
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const carousel = document.getElementById('schedule-carousel');
        if (carousel) {
            carousel.addEventListener('touchstart', handleTouchStart);
            carousel.addEventListener('touchend', handleTouchEnd);
        }
    });

    // Suporte para teclado
    window.addEventListener('keydown', (e) => {
        if (appState.currentScreen === 'schedule') {
            if (e.key === 'ArrowLeft') {
                navigateCarousel(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCarousel(1);
            }
        }
    });
}
