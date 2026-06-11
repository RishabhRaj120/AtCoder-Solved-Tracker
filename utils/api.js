globalThis.AtcoderAPI = {
  async fetchNewSubmissions(username, fromSecond) {
    const url = `${globalThis.ATCODER_CONSTANTS.API.SUBMISSIONS}?user=${encodeURIComponent(username)}&from_second=${fromSecond}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },
  async fetchDifficulties() {
    const response = await fetch(globalThis.ATCODER_CONSTANTS.API.DIFFICULTY);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  async scrapeCurrentContestSubmissions(contestId) {
    const url = `/contests/${contestId}/submissions/me`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const rows = doc.querySelectorAll('table tbody tr');
      const results = [];
      rows.forEach(row => {
        const taskLink = row.querySelector('a[href*="/tasks/"]');
        const statusSpan = row.querySelector('span.label');
        const detailLink = row.querySelector('a[href*="/submissions/"]');
        if (taskLink && statusSpan) {
          try {
            const urlObj = new URL(taskLink.href, window.location.origin);
            const match = urlObj.pathname.match(/\/tasks\/([^\/]+)\/?$/);
            if (match) {
              results.push({
                problem_id: match[1].trim(),
                isAC: statusSpan.textContent.trim() === 'AC',
                submission_url: detailLink ? detailLink.href : ''
              });
            }
          } catch(e) {}
        }
      });
      return results;
    } catch (e) {
      console.error('Failed to scrape submissions:', e);
      return null;
    }
  },

  async syncContestNative(contestId) {
    const scraped = await this.scrapeCurrentContestSubmissions(contestId);
    if (!scraped || scraped.length === 0) return false;
    
    const statuses = await globalThis.AtcoderStorage.getProblemStatuses();
    let updated = false;
    const seenAC = new Set();
    
    for (const sub of scraped) {
      const probId = sub.problem_id;
      if (!statuses[probId]) {
        statuses[probId] = { status: globalThis.ATCODER_CONSTANTS.STATUS.UNSEEN };
      }

      if (sub.isAC) {
        if (statuses[probId].status !== globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) {
          statuses[probId].status = globalThis.ATCODER_CONSTANTS.STATUS.SOLVED;
          updated = true;
        }
        if (!seenAC.has(probId)) {
          statuses[probId].latestAC = sub.submission_url;
          seenAC.add(probId);
          updated = true;
        }
      } else {
        if (statuses[probId].status === globalThis.ATCODER_CONSTANTS.STATUS.UNSEEN) {
          statuses[probId].status = globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED;
          updated = true;
        }
      }
    }

    if (updated) {
      await globalThis.AtcoderStorage.updateProblemStatuses(statuses);
    }
    return updated;
  }
};
