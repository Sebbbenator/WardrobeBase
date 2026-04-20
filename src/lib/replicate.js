/**
 * Replicate client — talks to the Vite dev proxy at /api/replicate.
 * The proxy forwards to https://api.replicate.com so the browser avoids CORS.
 *
 * Auth: the API key is stored in localStorage by the Settings page under
 * `replicate_api_key` and sent via the Authorization header on each request.
 */

const BASE = '/api/replicate/v1';

// Latest version of cuuupid/idm-vton (0513734a — published ~1 year ago).
const IDM_VTON_VERSION = '0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';

export function getReplicateKey() {
  return localStorage.getItem('replicate_api_key') || '';
}

export function setReplicateKey(key) {
  if (key) localStorage.setItem('replicate_api_key', key.trim());
  else localStorage.removeItem('replicate_api_key');
}

/**
 * Run IDM-VTON to composite one garment onto a human image.
 * @param {{ humanUrl: string, garmentUrl: string, category: 'upper_body'|'lower_body'|'dresses', description?: string, onStatus?: (s: string) => void }} opts
 * @returns {Promise<string>} public URL of the generated image (expires ~24h)
 */
export async function runIdmVton({ humanUrl, garmentUrl, category, description = '', onStatus }) {
  const token = getReplicateKey();
  if (!token) {
    throw new Error(
      'Missing Replicate API key. Open Settings and paste your key (starts with "r8_").',
    );
  }

  onStatus?.('starting');
  const res = await fetch(`${BASE}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: IDM_VTON_VERSION,
      input: {
        human_img: humanUrl,
        garm_img: garmentUrl,
        category,
        garment_des: description || `A ${category.replace('_', ' ')} garment`,
      },
    }),
  });

  if (!res.ok) throw new Error(await friendlyError(res, 'Failed to start try-on'));
  const prediction = await res.json();
  return pollPrediction(prediction.id, token, onStatus);
}

async function pollPrediction(id, token, onStatus) {
  const started = Date.now();
  // 5-minute safety cap — IDM-VTON normally runs in 30-90s.
  const timeoutMs = 5 * 60 * 1000;
  while (true) {
    if (Date.now() - started > timeoutMs) {
      throw new Error('Try-on timed out after 5 minutes.');
    }
    await sleep(2000);
    const res = await fetch(`${BASE}/predictions/${id}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error(await friendlyError(res, 'Failed to check try-on status'));
    const data = await res.json();
    onStatus?.(data.status);
    if (data.status === 'succeeded') {
      const output = data.output;
      const url = Array.isArray(output) ? output[output.length - 1] : output;
      if (!url) throw new Error('Try-on finished but returned no image.');
      return url;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error || `Try-on ${data.status}.`);
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function friendlyError(res, fallback) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body.detail || body.error || '';
  } catch {
    // ignore
  }
  if (res.status === 401) return 'Replicate rejected the API key. Check Settings.';
  if (res.status === 402) return 'Replicate account is out of credit or billing is not set up.';
  if (res.status === 404) return 'Replicate model/version not found. The pinned version may be out of date.';
  if (res.status === 429) return 'Replicate is rate-limiting requests. Wait a moment and try again.';
  return `${fallback}${detail ? `: ${detail}` : ` (HTTP ${res.status}).`}`;
}
