const { exec } = require('child_process');
const http = require('http');

const URL = process.env.APP_URL || 'http://localhost:3000/login';
const MAX_WAIT_MS = 120000;
const POLL_MS = 1500;

function checkReady() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitAndOpen() {
  const start = Date.now();
  process.stdout.write('Waiting for frontend at http://localhost:3000...\n');

  while (Date.now() - start < MAX_WAIT_MS) {
    if (await checkReady()) {
      const cmd =
        process.platform === 'win32'
          ? `start "" "${URL}"`
          : process.platform === 'darwin'
            ? `open "${URL}"`
            : `xdg-open "${URL}"`;

      exec(cmd, (err) => {
        if (err) console.error('Could not open browser:', err.message);
        else console.log(`Opened ${URL}`);
      });
      return;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.warn('Frontend did not become ready in time. Open manually:', URL);
}

waitAndOpen();
