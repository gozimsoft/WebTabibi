<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tableau de Bord National de la Santأ© "Tabibi" - Algأ©rie</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
:root{--bg:#0a1628;--panel:#0d1f3c;--panel2:#112244;--border:#1e3a5f;--a:#1a9fd4;--g:#22c55e;--o:#f59e0b;--r:#ef4444;--p:#8b5cf6;--t:#e2e8f0;--t2:#94a3b8;}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:var(--bg);color:var(--t);font-family:'Cairo',sans-serif;font-size:12px;overflow-x:hidden;}

/* HEADER */
.hdr{background:linear-gradient(135deg,#0a1f3d,#0d2b52,#0a1f3d);border-bottom:2px solid var(--a);padding:6px 16px;display:flex;align-items:center;gap:12px;}
.ecg{flex:1;height:26px;opacity:.6;}
.htitle{text-align:center;flex:2;}
.htitle h1{font-size:19px;font-weight:900;color:#fff;text-shadow:0 0 20px rgba(26,159,212,.5);}
.htitle small{font-size:10px;color:var(--t2);}
.hlogo{background:var(--r);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 0 12px rgba(239,68,68,.5);}

/* TABS */
.tabs{background:#071020;border-bottom:1px solid var(--border);display:flex;gap:2px;padding:0 8px;overflow-x:auto;}
.tabs::-webkit-scrollbar{height:2px;}
.tabs::-webkit-scrollbar-thumb{background:var(--border);}
.tbtn{padding:7px 12px;font-size:11px;font-weight:700;color:var(--t2);border:none;background:transparent;cursor:pointer;white-space:nowrap;border-bottom:3px solid transparent;transition:.2s;font-family:'Cairo',sans-serif;}
.tbtn:hover{color:var(--a);}
.tbtn.act{color:var(--a);border-bottom-color:var(--a);background:rgba(26,159,212,.07);}

/* CONTENT */
.tc{display:none;} .tc.act{display:block;}

/* OVERVIEW GRID */
.ovg{display:grid;grid-template-columns:220px 1fr 220px;gap:6px;padding:6px;height:calc(100vh - 94px);}
.cf{display:flex;flex-direction:column;gap:6px;}

/* PANEL */
.pnl{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:8px;position:relative;overflow:hidden;}
.pnl::before{content:'';position:absolute;top:0;right:0;left:0;height:2px;background:var(--a);}
.pnl.g::before{background:var(--g);} .pnl.o::before{background:var(--o);} .pnl.r::before{background:var(--r);} .pnl.p::before{background:var(--p);}
.pt{font-size:11px;font-weight:700;color:var(--a);margin-bottom:5px;display:flex;align-items:center;gap:4px;}
.pt.g{color:var(--g);} .pt.o{color:var(--o);} .pt.r{color:var(--r);} .pt.p{color:var(--p);}

.sr{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.sl{color:var(--t2);font-size:11px;} .sv{font-weight:700;font-size:13px;}
.sv.b{color:var(--a);}.sv.g{color:var(--g);}.sv.r{color:var(--r);}.sv.o{color:var(--o);}

.pb-w{margin:3px 0;} .pb-l{display:flex;justify-content:space-between;font-size:10px;color:var(--t2);margin-bottom:2px;}
.pb{height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;}
.pf{height:100%;border-radius:3px;}

.kpi3{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:5px;}
.kb{background:var(--panel2);border-radius:5px;padding:5px;text-align:center;border:1px solid var(--border);}
.kb .kv{font-size:15px;font-weight:900;color:var(--a);} .kb .kl{font-size:9px;color:var(--t2);}

.pr{display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.pd{width:7px;height:7px;border-radius:50%;} .pn{display:flex;align-items:center;gap:5px;font-size:11px;flex:1;}
.pbw{flex:1;margin:0 7px;height:4px;background:rgba(255,255,255,.1);border-radius:2px;}
.pb2{height:100%;border-radius:2px;}

.mr{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11px;}
.bdg{padding:2px 6px;border-radius:10px;font-size:10px;font-weight:700;}
.bok{background:rgba(34,197,94,.2);color:var(--g);} .bwn{background:rgba(245,158,11,.2);color:var(--o);} .bbd{background:rgba(239,68,68,.2);color:var(--r);}

.lgr{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--t2);margin-top:3px;}
.lgd{width:8px;height:8px;border-radius:50%;}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} .pulse{animation:pulse 1.4s infinite;}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;}

/* DETAIL PAGES */
.dp{padding:10px;height:calc(100vh - 94px);overflow-y:auto;}
.dp::-webkit-scrollbar{width:4px;} .dp::-webkit-scrollbar-thumb{background:var(--border);}
.dtitle{font-size:15px;font-weight:900;color:var(--a);margin-bottom:10px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);padding-bottom:8px;}
.dg2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.dg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;}
.dg4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;}

.kc{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;position:relative;overflow:hidden;}
.kc::before{content:'';position:absolute;top:0;right:0;left:0;height:3px;background:var(--a);}
.kc.g::before{background:var(--g);}.kc.o::before{background:var(--o);}.kc.r::before{background:var(--r);}
.kc .big{font-size:24px;font-weight:900;color:var(--a);margin:3px 0;}
.kc .big.g{color:var(--g);}.kc .big.o{color:var(--o);}.kc .big.r{color:var(--r);}
.kc .lbl{font-size:11px;color:var(--t2);}

.tp{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;}
table.tbl{width:100%;border-collapse:collapse;font-size:11px;}
.tbl th{background:var(--panel2);color:var(--t2);padding:7px 10px;text-align:right;font-weight:600;}
.tbl td{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.05);}
.tbl tr:hover td{background:rgba(255,255,255,.03);}

.cw{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;}
.cw h4{font-size:12px;color:var(--t2);margin-bottom:8px;}

.alb{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px;padding:8px 12px;margin-bottom:8px;font-size:11px;color:var(--r);display:flex;align-items:center;gap:8px;}
.alb.wn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:var(--o);}
.alb.ok{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:var(--g);}

.il{list-style:none;}
.il li{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px;}
.il li span{color:var(--a);font-weight:700;}

#mapFull{height:calc(100vh - 200px);border-radius:8px;border:1px solid var(--border);}
.mleg{display:flex;gap:16px;margin-top:8px;justify-content:center;}
</style>
</head>
<body>

