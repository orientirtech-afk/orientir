// ============================================================
// Ориентир — Background Service Worker
// Реализация Уровня 7: Ограничение слежки
// ============================================================
//
// Этот файл:
// 1. Подсчитывает заблокированные запросы через DNR
//    (onRuleMatchedInfo — единственный источник истины,
//     без дублирования паттернов из telemetry_rules.json)
// 2. Хранит статистику по доменам
// 3. Управляет состоянием (вкл/выкл)
// 4. Принимает статистику от content scripts (через bridge)
// 5. Рассылает обновления опций и состояния во все вкладки
// 6. Обновляет badge расширения

const STORAGE_KEY = 'orientir_stats';
const STATE_KEY = 'orientir_enabled';
const DEFAULT_STATE = true;

// Список AI-доменов (должен совпадать с manifest.json host_permissions
// и content-bridge.js AI_DOMAINS)
const AI_URL_FILTERS = [
  'https://chatgpt.com/*',
  'https://chat.openai.com/*',
  'https://claude.ai/*',
  'https://gemini.google.com/*',
  'https://aistudio.google.com/*',
  'https://www.perplexity.ai/*',
  'https://you.com/*',
  'https://poe.com/*',
  'https://character.ai/*',
  'https://replika.com/*'
];

// Инициализация состояния
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get([STATE_KEY, STORAGE_KEY]);
  if (stored[STATE_KEY] === undefined) {
    await chrome.storage.local.set({ [STATE_KEY]: DEFAULT_STATE });
  }
  if (!stored[STORAGE_KEY]) {
    await chrome.storage.local.set({
      [STORAGE_KEY]: makeEmptyStats()
    });
  }
  console.log('[Ориентир] Установлен. Состояние:', stored[STATE_KEY] ?? DEFAULT_STATE);
});

function makeEmptyStats() {
  return {
    totalBlocked: 0,
    sessionBlocked: 0,
    byDomain: {},
    byType: {
      telemetry: 0,
      listeners: 0,
      beacons: 0,
      canvas: 0,
      webrtc: 0,
      audio: 0,
      fingerprint: 0
    },
    firstBlocked: null,
    lastBlocked: null
  };
}

// ============================================================
// Подсчёт заблокированных запросов
// ============================================================
//
// Используем declarativeNetRequest.onRuleMatchedInfo — это
// срабатывает при совпадении DNR-правила. Один источник истины,
// никакого дублирования паттернов.
//
// Требует permission "declarativeNetRequestFeedback".
// Работает в Chrome 116+ как в unpacked, так и в packed режиме.

