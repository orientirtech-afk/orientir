// public/sw.js — Service Worker для офлайн-доступа и кеширования статики
// Стратегия: cache-first для статики, network-first для HTML, stale-while-revalidate для шрифтов

const CACHE_VERSION = 'orientir-v2-6-5-20260708';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Список предзагрузки (критичные ресурсы)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/fonts/Manrope-Variable.woff2',
  '/fonts/JetBrainsMono-Variable.woff2'
];

// ============================================================
// INSTALL: предзагрузка критичных ресурсов
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Ошибка precache:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE: очистка старых кешей
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH: стратегии кеширования
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Игнорируем не-GET запросы
  if (request.method !== 'GET') return;

  // Игнорируем chrome-extension и другие протоколы
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Внешние ресурсы (CDN) — network-only, не кешируем
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML — network-first (всегда свежий контент)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Шрифты — stale-while-revalidate
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Остальная статика (CSS, JS, images) — cache-first
  event.respondWith(cacheFirstStrategy(request));
});

// ============================================================
// СТРАТЕГИИ
// ============================================================
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Офлайн fallback
    if (request.destination === 'image') {
      return caches.match('/favicon.svg');
    }
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback на главную
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Офлайн', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// ============================================================
// MESSAGE: управление из клиента
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
});