<div class="hdr">
  <svg class="ecg" viewBox="0 0 300 26"><polyline points="0,13 30,13 40,3 50,23 60,13 80,13 90,2 100,24 110,13 140,13 150,6 160,20 170,13 200,13 210,3 220,23 230,13 260,13 270,8 280,18 290,13 300,13" fill="none" stroke="#1a9fd4" stroke-width="1.5"/></svg>
  <div class="htitle">
    <h1>ًںڈ¥ Tableau de Bord National de la Santأ© "Tabibi"</h1>
    <small>Ministأ¨re de la Santأ© Algأ©rien â€” Systأ¨me National de Prospective Sanitaire</small>
  </div>
  <svg class="ecg" viewBox="0 0 300 26"><polyline points="0,13 30,13 40,3 50,23 60,13 80,13 90,2 100,24 110,13 140,13 150,6 160,20 170,13 200,13 210,3 220,23 230,13 260,13 270,8 280,18 290,13 300,13" fill="none" stroke="#1a9fd4" stroke-width="1.5"/></svg>
  <div class="hlogo">â‌¤ï¸ڈ</div>
</div>

<div class="tabs">
  <button class="tbtn act" onclick="st('ov',this)">ًں“ٹ Aperأ§u Gأ©nأ©ral</button>
  <button class="tbtn" onclick="st('map',this)">ًں—؛ï¸ڈ Carte Sanitaire</button>
  <button class="tbtn" onclick="st('epi',this)">ًں”¬ أ‰pidأ©miologie et Maladies</button>
  <button class="tbtn" onclick="st('cap',this)">ًںڈ¥ Hospitalisation et Capacitأ©</button>
  <button class="tbtn" onclick="st('res',this)">ًں‘¨â€چâڑ•ï¸ڈ Ressources Humaines</button>
  <button class="tbtn" onclick="st('ph',this)">ًں’ٹ Mأ©dicaments et Stocks</button>
  <button class="tbtn" onclick="st('vac',this)">ًں’‰ Programme de Vaccination</button>
  <button class="tbtn" onclick="st('mc',this)">ًںچ¼ Santأ© Maternelle et Infantile</button>
  <button class="tbtn" onclick="st('acc',this)">ًںڑ‘ Accأ¨s aux Soins</button>
  <button class="tbtn" onclick="st('ai',this)">ًں¤– Prأ©visions Intelligentes</button>
</div>