if (chrome.declarativeNetRequest.onRuleMatchedInfo) {
  chrome.declarativeNetRequest.onRuleMatchedInfo.addListener(
    async (info) => {
      const state = await chrome.storage.local.get([STATE_KEY]);
      if (!state[STATE_KEY]) return;

      const url = safeParseUrl(info.request.url);
      if (!url) return;
      const domain = url.hostname;

      const stats = await chrome.storage.local.get([STORAGE_KEY]);
      const data = stats[STORAGE_KEY];
      const now = Date.now();

      data.totalBlocked += 1;
      data.sessionBlocked += 1;
      data.byDomain[domain] = (data.byDomain[domain] || 0) + 1;
      data.byType.telemetry = (data.byType.telemetry || 0) + 1;
      if (!data.firstBlocked) data.firstBlocked = now;
      data.lastBlocked = now;

      await chrome.storage.local.set({ [STORAGE_KEY]: data });
      await updateBadge();
    },
    { urls: AI_URL_FILTERS }
  );
  console.log('[Ориентир] onRuleMatchedInfo активен');
} else {
  // Fallback для старых Chrome (< 116): используем webRequest observer
  // с ограничением только по AI-доменам (не <all_urls>)
  console.warn('[Ориентир] onRuleMatchedInfo недоступен, fallback на webRequest');

  // Список паттернов телеметрии — синхронизирован с rules/telemetry_rules.json
  // Внимание: при обновлении правил обновлять и здесь.
  const TELEMETRY_PATTERNS = [
    /google-analytics\.com\/(collect|g\/)/,
    /googletagmanager\.com\/gtm\.js/,
    /analytics\.google\.com/,
    /chatgpt\.com\/ces\//,
    /chatgpt\.com\/backend-api\/conversation\/.*\/metrics/,
    /oaistatic\.com\/_next\/static\/chunks\/.*analytics/,
    /claude\.ai\/api\/.*telemetry/,
    /anthropic\.com\/.*metrics/,
    /gemini\.google\.com\/.*\/log/,
    /google\.com\/gen_204/,
    /clients\d*\.google\.com\/.*\/log/,
    /segment\.io\/v1\//,
    /mixpanel\.com\/track/,
    /amplitude\.com\/.*\/httpapi/,
    /hotjar\.com\/api/,
    /fullstory\.com\/rec/,
    /sentry\.io\/api/,
    /datadoghq\.com\/api\/v2\/rum/,
    /newrelic\.com\/.*\/events/,
    /facebook\.net\/.*fbevents/,
    /facebook\.com\/tr/,
    /doubleclick\.net\/.*\/activity/,
    /adsrvr\.org\/track/,
    /adroll\.com\/j\/roundtrip/,
    /scorecardresearch\.com\/beacon/,
    /quantserve\.com\/quant/,
    /comscore\.com\/beat/,
    /optimizely\.com\/log/,
    /crazyegg\.com\/track/,
    /mouseflow\.com\//,
    /clarity\.ms\//,
    /logrocket\.com\//,
    /.*\/fingerprint(?:js)?(?:\.min)?\.js/,
    /.*\/device-fingerprint/,
    /.*\/clientjs/,
    /.*\/behavioral-tracking/,
    /.*\/user-tracking/,
    /.*\/event-track/
  ];

  chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
      const state = await chrome.storage.local.get([STATE_KEY]);
      if (!state[STATE_KEY]) return;

      // Считаем только запросы с AI-страниц
      const initiator = details.initiator || details.originUrl || '';
      const isFromAISite = AI_URL_FILTERS.some(pattern => {
        const host = pattern.replace('https://', '').replace('/*', '');
        return initiator.includes(host);
      });
      if (!isFromAISite) return;

      const isTelemetry = TELEMETRY_PATTERNS.some(p => p.test(details.url));
      if (!isTelemetry) return;

      const url = safeParseUrl(details.url);
      if (!url) return;

      const stats = await chrome.storage.local.get([STORAGE_KEY]);
      const data = stats[STORAGE_KEY];
      const now = Date.now();

      data.totalBlocked += 1;
      data.sessionBlocked += 1;
      data.byDomain[url.hostname] = (data.byDomain[url.hostname] || 0) + 1;
      data.byType.telemetry = (data.byType.telemetry || 0) + 1;
      if (!data.firstBlocked) data.firstBlocked = now;
      data.lastBlocked = now;

      await chrome.storage.local.set({ [STORAGE_KEY]: data });
      await updateBadge();
    },
    { urls: AI_URL_FILTERS, types: ['xmlhttprequest', 'image', 'script', 'ping', 'beacon'] },
    []
  );
}

function safeParseUrl(urlString) {
  try {
    return new URL(urlString);
  } catch (e) {
    return null;
  }
}

// ============================================================
// Статистика от content scripts (через bridge)
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTENT_STATS') {
    // Content script (MAIN world) прислал статистику через bridge
    handleContentStats(message).catch(console.error);
    return false;
  }

  if (message.type === 'GET_STATS') {
    chrome.storage.local.get([STORAGE_KEY, STATE_KEY]).then(result => {
      sendResponse({
        stats: result[STORAGE_KEY],
        enabled: result[STATE_KEY]
      });
    });
    return true; // async
  }

  if (message.type === 'TOGGLE_STATE') {
    chrome.storage.local.get([STATE_KEY]).then(async result => {
      const newState = !(result[STATE_KEY] === false ? false : true);
      await chrome.storage.local.set({ [STATE_KEY]: newState });

      // Включаем/выключаем DNR правила
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: newState ? ['telemetry_rules'] : [],
        disableRulesetIds: newState ? [] : ['telemetry_rules']
      });

      // Рассылаем обновление состояния во все вкладки с AI-сайтами
      await broadcastToTabs({ type: 'STATE_UPDATED', enabled: newState });

      await updateBadge();
      sendResponse({ enabled: newState });
    });
    return true;
  }

  if (message.type === 'RESET_STATS') {
    chrome.storage.local.set({ [STORAGE_KEY]: makeEmptyStats() }).then(() => {
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

  if (message.type === 'PAUSE_HOUR') {
    // Пауза на 1 час: запоминаем состояние, отключаем защиту, ставим alarm
    chrome.storage.local.get([STATE_KEY]).then(async result => {
      const wasEnabled = result[STATE_KEY] !== false;
      const pauseUntil = Date.now() + 60 * 60 * 1000; // 1 час

      // Сохраняем предыдущее состояние (для восстановления)
      await chrome.storage.local.set({
        orientir_paused_until: pauseUntil,
        orientir_paused_prev_state: wasEnabled
      });

      // Отключаем DNR
      if (wasEnabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: [],
          disableRulesetIds: ['telemetry_rules']
        });
        await chrome.storage.local.set({ [STATE_KEY]: false });
        await broadcastToTabs({ type: 'STATE_UPDATED', enabled: false });
      }

      // Alarm для автовозобновления
      chrome.alarms.create('resume-protection', { when: pauseUntil });

      await updateBadge();
      sendResponse({ success: true, pausedUntil: pauseUntil });
    });
    return true;
  }

  if (message.type === 'RESUME_NOW') {
    // Ручное возобновление
    chrome.storage.local.get(['orientir_paused_prev_state']).then(async result => {
      const wasEnabled = result.orientir_paused_prev_state !== false;
      await chrome.storage.local.remove(['orientir_paused_until', 'orientir_paused_prev_state']);
      chrome.alarms.clear('resume-protection');

      if (wasEnabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ['telemetry_rules'],
          disableRulesetIds: []
        });
        await chrome.storage.local.set({ [STATE_KEY]: true });
        await broadcastToTabs({ type: 'STATE_UPDATED', enabled: true });
      }

      await updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }
});

