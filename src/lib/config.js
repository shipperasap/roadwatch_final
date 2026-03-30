/* ──────────────────────────────────────────────
   Delhi RoadWatch — API Key Config (localStorage)
   Users enter their own keys on first launch.
   ────────────────────────────────────────────── */

const CONFIG_KEY = 'rw_api_keys';

export function getConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); }
  catch { return {}; }
}

export function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isConfigured() {
  const c = getConfig();
  return !!(c.gemini);
}

export function getGeminiKey()  { return getConfig().gemini    || ''; }
export function getSEUser()     { return getConfig().se_user   || ''; }
export function getSESecret()   { return getConfig().se_secret || ''; }
