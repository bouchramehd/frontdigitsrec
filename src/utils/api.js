// src/utils/api.js
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";
const TIMEOUT_MS = 10000; // 10s pour laisser le temps au warm-up TF

function mockFromImage(dataUrl) {
  let h = 0; for (let i = 0; i < dataUrl.length; i++) h = (h * 31 + dataUrl.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const top1 = h % 10, top2 = (top1 + ((h >> 3) % 9) + 1) % 10, top3 = (top1 + ((h >> 7) % 9) + 1) % 10;
  return { prediction: top1, probs: [{digit: top1, prob: 0.78},{digit: top2, prob: 0.17},{digit: top3, prob: 0.05}], _mock: true };
}

async function fetchWithTimeout(url, options = {}, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try { const r = await fetch(url, { ...options, signal: controller.signal }); clearTimeout(t); return r; }
  catch (e) { clearTimeout(t); throw e; }
}

export async function predictDigit(dataUrl) {
  try {
    const res = await fetchWithTimeout(`${API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // normalise le format pour que ton UI accepte soit l'ancien mock soit le backend
    return {
      prediction: json.digit,
      probs: [{ digit: json.digit, prob: json.proba }],
      raw: json, // au cas où tu l’affiches ailleurs
    };
  } catch (e) {
    // Utilise le mock seulement si explicitement demandé
    if (process.env.REACT_APP_USE_MOCK === '1') return mockFromImage(dataUrl);
    throw e; // laisser App.js afficher l’erreur (ErrorBanner)
  }
}
