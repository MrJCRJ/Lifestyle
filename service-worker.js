// Service Worker para PWA

const CACHE_NAME = 'lifestyle-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/components.css',
  '/css/screens.css',
  '/css/buttons.css',
  '/css/cards.css',
  '/css/forms.css',
  '/css/modals.css',
  '/css/tracking.css',
  '/js/main.js',
  '/js/component-loader.js',
  '/js/state.js',
  '/js/settings.js',
  '/js/data-transfer.js',
  '/js/notifications.js',
  '/js/free-time.js',
  '/js/dashboard.js',
  '/js/forms.js',
  '/js/navigation.js',
  '/js/work.js',
  '/js/study.js',
  '/js/cleaning.js',
  '/js/planner.js',
  '/js/schedule-generator.js',
  '/js/schedule-filters.js',
  '/js/schedule-render.js',
  '/js/schedule-display.js',
  '/js/time-utils.js',
  '/js/tracking-modals.js',
  '/js/tracking-actions.js',
  '/js/schedule-events.js',
  '/js/planner-wizard.js',
  '/js/planner-data.js',
  '/js/schedule-planner.js',
  '/components/header.html',
  '/components/footer.html',
  '/components/settings-modal.html',
  '/components/setup-screens.html',
  '/components/planner-screens.html',
  '/components/schedule-screen.html'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) {
          return response;
        }

        // Senão, busca da rede
        return fetch(event.request).then(response => {
          // Não cachear se não for resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Se offline e não tem no cache, retorna página offline
          return caches.match('/index.html');
        });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('Service Worker: Sincronização em background');
  if (event.tag === 'sync-schedules') {
    event.waitUntil(syncSchedules());
  }
});

// Notificações push (para futuro)
self.addEventListener('push', event => {
  console.log('Service Worker: Push recebido');
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Lifestyle App',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Lifestyle App', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notificação clicada');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Função auxiliar de sincronização
async function syncSchedules() {
  try {
    // Aqui você pode implementar sincronização com servidor no futuro
    console.log('Service Worker: Sincronizando cronogramas...');
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Erro ao sincronizar:', error);
    return Promise.reject(error);
  }
}
