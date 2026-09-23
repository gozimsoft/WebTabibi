async function checkLive() {
  try {
    const res = await fetch('https://tabibi.dz/');
    const html = await res.text();
    console.log('--- Checking https://tabibi.dz/ ---');
    console.log('HTML Length:', html.length);
    
    // Find scripts
    const scriptMatches = [...html.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
    console.log('Scripts:');
    scriptMatches.forEach(s => console.log('  -', s));

    // Find links
    const linkMatches = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    console.log('Links:');
    linkMatches.forEach(l => console.log('  -', l));
  } catch (err) {
    console.error('Error fetching live:', err);
  }
}

checkLive();
