(async function() {
  const match = window.location.pathname.match(/\/contests\/([^\/]+)\/tasks\/([^\/]+?)\/?$/);
  if (!match) return;
  const contestId = match[1];
  const problemId = match[2].trim();

  async function render() {
    const statuses = await globalThis.AtcoderStorage.getProblemStatuses();
    const difficulties = await globalThis.AtcoderStorage.getDifficulties();

    const statusObj = statuses[problemId] || { status: globalThis.ATCODER_CONSTANTS.STATUS.UNSEEN };
    const diffVal = difficulties[problemId];

    let statusText = '○ Unseen';
    let color = globalThis.ATCODER_CONSTANTS.COLORS.UNSEEN;

    if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) {
      statusText = '✓ Solved';
      color = globalThis.ATCODER_CONSTANTS.COLORS.SOLVED;
    } else if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED) {
      statusText = '⚠ Attempted';
      color = globalThis.ATCODER_CONSTANTS.COLORS.ATTEMPTED;
    }

    const titleEl = document.querySelector('.h2') || document.querySelector('h2');
    if (titleEl) {
      titleEl.querySelectorAll('.ast-badge, .ast-ac-btn').forEach(el => el.remove());

      const badge = globalThis.AtcoderUI.createBadge(statusText, color);
      titleEl.appendChild(badge);

      if (diffVal !== undefined) {
        const diffBadge = globalThis.AtcoderUI.createDifficultyBadge(diffVal);
        titleEl.appendChild(diffBadge);
      }

      if (statusObj.latestAC) {
        const acBtn = globalThis.AtcoderUI.createLatestACButton(statusObj.latestAC);
        titleEl.appendChild(acBtn);
      }
    }
  }

  await render();

  if (globalThis.AtcoderAPI && globalThis.AtcoderAPI.syncContestNative) {
    const updated = await globalThis.AtcoderAPI.syncContestNative(contestId);
    if (updated) {
      await render();
    }
  }
})();
