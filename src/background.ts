// Background service worker – stores last headers per tab

const tabHeaders = new Map<number, Record<string, string>>();

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0) return;
    const headers: Record<string, string> = {};
    for (const h of details.responseHeaders || []) {
      if (h.name && h.value) {
        headers[h.name.toLowerCase()] = h.value;
      }
    }
    tabHeaders.set(details.tabId, headers);
  },
  { urls: ['<all_urls>'], types: ['main_frame'] },
  ['responseHeaders']
);

chrome.tabs.onRemoved.addListener((tabId) => {
  tabHeaders.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'GET_HEADERS') {
    const tabId = msg.tabId ?? sender.tab?.id;
    const headers = tabId != null ? tabHeaders.get(tabId) || {} : {};
    sendResponse({ headers });
    return true;
  }
  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('WebXray installed');
});