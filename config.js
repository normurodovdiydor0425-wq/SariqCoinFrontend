'use strict';
(() => {
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  const defaultApi = localHosts.has(location.hostname)
    ? location.origin
    : 'https://sariqcoinbackend.onrender.com';
  const apiBase = new URL(window.SARIQ_API_BASE || defaultApi);
  window.SARIQ_API_BASE = apiBase.origin;
  window.sariqApiUrl = path => new URL(path, window.SARIQ_API_BASE).toString();
})();
