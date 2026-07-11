// ============================================================
// Ориентир — Popup script
// ============================================================
//
// Вместо опроса background каждые 2 секунды используем
// chrome.storage.onChanged — popup обновляется только когда
// статистика реально изменилась.

const AI_HOSTS = [
  'chatgpt.com', 'chat.openai.com', 'claude.ai',
  'gemini.google.com', 'aistudio.google.com',
  'perplexity.ai', 'you.com', 'poe.com',
  'character.ai', 'replika.com'
];

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('toggle-enabled');
  const statusState = document.getElementById('status-state');
  const statusSite = document.getElementById('status-site');
  const statSession = document.getElementById('stat-session');
  const statTotal = document.getElementById('stat-total');
  const domainsList = document.getElementById('domains-list');
  const btnResetSession = document.getElementById('btn-reset-session');
  const btnOptions = document.getElementById('btn-options');
  const btnPauseHour = document.getElementById('btn-pause-hour');
  const btnResumeNow = document.getElementById('btn-resume-now');
  const pauseBanner = document.getElementById('pause-banner');
  const pauseUntil = document.getElementById('pause-until');

  let currentTab = null;

  // Получаем текущую вкладку один раз при открытии popup
  async function getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  // Загружаем статистику (один запрос при открытии)
  async function loadStats() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ stats: null, enabled: true });
          return;
        }
        resolve(response || { stats: null, enabled: true });
      });
    });
  }

  // Обновляем только UI, без запросов к background
  function renderUI(stats, enabled) {
    // Toggle
    toggle.checked = enabled !== false;

    // Status
    if (enabled !== false) {
      statusState.textContent = 'Активна';
      statusState.className = 'status-value active';
      statusState.style.color = '';
    } else {
      statusState.textContent = 'Отключена';
      statusState.className = 'status-value inactive';
      statusState.style.color = '';
    }

    // Текущий сайт
    if (currentTab && currentTab.url) {
      try {
        const url = new URL(currentTab.url);
        const isProtectedSite = AI_HOSTS.some(d => url.hostname.includes(d));

        if (isProtectedSite) {
          statusSite.textContent = url.hostname;
          statusSite.className = 'status-value active';
          statusSite.style.color = '';
        } else {
          statusSite.textContent = 'не AI-сайт';
          statusSite.className = 'status-value';
          statusSite.style.color = 'rgba(160,180,210,0.6)';
        }
      } catch (e) {
        statusSite.textContent = '—';
      }
    }

    // Stats
    if (stats) {
      statSession.textContent = stats.sessionBlocked || 0;
      statTotal.textContent = stats.totalBlocked || 0;

      // Domains
      const domains = Object.entries(stats.byDomain || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      if (domains.length === 0) {
        domainsList.innerHTML = '<div class="domains-empty">Пока ничего не заблокировано</div>';
      } else {
        domainsList.innerHTML = domains.map(([domain, count]) => `
          <div class="domain-row">
            <span class="domain-name" title="${domain}">${domain}</span>
            <span class="domain-count">${count}</span>
          </div>
        `).join('');
      }
    }
  }

  // Initial load
  currentTab = await getCurrentTab();
  const initial = await loadStats();
  renderUI(initial.stats, initial.enabled);
  await updatePauseBanner();

  // Слушаем изменения storage — мгновенное обновление без опроса
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes.orientir_stats) {
      const newStats = changes.orientir_stats.newValue;
      const enabled = changes.orientir_enabled ?
        changes.orientir_enabled.newValue : initial.enabled;
      renderUI(newStats, enabled);
    }
    if (changes.orientir_enabled) {
      renderUI(initial.stats, changes.orientir_enabled.newValue);
    }
    if (changes.orientir_paused_until) {
      updatePauseBanner();
    }
  });

  // Toggle handler
  toggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_STATE' }, (response) => {
      if (response && response.enabled !== undefined) {
        renderUI(initial.stats, response.enabled);
      }
    });
  });

  // Reset session
  btnResetSession.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESET_SESSION' }, () => {
      // storage.onChanged сработает и обновит UI
    });
  });

  // Pause for 1 hour
  btnPauseHour.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_HOUR' }, () => {
      updatePauseBanner();
    });
  });

  // Resume now
  btnResumeNow.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESUME_NOW' }, () => {
      updatePauseBanner();
    });
  });

  // Open options
  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Обновление баннера паузы
  async function updatePauseBanner() {
    try {
      const result = await chrome.storage.local.get(['orientir_paused_until']);
      const until = result.orientir_paused_until;
      if (until && until > Date.now()) {
        const date = new Date(until);
        const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        pauseUntil.textContent = timeStr;
        pauseBanner.style.display = 'flex';
      } else {
        pauseBanner.style.display = 'none';
      }
    } catch (e) {/* ignore */}
  }
});