<!-- ======= TAB: OVERVIEW ======= -->
<div id="t-ov" class="tc act">
<div class="ovg">

  <!-- LEFT -->
  <div class="cf">
    <div class="pnl">
      <div class="pt">ًں“ٹ Statistiques Gأ©nأ©rales</div>
      <div class="sr"><span class="sl">ًں‘¥ Population Totale</span><span class="sv b">12,5 M</span></div>
      <div class="sr"><span class="sl">ًں’™ Espأ©rance de Vie</span><span class="sv b">76,4 ans</span></div>
      <div class="sr"><span class="sl">ًں“‰ Taux de Mortalitأ©</span><span class="sv r">7,2 %</span></div>
      <div class="sr"><span class="sl">ًںچ¼ Taux de Natalitأ©</span><span class="sv o">18,5 %</span></div>
      <div style="margin-top:6px">
        <div class="pb-w"><div class="pb-l"><span>âœ… Assurأ©s Sociaux</span><span style="color:var(--g)">68%</span></div><div class="pb"><div class="pf" style="width:68%;background:var(--g)"></div></div></div>
        <div class="pb-w"><div class="pb-l"><span>ًں’‰ Taux de Vaccination</span><span style="color:var(--a)">82%</span></div><div class="pb"><div class="pf" style="width:82%;background:var(--a)"></div></div></div>
      </div>
    </div>

    <div class="pnl g">
      <div class="pt g">ًں«€ Gestion des Maladies</div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--r)"></div>Maladies Cardiaques</div><div class="pbw"><div class="pb2" style="width:70%;background:var(--r)"></div></div><span style="color:var(--r);font-size:10px">â†‘</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--a)"></div>Diabأ¨te</div><div class="pbw"><div class="pb2" style="width:55%;background:var(--a)"></div></div><span style="color:var(--a);font-size:10px">+</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--p)"></div>Cancer</div><div class="pbw"><div class="pb2" style="width:40%;background:var(--p)"></div></div><span style="color:var(--p);font-size:10px">+</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--o)"></div>Maladies Respiratoires</div><div class="pbw"><div class="pb2" style="width:35%;background:var(--o)"></div></div><span style="color:var(--o);font-size:10px">â†‘â†‘</span></div>
      <div style="margin-top:5px;font-size:10px;color:var(--t2);margin-bottom:3px">Top 5 Maladies</div>
      <div style="height:75px"><canvas id="c-top5"></canvas></div>
    </div>

    <div class="pnl" style="flex:1">
      <div class="pt">ًں—؛ï¸ڈ Carte Sanitaire</div>
      <div id="sm2" style="height:120px;border-radius:4px;border:1px solid var(--border)"></div>
      <div class="lgr"><div class="lgd" style="background:var(--g)"></div>Bon Accأ¨s</div>
      <div class="lgr"><div class="lgd" style="background:var(--o)"></div>Accأ¨s Moyen</div>
      <div class="lgr"><div class="lgd" style="background:var(--r)"></div>Accأ¨s Faible</div>
      <div style="height:55px;margin-top:4px"><canvas id="c-acc"></canvas></div>
    </div>
  </div>

  <!-- CENTER -->
  <div class="cf">
    <div class="pnl">
      <div class="pt">ًںڈ¥ أ‰tat des Hأ´pitaux</div>
      <div class="kpi3">
        <div class="kb"><div class="kv">245</div><div class="kl">ًںڈ¥ Hأ´pitaux</div></div>
        <div class="kb"><div class="kv" style="color:var(--g)">520</div><div class="kl">ًںڈ¢ Centres de Santأ©</div></div>
        <div class="kb"><div class="kv" style="color:var(--o)">15,300</div><div class="kl">ًں›ڈï¸ڈ Lits</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
        <span style="font-size:11px;color:var(--t2)">Taux d'Occupation</span>
        <span style="font-size:14px;font-weight:900;color:var(--o)">78%</span>
      </div>
      <div class="pb"><div class="pf" style="width:78%;background:linear-gradient(90deg,var(--a),var(--o))"></div></div>
    </div>

    <div class="pnl" style="flex:2">
      <div class="pt">ًں—؛ï¸ڈ Rأ©partition Hospitaliأ¨re â€” Algأ©rie</div>
      <div id="sm1" style="height:225px;border-radius:4px;border:1px solid var(--border)"></div>
    </div>

    <div class="g3">
      <div class="pnl o">
        <div class="pt o">ًں’ٹ Consommation Mأ©dicamenteuse</div>
        <div class="sr"><span class="sl">Mأ©dicaments Distribuأ©s</span><span class="sv o">2,3 M</span></div>
        <div class="sr"><span class="sl" style="color:var(--r)">âڑ ï¸ڈ Rupture de Stock</span><span class="sv r">15</span></div>
        <div class="sr"><span class="sl">Production Locale</span><span class="sv g">58%</span></div>
        <div style="height:55px;margin-top:4px"><canvas id="c-med"></canvas></div>
        <div class="mr"><span>Paracetamol</span><span class="bdg bok">Stable</span></div>
        <div class="mr"><span>Insuline Lantus</span><span class="bdg bwn">Critique</span></div>
        <div class="mr"><span>Amoxicilline 1g</span><span class="bdg bbd">Rupture</span></div>
      </div>
      <div class="pnl g">
        <div class="pt g">ًں‘¨â€چâڑ•ï¸ڈ Ressources Mأ©dicales</div>
        <div class="sr"><span class="sl">Mأ©decins</span><span class="sv b">8,200</span></div>
        <div class="sr"><span class="sl">Infirmiers</span><span class="sv g">14,500</span></div>
        <div class="sr"><span class="sl">Ambulances</span><span class="sv o">850</span></div>
        <div class="pb-w" style="margin-top:5px"><div class="pb-l"><span>Formation et Recrutement</span><span>74%</span></div><div class="pb"><div class="pf" style="width:74%;background:var(--g)"></div></div></div>
        <div class="pb-w"><div class="pb-l"><span>أ‰quipements Mأ©dicaux</span><span>62%</span></div><div class="pb"><div class="pf" style="width:62%;background:var(--a)"></div></div></div>
        <div class="g3" style="margin-top:5px;text-align:center">
          <div><div style="font-size:12px;font-weight:700;color:var(--a)">210</div><div style="font-size:9px;color:var(--t2)">Scanners</div></div>
          <div><div style="font-size:12px;font-weight:700;color:var(--p)">120</div><div style="font-size:9px;color:var(--t2)">IRM</div></div>
          <div><div style="font-size:12px;font-weight:700;color:var(--g)">850</div><div style="font-size:9px;color:var(--t2)">Laboratoires</div></div>
        </div>
      </div>
      <div class="pnl p">
        <div class="pt p">ًںڈ¨ Tourisme Mأ©dical</div>
        <div style="height:90px"><canvas id="c-tour"></canvas></div>
        <div class="sr" style="margin-top:3px"><span class="sl">Patients أ‰trangers</span><span class="sv" style="color:var(--p)">3,200</span></div>
        <div class="sr"><span class="sl">Revenus</span><span class="sv o">42 M$</span></div>
      </div>
    </div>

    <div class="pnl">
      <div class="pt">ًں“ˆ Indicateurs de Santأ© Publique</div>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--a)">24,5%</div><div style="font-size:10px;color:var(--t2)">Taux d'Obأ©sitأ©</div></div>
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--o)">12,8%</div><div style="font-size:10px;color:var(--t2)">Malnutrition Infantile</div></div>
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--p)">17,4%</div><div style="font-size:10px;color:var(--t2)">Maladies Chroniques</div></div>
        <div style="flex:1;min-width:100px;height:55px"><canvas id="c-ind"></canvas></div>
      </div>
    </div>
  </div>

  <!-- RIGHT -->
  <div class="cf">
    <div class="pnl r">
      <div class="pt r">ًں”¬ Surveillance أ‰pidأ©miologique</div>
      <div class="alb"><span class="pulse">ًں”´</span>Alertes أ‰pidأ©miologiques Actives</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:11px;color:var(--t2)">ًںژ¯ Taux de Dأ©tection</span>
        <span style="font-size:22px;font-weight:900;color:var(--g)">92%</span>
      </div>
      <div style="font-size:10px;color:var(--t2);margin-bottom:3px">Indice d'Infection</div>
      <div style="height:65px"><canvas id="c-cont"></canvas></div>
    </div>

    <div class="g2">
      <div class="pnl r" style="padding:6px">
        <div class="pt r" style="font-size:10px">ًں¦  Covid-19</div>
        <div style="height:58px"><canvas id="c-cov"></canvas></div>
        <div style="font-size:10px;color:var(--t2);text-align:center;margin-top:2px">â†“ En baisse</div>
      </div>
      <div class="pnl o" style="padding:6px">
        <div class="pt o" style="font-size:10px">ًں¤§ Grippe Saisonniأ¨re</div>
        <div style="height:58px"><canvas id="c-flu"></canvas></div>
        <div style="font-size:10px;color:var(--t2);text-align:center;margin-top:2px">â†‘ Pic hivernal</div>
      </div>
    </div>

    <div class="pnl" style="flex:1">
      <div class="pt">ًں¤– Prأ©visions et Planification</div>
      <div style="font-size:10px;color:var(--t2);margin-bottom:2px">ًں“ٹ Besoins Hospitaliers</div>
      <div style="height:55px"><canvas id="c-ph"></canvas></div>
      <div style="font-size:10px;color:var(--t2);margin:5px 0 2px">ًں’ٹ Prأ©visions Mأ©dicaments</div>
      <div style="height:55px"><canvas id="c-pm"></canvas></div>
      <div style="font-size:10px;color:var(--t2);margin:5px 0 2px">ًں’° Budget de la Santأ©</div>
      <div style="font-size:20px;font-weight:900;color:var(--o);text-align:center;margin:3px 0">15,4 Milliards DZD</div>
      <div class="g2" style="text-align:center;margin-top:3px">
        <div><div style="font-size:10px;color:var(--t2)">ًںں، Projets en Cours</div><div style="font-size:14px;font-weight:700;color:var(--o)">38</div></div>
        <div><div style="font-size:10px;color:var(--t2)">ًںڈ—ï¸ڈ Nouvelles Constructions</div><div style="font-size:14px;font-weight:700;color:var(--a)">12</div></div>
      </div>
      <div style="display:flex;gap:4px;margin-top:8px;justify-content:center;font-size:17px">ًںڈ¥ًںڈ¨ًںڈ—ï¸ڈًںڈ¢</div>
    </div>
  </div>

</div>
</div>

