/**
 * Vercel serverless function: proxies all /api/replicate/* requests to
 * https://api.replicate.com/* so the browser never hits Replicate directly
 * (avoids CORS and keeps the API key usage server-side).
 *
 * The API key is sent by the frontend in the Authorization header — it remains
 * a client-side secret (stored in localStorage) since this is a single-user app.
 */
export default async function handler(req, res) {
  // Build the Replicate URL from the catch-all path segments.
  const segments = req.query.path;
  const pathStr = Array.isArray(segments) ? segments.join('/') : (segments ?? '');
  const targetUrl = `https://api.replicate.com/v1/${pathStr}`;

  // Forward Authorization + Content-Type from the browser request.
  const forwardHeaders = {
    'Content-Type': 'application/json',
  };
  if (req.headers.authorization) {
    forwardHeaders['Authorization'] = req.headers.authorization;
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Vercel parses JSON bodies automatically — re-serialize for the upstream call.
    body = JSON.stringify(req.body);
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body,
  });

  const contentType = upstream.headers.get('content-type') ?? 'application/json';
  const responseBody = contentType.includes('application/json')
    ? await upstream.json()
    : await upstream.text();

  res.setHeader('Content-Type', contentType);
  res.status(upstream.status).json(responseBody);
}
