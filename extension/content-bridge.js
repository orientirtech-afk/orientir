// ============================================================
// Ориентир — Content Bridge (ISOLATED world)
// ============================================================
//
// Этот скрипт работает в изолированном мире (Chrome default) и
// служит мостом между content.js (MAIN world) и background.js.
//
// MAIN world не имеет доступа к chrome.runtime, поэтому:
//   1. Слушаем window.postMessage от content.js
//   2. Пересылаем в chrome.runtime.sendMessage
//   3. Слушаем chrome.runtime.onMessage
//   4. Пересылаем в window.postMessage для content.js
//
// Также при старте загружаем опции из chrome.storage и отправляем
// их в MAIN world, чтобы content.js знал, какие защиты включены.

const BRIDGE_TAG = 'orientir-bridge';
const MAIN_TAG = 'orientir-main';

// Ожидаемые имена опций (должны совпадать с options.js)
const OPTION_KEYS = [
  'telemetry',
  'behavioral',
  'canvas',
  'webrtc',
  'audio',
  'beacon'
];

const DEFAULT_OPTIONS = {
  telemetry: true,
  behavioral: true,
  canvas: true,
  webrtc: true,
  audio: true,
  beacon: true
};

// Список AI-доменов (должен совпадать с manifest.json host_permissions)
const AI_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'aistudio.google.com',
  'perplexity.ai',
  'you.com',
  'poe.com',
  'character.ai',
  'replika.com'
];

// ============================================================
// Отправка сообщения в MAIN world
// ============================================================
function postToMain(type, payload) {
  window.postMessage({ tag: MAIN_TAG, type, payload }, '*');
}

// ============================================================
// Загрузка и отправка опций в MAIN world
// ============================================================
async function sendOptionsToMain() {
  try {
    const result = await chrome.storage.local.get(['orientir_options']);
    const options = { ...DEFAULT_OPTIONS, ...(result.orientir_options || {}) };
    postToMain('OPTIONS', options);
  } catch (e) {
    // Если что-то пошло не так — отправляем дефолт, чтобы защиты работали
    postToMain('OPTIONS', DEFAULT_OPTIONS);
  }
}

// ============================================================
// Слушаем сообщения от MAIN world
// ============================================================
window.addEventListener('message', (event) => {
  // Только same-origin
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.tag !== BRIDGE_TAG) return;

  if (data.type === 'STATS') {
    // Пересылаем статистику в background
    try {
      chrome.runtime.sendMessage({
        type: 'CONTENT_STATS',
        blockedListeners: data.payload.blockedListeners || 0,
        blockedDetails: data.payload.blockedDetails || {}
      }).catch(() => {/* ignore */});
    } catch (e) {/* ignore */}
  }

  if (data.type === 'OPTIONS_REQUEST') {
    // MAIN world запросил опции
    sendOptionsToMain();
  }
});

// ============================================================
// Слушаем сообщения от background → пересылаем в MAIN
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPTIONS_UPDATED') {
    postToMain('OPTIONS', { ...DEFAULT_OPTIONS, ...message.options });
  }
  if (message.type === 'STATE_UPDATED') {
    postToMain('STATE', { enabled: message.enabled });
  }
  // Не возвращаем true — синхронный ответ не нужен
});

// ============================================================
// При старте: отправляем опции + слушаем изменения storage
// ============================================================
sendOptionsToMain();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes.orientir_options) {
    const options = { ...DEFAULT_OPTIONS, ...(changes.orientir_options.newValue || {}) };
    postToMain('OPTIONS', options);
  }
  if (changes.orientir_enabled) {
    postToMain('STATE', { enabled: changes.orientir_enabled.newValue });
  }
});

console.log('[Ориентир] Bridge загружен (ISOLATED world)');
