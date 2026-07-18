// Vercel serverless entry point.
//
// Vercel runs each file under `api/` as a Node serverless function. We reuse the
// existing Express app (`src/app.ts`) rather than `src/server.ts`, because the
// serverless model has no long-lived process: the Socket.IO server, the BullMQ
// worker, and the standalone MCP server that `server.ts` starts do NOT run here.
//
// Consequences (see DEPLOYMENT.md §2):
//   - Real-time agent progress falls back to Socket.IO HTTP long-polling.
//   - The agent pipeline should be driven by an external worker (set REDIS_URL and
//     run `node dist/server.js` somewhere that stays up), not by this function.
//
// The plain REST API (auth, projects, teams, billing, health) works fine as a
// serverless function.
import app from '../src/app';

export default app;