<!-- ======= TAB: MAP ======= -->
<div id="t-map" class="tc">
<div class="dp">
  <div class="dtitle">ًں—؛ï¸ڈ Carte Sanitaire Interactive â€” Algأ©rie</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">Total Wilayas</div><div class="big">58</div></div>
    <div class="kc g"><div class="lbl">Wilayas Stables</div><div class="big g">38</div></div>
    <div class="kc o"><div class="lbl">Risque Moyen</div><div class="big o">14</div></div>
    <div class="kc r"><div class="lbl">Risque أ‰levأ©</div><div class="big r">6</div></div>
  </div>
  <div id="mapFull"></div>
  <div class="mleg">
    <div class="lgr"><div class="lgd" style="background:var(--r)"></div>Risque أ‰levأ© (Alger, Oran, Annaba)</div>
    <div class="lgr"><div class="lgd" style="background:var(--o)"></div>Risque Moyen (Sأ©tif, Constantine, Blida)</div>
    <div class="lgr"><div class="lgd" style="background:var(--g)"></div>Situation Stable (Tamanrasset, Adrar, Sud)</div>
  </div>
</div>
</div>

<!-- ======= TAB: EPIDEMIO ======= -->
<div id="t-epi" class="tc">
<div class="dp">
  <div class="dtitle">ًں”¬ أ‰pidأ©miologie et Maladies</div>
  <div class="alb"><span class="pulse">ًں”´</span><b>Alerte:</b> Hausse prأ©vue de 15% des cas d'asthme dans les wilayas du nord la semaine prochaine.</div>
  <div class="alb wn"><span class="pulse">ًںں،</span><b>Alerte:</b> Augmentation des cas de fiأ¨vre de Malte dans les zones rurales â€” renforcer l'inspection vأ©tأ©rinaire recommandأ©.</div>
  <div class="dg4">
    <div class="kc r"><div class="lbl">Cas أ‰pidأ©miologiques Actifs</div><div class="big r">4,230</div></div>
    <div class="kc"><div class="lbl">Taux de Dأ©tection</div><div class="big">92%</div></div>
    <div class="kc o"><div class="lbl">Cas Isolأ©s</div><div class="big o">1,840</div></div>
    <div class="kc g"><div class="lbl">Cas Guأ©ris</div><div class="big g">128,400</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ˆ أ‰volution des Infections (30 jours)</h4><div style="height:220px"><canvas id="d-e1"></canvas></div></div>
    <div class="cw"><h4>ًں¦  Rأ©partition des Maladies par Type</h4><div style="height:220px"><canvas id="d-e2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt r" style="margin-bottom:8px">ًں¦  Tableau des أ‰pidأ©mies Actives</div>
    <table class="tbl">
      <thead><tr><th>Maladie</th><th>Wilaya</th><th>Cas</th><th>Taux de Propagation</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Grippe Saisonniأ¨re</td><td>Alger Centre</td><td>1,240</td><td>0.8%</td><td><span class="bdg bwn">Actif</span></td></tr>
        <tr><td>Hأ©patite B</td><td>Oran</td><td>380</td><td>0.3%</td><td><span class="bdg bwn">Surveillance</span></td></tr>
        <tr><td>Tuberculose Pulmonaire</td><td>Constantine</td><td>210</td><td>0.2%</td><td><span class="bdg bok">Contrأ´lأ©</span></td></tr>
        <tr><td>Covid-19</td><td>National</td><td>850</td><td>0.1%</td><td><span class="bdg bok">En baisse</span></td></tr>
        <tr><td>Fiأ¨vre de Malte</td><td>Rural</td><td>520</td><td>0.4%</td><td><span class="bdg bbd">En hausse</span></td></tr>
        <tr><td>Mأ©ningite</td><td>Sأ©tif</td><td>95</td><td>0.05%</td><td><span class="bdg bwn">Surveillance</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: CAPACITY ======= -->
<div id="t-cap" class="tc">
<div class="dp">
  <div class="dtitle">ًںڈ¥ Hospitalisation et Capacitأ© d'Accueil</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">Total Lits</div><div class="big">40,000</div></div>
    <div class="kc o"><div class="lbl">Taux d'Occupation</div><div class="big o">78%</div></div>
    <div class="kc r"><div class="lbl">Lits de Soins Intensifs</div><div class="big r">4,000</div></div>
    <div class="kc g"><div class="lbl">Durأ©e Moyenne de Sأ©jour</div><div class="big g">4,3 jours</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ٹ Taux d'Occupation des Lits par Wilaya</h4><div style="height:220px"><canvas id="d-c1"></canvas></div></div>
    <div class="cw"><h4>ًں›ڈï¸ڈ Rأ©partition des Lits par Spأ©cialitأ©</h4><div style="height:220px"><canvas id="d-c2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt" style="margin-bottom:8px">ًںڈ¥ Dأ©tail des Grands Hأ´pitaux</div>
    <table class="tbl">
      <thead><tr><th>Hأ´pital</th><th>Wilaya</th><th>Lits</th><th>Occupation</th><th>Soins Intensifs</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Hأ´pital Mustapha Pacha</td><td>Alger</td><td>2,200</td><td>88%</td><td>320</td><td><span class="bdg bbd">Saturأ©</span></td></tr>
        <tr><td>Hأ´pital Ibn Sina</td><td>Oran</td><td>1,800</td><td>75%</td><td>280</td><td><span class="bdg bwn">أ‰levأ©</span></td></tr>
        <tr><td>Hأ´pital Ibn Badi</td><td>Constantine</td><td>1,400</td><td>62%</td><td>210</td><td><span class="bdg bok">Normal</span></td></tr>
        <tr><td>Hأ´pital de Sأ©tif</td><td>Sأ©tif</td><td>1,200</td><td>70%</td><td>180</td><td><span class="bdg bwn">أ‰levأ©</span></td></tr>
        <tr><td>Hأ´pital de Batna</td><td>Batna</td><td>1,000</td><td>55%</td><td>150</td><td><span class="bdg bok">Normal</span></td></tr>
        <tr><td>Hأ´pital d'Annaba</td><td>Annaba</td><td>900</td><td>68%</td><td>130</td><td><span class="bdg bwn">أ‰levأ©</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: RESOURCES ======= -->
