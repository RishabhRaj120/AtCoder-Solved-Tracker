# AtCoder Solved Tracker

A production-ready Chrome Extension that instantly shows which AtCoder problems you've solved or attempted directly on problem and contest pages.

## Features
- **Problem Page Status Badge**: See if a problem is Solved, Attempted, or Unseen right next to the title.
- **Difficulty Badges**: View problem difficulty estimations directly.
- **Contest Task List Coloring**: Color-codes task list links for quick assessment.
- **Incremental Synchronization**: Automatically fetches only new submissions in the background to save bandwidth.
- **Statistics Dashboard**: Visualizes your progress with beautiful Chart.js charts.
- **CSV Export**: Download your problem-solving data locally.
- **Latest AC Shortcut**: Instantly open your latest accepted submission for any solved problem.
- **Privacy First**: No user data leaves the browser except requests made directly to the official AtCoder Problems API.

## Installation

This extension can be loaded directly into Google Chrome as an unpacked extension.

1. Download the repository as a ZIP file or clone it using `git clone`.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `AtCoder-Solved-Tracker` directory.

## Usage

1. Click on the extension icon in your Chrome toolbar.
2. Enter your AtCoder username.
3. The extension will perform an initial sync of all your past submissions.
4. Browse AtCoder problems and enjoy the tracker!
5. To force a sync or change your username, open the Settings menu.

## Architecture & Storage Model

The extension heavily optimizes performance by storing status data efficiently in `chrome.storage.local`.

```json
{
  "problemStatuses": {
    "abc297_a": {
      "status": "solved",
      "latestAC": "https://atcoder.jp/contests/abc297/submissions/123456"
    }
  },
  "lastSubmissionEpoch": 1682859345
}
```

The background service worker syncs on a 6-hour interval, fetching only new submissions (`from_second=lastSubmissionEpoch`). Problem difficulty data is cached for 7 days.

## Privacy Policy
No user data leaves the browser except requests made directly to AtCoder Problems API (`kenkoooo.com/atcoder`) for synchronization.

## Screenshots
*(Insert screenshots here)*
