async function testLive() {
  try {
    console.log('Logging in to https://tabibi.dz/api/auth/login...');
    const loginRes = await fetch('https://tabibi.dz/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'saint_germain_e24a93',
        password: 'COMdoc007?'
      })
    });
    
    console.log('Login Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login Success:', loginData.success);
    const token = loginData.data?.token;
    if (!token) {
      console.error('No token returned:', loginData);
      return;
    }
    console.log('Token received:', token.slice(0, 20) + '...');

    for (const ep of ['/api/notifications', '/api/tickets', '/api/clinics/profile']) {
      console.log(`\nCalling https://tabibi.dz${ep}...`);
      const res = await fetch(`https://tabibi.dz${ep}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Status for ${ep}:`, res.status, res.statusText);
      const text = await res.text();
      console.log(`Body for ${ep} (first 200 chars):`, text.slice(0, 200));
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testLive();