<div id="t-res" class="tc">
<div class="dp">
  <div class="dtitle">ًں‘¨â€چâڑ•ï¸ڈ Ressources Humaines et أ‰quipements</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">Mأ©decins Gأ©nأ©ralistes</div><div class="big">23,000</div></div>
    <div class="kc g"><div class="lbl">Mأ©decins Spأ©cialistes</div><div class="big g">18,000</div></div>
    <div class="kc o"><div class="lbl">Infirmiers et Para-mأ©dicaux</div><div class="big o">55,000</div></div>
    <div class="kc r"><div class="lbl">Pأ©nurie de Spأ©cialitأ©s</div><div class="big r">12</div></div>
  </div>
  <div class="dg2">
    <div class="tp">
      <div class="pt g" style="margin-bottom:8px">ًں‘¨â€چâڑ•ï¸ڈ Rأ©partition du Personnel Mأ©dical</div>
      <table class="tbl">
        <thead><tr><th>Catأ©gorie</th><th>Effectif</th><th>Norme Nationale</th><th>أ‰cart</th></tr></thead>
        <tbody>
          <tr><td>Mأ©decins Gأ©nأ©ralistes</td><td>23,000</td><td>25,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>Mأ©decins Spأ©cialistes</td><td>18,000</td><td>20,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>Infirmiers</td><td>55,000</td><td>50,000</td><td><span class="bdg bok">+5,000</span></td></tr>
          <tr><td>Sages-femmes</td><td>12,000</td><td>14,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>Pharmaciens</td><td>8,500</td><td>9,000</td><td><span class="bdg bwn">-500</span></td></tr>
          <tr><td>Techniciens Mأ©dicaux</td><td>30,000</td><td>28,000</td><td><span class="bdg bok">+2,000</span></td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <div class="cw" style="margin-bottom:10px"><h4>ًں“ٹ Rأ©partition du Personnel par Rأ©gion</h4><div style="height:160px"><canvas id="d-r1"></canvas></div></div>
      <div class="tp">
        <div class="pt" style="margin-bottom:8px">ًںڈ—ï¸ڈ Gros أ‰quipements</div>
        <ul class="il">
          <li><span>Scanners (CT)</span><span>210 appareils</span></li>
          <li><span>IRM</span><span>120 appareils</span></li>
          <li><span>Laboratoires d'Analyse</span><span>850 laboratoires</span></li>
          <li><span>Appareils de Dialyse</span><span>3,200 appareils</span></li>
          <li><span>Salles d'Opأ©ration</span><span>1,400 salles</span></li>
          <li><span>Appareils de Radiothأ©rapie</span><span>48 appareils</span></li>
        </ul>
      </div>
    </div>
  </div>
</div>
</div>

<!-- ======= TAB: PHARMACY ======= -->
<div id="t-ph" class="tc">
<div class="dp">
  <div class="dtitle">ًں’ٹ Mأ©dicaments et Stock Stratأ©gique</div>
  <div class="alb"><span class="pulse">ًں”´</span><b>Alerte Urgente:</b> Rupture de stock d'Amoxicilline 1g â€” Demande urgente soumise.</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">Mأ©dicaments Distribuأ©s</div><div class="big">2,3 M</div></div>
    <div class="kc g"><div class="lbl">Production Locale</div><div class="big g">58%</div></div>
    <div class="kc r"><div class="lbl">Ruptures de Stock</div><div class="big r">15</div></div>
    <div class="kc o"><div class="lbl">Valeur du Stock</div><div class="big o">4,2 M DZD</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ٹ Consommation Mensuelle de Mأ©dicaments 2024</h4><div style="height:200px"><canvas id="d-p1"></canvas></div></div>
    <div class="cw"><h4>ًںڈ­ Production Locale vs Importation</h4><div style="height:200px"><canvas id="d-p2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt o" style="margin-bottom:8px">ًں’ٹ Surveillance du Stock Stratأ©gique</div>
    <table class="tbl">
      <thead><tr><th>Mأ©dicament</th><th>Stock Actuel</th><th>Consommation Mensuelle</th><th>Rأ©serve</th><th>Statut</th><th>Prأ©vision</th></tr></thead>
      <tbody>
        <tr><td>Paracأ©tamol 500mg</td><td>2,1 M unitأ©s</td><td>400 mille</td><td>5 mois</td><td><span class="bdg bok">Sأ»r</span></td><td>Suffisant 5 mois</td></tr>
        <tr><td>Metformine 500mg</td><td>800 mille</td><td>200 mille</td><td>4 mois</td><td><span class="bdg bok">Sأ»r</span></td><td>Suffisant 4 mois</td></tr>
        <tr><td>Amlodipine 5mg</td><td>600 mille</td><td>180 mille</td><td>3.3 mois</td><td><span class="bdg bok">Sأ»r</span></td><td>Suffisant 3 mois</td></tr>
        <tr><td>Insuline Lantus</td><td>150 mille</td><td>120 mille</td><td>15 jours</td><td><span class="bdg bwn">Critique</span></td><td>Commande urgente</td></tr>
        <tr><td>Omأ©prazole 20mg</td><td>90 mille</td><td>150 mille</td><td>18 jours</td><td><span class="bdg bwn">Critique</span></td><td>Commande urgente</td></tr>
        <tr><td>Amoxicilline 1g</td><td>5 mille</td><td>90 mille</td><td>2 jours</td><td><span class="bdg bbd">Rupture</span></td><td>Urgent</td></tr>
        <tr><td>Inhalateur Salbutamol</td><td>12 mille</td><td>80 mille</td><td>5 jours</td><td><span class="bdg bbd">Rupture imminente</span></td><td>Importation urgente</td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: VACCINES ======= -->
<div id="t-vac" class="tc">
<div class="dp">
  <div class="dtitle">ًں’‰ Programme National de Vaccination</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">Total Doses Administrأ©es</div><div class="big g">28 M</div></div>
    <div class="kc"><div class="lbl">Taux de Vaccination National</div><div class="big">82%</div></div>
    <div class="kc o"><div class="lbl">Doses ce Mois</div><div class="big o">420 mille</div></div>
    <div class="kc r"><div class="lbl">Wilayas < 70%</div><div class="big r">8</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ˆ أ‰volution de la Vaccination en 2024</h4><div style="height:200px"><canvas id="d-v1"></canvas></div></div>
    <div class="cw"><h4>ًں’‰ Couverture par Type de Vaccin</h4><div style="height:200px"><canvas id="d-v2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt g" style="margin-bottom:8px">ًں’‰ Vaccins Obligatoires â€” Taux de Couverture</div>
    <table class="tbl">
      <thead><tr><th>Vaccin</th><th>Population Cible</th><th>Taux de Couverture</th><th>Objectif</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>BCG (Tuberculose)</td><td>Nouveau-nأ©s</td><td>95%</td><td>95%</td><td><span class="bdg bok">Atteint âœ…</span></td></tr>
        <tr><td>DTC (Diphtأ©rie)</td><td>Enfants 0-5 ans</td><td>88%</td><td>90%</td><td><span class="bdg bwn">Proche</span></td></tr>
        <tr><td>ROR (Rougeole)</td><td>Enfants</td><td>85%</td><td>95%</td><td><span class="bdg bwn">Insuffisant</span></td></tr>
        <tr><td>Grippe Saisonniأ¨re</td><td>60 ans et plus</td><td>72%</td><td>80%</td><td><span class="bdg bwn">Insuffisant</span></td></tr>
        <tr><td>Covid-19</td><td>Adultes</td><td>78%</td><td>70%</td><td><span class="bdg bok">Atteint âœ…</span></td></tr>
        <tr><td>Tأ©tanos</td><td>Femmes Enceintes</td><td>90%</td><td>90%</td><td><span class="bdg bok">Atteint âœ…</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: MOTHER ======= -->
