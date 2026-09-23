const http2 = require('http2');

const client = http2.connect('https://tabibi.dz');

client.on('error', (err) => console.error('Client Error:', err));
client.on('goaway', (errorCode, lastStreamID, opaqueData) => {
  console.log('GOAWAY received:', { errorCode, lastStreamID, opaqueData: opaqueData?.toString() });
});

async function run() {
  const loginRes = await fetch('https://tabibi.dz/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'saint_germain_e24a93',
      password: 'COMdoc007?'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;

  function makeReq(path) {
    return new Promise((resolve, reject) => {
      const req = client.request({
        ':method': 'GET',
        ':path': path,
        'authorization': `Bearer ${token}`,
        'accept': 'application/json, text/plain, */*'
      });

      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => {
        resolve();
      });
      req.on('error', (err) => {
        console.error(`[${path}] Stream Error:`, err);
        reject(err);
      });
    });
  }

  console.log('Running 20 rounds of parallel requests...');
  for (let i = 1; i <= 20; i++) {
    try {
      process.stdout.write(`Round ${i}... `);
      await Promise.all([
        makeReq('/api/notifications'),
        makeReq('/api/tickets')
      ]);
      console.log('OK');
    } catch (e) {
      console.log('FAILED in round', i, e);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  client.close();
}

run();
