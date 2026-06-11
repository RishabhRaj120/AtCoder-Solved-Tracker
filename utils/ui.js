globalThis.AtcoderUI = {
  createBadge(statusText, color) {
    const badge = document.createElement('span');
    badge.className = 'ast-badge';
    badge.textContent = statusText;
    badge.style.backgroundColor = color;
    return badge;
  },
  
  createDifficultyBadge(difficultyValue) {
    let diffText = 'Easy';
    let color = globalThis.ATCODER_CONSTANTS.COLORS.DIFFICULTY.EASY;
    if (difficultyValue >= 2000) {
      diffText = 'Very Hard';
      color = globalThis.ATCODER_CONSTANTS.COLORS.DIFFICULTY.VERY_HARD;
    } else if (difficultyValue >= 1200) {
      diffText = 'Hard';
      color = globalThis.ATCODER_CONSTANTS.COLORS.DIFFICULTY.HARD;
    } else if (difficultyValue >= 400) {
      diffText = 'Medium';
      color = globalThis.ATCODER_CONSTANTS.COLORS.DIFFICULTY.MEDIUM;
    }

    const badge = document.createElement('span');
    badge.className = 'ast-badge ast-diff-badge';
    badge.textContent = diffText;
    badge.style.backgroundColor = color;
    return badge;
  },

  createLatestACButton(url) {
    const btn = document.createElement('a');
    btn.className = 'ast-ac-btn btn btn-default btn-sm';
    btn.href = url;
    btn.target = '_blank';
    btn.textContent = 'Open Submission';
    return btn;
  }
};
