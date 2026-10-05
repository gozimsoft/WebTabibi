const { spawn } = require('child_process');
const fs = require('fs');

async function testOptions() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9340',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/#/register-doctor'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9340/json/list');
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

    await new Promise(r => setTimeout(r, 1200));

    const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';

    // Scroll into view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) el.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    // Option A: Just add alignItems: start
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) el.style.alignItems = 'start';
      })()`
    });
    let s = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/option_a_align_start.png', Buffer.from(s.data, 'base64'));

    // Option B: Balanced help text for phone + alignItems: start
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
          el.style.alignItems = 'start';
          const phoneContainer = el.children[1];
          if (phoneContainer && !phoneContainer.querySelector('.help-text-added')) {
            const help = document.createElement('div');
            help.className = 'help-text-added';
            help.style.fontSize = '11px';
            help.style.color = 'rgb(100, 116, 139)';
            help.style.marginTop = '4px';
            help.innerText = 'Numéro direct ou accueil du cabinet';
            phoneContainer.appendChild(help);
          }
        }
      })()`
    });
    s = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/option_b_balanced_help.png', Buffer.from(s.data, 'base64'));

    // Option C: Tooltip instead of help text
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
          const nameContainer = el.children[0];
          const phoneContainer = el.children[1];
          // remove help text from nameContainer
          const help = nameContainer.querySelector('div:last-child');
          if (help && help.innerText.includes('Suggéré')) help.remove();
          const helpB = phoneContainer.querySelector('.help-text-added');
          if (helpB) helpB.remove();
          // add tooltip to label
          const labelDiv = nameContainer.querySelector('div');
          if (labelDiv) {
            const tip = document.createElement('span');
            tip.title = 'Suggéré automatiquement, modifiable';
            tip.style.cssText = 'cursor: help; color: #0891b2; display: inline-flex; align-items: center; background: #ecfeff; border-radius: 50%; padding: 2px; font-size: 11px; margin-left: 4px;';
            tip.innerText = ' ⓘ';
            labelDiv.appendChild(tip);
          }
        }
      })()`
    });
    s = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/option_c_tooltip.png', Buffer.from(s.data, 'base64'));

    console.log('All options captured');
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

testOptions();
