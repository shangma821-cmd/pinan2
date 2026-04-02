const https = require('https');

const appId = '2121754718';
const access = 'nrcTmB0LwzaVC3rvsJNx2_tHncnh2uaB';
const speaker = 'BV700_V2_streaming';

function req(resourceId) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      user: { uid: 'probe-user' },
      req_params: {
        text: 'test',
        speaker,
        audio_params: { format: 'pcm', sample_rate: 24000 },
      },
    });

    const options = {
      hostname: 'openspeech.bytedance.com',
      path: '/api/v3/tts/unidirectional',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Api-App-Id': appId,
        'X-Api-Access-Key': access,
        'X-Api-Resource-Id': resourceId,
      },
      timeout: 20000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk.toString('utf8')));
      res.on('end', () => {
        let code = null;
        let message = '';
        try {
          const json = JSON.parse(data);
          code = json.code;
          message = json.message || '';
        } catch {
          const line = data.split(/\r?\n/).find(Boolean);
          if (line) {
            try {
              const json = JSON.parse(line);
              code = json.code;
              message = json.message || '';
            } catch {}
          }
        }
        const ok = code === 0 || code === 20000000 || /"data"\s*:\s*"/.test(data);
        resolve({ resourceId, code, message, ok, status: res.statusCode, raw: data.slice(0, 200) });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });

    req.on('error', (err) => {
      resolve({ resourceId, code: -1, message: String(err.message || err), ok: false, status: 0, raw: '' });
    });

    req.write(body);
    req.end();
  });
}

(async () => {
  const candidates = [];
  for (let i = 10000; i <= 10220; i++) {
    candidates.push(`volc.service_type.${i}`);
  }

  const results = [];
  for (const rid of candidates) {
    const r = await req(rid);
    results.push(r);
    if (r.ok) {
      console.log('HIT', JSON.stringify(r));
      process.exit(0);
    }
  }

  const summary = {};
  for (const r of results) {
    const key = `${r.code}|${r.message}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  console.log('NO_HIT');
  Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([k, v]) => console.log(v, k));

  console.log('SAMPLES');
  results.slice(0, 12).forEach((r) => console.log(JSON.stringify(r)));
})();
