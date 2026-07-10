/**
 * Express adapter over RgsService — a reference REST backend demonstrating the
 * operator API contract. The in-browser build uses RgsService directly; this
 * shows how the very same service is exposed over HTTP so an operator can host
 * it and point the client at it (see INTEGRATION.md).
 *
 * Run: npm run server   (defaults to :8787)
 */
import express, { type Request, type Response } from 'express';
import { RgsService, RgsError } from './rgs';

const app = express();
app.use(express.json());

// CORS for local dev / iframe embedding.
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  next();
});
app.options('*', (_req, res) => res.sendStatus(204));

// One session per process for the mock. A real deployment keys sessions by auth.
const rgs = new RgsService();

function guard(handler: (req: Request, res: Response) => void) {
  return (req: Request, res: Response) => {
    try {
      handler(req, res);
    } catch (err) {
      const status = err instanceof RgsError ? 400 : 500;
      res.status(status).json({ error: (err as Error).message });
    }
  };
}

app.get('/api/config', guard((_req, res) => res.json(rgs.getConfig())));
app.get('/api/balance', guard((_req, res) => res.json({ balance: rgs.getBalance() })));
app.get('/api/fairness', guard((_req, res) => res.json(rgs.getCommitment())));
app.post(
  '/api/fairness/client-seed',
  guard((req, res) => res.json(rgs.setClientSeed(String(req.body?.clientSeed ?? '')))),
);
app.post('/api/bet', guard((req, res) => res.json(rgs.placeBet(req.body))));
app.post(
  '/api/round/:id/tick',
  guard((req, res) => res.json(rgs.tick(String(req.params.id)))),
);
app.post(
  '/api/round/:id/pace',
  guard((req, res) => res.json(rgs.setPace(String(req.params.id), req.body?.pace))),
);
app.post(
  '/api/round/:id/redeclare',
  guard((req, res) => res.json(rgs.reDeclare(String(req.params.id), Number(req.body?.target)))),
);
app.post(
  '/api/round/:id/rest',
  guard((req, res) => res.json(rgs.rest(String(req.params.id)))),
);
app.get('/api/history', guard((_req, res) => res.json(rgs.getHistory())));

const PORT = Number(process.env.PORT ?? 8787);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Life Engine mock RGS listening on http://localhost:${PORT}`);
});
