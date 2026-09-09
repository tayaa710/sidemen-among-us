# Server

Express API for the [Sidemen Among Us fan archive](../README.md). Aggregates the YouTube playlist, the community game sheet and three mod wikis into four JSON endpoints, with a 20-minute cache that is persisted to disk.

```bash
cp .env.example .env   # APIKEY is optional; the committed snapshot is served without it
npm install
npm run dev            # nodemon on http://localhost:3001
npm start              # production
npm run refresh        # wipe the snapshot files and rebuild from the live sources (needs APIKEY)
```

| Endpoint | Description |
|---|---|
| `GET /api/videos` | Videos with stats, players, roles and maps |
| `GET /api/sheetData` | Raw sheet tabs |
| `GET /api/roles` | Role descriptions merged from the three mods |
| `GET /api/reset-cache` | Clear caches and snapshot files |

Deployed on Render with the root directory set to `server`.
