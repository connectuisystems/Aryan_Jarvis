const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;

// Detect local Wi-Fi / LAN IP addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Groq API proxy route (safeguards against browser restrictions or CORS)
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': req.headers['authorization'] || `Bearer ${payload.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: payload.model || 'groq/compound',
            messages: payload.messages,
            temperature: 0.65,
            max_tokens: 350
          })
        });
        const data = await groqResp.json();
        res.writeHead(groqResp.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

// Bind to 0.0.0.0 so tablets on the local network can connect
server.listen(PORT, '0.0.0.0', () => {
  const ips = getNetworkIps();
  console.log('================================================================');
  console.log('🕷️  E.V.E. SYSTEM SERVER ONLINE (SPIDER-MAN: BRAND NEW DAY)');
  console.log('================================================================');
  console.log(`▶ On this Computer:      http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`▶ On your Android Tablet: http://${ip.address}:${PORT}`);
    });
    console.log('  (Make sure your Tablet & PC are on the same Wi-Fi network)');
  } else {
    console.log(`▶ On your Tablet:        http://<YOUR_PC_IP>:${PORT}`);
  }
  console.log('================================================================');
});
