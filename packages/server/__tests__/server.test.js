const http = require('http');
const createServer = require('../dist/index.js').default;
const data = require('../../data/dist/index.js');

/** Helper to perform an HTTP request against our server. Returns a
 * promise that resolves with an object containing statusCode and
 * parsed JSON body. */
function requestJson(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {}
    };
    let payload = null;
    if (body !== undefined) {
      payload = Buffer.from(JSON.stringify(body));
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = payload.length;
    }
    const req = http.request(options, (res) => {
      let dataStr = '';
      res.on('data', (chunk) => {
        dataStr += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = dataStr.length ? JSON.parse(dataStr) : {};
        } catch (err) {
          return reject(err);
        }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });
    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

describe('server API', () => {
  let server;
  let port;
  beforeEach(async () => {
    // Reset persistent data between tests
    if (data.resetData) {
      await data.resetData();
    }
    server = createServer();
    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });
  afterEach(() => {
    server.close();
  });
  test('GET /health returns OK', async () => {
    const res = await requestJson(port, 'GET', '/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
  test('POST /api/theses and GET /api/theses', async () => {
    const params = {
      type: 'setup',
      description: 'desc',
      supports: ['s'],
      killConditions: ['price drop 10%'],
      reviewCadenceDays: 1,
      horizonDays: 5
    };
    const postRes = await requestJson(port, 'POST', '/api/theses', params);
    expect(postRes.statusCode).toBe(201);
    const getRes = await requestJson(port, 'GET', '/api/theses');
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(1);
  });
  test('GET /api/board returns board', async () => {
    const boardRes = await requestJson(port, 'GET', '/api/board');
    expect(boardRes.statusCode).toBe(200);
    expect(Array.isArray(boardRes.body)).toBe(true);
  });
});