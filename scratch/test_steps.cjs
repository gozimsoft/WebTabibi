const { spawn } = require('child_process');

async function testSteps() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9337',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/#/register-doctor'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9337/json/list');
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

    await new Promise(r => setTimeout(r, 1000));

    const parts = [
      '#root',
      '#root > div',
      '#root > div > div:nth-child(4)',
      '#root > div > div:nth-child(4) > div',
      '#root > div > div:nth-child(4) > div > div',
      '#root > div > div:nth-child(4) > div > div > div:nth-child(2)',
      '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4)',
      '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)'
    ];

    for (const p of parts) {
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelector(${JSON.stringify(p)});
          if (!el) return null;
          return {
            tag: el.tagName,
            class: el.className,
            text: el.innerText ? el.innerText.slice(0, 50).replace(/\\n/g, ' ') : '',
            style: el.getAttribute('style')
          };
        })()`,
        returnByValue: true
      });
      console.log(p, '=>', res.result.value);
    }

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

testSteps();
