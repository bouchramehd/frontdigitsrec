// src/utils/api.js

// Base API: prend l'env si défini, sinon relatif (proxy CRA requis)
export const API =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, "")) ||
  "/api/v1";

// Timeout configurable (ms)
const TIMEOUT_MS = Number(process.env.REACT_APP_API_TIMEOUT_MS || 10000);

// Mock (optionnel)
function mockFromImage(dataUrl) {
  let h = 0;
  for (let i = 0; i < dataUrl.length; i++) h = (h * 31 + dataUrl.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const top1 = h % 10,
    top2 = (top1 + ((h >> 3) % 9) + 1) % 10,
    top3 = (top1 + ((h >> 7) % 9) + 1) % 10;
  return {
    prediction: top1,
    probs: [
      { digit: top1, prob: 0.78 },
      { digit: top2, prob: 0.17 },
      { digit: top3, prob: 0.05 },
    ],
    _mock: true,
  };
}

async function fetchWithTimeout(url, options = {}, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(t);
    return r;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

/**
 * Envoie une image dataURL au backend et normalise la réponse.
 * Retour: { prediction, probs, raw?, _mock? }
 */
export async function predictDigit(dataUrl) {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:image"))
      throw new Error("Invalid image dataURL");

    const res = await fetchWithTimeout(`${API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Normalisation de forme pour l'UI
    if ("digit" in data) {
      return {
        prediction: data.digit,
        probs: [{ digit: data.digit, prob: data.proba ?? 1 }],
        raw: data,
        _mock: false,
      };
    }
    // Si le backend renvoyait déjà le format UI
    if ("prediction" in data && "probs" in data) {
      return { ...data, _mock: false };
    }

    // Dernier recours: renvoyer brut, mais marqué non-mock
    return { ...data, _mock: false };
  } catch (e) {
    if (process.env.REACT_APP_USE_MOCK === "1") return mockFromImage(dataUrl);
    throw e; // laisser l'UI afficher l'erreur (ErrorBanner)
  }
}

export async function checkHealth() {
  try {
    const r = await fetch(`${API}/health`);
    return r.ok;
  } catch {
    return false;
  }
}
