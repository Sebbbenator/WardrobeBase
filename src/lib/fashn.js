/**
 * FASHN AI client — talks to the /api/fashn proxy (Vite dev or Vercel function).
 * Docs: https://docs.fashn.ai
 *
 * Auth: the FASHN API key is stored in localStorage under `fashn_api_key`
 * and entered by the user in the Settings page.
 */

function proxyUrl(fashnPath) {
  return `/api/fashn?p=${encodeURIComponent(fashnPath)}`;
}

export function getFashnKey() {
  return localStorage.getItem('fashn_api_key') || '';
}

export function setFashnKey(key) {
  if (key) localStorage.setItem('fashn_api_key', key.trim());
  else localStorage.removeItem('fashn_api_key');
}

/**
 * Run FASHN virtual try-on for one garment.
 * @param {{
 *   humanUrl: string,
 *   garmentUrl: string,
 *   category: 'tops' | 'bottoms' | 'one-pieces',
 *   mode?: 'performance' | 'balanced' | 'quality',
 *   onStatus?: (s: string) => void
 * }} opts
 * @returns {Promise<string>} CDN URL of the generated image (valid 72h)
 */
export async function runFashnTryOn({ humanUrl, garmentUrl, category, mode = 'quality', onStatus }) {
  const key = getFashnKey();
  if (!key) {
    throw new Error(
      'Missing FASHN API key. Open Settings and paste your key.',
    );
  }

  onStatus?.('starting');

  const res = await fetch(proxyUrl('v1/run'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_image: humanUrl,
      garment_image: garmentUrl,
      category,
      mode,
      num_samples: 1,
      output_format: 'jpeg',
    }),
  });

  if (!res.ok) throw new Error(await friendlyError(res, 'Failed to start try-on'));
  const { id, error } = await res.json();
  if (error) throw new Error(`FASHN error: ${error}`);
  if (!id) throw new Error('FASHN did not return a prediction ID.');

  return pollStatus(id, key, onStatus);
}

async function pollStatus(id, key, onStatus) {
  const started = Date.now();
  const timeoutMs = 5 * 60 * 1000; // 5 min cap

  while (true) {
    if (Date.now() - started > timeoutMs) {
      throw new Error('Try-on timed out after 5 minutes.');
    }
    await sleep(2500);

    const res = await fetch(proxyUrl(`v1/status/${id}`), {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(await friendlyError(res, 'Failed to check try-on status'));

    const data = await res.json();
    onStatus?.(data.status);

    if (data.status === 'completed') {
      const output = data.output;
      const url = Array.isArray(output) ? output[0] : output;
      if (!url) throw new Error('Try-on completed but returned no image.');
      return url;
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'Try-on failed.');
    }
    // 'starting' | 'in_queue' | 'processing' — keep polling
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function friendlyError(res, fallback) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body.error || body.detail || body.message || '';
  } catch {
    // ignore
  }
  if (res.status === 401) return 'FASHN rejected the API key. Check Settings.';
  if (res.status === 402) return 'FASHN account is out of credits or billing is not set up.';
  if (res.status === 422) return `FASHN validation error${detail ? `: ${detail}` : '.'}`;
  if (res.status === 429) return 'FASHN is rate-limiting requests. Wait a moment and try again.';
  return `${fallback}${detail ? `: ${detail}` : ` (HTTP ${res.status}).`}`;
}
