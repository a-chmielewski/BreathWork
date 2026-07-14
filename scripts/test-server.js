const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function sendFile(response, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(function (request, response) {
  const url = new URL(request.url, 'http://127.0.0.1:' + PORT);
  let pathname = url.pathname;

  if (pathname === '/BreathWork' || pathname.startsWith('/BreathWork/')) {
    let relative = pathname.replace(/^\/BreathWork\/?/, '');
    if (!relative || relative.endsWith('/')) {
      relative = 'index.html';
    }
    const filePath = path.join(ROOT, relative);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(response, filePath);
      return;
    }
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(ROOT, pathname.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(response, filePath);
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('Test server listening on http://127.0.0.1:' + PORT);
});
