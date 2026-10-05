const { spawn } = require('child_process');
const http = require('http');

async function testSelectorOnUrl(url, selector) {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    url
  ]);

  // wait 2 seconds for chrome to start
  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9333/json/list');
    const tabs = await listRes.json();
    console.log('Tabs found:', tabs.length);
    if (tabs.length === 0) {
      console.log('No tab found');
      chromeProcess.kill();
      return;
    }
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost')) || tabs.find(t => t.type === 'page');
    console.log('Selected tab URL:', pageTab?.url);
    if (!pageTab) {
      console.log('No page tab found, tabs were:', tabs.map(t => ({ type: t.type, url: t.url })));
      chromeProcess.kill();
      return;
    }
    const wsUrl = pageTab.webSocketDebuggerUrl;

    // Node 22+ has WebSocket globally
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

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

    // Wait a bit for page load
    await new Promise(r => setTimeout(r, 1500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) {
          // let's see what is inside #root > div > div:nth-child(4)
          const c4 = document.querySelector('#root > div > div:nth-child(4)');
          return {
            found: false,
            c4Exists: !!c4,
            currentUrl: window.location.href,
            c4Html: c4 ? c4.innerHTML.slice(0, 500) : null
          };
        }
        return {
          found: true,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          outerHTML: el.outerHTML.slice(0, 1000),
          childrenCount: el.children.length,
          childrenTags: Array.from(el.children).map(c => ({
            tag: c.tagName,
            class: c.className,
            text: c.innerText ? c.innerText.slice(0, 50) : '',
            style: c.getAttribute('style')
          })),
          computedStyle: {
            display: window.getComputedStyle(el).display,
            flexDirection: window.getComputedStyle(el).flexDirection,
            alignItems: window.getComputedStyle(el).alignItems,
            justifyContent: window.getComputedStyle(el).justifyContent,
            textAlign: window.getComputedStyle(el).textAlign
          }
        };
      })()`,
      returnByValue: true
    });

    console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

const selector = '#root > div > div:nth-child(4) > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2)';
testSelectorOnUrl('http://localhost:81', selector);
