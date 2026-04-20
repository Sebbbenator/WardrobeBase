/**
 * Replicate client — talks to the /api/replicate proxy (Vite dev or Vercel function).
 * Currently using subhash25rawat/flux-vton — Flux-based VITON-HD model.
 *
 * Auth: the API key is stored in localStorage under `replicate_api_key`
 * and entered by the user in the Settings page.
 */

// Build a proxy URL — the Replicate path is passed as ?p= to avoid
// catch-all routing issues on Vercel.
function proxyUrl(replicatePath) {
  return `/api/replicate?p=${encodeURIComponent(replicatePath)}`;
}

// subhash25rawat/flux-vton — latest version (a02643ce).
// Inputs: image (person URL), garment (garment URL), part (upper_body | lower_body)
const FLUX_VTON_VERSION = 'a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199';

export function getReplicateKey() {
  return localStorage.getItem('replicate_api_key') || '';
}

export function setReplicateKey(key) {
  if (key) localStorage.setItem('replicate_api_key', key.trim());
  else localStorage.removeItem('replicate_api_key');
}

/**
 * Run Flux-VTON to composite one garment onto a human image.
 * @param {{ humanUrl: string, garmentUrl: string, category: 'upper_body'|'lower_body', onStatus?: (s: string) => void }} opts
 * @returns {Promise<string>} public URL of the generated image
 */
export async function runIdmVton({ humanUrl, garmentUrl, category, onStatus }) {
  const token = getReplicateKey();
  if (!token) {
    throw new Error(
      'Missing Replicate API key. Open Settings and paste your key (starts with "r8_").',
    );
  }

  onStatus?.('starting');
  const res = await fetch(proxyUrl('v1/predictions'), {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: FLUX_VTON_VERSION,
      input: {
        image: humanUrl,
        garment: garmentUrl,
        part: category, // 'upper_body' or 'lower_body'
      },
    }),
  });

  if (!res.ok) throw new Error(await friendlyError(res, 'Failed to start try-on'));
  const prediction = await res.json();
  if (prediction.error) throw new Error(`Replicate error: ${prediction.error}`);
  return pollPrediction(prediction.id, token, onStatus);
}

async function pollPrediction(id, token, onStatus) {
  const started = Date.now();
  const timeoutMs = 5 * 60 * 1000;
  while (true) {
    if (Date.now() - started > timeoutMs) {
      throw new Error('Try-on timed out after 5 minutes.');
    }
    await sleep(3000);
    const res = await fetch(proxyUrl(`v1/predictions/${id}`), {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error(await friendlyError(res, 'Failed to check try-on status'));
    const data = await res.json();
    onStatus?.(data.status);
    if (data.status === 'succeeded') {
      const output = data.output;
      // flux-vton returns a single FileOutput object — the URL is the output itself
      const url = Array.isArray(output) ? output[output.length - 1] : output;
      if (!url) throw new Error('Try-on finished but returned no image.');
      return typeof url === 'string' ? url : url?.url?.() ?? String(url);
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
  if (res.status === 404) return 'Replicate model/version not found.';
  if (res.status === 429) return 'Replicate is rate-limiting requests. Wait a moment and try again.';
  return `${fallback}${detail ? `: ${detail}` : ` (HTTP ${res.status}).`}`;
}
