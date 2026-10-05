const { spawn } = require('child_process');
const fs = require('fs');

async function testClinicTabs() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9344',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:81/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9344/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
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

    // Intercept fetch globally
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => {
        localStorage.setItem('tabibi_token', 'mock_token_abc');
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          const url = String(args[0]);
          console.log('[MOCK FETCH REQUEST]', url);
          if (url.includes('/auth/me')) {
            return new Response(JSON.stringify({
              success: true,
              data: {
                id: "doc-123",
                doctor_id: "doc-123",
                username: "test_doctor",
                user_type: 1,
                fullname: "Dr. Mohamed",
                email: "doctor@example.com",
                profile: {
                  id: "doc-123",
                  doctor_id: "doc-123",
                  fullname: "Dr. Mohamed",
                  specialtyfr: "Médecine générale",
                  specialtyar: "طب عام"
                }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/profile')) {
            return new Response(JSON.stringify({
              success: true,
              data: {
                id: "doc-123",
                fullname: "Dr. Mohamed",
                specialtyfr: "Médecine générale",
                specialtyar: "طب عام"
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/clinics') || url.includes('/clinics')) {
            return new Response(JSON.stringify({
              success: true,
              data: [{
                id: "clinic-1",
                clinicid: "clinic-1",
                clinicname: "Cabinet Dr. Mohamed",
                address: "Rue 1, Alger",
                is_active: 1
              }]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/reasons')) {
            return new Response(JSON.stringify({
              success: true,
              data: []
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/off-hours') || url.includes('/off-hours')) {
            return new Response(JSON.stringify({
              success: true,
              data: []
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return origFetch.apply(this, args);
        };
      })()`
    });

    await send('Page.navigate', { url: 'http://localhost:81/#/clinics' });
    await new Promise(r => setTimeout(r, 2000));

    const checkRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        return {
          url: window.location.href,
          buttons: btns.filter(Boolean).slice(0, 20)
        };
      })()`,
      returnByValue: true
    });
    console.log('Result after navigating /clinics:', checkRes.result.value);

    // Switch to Motifs subtab
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Motifs') || b.innerText.includes('أسباب'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    // Scroll form into view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (form) form.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    let s1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/tab_motifs_rendered.png', Buffer.from(s1.data, 'base64'));
    console.log('Saved tab_motifs_rendered.png');

    // Switch to Pauses subtab
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pauses') || b.innerText.includes('استراحة'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    // Scroll form into view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const forms = document.querySelectorAll('form');
        const form = forms[forms.length - 1];
        if (form) form.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    let s2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/tab_pauses_rendered.png', Buffer.from(s2.data, 'base64'));
    console.log('Saved tab_pauses_rendered.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

testClinicTabs();
