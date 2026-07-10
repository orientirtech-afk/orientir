// ============================================================
// Ориентир — Popup script
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('toggle-enabled');
  const statusState = document.getElementById('status-state');
  const statusSite = document.getElementById('status-site');
  const statSession = document.getElementById('stat-session');
  const statTotal = document.getElementById('stat-total');
  const domainsList = document.getElementById('domains-list');
  const btnResetSession = document.getElementById('btn-reset-session');
  const btnOptions = document.getElementById('btn-options');

  // Получаем текущую вкладку
  async function getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  // Загружаем статистику
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

  // Обновляем UI
  async function updateUI() {
    const { stats, enabled } = await loadStats();
    const tab = await getCurrentTab();

    // Toggle
    toggle.checked = enabled;

    // Status
    if (enabled) {
      statusState.textContent = 'Активна';
      statusState.className = 'status-value active';
    } else {
      statusState.textContent = 'Отключена';
      statusState.className = 'status-value inactive';
    }

    // Текущий сайт
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        const isProtectedSite = [
          'chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com',
          'aistudio.google.com', 'perplexity.ai', 'you.com', 'poe.com',
          'character.ai', 'replika.com'
        ].some(d => url.hostname.includes(d));

        if (isProtectedSite) {
          statusSite.textContent = url.hostname;
          statusSite.className = 'status-value active';
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

  // Toggle handler
  toggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_STATE' }, (response) => {
      if (response && response.enabled !== undefined) {
        updateUI();
      }
    });
  });

  // Reset session
  btnResetSession.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESET_SESSION' }, () => {
      updateUI();
    });
  });

  // Open options
  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Первичное обновление
  await updateUI();

  // Обновление каждые 2 секунды (пока popup открыт)
  setInterval(updateUI, 2000);
});
