// ============================================================
// Ориентир — Background Service Worker
// Реализация Уровня 7: Ограничение слежки
// ============================================================
//
// Этот файл:
// 1. Подсчитывает заблокированные запросы
// 2. Хранит статистику по доменам
// 3. Управляет состоянием (вкл/выкл)
// 4. Обновляет badge расширения
//
// Внимание: declarativeNetRequest правила в rules/telemetry_rules.json
// делают основную работу (блокировка запросов). Этот файл — учёт и UI.

const STORAGE_KEY = 'orientir_stats';
const STATE_KEY = 'orientir_enabled';
const DEFAULT_STATE = true;

// Инициализация состояния
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get([STATE_KEY, STORAGE_KEY]);
  if (stored[STATE_KEY] === undefined) {
    await chrome.storage.local.set({ [STATE_KEY]: DEFAULT_STATE });
  }
  if (!stored[STORAGE_KEY]) {
    await chrome.storage.local.set({
      [STORAGE_KEY]: {
        totalBlocked: 0,
        byDomain: {},
        byType: {},
        firstBlocked: null,
        lastBlocked: null,
        sessionBlocked: 0
      }
    });
  }
  console.log('[Ориентир] Установлен. Состояние:', stored[STATE_KEY] ?? DEFAULT_STATE);
});

// ============================================================
// Подсчёт заблокированных запросов
// ============================================================
//
// declarativeNetRequest не даёт прямого API для подсчёта,
// поэтому используем onBeforeRequest (webRequest) для учёта
// запросов, которые DNR блокирует.
//
// Внимание: webRequest в Manifest V3 работает как наблюдатель,
// не может блокировать сам (только DNR). Но мы можем видеть
// запросы и сравнивать с тем, что блокируется.

// Список паттернов, которые мы считаем телеметрией
// (должен совпадать с rules/telemetry_rules.json)
const TELEMETRY_PATTERNS = [
  // Google Analytics
  /google-analytics\.com\/(collect|g|j\/)/,
  /googletagmanager\.com\/gtm\.js/,
  /analytics\.google\.com/,
  // OpenAI telemetry
  /chatgpt\.com\/ces\//,
  /chatgpt\.com\/backend-api\/conversation\/.*\/metrics/,
  /oaistatic\.com\/_next\/static\/chunks\/.*analytics/,
  // Anthropic / Claude
  /claude\.ai\/api\/.*telemetry/,
  /anthropic\.com\/.*metrics/,
  // Google / Gemini
  /gemini\.google\.com\/.*\/log/,
  /google\.com\/gen_204/,
  /clients\d*\.google\.com\/.*\/log/,
  // Общие analytics
  /segment\.io\/v1\//,
  /mixpanel\.com\/track/,
  /amplitude\.com\/.*\/httpapi/,
  /hotjar\.com\/api/,
  /fullstory\.com\/rec/,
  /sentry\.io\/api/,
  /datadoghq\.com\/api\/v2\/rum/,
  /newrelic\.com\/.*\/events/,
  // Facebook Pixel
  /facebook\.net\/.*fbevents/,
  /facebook\.com\/tr/,
  // Рекламные сети
  /doubleclick\.net\/.*\/activity/,
  /adsrvr\.org\/track/,
  /adroll\.com\/j\/roundtrip/,
  // Canvas fingerprinting
  /.*\/fingerprint(?:js)?(?:\.min)?\.js/,
  // Device fingerprinting
  /.*\/device-fingerprint/,
  /.*\/clientjs/,
  // Поведенческая аналитика
  /.*\/behavioral-tracking/,
  /.*\/user-tracking/,
  /.*\/event-track/
];

async function incrementStats(details) {
  const state = await chrome.storage.local.get([STATE_KEY]);
  if (!state[STATE_KEY]) return;

  const url = new URL(details.url);
  const domain = url.hostname;

  // Проверяем, попадает ли URL под телеметрию
  const isTelemetry = TELEMETRY_PATTERNS.some(pattern => pattern.test(details.url));
  if (!isTelemetry) return;

  const stats = await chrome.storage.local.get([STORAGE_KEY]);
  const data = stats[STORAGE_KEY];
  const now = Date.now();

  data.totalBlocked += 1;
  data.sessionBlocked += 1;
  data.byDomain[domain] = (data.byDomain[domain] || 0) + 1;
  data.byType['telemetry'] = (data.byType['telemetry'] || 0) + 1;
  if (!data.firstBlocked) data.firstBlocked = now;
  data.lastBlocked = now;

  await chrome.storage.local.set({ [STORAGE_KEY]: data });

  // Обновляем badge
  await updateBadge();
}

// Слушаем все запросы (manifest V3 — наблюдатель)
chrome.webRequest.onBeforeRequest.addListener(
  incrementStats,
  {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest", "image", "script", "ping", "beacon"]
  },
  []
);

// ============================================================
// Управление badge
// ============================================================
async function updateBadge() {
  const state = await chrome.storage.local.get([STATE_KEY]);
  if (!state[STATE_KEY]) {
    await chrome.action.setBadgeText({ text: 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: '#666666' });
    return;
  }

  const stats = await chrome.storage.local.get([STORAGE_KEY]);
  const count = stats[STORAGE_KEY]?.sessionBlocked || 0;

  if (count === 0) {
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#a5d6a7' });
  } else if (count < 100) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: '#ffcc80' });
  } else {
    await chrome.action.setBadgeText({ text: '99+' });
    await chrome.action.setBadgeBackgroundColor({ color: '#ef5350' });
  }
}

// Обновляем badge при переключении вкладок
chrome.tabs.onActivated.addListener(updateBadge);

// Сброс сессионной статистики при загрузке браузера
chrome.runtime.onStartup.addListener(async () => {
  const stats = await chrome.storage.local.get([STORAGE_KEY]);
  if (stats[STORAGE_KEY]) {
    stats[STORAGE_KEY].sessionBlocked = 0;
    await chrome.storage.local.set({ [STORAGE_KEY]: stats[STORAGE_KEY] });
  }
  await updateBadge();
});

// ============================================================
// Обработка сообщений от popup / content script
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get([STORAGE_KEY, STATE_KEY]).then(result => {
      sendResponse({
        stats: result[STORAGE_KEY],
        enabled: result[STATE_KEY]
      });
    });
    return true; // async response
  }

  if (message.type === 'TOGGLE_STATE') {
    chrome.storage.local.get([STATE_KEY]).then(async result => {
      const newState = !result[STATE_KEY];
      await chrome.storage.local.set({ [STATE_KEY]: newState });

      // Включаем/выключаем DNR правила
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: newState ? ['telemetry_rules'] : [],
        disableRulesetIds: newState ? [] : ['telemetry_rules']
      });

      await updateBadge();
      sendResponse({ enabled: newState });
    });
    return true;
  }

  if (message.type === 'RESET_STATS') {
    chrome.storage.local.set({
      [STORAGE_KEY]: {
        totalBlocked: 0,
        byDomain: {},
        byType: {},
        firstBlocked: null,
        lastBlocked: null,
        sessionBlocked: 0
      }
    }).then(() => {
      updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'RESET_SESSION') {
    chrome.storage.local.get([STORAGE_KEY]).then(async result => {
      const data = result[STORAGE_KEY];
      data.sessionBlocked = 0;
      await chrome.storage.local.set({ [STORAGE_KEY]: data });
      await updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }
});

// Инициализация badge при запуске
updateBadge();

console.log('[Ориентир] Background service worker загружен');
