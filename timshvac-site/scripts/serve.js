#!/usr/bin/env node
'use strict';
// Simple local server for dist/ (works like Cloudflare Pages: /blog/ -> /blog/index.html, 404.html).
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2'
};

function resolve(urlPath) {
  const p = path.normalize(path.join(DIST, decodeURIComponent(urlPath.split('?')[0])));
  if (!p.startsWith(DIST)) return null;
  for (const c of [p, path.join(p, 'index.html'), p + '.html']) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

http.createServer((req, res) => {
  const file = resolve(req.url);
  const status = file ? 200 : 404;
  const target = file || path.join(DIST, '404.html');
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
