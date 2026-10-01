const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Connected SSE clients for live reload
const clients = new Set();

function broadcastReload() {
  for (const client of clients) {
    try {
      client.write('data: reload\n\n');
    } catch {
      clients.delete(client);
    }
  }
}

// Watch directory for changes with debounce
let debounceTimer = null;
fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  // Ignore git, server itself, or temp files
  if (filename.includes('.git') || filename.includes('server.js') || filename.endsWith('~')) return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`[live-reload] File changed: ${filename}. Reloading browser...`);
    broadcastReload();
  }, 100);
});

const LIVE_RELOAD_SCRIPT = `
<!-- Live Reload Script -->
<script>
(() => {
  const es = new EventSource('/__livereload');
  es.onmessage = (event) => {
    if (event.data === 'reload') {
      console.log('[live-reload] Change detected. Reloading...');
      window.location.reload();
    }
  };
  es.onerror = () => {
    // Reconnect gracefully
    es.close();
    setTimeout(() => location.reload(), 2000);
  };
})();
</script>
`;

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      const headers = {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };

      if (ext === '.html') {
        let htmlStr = content.toString('utf8');
        if (htmlStr.includes('</body>')) {
          htmlStr = htmlStr.replace('</body>', `${LIVE_RELOAD_SCRIPT}</body>`);
        } else {
          htmlStr += LIVE_RELOAD_SCRIPT;
        }
        res.writeHead(200, headers);
        res.end(htmlStr);
      } else {
        res.writeHead(200, headers);
        res.end(content);
      }
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // SSE Live Reload Endpoint
  if (url.pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 1000\n\n');
    clients.add(res);

    req.on('close', () => {
      clients.delete(res);
    });
    return;
  }

  // Sanitize path to prevent directory traversal
  let reqPath = decodeURIComponent(url.pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const safePath = path.normalize(path.join(ROOT_DIR, reqPath));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  serveFile(req, res, safePath);
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Live Dev Server is running at: http://localhost:${PORT}`);
  console.log(`🔄 Live Reload active: edits in REso will auto-refresh.`);
  console.log(`==================================================\n`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', e);
  }
});