// ============================================================
// Alarm для автовозобновления защиты после паузы
// ============================================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'resume-protection') {
    const result = await chrome.storage.local.get(['orientir_paused_prev_state']);
    const wasEnabled = result.orientir_paused_prev_state !== false;

    await chrome.storage.local.remove(['orientir_paused_until', 'orientir_paused_prev_state']);

    if (wasEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['telemetry_rules'],
        disableRulesetIds: []
      });
      await chrome.storage.local.set({ [STATE_KEY]: true });
      await broadcastToTabs({ type: 'STATE_UPDATED', enabled: true });
    }

    await updateBadge();
    console.log('[Ориентир] Защита автоматически возобновлена после паузы');
  }
});

// Обработка статистики от content script
async function handleContentStats(message) {
  const state = await chrome.storage.local.get([STATE_KEY]);
  if (!state[STATE_KEY]) return;

  const blockedListeners = message.blockedListeners || 0;
  const details = message.blockedDetails || {};

  const stats = await chrome.storage.local.get([STORAGE_KEY]);
  const data = stats[STORAGE_KEY];
  const now = Date.now();

  data.totalBlocked += blockedListeners;
  data.sessionBlocked += blockedListeners;

  // Складываем по типам
  if (details.listeners) data.byType.listeners = (data.byType.listeners || 0) + details.listeners;
  if (details.beacons) data.byType.beacons = (data.byType.beacons || 0) + details.beacons;
  if (details.canvas) data.byType.canvas = (data.byType.canvas || 0) + details.canvas;
  if (details.webrtc) data.byType.webrtc = (data.byType.webrtc || 0) + details.webrtc;
  if (details.audio) data.byType.audio = (data.byType.audio || 0) + details.audio;
  if (details.fingerprint) data.byType.fingerprint = (data.byType.fingerprint || 0) + details.fingerprint;

  if (blockedListeners > 0) {
    if (!data.firstBlocked) data.firstBlocked = now;
    data.lastBlocked = now;
    // Записываем домен страницы как источник
    // (sender.tab.url не передаётся через bridge, поэтому не детализируем)
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: data });
  await updateBadge();
}

// Рассылка сообщения во все AI-вкладки (bridge слушает)
async function broadcastToTabs(message) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url || !tab.url.startsWith('https://')) continue;
      const isAITab = AI_URL_FILTERS.some(pattern => {
        const host = pattern.replace('https://', '').replace('/*', '');
        return tab.url.includes(host);
      });
      if (isAITab) {
        try {
          await chrome.tabs.sendMessage(tab.id, message);
        } catch (e) {/* ignore */}
      }
    }
  } catch (e) {/* ignore */}
}

// ============================================================
// Управление badge
// ============================================================
async function updateBadge() {
  const state = await chrome.storage.local.get([STATE_KEY]);
  if (state[STATE_KEY] === false) {
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

// Инициализация badge при запуске
updateBadge();

console.log('[Ориентир] Background service worker загружен');
