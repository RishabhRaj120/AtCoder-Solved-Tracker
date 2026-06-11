(async function() {
  const matchContest = window.location.pathname.match(/\/contests\/([^\/]+)\/tasks/);
  if (!matchContest) return;
  const contestId = matchContest[1];

  async function render() {
    const statuses = await globalThis.AtcoderStorage.getProblemStatuses();
    const links = document.querySelectorAll('table tbody tr td a[href*="/tasks/"]');
    
    links.forEach(link => {
      try {
        const url = new URL(link.href, window.location.origin);
        const match = url.pathname.match(/\/tasks\/([^\/]+)\/?$/);
        if (match) {
          const problemId = match[1].trim();
          const statusObj = statuses[problemId];
          
          link.classList.remove('ast-solved-link', 'ast-attempted-link');
          const row = link.closest('tr');
          if (row) {
            row.classList.remove('ast-solved-row', 'ast-attempted-row');
          }
          
          if (statusObj) {
            if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) {
              link.classList.add('ast-solved-link');
              link.title = 'Previously solved';
              if (row) row.classList.add('ast-solved-row');
            } else if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED) {
              link.classList.add('ast-attempted-link');
              link.title = 'Previously attempted';
              if (row) row.classList.add('ast-attempted-row');
            }
          } else {
            link.title = 'Never attempted';
          }
        }
      } catch (e) {
        console.error("AtCoder Solved Tracker: Error parsing link", e);
      }
    });
  }

  await render();

  if (globalThis.AtcoderAPI && globalThis.AtcoderAPI.syncContestNative) {
    const updated = await globalThis.AtcoderAPI.syncContestNative(contestId);
    if (updated) {
      await render();
    }
  }
})();
