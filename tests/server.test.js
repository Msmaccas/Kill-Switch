const assert = require('assert');
const http = require('http');

async function run() {
  const createServer = require('../packages/server/dist/index.js').default;
  const data = require('../packages/data/dist/index.js');
  // Reset data
  await data.resetData();
  // Start server on random port
  const server = createServer();
  let port;
  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
  // helper
  async function requestJson(method, path, body) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {}
      };
      let payload;
      if (body !== undefined) {
        payload = Buffer.from(JSON.stringify(body));
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = payload.length;
      }
      const req = http.request(options, (res) => {
        let dataStr = '';
        res.on('data', (chunk) => (dataStr += chunk));
        res.on('end', () => {
          let parsed = {};
          if (dataStr.length) {
            parsed = JSON.parse(dataStr);
          }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }
  // Health
  const health = await requestJson('GET', '/health');
  assert.strictEqual(health.statusCode, 200);
  assert.strictEqual(health.body.status, 'OK');
  // POST thesis and GET
  const params = {
    type: 'setup',
    description: 'test',
    supports: ['s'],
    killConditions: ['price drop 10%'],
    reviewCadenceDays: 1,
    horizonDays: 5
  };
  const postRes = await requestJson('POST', '/api/theses', params);
  assert.strictEqual(postRes.statusCode, 201);
  const getRes = await requestJson('GET', '/api/theses');
  assert.ok(Array.isArray(getRes.body));
  assert.strictEqual(getRes.body.length, 1);
  // Board
  const board = await requestJson('GET', '/api/board');
  assert.strictEqual(board.statusCode, 200);
  assert.ok(Array.isArray(board.body));
  // cleanup
  server.close();
}

module.exports = { run };