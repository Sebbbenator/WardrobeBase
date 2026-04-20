import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev middleware: handle /api/fashn?p=<path> by forwarding to api.fashn.ai/<path>
    // In production this is handled by api/fashn.js on Vercel.
    configureServer(server) {
      server.middlewares.use('/api/fashn', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const p = url.searchParams.get('p');
          if (!p) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing path query param' }));
            return;
          }

          const targetUrl = `https://api.fashn.ai/${p}`;

          const headers = { 'Content-Type': 'application/json' };
          if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
          }

          let body;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await new Promise((resolve) => {
              let data = '';
              req.on('data', (chunk) => { data += chunk; });
              req.on('end', () => resolve(data));
            });
          }

          const upstream = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: body || undefined,
          });

          const data = await upstream.json();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Dev proxy error: ${err.message}` }));
        }
      });
    },
  },
});
