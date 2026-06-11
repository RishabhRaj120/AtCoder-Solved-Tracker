importScripts('../utils/constants.js', '../utils/storage.js', '../utils/api.js');

const SYNC_ALARM_NAME = 'sync-atcoder-data';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(SYNC_ALARM_NAME, { periodInMinutes: 360 }); // 6 hours
  
  chrome.contextMenus.create({
    id: 'open-atcoder-problems',
    title: 'Open on AtCoder Problems',
    contexts: ['page'],
    documentUrlPatterns: ['https://atcoder.jp/contests/*/tasks/*']
  });

  // Fetch difficulties immediately on install
  syncDifficulties();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-atcoder-problems') {
    const url = tab.url;
    const match = url.match(/contests\/([^\/]+)\/tasks\/([^\/]+)/);
    if (match) {
      const problemId = match[2];
      chrome.tabs.create({ url: `https://kenkoooo.com/atcoder/#/table//${problemId}` });
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    syncData();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sync') {
    syncData(request.forceFull)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; 
  }
});

async function syncDifficulties(forceFull = false) {
  try {
    const lastDiffUpdate = await globalThis.AtcoderStorage.getDifficultyLastUpdated();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (forceFull || Date.now() - lastDiffUpdate > SEVEN_DAYS_MS) {
      const diffData = await globalThis.AtcoderAPI.fetchDifficulties();
      const difficulties = {};
      for (const [probId, model] of Object.entries(diffData)) {
        if (model.difficulty !== undefined) {
          difficulties[probId] = model.difficulty;
        }
      }
      await globalThis.AtcoderStorage.setDifficulties(difficulties);
    }
  } catch (error) {
    console.error('Failed to fetch difficulties:', error);
  }
}

async function syncData(forceFull = false) {
  await syncDifficulties(forceFull);

  const username = await globalThis.AtcoderStorage.getUsername();
  if (!username) return;

  try {
    let fromSecond = forceFull ? 0 : await globalThis.AtcoderStorage.getLastSubmissionEpoch();
    const currentStatuses = forceFull ? {} : await globalThis.AtcoderStorage.getProblemStatuses();
    let maxEpoch = fromSecond;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      const submissions = await globalThis.AtcoderAPI.fetchNewSubmissions(username, fromSecond);
      
      if (submissions.length === 0) {
        break;
      }

      for (const sub of submissions) {
        if (sub.epoch_second > maxEpoch) {
          maxEpoch = sub.epoch_second;
        }

        const probId = sub.problem_id;
        const isAC = sub.result === 'AC';
        
        if (!currentStatuses[probId]) {
          currentStatuses[probId] = { status: globalThis.ATCODER_CONSTANTS.STATUS.UNSEEN };
        }

        if (currentStatuses[probId].status === globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) {
          if (isAC) {
            currentStatuses[probId].latestAC = `https://atcoder.jp/contests/${sub.contest_id}/submissions/${sub.id}`;
          }
        } else {
          if (isAC) {
            currentStatuses[probId].status = globalThis.ATCODER_CONSTANTS.STATUS.SOLVED;
            currentStatuses[probId].latestAC = `https://atcoder.jp/contests/${sub.contest_id}/submissions/${sub.id}`;
          } else {
            currentStatuses[probId].status = globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED;
          }
        }
      }

      totalFetched += submissions.length;

      if (submissions.length === 500) {
        // Fetch the next page based on the latest epoch + 1 to avoid duplicates
        fromSecond = maxEpoch + 1;
        // Sleep to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        hasMore = false;
      }
    }

    if (totalFetched > 0 || forceFull) {
      await globalThis.AtcoderStorage.set({ problemStatuses: currentStatuses });
      await globalThis.AtcoderStorage.setLastSubmissionEpoch(maxEpoch + 1);
    }
  } catch (error) {
    console.error('AtCoder Solved Tracker Sync Error:', error);
    throw error;
  }
}
