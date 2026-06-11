document.addEventListener('DOMContentLoaded', async () => {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version-display').textContent = manifest.version;

  const username = await globalThis.AtcoderStorage.getUsername();
  if (username) {
    document.getElementById('username-input').value = username;
  }

  document.getElementById('save-username-btn').addEventListener('click', async () => {
    const input = document.getElementById('username-input').value.trim();
    if (input) {
      await globalThis.AtcoderStorage.setUsername(input);
      setStatus('Username saved!', '#5cb85c');
    }
  });

  document.getElementById('force-sync-btn').addEventListener('click', () => {
    const btn = document.getElementById('force-sync-btn');
    btn.disabled = true;
    btn.textContent = 'Syncing...';
    setStatus('Performing full synchronization. This may take a minute...', '#f0ad4e');

    chrome.runtime.sendMessage({ action: 'sync', forceFull: true }, async (response) => {
      btn.disabled = false;
      btn.textContent = 'Force Full Resync';
      if (response && response.success) {
        await chrome.storage.local.set({ lastLocalSyncTime: Date.now() });
        setStatus('Full synchronization complete!', '#5cb85c');
      } else {
        setStatus('Sync failed: ' + (response ? response.error : 'Unknown error'), '#d9534f');
      }
    });
  });

  document.getElementById('clear-cache-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear the local cache? All solved statuses will be removed until next sync.')) {
      await globalThis.AtcoderStorage.clearCache();
      setStatus('Local cache cleared.', '#5bc0de');
    }
  });
});

function setStatus(msg, color) {
  const el = document.getElementById('sync-status');
  el.textContent = msg;
  el.style.color = color;
  setTimeout(() => { el.textContent = ''; }, 5000);
}
