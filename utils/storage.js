globalThis.AtcoderStorage = {
  async get(keys) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  },
  async set(data) {
    return new Promise(resolve => chrome.storage.local.set(data, resolve));
  },
  async getUsername() {
    const data = await this.get(['username']);
    return data.username || '';
  },
  async setUsername(username) {
    await this.set({ username });
  },
  async getProblemStatuses() {
    const data = await this.get(['problemStatuses']);
    return data.problemStatuses || {};
  },
  async updateProblemStatuses(newStatuses) {
    const current = await this.getProblemStatuses();
    Object.assign(current, newStatuses);
    await this.set({ problemStatuses: current });
  },
  async getLastSubmissionEpoch() {
    const data = await this.get(['lastSubmissionEpoch']);
    return data.lastSubmissionEpoch || 0;
  },
  async setLastSubmissionEpoch(epoch) {
    await this.set({ lastSubmissionEpoch: epoch });
  },
  async getDifficulties() {
    const data = await this.get(['difficulties']);
    return data.difficulties || {};
  },
  async setDifficulties(difficulties) {
    await this.set({ difficulties, difficultyLastUpdated: Date.now() });
  },
  async getDifficultyLastUpdated() {
    const data = await this.get(['difficultyLastUpdated']);
    return data.difficultyLastUpdated || 0;
  },
  async clearCache() {
    await chrome.storage.local.remove([
      'problemStatuses',
      'lastSubmissionEpoch',
      'difficulties',
      'difficultyLastUpdated'
    ]);
  }
};
