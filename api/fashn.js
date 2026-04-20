/**
 * Vercel serverless function — proxies requests to api.fashn.ai.
 * The FASHN API path is passed as the `p` query parameter.
 *
 * e.g. /api/fashn?p=v1/run
 *      /api/fashn?p=v1/status/abc123
 */
export default async function handler(req, res) {
  const path = req.query.p;
  if (!path) {
    return res.status(400).json({ error: 'Missing path query param' });
  }

  const targetUrl = `https://api.fashn.ai/${path}`;

  const forwardHeaders = {
    'Content-Type': 'application/json',
  };
  if (req.headers.authorization) {
    forwardHeaders['Authorization'] = req.headers.authorization;
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: `Proxy error: ${err.message}` });
  }
}
