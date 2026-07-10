// ============================================================
// Ориентир — Options page script
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load and display stats
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
    }
  }

  // Load option states
  async function loadOptions() {
    const result = await chrome.storage.local.get(['orientir_options']);
    const options = result.orientir_options || {
      telemetry: true,
      behavioral: true,
      canvas: true,
      webrtc: true,
      audio: true,
      beacon: true
    };

    document.getElementById('opt-telemetry').checked = options.telemetry;
    document.getElementById('opt-behavioral').checked = options.behavioral;
    document.getElementById('opt-canvas').checked = options.canvas;
    document.getElementById('opt-webrtc').checked = options.webrtc;
    document.getElementById('opt-audio').checked = options.audio;
    document.getElementById('opt-beacon').checked = options.beacon;
  }

  // Save option state
  async function saveOptions() {
    const options = {
      telemetry: document.getElementById('opt-telemetry').checked,
      behavioral: document.getElementById('opt-behavioral').checked,
      canvas: document.getElementById('opt-canvas').checked,
      webrtc: document.getElementById('opt-webrtc').checked,
      audio: document.getElementById('opt-audio').checked,
      beacon: document.getElementById('opt-beacon').checked
    };

    await chrome.storage.local.set({ orientir_options: options });

    // Уведомляем content script (через tabs.sendMessage)
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith('https://')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'OPTIONS_UPDATED',
            options: options
          });
        } catch (e) {
          // ignore — вкладка может не иметь content script
        }
      }
    }
  }

  // Reset stats
  document.getElementById('opt-btn-reset').addEventListener('click', () => {
    if (confirm('Сбросить всю статистику? Это действие необратимо.')) {
      chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
        updateStats();
      });
    }
  });

  // Option change handlers
  ['opt-telemetry', 'opt-behavioral', 'opt-canvas', 'opt-webrtc', 'opt-audio', 'opt-beacon']
    .forEach(id => {
      document.getElementById(id).addEventListener('change', saveOptions);
    });

  // Initial load
  await loadOptions();
  await updateStats();

  // Update stats periodically
  setInterval(updateStats, 5000);
});
