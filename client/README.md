# Client

React 19 + Vite single-page app for the [Sidemen Among Us fan archive](../README.md).

```bash
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:3001
npm install
npm run dev            # http://localhost:5173
npm run build          # production bundle in dist/
npm run lint
```

Deployed on Vercel with the root directory set to `client`. `vercel.json` adds the security headers, long-lived caching for static assets and the SPA rewrite.
