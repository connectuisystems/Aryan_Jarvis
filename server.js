const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

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

        const apiKey = process.env.GROQ_API_KEY || payload.apiKey || '';
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured on the server. Set it in your environment variables.' }));
          return;
        }

        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: payload.model || 'groq/compound',
            messages: payload.messages,
            temperature: 0.65,
            max_tokens: 350
          })
        });

        // Read as text first to avoid JSON parse crash on empty/HTML error responses
        const rawText = await groqResp.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (_) {
          data = { error: `Groq returned an unexpected response (HTTP ${groqResp.status}): ${rawText.slice(0, 200)}` };
        }

        res.writeHead(groqResp.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Fish Audio TTS proxy route
  if (req.url === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const fishApiKey = process.env.FISH_AUDIO_API_KEY || payload.apiKey || '';
        
        if (!fishApiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'FISH_AUDIO_API_KEY is not configured on the server. Set it in your environment variables to enable dynamic TTS.' }));
          return;
        }

        const ttsResp = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fishApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: payload.text,
            reference_id: payload.reference_id || 'a2eaac4c2e1040c09be1257675c8c8c8',
            format: 'mp3',
            latency: 'normal'
          })
        });

        if (!ttsResp.ok) {
          const errText = await ttsResp.text();
          res.writeHead(ttsResp.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: `Fish Audio API Error: ${errText}` }));
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*'
        });
        
        // Pipe the audio stream directly to the response
        if (ttsResp.body) {
          // fetch response body is a Web stream (ReadableStream)
          const reader = ttsResp.body.getReader();
          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              return;
            }
            res.write(value);
            pump();
          };
          pump();
        } else {
          // Fallback if not streamed
          const arrayBuffer = await ttsResp.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        }

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
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
