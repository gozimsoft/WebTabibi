const { spawn } = require('child_process');

const routes = [
  '/',
  '/#/search',
  '/#/login',
  '/#/register',
  '/#/register-doctor',
  '/#/register-clinic',
  '/#/contact',
  '/#/about',
  '/#/privacy',
  '/#/terms',
  '/#/legal',
  '/#/law-18-07',
  '/#/guide',
  '/#/profile',
  '/#/appointments',
  '/#/requests',
  '/#/tickets',
  '/#/doctor/1',
  '/#/clinic/1',
  '/#/admin'
];

async function checkRoutes() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9335',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9335/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost')) || tabs.find(t => t.type === 'page');
    if (!pageTab) {
      console.log('No tab');
      chromeProcess.kill();
      return;
    }

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

    const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';

    for (const route of routes) {
      await send('Page.navigate', { url: 'http://localhost:81' + route });
      await new Promise(r => setTimeout(r, 1200));

      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const target = document.querySelector(${JSON.stringify(selector)});
          if (target) {
            return {
              matched: true,
              route: window.location.hash || window.location.pathname,
              tag: target.tagName,
              class: target.className,
              text: target.innerText.slice(0, 100),
              html: target.outerHTML.slice(0, 300)
            };
          }
          // Also check partial selector
          const p = document.querySelector('#root > div > div:nth-child(4) > div > div > div:nth-child(2)');
          return {
            matched: false,
            pExists: !!p,
            pChildren: p ? Array.from(p.children).map(c => c.tagName + '.' + c.className) : []
          };
        })()`,
        returnByValue: true
      });

      const res = evalRes.result.value;
      if (res && res.matched) {
        console.log('!!! MATCH FOUND ON ROUTE:', route, res);
      } else if (res && res.pExists) {
        console.log('Partial matched on:', route, 'children count:', res.pChildren.length, res.pChildren.slice(0, 5));
      }
    }

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

checkRoutes();
