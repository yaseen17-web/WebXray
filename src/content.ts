// Content script – collects page signals and responds to popup/background

function collectPageData() {
  const html = document.documentElement.outerHTML;

  const scripts: string[] = [];
  document.querySelectorAll('script').forEach((s) => {
    if (s.src) scripts.push(s.src);
    if (s.textContent) scripts.push(s.textContent.slice(0, 2000));
  });

  const meta: Record<string, string> = {};
  document.querySelectorAll('meta').forEach((m) => {
    const name = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv');
    const content = m.getAttribute('content');
    if (name && content) meta[name.toLowerCase()] = content;
  });

  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach((c) => {
    const [k, ...rest] = c.trim().split('=');
    if (k) cookies[k] = rest.join('=');
  });

  // Lightweight global checks
  const globals: Record<string, unknown> = {};
  const candidates = ['jQuery', '$', 'React', 'ReactDOM', 'Vue', 'angular', 'ng', 'Shopify', '__NEXT_DATA__'];
  for (const key of candidates) {
    try {
      // @ts-ignore
      if (typeof window[key] !== 'undefined') {
        // @ts-ignore
        globals[key] = typeof window[key];
      }
    } catch {
      /* ignore */
    }
  }

  try {
    // @ts-ignore
    if (window.__NEXT_DATA__) globals.__NEXT_DATA__ = true;
  } catch {
    /* */
  }

  return {
    html: html.slice(0, 500000),
    scripts,
    meta,
    cookies,
    url: location.href,
    globals,
    title: document.title,
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'COLLECT_PAGE_DATA') {
    try {
      const data = collectPageData();
      sendResponse({ ok: true, data });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
    return true;
  }
  return false;
});

chrome.runtime.sendMessage({ type: 'CONTENT_READY', url: location.href }).catch(() => {});