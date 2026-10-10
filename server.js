// Tiny zero-dependency server for the TradeSource practice site.
//
//  - Serves everything in /public, and falls back to index.html for any path
//    that isn't a real file, so client-side routes like
//    /en/gb/manufacturer/vortix/<id>/overview work on a hard refresh or a
//    direct cy.visit() / page.goto() too.
//  - Serves a small fictional GraphQL-style API at POST /api/graphql, used by
//    the manufacturer tabs (Certifications, CPD, Literature, Case studies) and
//    the Overview's "Certification bodies" section. Because it is a real network
//    request, tests can wait on it, stub it, slow it down, or make it fail.

const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./api-data');
const catalogue = require('./public/data.js');

const PORT = process.env.PORT || 4321;
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_DELAY_MS = Number(process.env.API_DELAY_MS ?? 150);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// ---------------------------------------------------------------------------
// Fictional API
// ---------------------------------------------------------------------------

// operationName -> where its data lives in api-data.js
const LIST_OPERATIONS = {
  certifications: api.certifications,
  cpd: api.cpd,
  literature: api.literature,
  caseStudies: api.caseStudies,
};

// Answers one GraphQL-style operation. Two requests share each list operation
// name, like the real thing: one loads the filter options, the other loads the
// result tiles. Only the tiles request mentions "paginatedResponse" in its query.
function runOperation(op) {
  const name = op && op.operationName;
  const query = (op && op.query) || '';
  const brandSlug = op && op.variables && op.variables.brandSlug;

  if (!catalogue.manufacturers.some((m) => m.slug === brandSlug)) {
    return { errors: [{ message: `Unknown brand "${brandSlug}"` }] };
  }

  if (name === 'certificationBodies') {
    const items = (api.certificationBodies[brandSlug] || []).map((n) => ({ name: n }));
    return { data: { certificationBodies: { byBrandId: { items } } } };
  }

  if (LIST_OPERATIONS[name]) {
    const items = LIST_OPERATIONS[name][brandSlug] || [];
    if (query.includes('paginatedResponse')) {
      return {
        data: { [name]: { byBrandId: { paginatedResponse: { items, totalItems: items.length } } } },
      };
    }
    const types = [...new Set(items.map((i) => i.type))];
    return {
      data: { [name]: { byBrandId: { filters: [{ id: 'type', label: 'Type', options: types }] } } },
    };
  }

  return { errors: [{ message: `Unknown operation "${name}"` }] };
}

function handleApi(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e5) req.destroy();
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body || 'null');
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ errors: [{ message: 'Invalid JSON' }] }));
      return;
    }
    // Like GraphQL batching: an array in, an array out.
    const result = Array.isArray(parsed) ? parsed.map(runOperation) : runOperation(parsed);
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(result));
    }, API_DELAY_MS);
  });
}

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/api/graphql') {
    if (req.method !== 'POST') {
      res.writeHead(405, { Allow: 'POST' });
      res.end('Method not allowed');
      return;
    }
    handleApi(req, res);
    return;
  }

  // Resolve against /public and refuse anything that escapes it (e.g. ../server.js).
  let filePath = path.resolve(PUBLIC_DIR, '.' + path.sep + urlPath);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // If the path doesn't map to a real file, serve index.html and let the
  // client-side router handle it.
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
