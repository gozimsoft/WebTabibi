const { spawn } = require('child_process');
const fs = require('fs');

async function testDoctorTabs() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9345',
    '--window-size=1280,1000',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9345/json/list');
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

    const mockDoctor = {
      id: "doc-123",
      doctor_id: "doc-123",
      user_id: "doc-123",
      username: "test_doctor",
      user_type: 1,
      fullname: "Dr. Mohamed",
      email: "doctor@example.com",
      token: "mock_jwt_token",
      profile: {
        id: "doc-123",
        doctor_id: "doc-123",
        fullname: "Dr. Mohamed",
        specialtyfr: "Médecine générale",
        specialtyar: "طب عام"
      }
    };

    // Intercept fetch
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => {
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          const url = String(args[0]);
          if (url.includes('/auth/login') || url.includes('/login')) {
            return new Response(JSON.stringify({
              success: true,
              data: ${JSON.stringify(mockDoctor)}
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/auth/me')) {
            return new Response(JSON.stringify({
              success: true,
              data: ${JSON.stringify(mockDoctor)}
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/clinics') || url.includes('/clinics')) {
            return new Response(JSON.stringify({
              success: true,
              data: [{
                id: "clinic-1",
                clinicid: "clinic-1",
                clinicname: "Cabinet Dr. Mohamed",
                activitysector: "Médecine générale",
                address: "Rue 1, Alger",
                is_active: 1
              }]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/profile')) {
            return new Response(JSON.stringify({
              success: true,
              data: ${JSON.stringify(mockDoctor.profile)}
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (url.includes('/doctors/reasons') || url.includes('/reasons')) {
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

    // Go to login page
    await send('Page.navigate', { url: 'http://localhost:81/#/login' });
    await new Promise(r => setTimeout(r, 1500));

    // Fill in login form and click submit
    await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = document.querySelectorAll('input');
        if (inputs.length >= 2) {
          inputs[0].value = 'test_doctor';
          inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[1].value = 'password123';
          inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Se connecter') || b.innerText.includes('تسجيل الدخول'));
        if (submitBtn) submitBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Navigate to clinics
    await send('Page.navigate', { url: 'http://localhost:81/#/clinics' });
    await new Promise(r => setTimeout(r, 1500));

    const state = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        return {
          url: window.location.href,
          btns: btns.filter(Boolean)
        };
      })()`,
      returnByValue: true
    });
    console.log('State at /clinics:', state.result.value);

    // Click "Gérer" or clinic card if there's a list
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gérer') || b.innerText.includes('إدارة') || b.innerText.includes('Paramètres'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Look for Motifs tab
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
        const f = document.querySelector('form');
        if (f) f.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    let s1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/tab_motifs_clean.png', Buffer.from(s1.data, 'base64'));
    console.log('Saved tab_motifs_clean.png');

    // Click Pauses tab
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
        const f = forms[forms.length - 1];
        if (f) f.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    let s2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/tab_pauses_clean.png', Buffer.from(s2.data, 'base64'));
    console.log('Saved tab_pauses_clean.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProcess.kill();
  }
}

testDoctorTabs();
