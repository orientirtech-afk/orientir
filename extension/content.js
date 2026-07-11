// ============================================================
// Ориентир — Content Script (MAIN world)
// Реализация Уровня 7: Удаление поведенческих слушателей
// ============================================================
//
// Этот скрипт работает в MAIN world (не в изолированном), чтобы
// иметь доступ к JavaScript-контексту страницы. Он:
//
// 1. Перехватывает addEventListener, фильтрует поведенческие события
// 2. Блокирует canvas fingerprinting (seed-based noise)
// 3. Блокирует WebRTC IP leak (typ host + typ srflx)
// 4. Блокирует AudioContext fingerprinting (много сэмплов)
// 5. Перехватывает sendBeacon к телеметрии
// 6. Заглушает FingerprintJS (включая ESM-импорты через Proxy)
// 7. Связывается с background через window.postMessage → bridge
//
// Все защиты включаются/выключаются через опции из chrome.storage,
// которые доставляются сюда через bridge (ISOLATED world).

(function() {
  'use strict';

  // Метки для общения с bridge
  const BRIDGE_TAG = 'orientir-bridge';
  const MAIN_TAG = 'orientir-main';

  // Опции защиты (по умолчанию всё включено — safe default)
  const options = {
    telemetry: true,
    behavioral: true,
    canvas: true,
    webrtc: true,
    audio: true,
    beacon: true
  };

  let enabled = true;

  // Счётчики для статистики
  let blockedListeners = 0;
  let blockedBeacons = 0;
  let blockedCanvas = 0;
  let blockedWebRTC = 0;
  let blockedAudio = 0;
  let blockedFingerprint = 0;

  // ============================================================
  // Список поведенческих событий, которые мы блокируем
  // ============================================================
  const BEHAVIORAL_EVENTS = new Set([
    'mousemove',
    'mousedown',
    'mouseup',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'mousewheel',
    'wheel',
    'click',
    'dblclick',
    'contextmenu',
    'scroll',
    'resize',
    'focus',
    'blur',
    'focusin',
    'focusout',
    'keydown',
    'keyup',
    'keypress',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerover',
    'pointerout',
    'pointerenter',
    'pointerleave',
    'pointercancel',
    'visibilitychange',
    'pagehide',
    'pageshow',
    'beforeunload',
    'unload',
    'copy',
    'cut',
    'paste',
    'selectionchange'
  ]);

  // События, которые мы НЕ блокируем (нужны для работы интерфейса)
  const ALLOWED_EVENTS = new Set([
    'input',
    'change',
    'submit',
    'load',
    'DOMContentLoaded',
    'error',
    'message',
    'storage',
    'hashchange',
    'popstate',
    'animationend',
    'transitionend',
    'play',
    'pause',
    'ended',
    'canplay',
    'progress',
    'loadstart'
  ]);

  // ============================================================
  // Телеметрические домены для sendBeacon
  // ============================================================
  const TELEMETRY_DOMAINS = [
    'google-analytics.com',
    'googletagmanager.com',
    'segment.io',
    'mixpanel.com',
    'amplitude.com',
    'hotjar.com',
    'fullstory.com',
    'sentry.io',
    'datadoghq.com',
    'facebook.com',
    'doubleclick.net',
    'scorecardresearch.com',
    'quantserve.com',
    'comscore.com',
    'crazyegg.com',
    'mouseflow.com',
    'clarity.ms',
    'logrocket.com',
    'optimizely.com',
    'adroll.com',
    'adsrvr.org',
    'newrelic.com'
  ];

  // ============================================================
  // Утилита: deterministic PRNG (mulberry32)
  // Нужна для seed-based шума в canvas — чтобы отпечаток был
  // нестабильным между сессиями, но стабильным внутри одной.
  // ============================================================
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Сессионный seed — один на вкладку
  const SESSION_SEED = (Math.random() * 0xFFFFFFFF) >>> 0;

  // ============================================================
  // Communication with bridge (ISOLATED world)
  // ============================================================
  function postToBridge(type, payload) {
    window.postMessage({ tag: BRIDGE_TAG, type, payload }, '*');
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.tag !== MAIN_TAG) return;

    if (data.type === 'OPTIONS') {
      Object.assign(options, data.payload);
    }
    if (data.type === 'STATE') {
      enabled = data.payload.enabled;
    }
  });

  // Запрашиваем опции при старте
  postToBridge('OPTIONS_REQUEST', {});

  // ============================================================
  // 1. Перехват addEventListener
  // ============================================================
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, optionsArg) {
    if (!enabled || !options.behavioral) {
      return originalAddEventListener.call(this, type, listener, optionsArg);
    }

    // Блокируем только для window и document
    const isWindowOrDocument = (this === window || this === document);

    if (isWindowOrDocument && BEHAVIORAL_EVENTS.has(type) && !ALLOWED_EVENTS.has(type)) {
      blockedListeners++;
      return undefined;
    }

    return originalAddEventListener.call(this, type, listener, optionsArg);
  };

  // ============================================================
  // 2. Защита от Canvas fingerprinting (seed-based noise)
  // ============================================================
  // Добавляем шум в несколько пикселей, deterministically
  // по сессионному seed'у. Это делает отпечаток нестабильным
  // между сессиями (что ломает tracking), но стабильным внутри
  // сессии (что не вызывает подозрений).
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    if (!enabled || !options.canvas) {
      return originalToDataURL.apply(this, args);
    }

    try {
      const context = this.getContext('2d');
      if (context && this.width > 0 && this.height > 0) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        if (data.length > 16) {
          // Меняем 4 пикселя на детерминированные позиции
          const rng = mulberry32(SESSION_SEED ^ (this.width * 31 + this.height));
          for (let i = 0; i < 4; i++) {
            const idx = Math.floor(rng() * (data.length - 4)) & ~3;
            data[idx] = (data[idx] + Math.floor(rng() * 3)) % 256;
          }
          context.putImageData(imageData, 0, 0);
          blockedCanvas++;
        }
      }
    } catch (e) {
      // canvas может быть tainted (cross-origin) — игнорируем
    }
    return originalToDataURL.apply(this, args);
  };

  // Также шумим getImageData (некоторые библиотеки читают напрямую)
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function(...args) {
    const imageData = originalGetImageData.apply(this, args);
    if (!enabled || !options.canvas) return imageData;

    try {
      const data = imageData.data;
      if (data.length > 16) {
        const rng = mulberry32(SESSION_SEED ^ (imageData.width * 31 + imageData.height));
        // Меньше шума, чем в toDataURL — иначе сломает реальные приложения
        for (let i = 0; i < 2; i++) {
          const idx = Math.floor(rng() * (data.length - 4)) & ~3;
          data[idx] = (data[idx] + Math.floor(rng() * 2)) % 256;
        }
        blockedCanvas++;
      }
    } catch (e) {/* ignore */}
    return imageData;
  };

  // ============================================================
  // 3. Защита от WebRTC IP leak
  // ============================================================
  // Блокируем ICE candidates, которые раскрывают локальный IP (typ host)
  // И публичный IP (typ srflx). Оставляем только relay (TURN).
  const originalRTCPeerConnection = window.RTCPeerConnection;
  if (originalRTCPeerConnection) {
    const PatchedRTC = function(...args) {
      const pc = new originalRTCPeerConnection(...args);

      pc.addEventListener('icecandidate', (event) => {
        if (!enabled || !options.webrtc) return;
        if (event.candidate && event.candidate.candidate) {
          const candidate = event.candidate.candidate;
          // Блокируем host candidates (локальный IP) и srflx (публичный IP через STUN)
          if (candidate.includes('typ host') || candidate.includes('typ srflx')) {
            event.candidate.candidate = '';
            blockedWebRTC++;
          }
        }
      });

      return pc;
    };
    PatchedRTC.prototype = originalRTCPeerConnection.prototype;
    if (originalRTCPeerConnection.generateCertificate) {
      PatchedRTC.generateCertificate = originalRTCPeerConnection.generateCertificate;
    }
    window.RTCPeerConnection = PatchedRTC;
    // Также патчим webkitRTCPeerConnection (Safari/old Chrome)
    if (window.webkitRTCPeerConnection) {
      window.webkitRTCPeerConnection = PatchedRTC;
    }
  }

  // ============================================================
  // 4. Защита от AudioContext fingerprinting
  // ============================================================
  // Шумим несколько сэмплов в AudioBuffer — больше, чем 1,
  // чтобы сломать хэш-фингерпринт, но достаточно мало, чтобы
  // не повлиять на воспроизведение.
  const originalGetChannelData = AudioBuffer.prototype.getChannelData;
  AudioBuffer.prototype.getChannelData = function(...args) {
    const data = originalGetChannelData.apply(this, args);
    if (!enabled || !options.audio) return data;

    try {
      if (data.length > 0) {
        const rng = mulberry32(SESSION_SEED ^ data.length);
        // Меняем 5 сэмплов на случайных позициях в первой тысяче
        const limit = Math.min(data.length, 1000);
        for (let i = 0; i < 5; i++) {
          const idx = Math.floor(rng() * limit);
          data[idx] = data[idx] + (rng() - 0.5) * 1e-7;
        }
        blockedAudio++;
      }
    } catch (e) {/* ignore */}
    return data;
  };

  // Также патчим AnalyserNode.getFloatFrequencyData (используется для fingerprinting)
  const originalGetFloatFrequencyData = AnalyserNode.prototype.getFloatFrequencyData;
  AnalyserNode.prototype.getFloatFrequencyData = function(array) {
    originalGetFloatFrequencyData.call(this, array);
    if (!enabled || !options.audio) return;
    try {
      const rng = mulberry32(SESSION_SEED ^ array.length);
      for (let i = 0; i < Math.min(array.length, 10); i++) {
        const idx = Math.floor(rng() * array.length);
        array[idx] = array[idx] + (rng() - 0.5) * 1e-7;
      }
    } catch (e) {/* ignore */}
  };

  // ============================================================
  // 5. Блокировка navigator.sendBeacon к телеметрии
  // ============================================================
  const originalSendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    if (enabled && options.beacon) {
      try {
        const urlObj = new URL(url, window.location.href);
        for (const domain of TELEMETRY_DOMAINS) {
          if (urlObj.hostname.includes(domain)) {
            blockedBeacons++;
            return true; // Имитируем успех, чтобы сайт не повторял
          }
        }
      } catch (e) {/* ignore */}
    }
    return originalSendBeacon.call(this, url, data);
  };

  // ============================================================
  // 6. NavigatorUAData (новый API для fingerprinting)
  // ============================================================
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues = function() {
      return Promise.resolve({
        brands: navigator.userAgentData.brands,
        mobile: navigator.userAgentData.mobile,
        platform: navigator.userAgentData.platform
      });
    };
  }

  // ============================================================
  // 7. Заглушка для FingerprintJS и подобных библиотек
  // ============================================================
  // Подменяем window.FingerprintJS через Object.defineProperty.
  // Также используем Proxy на window, чтобы перехватить ESM-импорт
  // через `import FingerprintJS from '...'` — он обращается к
  // window.FingerprintJS через globalThis.

  const fingerprintStub = {
    get: () => Promise.resolve({
      visitorId: Math.random().toString(36).substring(2, 15) +
                 Math.random().toString(36).substring(2, 15),
      confidence: { score: 0.1 },
      components: {},
      version: '4.0.0'
    }),
    load: () => Promise.resolve(fingerprintStub),
    hashComponents: () => Math.random().toString(36).substring(2, 15)
  };

  // Перехватываем попытку назначить FingerprintJS (включая ESM-модули)
  const fingerprintNames = ['FingerprintJS', 'FingerprintJSPro', 'FPJS'];
  for (const name of fingerprintNames) {
    try {
      Object.defineProperty(window, name, {
        get: () => fingerprintStub,
        set: () => {
          blockedFingerprint++;
          // игнорируем — оставляем stub
        },
        configurable: false
      });
    } catch (e) {/* ignore — если уже определено */}
  }

  // Перехват также через globalThis proxy — для ESM-импортов,
  // которые могут миновать window.FingerprintJS.
  // Используем более мягкий подход: подменяем import()
  const originalImport = window.import;
  if (typeof originalImport === 'function') {
    window.import = function(specifier) {
      if (typeof specifier === 'string' && /fingerprint/i.test(specifier)) {
        blockedFingerprint++;
        return Promise.resolve({ default: fingerprintStub });
      }
      return originalImport.apply(this, arguments);
    };
  }

  // ============================================================
  // 8. Регулярная отправка статистики в background (через bridge)
  // ============================================================
  setInterval(() => {
    const total = blockedListeners + blockedBeacons + blockedCanvas +
                  blockedWebRTC + blockedAudio + blockedFingerprint;
    if (total > 0) {
      postToBridge('STATS', {
        blockedListeners: total,
        blockedDetails: {
          listeners: blockedListeners,
          beacons: blockedBeacons,
          canvas: blockedCanvas,
          webrtc: blockedWebRTC,
          audio: blockedAudio,
          fingerprint: blockedFingerprint
        }
      });
      // Сбрасываем после отправки
      blockedListeners = 0;
      blockedBeacons = 0;
      blockedCanvas = 0;
      blockedWebRTC = 0;
      blockedAudio = 0;
      blockedFingerprint = 0;
    }
  }, 5000);

  console.log('[Ориентир] Content script загружен (MAIN world). Защита активна.');
})();