<div id="t-mc" class="tc">
<div class="dp">
  <div class="dtitle">ًںچ¼ Santأ© Maternelle et Infantile</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">Naissances Supervisأ©es</div><div class="big g">94%</div></div>
    <div class="kc"><div class="lbl">Mortalitأ© Maternelle / 100 mille</div><div class="big">72</div></div>
    <div class="kc o"><div class="lbl">Mortalitأ© Infantile / 1000</div><div class="big o">18,4</div></div>
    <div class="kc r"><div class="lbl">Malnutrition Infantile</div><div class="big r">12,8%</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ˆ Mortalitأ© Maternelle et Infantile (2019-2024)</h4><div style="height:200px"><canvas id="d-m1"></canvas></div></div>
    <div class="cw"><h4>ًں¤± Taux d'Allaitement et Soins Prأ©natals</h4><div style="height:200px"><canvas id="d-m2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt g" style="margin-bottom:8px">ًںچ¼ Indicateurs par Tranche d'أ‚ge des Enfants</div>
    <table class="tbl">
      <thead><tr><th>Tranche d'أ‚ge</th><th>Vaccination</th><th>Allaitement Naturel</th><th>Poids Normal</th><th>أ‰valuation</th></tr></thead>
      <tbody>
        <tr><td>0 - 6 mois</td><td>95%</td><td>68%</td><td>92%</td><td><span class="bdg bok">Excellent</span></td></tr>
        <tr><td>6 mois - 1 an</td><td>90%</td><td>42%</td><td>88%</td><td><span class="bdg bok">Bon</span></td></tr>
        <tr><td>1 - 3 ans</td><td>87%</td><td>â€”</td><td>84%</td><td><span class="bdg bwn">Moyen</span></td></tr>
        <tr><td>3 - 6 ans</td><td>82%</td><td>â€”</td><td>80%</td><td><span class="bdg bwn">Moyen</span></td></tr>
        <tr><td>6 - 12 ans</td><td>78%</td><td>â€”</td><td>76%</td><td><span class="bdg bwn">Moyen</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: ACCESS ======= -->
<div id="t-acc" class="tc">
<div class="dp">
  <div class="dtitle">ًںڑ‘ Accأ¨s aux Soins et أ‰quitأ©</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">Population Bon Accأ¨s</div><div class="big g">68%</div></div>
    <div class="kc o"><div class="lbl">Population Accأ¨s Moyen</div><div class="big o">22%</div></div>
    <div class="kc r"><div class="lbl">Population Accأ¨s Faible</div><div class="big r">10%</div></div>
    <div class="kc"><div class="lbl">Distance Moyenne au Centre de Santأ©</div><div class="big">14 km</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں—؛ï¸ڈ Accأ¨s aux Soins par Rأ©gion</h4><div style="height:200px"><canvas id="d-a1"></canvas></div></div>
    <div class="cw"><h4>ًں“ٹ Disparitأ©s de Services entre Wilayas</h4><div style="height:200px"><canvas id="d-a2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt" style="margin-bottom:8px">ًںڑ‘ Services d'Urgence et Transport Sanitaire</div>
    <ul class="il">
      <li><span>Nombre d'Ambulances</span><span>850 vأ©hicules</span></li>
      <li><span>Temps de Rأ©ponse Moyen (Urbain)</span><span>8 minutes</span></li>
      <li><span>Temps de Rأ©ponse Moyen (Rural)</span><span>28 minutes</span></li>
      <li><span>Centres en Zones Reculأ©es</span><span>124 centres</span></li>
      <li><span>Hأ©licoptأ¨res Sanitaires</span><span>12 hأ©licoptأ¨res</span></li>
      <li><span>Unitأ©s Mأ©dicales Mobiles</span><span>320 unitأ©s</span></li>
    </ul>
  </div>
</div>
</div>

<!-- ======= TAB: AI ======= -->
<div id="t-ai" class="tc">
<div class="dp">
  <div class="dtitle">ًں¤– Prأ©visions Intelligentes par IA</div>
  <div class="alb wn"><span>ًں¤–</span><b>Alerte IA:</b> Hausse prأ©vue de 15% des cas d'asthme dans le nord la semaine prochaine.</div>
  <div class="alb ok"><span>ًں¤–</span><b>Prأ©vision Positive:</b> Baisse prأ©vue de 8% des cas de Covid-19 en mars 2025.</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">Prأ©cision du Modأ¨le Prأ©dictif</div><div class="big">94,2%</div></div>
    <div class="kc g"><div class="lbl">Alertes Traitأ©es</div><div class="big g">1,248</div></div>
    <div class="kc o"><div class="lbl">Prأ©vision Semaine Prochaine</div><div class="big o">+12%</div></div>
    <div class="kc r"><div class="lbl">Risque أ‰pidأ©mique Potentiel</div><div class="big r">Faible</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>ًں“ˆ Prأ©vision de Propagation des أ‰pidأ©mies â€” 6 Mois</h4><div style="height:200px"><canvas id="d-ai1"></canvas></div></div>
    <div class="cw"><h4>ًں’ٹ Prأ©vision des Besoins en Mأ©dicaments</h4><div style="height:200px"><canvas id="d-ai2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt p" style="margin-bottom:8px">ًں¤– Recommandations Intelligentes Urgentes</div>
    <table class="tbl">
      <thead><tr><th>Recommandation</th><th>Prioritأ©</th><th>Entitأ© Concernأ©e</th><th>أ‰chأ©ance</th></tr></thead>
      <tbody>
        <tr><td>Renforcer le stock de Salbutamol dans le nord</td><td><span class="bdg bbd">Urgent</span></td><td>Direction des Mأ©dicaments</td><td>3 jours</td></tr>
        <tr><td>Augmenter la capacitأ© de l'Hأ´pital Mustapha Pacha</td><td><span class="bdg bwn">Haute</span></td><td>Direction d'Alger</td><td>Semaine</td></tr>
        <tr><td>Campagne de vaccination contre la rougeole dans 8 wilayas</td><td><span class="bdg bwn">Haute</span></td><td>Directions concernأ©es</td><td>2 semaines</td></tr>
        <tr><td>Renforcer le contrأ´le vأ©tأ©rinaire en zones rurales</td><td><span class="bdg bok">Moyenne</span></td><td>Ministأ¨re de l'Agriculture</td><td>Mois</td></tr>
        <tr><td>Recruter 500 nouveaux mأ©decins gأ©nأ©ralistes</td><td><span class="bdg bok">Moyenne</span></td><td>Direction des Ressources Humaines</td><td>3 mois</td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<script>
