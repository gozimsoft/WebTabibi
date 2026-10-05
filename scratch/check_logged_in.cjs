const { spawn } = require('child_process');

async function testLoggedIn() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9339',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/#/login'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9339/json/list');
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

    // Try logging in via localStorage or API
    // Let's do API login to get token and set localStorage
    const loginRes = await fetch('http://localhost:81/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test_doctor', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('API login response:', loginData.success);

    if (loginData.success && loginData.data) {
      const userStr = JSON.stringify(loginData.data.user);
      const token = loginData.data.token;

      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('tabibi_token', ${JSON.stringify(token)});
          localStorage.setItem('tabibi_user', ${JSON.stringify(userStr)});
        })()`
      });
    }

    const docRoutes = [
      '/#/profile',
      '/#/appointments',
      '/#/appointmanager',
      '/#/clinic/appointments',
      '/#/my-clinic',
      '/#/support-tickets',
      '/#/tickets'
    ];

    const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';

    for (const r of docRoutes) {
      await send('Page.navigate', { url: 'http://localhost:81' + r });
      await new Promise(res => setTimeout(res, 1500));

      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const target = document.querySelector(${JSON.stringify(selector)});
          if (target) {
            return {
              matched: true,
              route: window.location.hash,
              tag: target.tagName,
              class: target.className,
              text: target.innerText.slice(0, 100),
              html: target.outerHTML.slice(0, 300)
            };
          }
          return { matched: false };
        })()`,
        returnByValue: true
      });

      if (evalRes.result.value && evalRes.result.value.matched) {
        console.log('!!! MATCH FOUND ON LOGGED IN ROUTE:', r, evalRes.result.value);
      }
    }

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

testLoggedIn();
