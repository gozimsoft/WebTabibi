const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

const badChunk = `    } catch (e) {
      show(e.message, "error");
    }
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>{t("join_requests")}</h1>`;

const goodChunk = `    } catch (e) {
      show(e.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0c4a6e", marginBottom: 20 }}>طلبات الانضمام</h1>`;

if (code.includes(badChunk)) {
  code = code.replace(badChunk, goodChunk);
  console.log('Restored the bad replacement at 5204.');
} else {
  console.log('Could not find the bad chunk to restore.');
}

if (code.includes('placeholder=t("write_message_here")')) {
  code = code.replace('placeholder=t("write_message_here")', 'placeholder={t("write_message_here")}');
  console.log('Fixed placeholder JSX error.');
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
