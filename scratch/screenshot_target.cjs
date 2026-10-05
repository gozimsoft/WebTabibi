const { spawn } = require('child_process');
const fs = require('fs');

async function capture() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9336',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/#/register-doctor'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9336/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost')) || tabs.find(t => t.type === 'page');
    if (!pageTab) {
      console.log('No tab found');
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

    await new Promise(r => setTimeout(r, 1500));

    const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';
    
    // Evaluate geometry and details of selector and its children
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return { error: 'Element not found' };
        
        const parent = el.parentElement;
        const children = Array.from(el.children);
        
        return {
          gridStyle: {
            display: window.getComputedStyle(el).display,
            gridTemplateColumns: window.getComputedStyle(el).gridTemplateColumns,
            alignItems: window.getComputedStyle(el).alignItems,
            justifyItems: window.getComputedStyle(el).justifyItems,
            gap: window.getComputedStyle(el).gap
          },
          elRect: el.getBoundingClientRect(),
          children: children.map((c, i) => {
            const rect = c.getBoundingClientRect();
            const input = c.querySelector('input');
            const inputRect = input ? input.getBoundingClientRect() : null;
            const label = c.querySelector('label');
            const labelRect = label ? label.getBoundingClientRect() : null;
            const help = c.querySelector('div:last-child');
            return {
              index: i,
              rect: { top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left, width: rect.width },
              labelRect: labelRect ? { top: labelRect.top, height: labelRect.height } : null,
              inputRect: inputRect ? { top: inputRect.top, height: inputRect.height, bottom: inputRect.bottom } : null,
              html: c.innerHTML
            };
          }),
          // Also let's check next siblings in parent (e.g. Wilaya / Baladiya grid, address)
          parentChildrenCount: parent.children.length,
          allParentChildrenTags: Array.from(parent.children).map(c => ({
            tag: c.tagName,
            style: c.getAttribute('style'),
            text: c.innerText.slice(0, 40).replace(/\\s+/g, ' ')
          }))
        };
      })()`,
      returnByValue: true
    });

    console.log('Inspection:', JSON.stringify(evalRes.result.value, null, 2));

    // Scroll into view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) el.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/register_doctor_grid.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to scratch/register_doctor_grid.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

capture();
