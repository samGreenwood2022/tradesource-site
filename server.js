// Tiny zero-dependency static server with SPA fallback.
// Serves everything in /public, and falls back to index.html for any
// path that isn't a real file, so client-side routes like
// /manufacturer/vortix/<id>/overview work on a hard refresh or a
// direct cy.visit() too.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4321;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(PUBLIC_DIR, urlPath);

  // If the path doesn't map to a real file (e.g. /manufacturer/vortix/.../overview),
  // serve index.html and let the client-side router handle it.
  fs.stat(filePath, (err, stats) => {
    if (err || stats.isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const ext = path.extname(filePath);
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`TradeSource practice site running at http://localhost:${PORT}`);
});