// NAVIGATION
function st(id, btn) {
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('act'));
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.remove('act'));
  document.getElementById('t-'+id).classList.add('act');
  btn.classList.add('act');
  if(id==='map' && !window._mf) initMapFull();
}

// CHART DEFAULTS
Chart.defaults.color='#94a3b8'; Chart.defaults.font.family='Cairo,sans-serif'; Chart.defaults.font.size=9;
const L_=(id,labels,data,color,fill=false)=>{const el=document.getElementById(id);if(!el)return;new Chart(el,{type:'line',data:{labels,datasets:[{data,borderColor:color,backgroundColor:color+'33',fill,tension:.4,borderWidth:1.5,pointRadius:2,pointBackgroundColor:color}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}});};
const B_=(id,labels,data,colors,h=false)=>{const el=document.getElementById(id);if(!el)return;new Chart(el,{type:'bar',data:{labels,datasets:[{data,backgroundColor:Array.isArray(colors)?colors:data.map(()=>colors),borderRadius:3}]},options:{indexAxis:h?'y':'x',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{display:h},y:{display:h}}}});};
const D_=(id,labels,data,colors)=>{const el=document.getElementById(id);if(!el)return;new Chart(el,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:9}}}}}});};
const LL_=(id,datasets)=>{const el=document.getElementById(id);if(!el)return;new Chart(el,{type:'line',data:{labels:['2019','2020','2021','2022','2023','2024'],datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:9}}}},scales:{x:{ticks:{font:{size:9}}},y:{display:false}}}});};

// OVERVIEW
B_('c-top5',['Cإ“ur','Diabأ¨te','Cancer','Respiratoires','Reins'],[70,55,40,35,25],['#ef4444','#1a9fd4','#8b5cf6','#f59e0b','#22c55e']);
B_('c-acc',['Nord','Centre','Sud','Est','Ouest'],[85,72,45,68,79],['#22c55e','#22c55e','#ef4444','#f59e0b','#22c55e']);
L_('c-cont',Array.from({length:12},(_,i)=>i),[3,5,4,7,6,9,8,11,7,5,8,10],'#ef4444',true);
L_('c-cov',Array.from({length:10},(_,i)=>i),[800,620,480,520,400,350,410,380,290,250],'#ef4444',true);
L_('c-flu',Array.from({length:10},(_,i)=>i),[200,350,600,900,1200,950,700,500,300,200],'#f59e0b',true);
B_('c-med',['Janv','Fأ©v','Mars','Avr','Mai','Juin'],[400,450,380,500,420,460],'#f59e0b');
L_('c-tour',['J','F','M','A','M','J','J','A','S','O','N','D'],[80,95,110,130,150,140,160,155,130,120,100,90],'#8b5cf6',true);
B_('c-ph',['Oct','Nov','Dأ©c','Janv','Fأ©v','Mars'],[280,310,350,320,290,270],['#1a9fd4','#1a9fd4','#ef4444','#f59e0b','#1a9fd4','#22c55e']);
L_('c-pm',['Oct','Nov','Dأ©c','Janv','Fأ©v','Mars'],[8000,9500,12000,15000,11000,8000],'#22c55e',true);
B_('c-ind',['Obأ©sitأ©','Malnutrition','Chroniques','Maternelle','Infantile'],[24.5,12.8,17.4,8.2,5.3],['#ef4444','#f59e0b','#8b5cf6','#1a9fd4','#22c55e']);

// DETAIL CHARTS
L_('d-e1',['1','5','10','15','20','25','30'],[3200,3400,3800,3600,4100,4000,4230],'#ef4444',true);
D_('d-e2',['Grippe','Covid','Tuberculose','Hأ©p B','Malte','Autres'],[35,20,15,12,10,8],['#ef4444','#f59e0b','#8b5cf6','#1a9fd4','#22c55e','#94a3b8']);
B_('d-c1',['Alger','Oran','Constantine','Sأ©tif','Batna','Annaba'],[88,75,62,70,55,68],['#ef4444','#f59e0b','#22c55e','#f59e0b','#22c55e','#f59e0b'],true);
D_('d-c2',['Mأ©decine Gأ©n','Chirurgie','Cardio','Pأ©diatrie','Gynأ©co','Autres'],[30,20,15,12,10,13],['#1a9fd4','#ef4444','#8b5cf6','#22c55e','#f59e0b','#94a3b8']);
B_('d-r1',['Nord','Centre','Est','Ouest','Sud'],[45,25,15,10,5],['#1a9fd4','#22c55e','#f59e0b','#8b5cf6','#ef4444'],true);
L_('d-p1',['Janv','Mars','Mai','Juil','Sept','Nov'],[350,390,420,440,420,480],'#f59e0b',true);
D_('d-p2',['Production Locale','Importation'],[58,42],['#22c55e','#1a9fd4']);
L_('d-v1',['Janv','Mars','Mai','Juil','Sept','Nov'],[380,420,460,500,520,540],'#22c55e',true);
D_('d-v2',['BCG','DTC','ROR','Grippe','Covid','Tأ©tanos'],[95,88,85,72,78,90],['#22c55e','#1a9fd4','#f59e0b','#8b5cf6','#ef4444','#f59e0b']);
L_('d-m1',['2019','2020','2021','2022','2023','2024'],[95,90,82,78,75,72],'#ef4444');
LL_('d-m2',[{label:'Soins Prأ©natals',data:[80,83,86,89,91,94],backgroundColor:'#1a9fd4',borderRadius:3,type:'bar'},{label:'Allaitement Naturel',data:[55,58,60,63,66,68],backgroundColor:'#22c55e',borderRadius:3,type:'bar'}]);
D_('d-a1',['Bon','Moyen','Faible'],[68,22,10],['#22c55e','#f59e0b','#ef4444']);
B_('d-a2',['Alger','Oran','Sأ©tif','Batna','Tamanrasset','Adrar'],[92,85,78,72,48,44],['#22c55e','#22c55e','#f59e0b','#f59e0b','#ef4444','#ef4444'],true);
L_('d-ai1',['Oct','Nov','Dأ©c','Janv','Fأ©v','Mars'],[5000,8500,12000,15000,11000,6000],'#f59e0b');
B_('d-ai2',['Antibiotiques','Insuline','Cardio','Antalgiques','Asthme'],[800,600,400,700,350],['#1a9fd4','#22c55e','#ef4444','#f59e0b','#8b5cf6']);

