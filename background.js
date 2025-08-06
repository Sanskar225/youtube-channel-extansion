// For future use if needed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({channels: [], enabled: true});
});