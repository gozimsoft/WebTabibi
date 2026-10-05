const { spawn } = require('child_process');
const fs = require('fs');

async function captureAr() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9338',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/#/register-doctor'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9338/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost')) || tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    // Switch to Arabic
    await send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.setItem('i18nextLng', 'ar');
        window.location.reload();
      })()`
    });

    await new Promise(r => setTimeout(r, 2000));

    const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) el.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/register_doctor_grid_ar.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved AR screenshot');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

captureAr();
