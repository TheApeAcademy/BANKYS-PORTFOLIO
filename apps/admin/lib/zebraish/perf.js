/* eslint-disable */
// Lite mode, shared by the stripe field (stripes.js) and the intro (experience.js).
// Both sample their own frame rate; a machine that can't keep up gets
// html[data-lite] and a 'zb:lite' event, and the heavy effects step down. The
// choice lasts for the tab (sessionStorage) so the next page starts light.
// Add ?lite to any URL to preview it.
export function perf() {
  return window.__zbPerf || (window.__zbPerf = { lite: false, t0: 0, n: 0, acc: 0, low: 0, last: 0 });
}
export function liteWanted() {
  try { return new URLSearchParams(location.search).has('lite') || sessionStorage.getItem('zb-lite') === '1'; } catch (e) { return false; }
}
export function goLite() {
  const G = perf(); if (G.lite) return; G.lite = true;
  document.documentElement.setAttribute('data-lite', '');
  try { sessionStorage.setItem('zb-lite', '1'); } catch (e) {}
  window.dispatchEvent(new Event('zb:lite'));
}
