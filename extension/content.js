// ============================================================
// Ориентир — Content Script (MAIN world)
// Реализация Уровня 7: Удаление поведенческих слушателей
// ============================================================
//
// Этот скрипт работает в MAIN world (не в изолированном), чтобы
// иметь доступ к JavaScript-контексту страницы. Он:
//
// 1. Перехватывает addEventListener, фильтрует поведенческие события
// 2. Блокирует canvas fingerprinting
// 3. Блокирует WebRTC IP leak
// 4. Удаляет уже установленные listening паттерны (где возможно)
// 5. Сообщает статистику в background
//
// Внимание: этот скрипт НЕ может удалить listeners, уже установленные
// до его загрузки. Поэтому run_at: document_start — критичен.

(function() {
  'use strict';

  // Список поведенческих событий, которые мы блокируем
  // (это события, по которым сайты tracking'ают поведение пользователя)
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
    'input',        // ввод текста — нужен
    'change',       // изменение формы — нужно
    'submit',       // отправка формы — нужна
    'load',         // загрузка — нужна
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

  let blockedListeners = 0;

  // ============================================================
  // 1. Перехват addEventListener
  // ============================================================
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Если событие поведенческое — блокируем (для window и document)
    const isWindowOrDocument = (this === window || this === document);

    if (isWindowOrDocument && BEHAVIORAL_EVENTS.has(type) && !ALLOWED_EVENTS.has(type)) {
      blockedListeners++;
      // Не вызываем оригинальный addEventListener — listener не установлен
      // Возвращаем undefined, как и оригинал
      return undefined;
    }

    // Для элементов — пропускаем (иначе сломается UI)
    // Внимание: это компромисс. Полная блокировка сломала бы интерфейс.
    // Блокируем только window/document-level tracking.

    return originalAddEventListener.call(this, type, listener, options);
  };

  // ============================================================
  // 2. Защита от Canvas fingerprinting
  // ============================================================
  // Сайты используют canvas для генерации уникального "отпечатка" браузера.
  // Добавляем шум в toDataURL и getImageData.

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    // Добавляем минимальный шум — каждый вызов даёт немного другой результат
    // Это делает fingerprint нестабильным
    try {
      const context = this.getContext('2d');
      if (context) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        // Меняем 1 пиксель на случайное значение
        if (data.length > 0) {
          const randomIdx = Math.floor(Math.random() * (data.length - 4));
          data[randomIdx] = (data[randomIdx] + Math.floor(Math.random() * 3)) % 256;
          context.putImageData(imageData, 0, 0);
        }
      }
    } catch (e) {
      // ignore — canvas может быть tainted
    }
    return originalToDataURL.apply(this, args);
  };

  // ============================================================
  // 3. Защита от WebRTC IP leak
  // ============================================================
  // WebRTC может раскрывать локальный IP-адрес даже через VPN.
  // Подменяем RTCPeerConnection, чтобы блокировать ICE candidates.

  const originalRTCPeerConnection = window.RTCPeerConnection;
  if (originalRTCPeerConnection) {
    window.RTCPeerConnection = function(...args) {
      const pc = new originalRTCPeerConnection(...args);

      const originalCreateDataChannel = pc.createDataChannel;
      const originalOnIceCandidate = Object.getOwnPropertyDescriptor(
        RTCPeerConnection.prototype, 'onicecandidate'
      );

      // Блокируем ICE candidates, которые раскрывают локальный IP
      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candidate = event.candidate.candidate;
          // Блокируем local IP candidates (typ host)
          if (candidate.includes('typ host')) {
            event.candidate.candidate = '';
          }
        }
      });

      return pc;
    };
    // Копируем статические свойства
    window.RTCPeerConnection.prototype = originalRTCPeerConnection.prototype;
    window.RTCPeerConnection.generateCertificate = originalRTCPeerConnection.generateCertificate;
  }

  // ============================================================
  // 4. Защита от AudioContext fingerprinting
  // ============================================================
  const originalCreateOscillator = AudioContext.prototype.createOscillator;
  const originalGetChannelData = AudioBuffer.prototype.getChannelData;

  AudioBuffer.prototype.getChannelData = function(...args) {
    const data = originalGetChannelData.apply(this, args);
    // Добавляем минимальный шум — делает audio fingerprint нестабильным
    if (data.length > 0) {
      // Меняем только один сэмпл — минимальное влияние на звук
      const idx = Math.floor(Math.random() * Math.min(data.length, 1000));
      data[idx] = data[idx] + (Math.random() - 0.5) * 1e-7;
    }
    return data;
  };

  // ============================================================
  // 5. Блокировка navigator.sendBeacon (часто используется для tracking)
  // ============================================================
  // Внимание: мы НЕ блокируем полностью, потому что sendBeacon
  // используется и для легитимных целей (analytics отправка при unload).
  // Блокируем только запросы к известным telemetry-доменам.

  const originalSendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    try {
      const urlObj = new URL(url, window.location.href);
      const telemetryDomains = [
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
        'optimizely.com'
      ];

      for (const domain of telemetryDomains) {
        if (urlObj.hostname.includes(domain)) {
          blockedListeners++;
          return true; // Возвращаем true, чтобы сайт думал, что отправка прошла
        }
      }
    } catch (e) {
      // ignore
    }
    return originalSendBeacon.call(this, url, data);
  };

  // ============================================================
  // 6. Блокировка NavigatorUAData (новый API для fingerprinting)
  // ============================================================
  if (navigator.userAgentData) {
    // Подменяем getHighEntropyValues — возвращает минимальные данные
    const originalGetHighEntropyValues = navigator.userAgentData.getHighEntropyValues;
    navigator.userAgentData.getHighEntropyValues = function(hints) {
      // Возвращаем только базовые значения, без entropy
      return Promise.resolve({
        brands: navigator.userAgentData.brands,
        mobile: navigator.userAgentData.mobile,
        platform: navigator.userAgentData.platform
      });
    };
  }

  // ============================================================
  // 7. Регулярная отправка статистики в background
  // ============================================================
  setInterval(() => {
    if (blockedListeners > 0) {
      try {
        chrome.runtime.sendMessage({
          type: 'CONTENT_STATS',
          blockedListeners: blockedListeners
        });
      } catch (e) {
        // ignore — расширение может быть перезагружено
      }
      blockedListeners = 0; // сбрасываем после отправки
    }
  }, 5000);

  // ============================================================
  // 8. Заглушка для fingerprinting-библиотек
  // ============================================================
  // Если сайт загружает FingerprintJS или аналогичную библиотеку,
  // она обычно ищет window.FingerprintJS или подобные глобальные объекты.
  // Подменяем их заглушками, которые возвращают случайные значения.

  const fingerprintStub = {
    get: () => Promise.resolve({
      visitorId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      confidence: { score: 0.1 }
    })
  };

  // Используем Object.defineProperty, чтобы перехватить попытку назначения
  try {
    Object.defineProperty(window, 'FingerprintJS', {
      get: () => fingerprintStub,
      set: () => {}, // игнорируем попытку перезаписи
      configurable: false
    });
  } catch (e) {
    // ignore — если уже определено
  }

  console.log('[Ориентир] Content script загружен. Защита активна.');
})();
