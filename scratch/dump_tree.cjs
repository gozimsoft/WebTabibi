const { spawn } = require('child_process');

async function dumpTree() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9334',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9334/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost')) || tabs.find(t => t.type === 'page');
    if (!pageTab) {
      console.log('No tab found');
      chromeProcess.kill();
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
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

    await new Promise(r => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        function describeNode(el, depth = 0, path = '') {
          if (depth > 8 || !el) return [];
          const children = Array.from(el.children);
          const info = {
            depth,
            path,
            tag: el.tagName.toLowerCase(),
            class: el.className || '',
            id: el.id || '',
            text: (el.innerText || '').slice(0, 30).replace(/\\s+/g, ' '),
            childCount: children.length
          };
          let res = [info];
          children.forEach((c, idx) => {
            const childPath = path ? \`\${path} > \${c.tagName.toLowerCase()}:nth-child(\${idx + 1})\` : c.tagName.toLowerCase();
            res = res.concat(describeNode(c, depth + 1, childPath));
          });
          return res;
        }

        const root = document.querySelector('#root');
        return describeNode(root, 0, '#root');
      })()`,
      returnByValue: true
    });

    const nodes = evalRes.result.value || [];
    console.log('Total nodes explored:', nodes.length);
    nodes.filter(n => n.path.startsWith('#root > div:nth-child(1) > div:nth-child(4)') || n.depth <= 3).forEach(n => {
      const cls = String(n.class || '');
      console.log('  '.repeat(n.depth) + n.path + ' [' + n.tag + (cls ? '.' + cls.slice(0, 20) : '') + '] (' + n.childCount + ' children) "' + n.text + '"');
    });

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

dumpTree();
