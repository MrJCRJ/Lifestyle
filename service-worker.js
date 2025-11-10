// Service Worker para PWA - Lifestyle App

const CACHE_NAME = 'lifestyle-v2.2';
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/base.css',
  '/css/components.css',
  '/css/screens.css',
  '/css/buttons.css',
  '/css/cards.css',
  '/css/forms.css',
  '/css/modals.css',
  '/css/tracking.css',
  '/css/dashboard.css',
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
  '/js/pwa-install.js',
  '/js/notifications-simple.js',
  '/components/header.html',
  '/components/footer.html',
  '/components/settings-modal.html',
  '/components/setup-screens.html',
  '/components/planner-screens.html',
  '/components/schedule-screen.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
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

// Interceptar requisições - Estratégia: Cache First com Network Fallback
self.addEventListener('fetch', event => {
  // Para requisições de navegação (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Atualiza cache com a resposta da rede
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Se offline, tenta buscar do cache ou retorna página offline
          return caches.match(event.request)
            .then(cached => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // Para outros recursos (CSS, JS, imagens)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          // Retorna do cache e atualiza em background
          fetch(event.request).then(response => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(() => { });
          return cached;
        }

        // Se não está no cache, busca da rede
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Fallback para offline
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
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

// Notificações push (simples e funcional)
self.addEventListener('push', event => {
  console.log('Service Worker: Push recebido');

  let notificationData = {
    title: 'Lifestyle App',
    body: 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };

  // Se houver dados no push
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || 'lifestyle-notification',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {}
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag || 'lifestyle-notification',
    requireInteraction: notificationData.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      url: notificationData.data.url || '/',
      ...notificationData.data
    },
    actions: notificationData.data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notificação clicada');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
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