// ======= MAPS =======
const wilayas=[
  {n:'Alger',lat:36.7538,lng:3.0588,c:'#ef4444',r:35000,s:'Critique'},
  {n:'Oran',lat:35.6971,lng:-0.6308,c:'#ef4444',r:28000,s:'أ‰levأ©'},
  {n:'Constantine',lat:36.365,lng:6.6147,c:'#f59e0b',r:22000,s:'Moyen'},
  {n:'Sأ©tif',lat:36.1911,lng:5.4103,c:'#f59e0b',r:20000,s:'Moyen'},
  {n:'Annaba',lat:36.9,lng:7.7667,c:'#f59e0b',r:18000,s:'Moyen'},
  {n:'Blida',lat:36.47,lng:2.83,c:'#f59e0b',r:18000,s:'Moyen'},
  {n:'Batna',lat:35.555,lng:6.1741,c:'#22c55e',r:15000,s:'Stable'},
  {n:'Bأ©jaأ¯a',lat:36.7523,lng:5.0564,c:'#22c55e',r:14000,s:'Stable'},
  {n:'Tlemcen',lat:34.8828,lng:-1.3165,c:'#22c55e',r:14000,s:'Stable'},
  {n:'Biskra',lat:34.8498,lng:5.7277,c:'#22c55e',r:12000,s:'Stable'},
  {n:'Tamanrasset',lat:22.785,lng:5.5228,c:'#22c55e',r:10000,s:'Stable'},
  {n:'Adrar',lat:27.874,lng:-0.294,c:'#22c55e',r:10000,s:'Stable'},
  {n:'Ouargla',lat:31.949,lng:5.3241,c:'#f59e0b',r:12000,s:'Moyen'},
  {n:'Ghardaأ¯a',lat:32.49,lng:3.673,c:'#22c55e',r:11000,s:'Stable'},
  {n:'Mأ©dأ©a',lat:36.267,lng:2.753,c:'#f59e0b',r:14000,s:'Moyen'},
  {n:'Tizi Ouzou',lat:36.716,lng:4.05,c:'#22c55e',r:16000,s:'Stable'},
  {n:'Jijel',lat:36.818,lng:5.766,c:'#22c55e',r:11000,s:'Stable'},
  {n:'Skikda',lat:36.875,lng:6.907,c:'#f59e0b',r:13000,s:'Moyen'},
  {n:'Tiaret',lat:35.37,lng:1.321,c:'#22c55e',r:12000,s:'Stable'},
  {n:'Mostaganem',lat:35.931,lng:0.089,c:'#22c55e',r:12000,s:'Stable'},
  {n:'M'Sila',lat:35.705,lng:4.541,c:'#22c55e',r:11000,s:'Stable'},
  {n:'Mascara',lat:35.396,lng:0.14,c:'#22c55e',r:11000,s:'Stable'},
  {n:'Guelma',lat:36.462,lng:7.431,c:'#22c55e',r:11000,s:'Stable'},
  {n:'El Oued',lat:33.368,lng:6.867,c:'#22c55e',r:11000,s:'Stable'},
  {n:'Laghouat',lat:33.8,lng:2.866,c:'#22c55e',r:10000,s:'Stable'},
];

function mkMap(divId, zoom) {
  const m=L.map(divId,{zoomControl:false,attributionControl:false}).setView([28.03,1.66],zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(m);
  return m;
}

const m1=mkMap('sm1',4.8), m2=mkMap('sm2',4.2);
wilayas.forEach(w=>{
  const pop=`<div dir="ltr" style="font-family:Cairo;font-size:12px"><b>${w.n}</b><br>Statut: <b style="color:${w.c}">${w.s}</b></div>`;
  L.circle([w.lat,w.lng],{color:w.c,fillColor:w.c,fillOpacity:.4,radius:w.r,weight:1.5}).addTo(m1).bindPopup(pop);
  L.marker([w.lat,w.lng],{icon:L.divIcon({html:`<div style="background:${w.c};width:7px;height:7px;border-radius:50%;border:1px solid white;box-shadow:0 0 5px ${w.c}"></div>`,iconSize:[7,7],className:''})}).addTo(m1);
});
[[36.7538,3.0588,'#ef4444'],[35.6971,-0.6308,'#ef4444'],[36.365,6.6147,'#f59e0b'],[22.785,5.5228,'#22c55e'],[27.874,-0.294,'#22c55e'],[34.849,5.727,'#22c55e']].forEach(([lat,lng,c])=>{
  L.circle([lat,lng],{color:c,fillColor:c,fillOpacity:.5,radius:40000,weight:1}).addTo(m2);
});

window._mf=false;
function initMapFull(){
  window._mf=true;
  const mf=L.map('mapFull',{zoomControl:true,attributionControl:false}).setView([28.03,1.66],5.2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(mf);
  wilayas.forEach(w=>{
    const pop=`<div dir="ltr" style="font-family:Cairo;font-size:13px"><b>${w.n}</b><br>Statut: <b style="color:${w.c}">${w.s}</b></div>`;
    L.circle([w.lat,w.lng],{color:w.c,fillColor:w.c,fillOpacity:.5,radius:w.r*2.2,weight:2}).addTo(mf).bindPopup(pop);
    L.marker([w.lat,w.lng],{icon:L.divIcon({html:`<div style="background:${w.c};width:10px;height:10px;border-radius:50%;border:1.5px solid white;box-shadow:0 0 8px ${w.c}"></div>`,iconSize:[10,10],className:''})}).addTo(mf).bindPopup(pop);
  });
}
</script>
</body>
</html>