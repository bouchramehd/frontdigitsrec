const TIMEOUT_MS = 2000;

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
    const res = await fetchWithTimeout('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return mockFromImage(dataUrl); // backend not ready → mock
  }
}
