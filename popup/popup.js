document.addEventListener('DOMContentLoaded', async () => {
  const username = await globalThis.AtcoderStorage.getUsername();
  if (!username) {
    document.getElementById('setup-view').classList.remove('hidden');
  } else {
    document.getElementById('dashboard-view').classList.remove('hidden');
    loadDashboard(username);
  }

  document.getElementById('save-username-btn').addEventListener('click', async () => {
    const input = document.getElementById('username-input').value.trim();
    if (!input) {
      document.getElementById('setup-error').classList.remove('hidden');
      return;
    }
    await globalThis.AtcoderStorage.setUsername(input);
    document.getElementById('setup-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    loadDashboard(input);
    triggerSync(true);
  });

  document.getElementById('sync-btn').addEventListener('click', () => {
    triggerSync(false);
  });

  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('stats-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('stats/stats.html') });
  });

  document.getElementById('open-atcoder-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://atcoder.jp/' });
  });
});

async function loadDashboard(username) {
  document.getElementById('display-username').textContent = username;
  
  const statuses = await globalThis.AtcoderStorage.getProblemStatuses();
  let solved = 0;
  let attempted = 0;
  
  for (const statusObj of Object.values(statuses)) {
    if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) solved++;
    else if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED) attempted++;
  }
  
  document.getElementById('solved-count').textContent = solved;
  document.getElementById('attempted-count').textContent = attempted;

  const data = await chrome.storage.local.get(['lastLocalSyncTime']);
  const lastSyncEl = document.getElementById('last-sync-time');
  if (data.lastLocalSyncTime) {
    lastSyncEl.textContent = new Date(data.lastLocalSyncTime).toLocaleString();
  } else {
    lastSyncEl.textContent = 'Never';
  }
}

function triggerSync(forceFull) {
  const btn = document.getElementById('sync-btn');
  btn.textContent = 'Syncing...';
  btn.disabled = true;
  chrome.runtime.sendMessage({ action: 'sync', forceFull }, async (response) => {
    btn.disabled = false;
    btn.textContent = 'Sync Now';
    if (response && response.success) {
      await chrome.storage.local.set({ lastLocalSyncTime: Date.now() });
      globalThis.AtcoderStorage.getUsername().then(loadDashboard);
    } else {
      alert('Sync failed: ' + (response ? response.error : 'Unknown error'));
    }
  });
}
