import http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { loadTheses, addThesis } from '../../data/dist/index.js';
import { createThesis } from '../../core/dist/index.js';
import { validateThesis } from '../../core/dist/validators.js';
import { evaluateBoard } from '../../workflows/dist/index.js';

/**
 * Parse a JSON body from an incoming HTTP request. Returns a promise
 * that resolves with the parsed object or rejects if parsing fails.
 */
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (body.length === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body.toString());
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Create an HTTP server that exposes a simple JSON API for theses and
 * board status. This implementation avoids external dependencies and
 * uses only the built‑in Node.js http module.  Requests are matched
 * by exact path and method. Responses use JSON and appropriate
 * status codes.
 */
export function createServer() {
  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Default response headers
    res.setHeader('Content-Type', 'application/json');
    const url = req.url || '/';
    const method = req.method || 'GET';
    try {
      if (url === '/health' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'OK' }));
        return;
      }
      if (url === '/api/theses' && method === 'GET') {
        const theses = await loadTheses();
        res.writeHead(200);
        res.end(JSON.stringify(theses));
        return;
      }
      if (url === '/api/theses' && method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const thesis = createThesis(body);
          validateThesis(thesis);
          await addThesis(thesis);
          res.writeHead(201);
          res.end(JSON.stringify(thesis));
        } catch (err: any) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: String(err) }));
        }
        return;
      }
      if (url === '/api/board' && method === 'GET') {
        const board = await evaluateBoard();
        res.writeHead(200);
        res.end(JSON.stringify(board));
        return;
      }
      // If no route matched, return 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err: any) {
      // Internal server error
      res.writeHead(500);
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
  return server;
}

// If this module is executed directly via `npm start`, start the
// server listening on the configured port.  When the module is
// imported (e.g. in tests), the server is not started automatically.
const portEnv = process.env.PORT ? parseInt(String(process.env.PORT), 10) : 3000;
if (require.main === module) {
  const server = createServer();
  const port = !isNaN(portEnv) && portEnv > 0 ? portEnv : 3000;
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

export default createServer;