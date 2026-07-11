// ============================================================
// Ориентир — Options page script
// ============================================================
//
// Опции сохраняются в chrome.storage.local и применяются
// в content.js (MAIN world) через content-bridge.js.
//
// Функции:
//   1. Тогглы защиты (6 опций)
//   2. Экспорт/импорт настроек в JSON
//   3. Whitelist сайтов (добавление/удаление)
//   4. Сброс статистики

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

const DEFAULT_WHITELIST = [
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

document.addEventListener('DOMContentLoaded', async () => {
  // ---- Stats ----
  async function loadStats() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ stats: null, enabled: true });
          return;
        }
        resolve(response);
      });
    });
  }

  function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  async function updateStats() {
    const { stats } = await loadStats();
    if (stats) {
      document.getElementById('opt-stat-total').textContent = stats.totalBlocked || 0;
      document.getElementById('opt-stat-domains').textContent =
        Object.keys(stats.byDomain || {}).length;
      document.getElementById('opt-stat-first').textContent = formatDate(stats.firstBlocked);

      const typesEl = document.getElementById('opt-stat-types');
      if (typesEl && stats.byType) {
        const types = stats.byType;
        typesEl.innerHTML = `
          <div class="stat-detail"><span>Телеметрия:</span> <strong>${types.telemetry || 0}</strong></div>
          <div class="stat-detail"><span>События:</span> <strong>${types.listeners || 0}</strong></div>
          <div class="stat-detail"><span>Beacon API:</span> <strong>${types.beacons || 0}</strong></div>
          <div class="stat-detail"><span>Canvas:</span> <strong>${types.canvas || 0}</strong></div>
          <div class="stat-detail"><span>WebRTC:</span> <strong>${types.webrtc || 0}</strong></div>
          <div class="stat-detail"><span>Audio:</span> <strong>${types.audio || 0}</strong></div>
          <div class="stat-detail"><span>Fingerprint:</span> <strong>${types.fingerprint || 0}</strong></div>
        `;
      }
    }
  }

  // ---- Options ----
  async function loadOptions() {
    const result = await chrome.storage.local.get(['orientir_options']);
    const options = { ...DEFAULT_OPTIONS, ...(result.orientir_options || {}) };

    for (const key of OPTION_KEYS) {
      const el = document.getElementById(`opt-${key}`);
      if (el) el.checked = options[key];
    }
  }

  async function saveOptions() {
    const options = {};
    for (const key of OPTION_KEYS) {
      const el = document.getElementById(`opt-${key}`);
      options[key] = el ? el.checked : DEFAULT_OPTIONS[key];
    }

    await chrome.storage.local.set({ orientir_options: options });

    // Рассылаем OPTIONS_UPDATED во все AI-вкладки
    try {
      const tabs = await chrome.tabs.query({});
      const aiHosts = await getWhitelist();
      for (const tab of tabs) {
        if (!tab.url || !tab.url.startsWith('https://')) continue;
        const isAITab = aiHosts.some(h => tab.url.includes(h));
        if (!isAITab) continue;
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'OPTIONS_UPDATED',
            options: options
          });
        } catch (e) {/* ignore */}
      }
    } catch (e) {/* ignore */}
  }

  // ---- Whitelist ----
  async function getWhitelist() {
    const result = await chrome.storage.local.get(['orientir_whitelist']);
    return result.orientir_whitelist || DEFAULT_WHITELIST.slice();
  }

  async function setWhitelist(list) {
    await chrome.storage.local.set({ orientir_whitelist: list });
    renderWhitelist(list);
  }

  async function renderWhitelist(list) {
    const container = document.getElementById('opt-whitelist-list');
    if (!container) return;
    if (!list) list = await getWhitelist();

    container.innerHTML = list.map(domain => `
      <div class="whitelist-badge">
        <span>${domain}</span>
        <button data-domain="${domain}" title="Удалить" aria-label="Удалить ${domain}">×</button>
      </div>
    `).join('');

    // Обработчики удаления
    container.querySelectorAll('button[data-domain]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const domain = btn.getAttribute('data-domain');
        const current = await getWhitelist();
        const next = current.filter(d => d !== domain);
        await setWhitelist(next);
      });
    });
  }

  // ---- Export ----
  async function exportSettings() {
    const data = await chrome.storage.local.get([
      'orientir_options',
      'orientir_whitelist',
      'orientir_enabled'
    ]);

    const exportData = {
      _meta: {
        app: 'Ориентир',
        version: '0.3.0',
        exported: new Date().toISOString(),
        description: 'Настройки расширения Ориентир — экспорт/импорт'
      },
      options: { ...DEFAULT_OPTIONS, ...(data.orientir_options || {}) },
      whitelist: data.orientir_whitelist || DEFAULT_WHITELIST.slice(),
      enabled: data.orientir_enabled !== false
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orientir-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showImportStatus('Настройки экспортированы.', 'success');
  }

  // ---- Import ----
  async function importSettings(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data || typeof data !== 'object') {
        throw new Error('Неверный формат файла');
      }

      // Валидация
      if (data.options) {
        const validOptions = {};
        for (const key of OPTION_KEYS) {
          if (typeof data.options[key] === 'boolean') {
            validOptions[key] = data.options[key];
          }
        }
        await chrome.storage.local.set({ orientir_options: { ...DEFAULT_OPTIONS, ...validOptions } });
      }

      if (Array.isArray(data.whitelist)) {
        const validWhitelist = data.whitelist
          .filter(d => typeof d === 'string' && d.length > 0 && d.length < 200)
          .map(d => d.trim().toLowerCase());
        await chrome.storage.local.set({ orientir_whitelist: validWhitelist });
      }

      if (typeof data.enabled === 'boolean') {
        await chrome.storage.local.set({ orientir_enabled: data.enabled });
        // Обновляем DNR rules
        await chrome.runtime.sendMessage({ type: 'TOGGLE_STATE' });
      }

      // Перечитываем UI
      await loadOptions();
      await renderWhitelist();
      await saveOptions(); // рассылаем OPTIONS_UPDATED

      showImportStatus('Настройки импортированы успешно.', 'success');
    } catch (e) {
      showImportStatus(`Ошибка импорта: ${e.message}`, 'error');
    }
  }

  function showImportStatus(msg, type) {
    const el = document.getElementById('opt-import-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'success' ? '#a5d6a7' : type === 'error' ? '#ef5350' : '#ffcc80';
    setTimeout(() => { el.textContent = ''; }, 5000);
  }

  // ---- Reset stats ----
  document.getElementById('opt-btn-reset').addEventListener('click', () => {
    if (confirm('Сбросить всю статистику? Это действие необратимо.')) {
      chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
        updateStats();
      });
    }
  });

  // ---- Option change handlers ----
  for (const key of OPTION_KEYS) {
    const el = document.getElementById(`opt-${key}`);
    if (el) el.addEventListener('change', saveOptions);
  }

  // ---- Export/Import handlers ----
  document.getElementById('opt-btn-export').addEventListener('click', exportSettings);

  document.getElementById('opt-btn-import').addEventListener('click', () => {
    document.getElementById('opt-import-file').click();
  });

  document.getElementById('opt-import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importSettings(file);
      e.target.value = ''; // сброс, чтобы можно было выбрать тот же файл повторно
    }
  });

  // ---- Whitelist add ----
  document.getElementById('opt-btn-whitelist-add').addEventListener('click', async () => {
    const input = document.getElementById('opt-whitelist-input');
    let domain = input.value.trim().toLowerCase();
    if (!domain) return;

    // Нормализация: убираем схему и путь
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

    if (domain.length < 3 || domain.length > 200) {
      showImportStatus('Некорректный домен', 'error');
      return;
    }

    const list = await getWhitelist();
    if (list.includes(domain)) {
      showImportStatus(`${domain} уже в списке`, 'error');
      return;
    }

    list.push(domain);
    await setWhitelist(list);
    input.value = '';
    showImportStatus(`${domain} добавлен в whitelist`, 'success');
  });

  // Enter в поле ввода домена
  document.getElementById('opt-whitelist-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('opt-btn-whitelist-add').click();
    }
  });

  // ---- Storage changes ----
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (changes.orientir_stats) {
      updateStats();
    }
  });

  // ---- Initial load ----
  await loadOptions();
  await renderWhitelist();
  await updateStats();
});
