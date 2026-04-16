<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>لوحة الصحة الوطنية "طبيبي" - الجزائر</title>
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
    <h1>🏥 لوحة الصحة الوطنية "طبيبي"</h1>
    <small>وزارة الصحة الجزائرية — نظام الاستشراف الصحي الوطني</small>
  </div>
  <svg class="ecg" viewBox="0 0 300 26"><polyline points="0,13 30,13 40,3 50,23 60,13 80,13 90,2 100,24 110,13 140,13 150,6 160,20 170,13 200,13 210,3 220,23 230,13 260,13 270,8 280,18 290,13 300,13" fill="none" stroke="#1a9fd4" stroke-width="1.5"/></svg>
  <div class="hlogo">❤️</div>
</div>

<div class="tabs">
  <button class="tbtn act" onclick="st('ov',this)">📊 نظرة عامة</button>
  <button class="tbtn" onclick="st('map',this)">🗺️ الخريطة الصحية</button>
  <button class="tbtn" onclick="st('epi',this)">🔬 الوبائيات والأمراض</button>
  <button class="tbtn" onclick="st('cap',this)">🏥 الاستشفاء والطاقة</button>
  <button class="tbtn" onclick="st('res',this)">👨‍⚕️ الموارد البشرية</button>
  <button class="tbtn" onclick="st('ph',this)">💊 الأدوية والمخزون</button>
  <button class="tbtn" onclick="st('vac',this)">💉 برنامج التلقيح</button>
  <button class="tbtn" onclick="st('mc',this)">🍼 صحة الأم والطفل</button>
  <button class="tbtn" onclick="st('acc',this)">🚑 الوصول للرعاية</button>
  <button class="tbtn" onclick="st('ai',this)">🤖 التوقعات الذكية</button>
</div>

<!-- ======= TAB: OVERVIEW ======= -->
<div id="t-ov" class="tc act">
<div class="ovg">

  <!-- LEFT -->
  <div class="cf">
    <div class="pnl">
      <div class="pt">📊 الإحصائيات العامة</div>
      <div class="sr"><span class="sl">👥 إجمالي السكان</span><span class="sv b">12,5 م</span></div>
      <div class="sr"><span class="sl">💙 متوسط العمر</span><span class="sv b">76,4 سنة</span></div>
      <div class="sr"><span class="sl">📉 معدل الوفيات</span><span class="sv r">7,2 %</span></div>
      <div class="sr"><span class="sl">🍼 معدل الولادات</span><span class="sv o">18,5 %</span></div>
      <div style="margin-top:6px">
        <div class="pb-w"><div class="pb-l"><span>✅ المؤمَّنون صحياً</span><span style="color:var(--g)">68%</span></div><div class="pb"><div class="pf" style="width:68%;background:var(--g)"></div></div></div>
        <div class="pb-w"><div class="pb-l"><span>💉 نسبة التلقيح</span><span style="color:var(--a)">82%</span></div><div class="pb"><div class="pf" style="width:82%;background:var(--a)"></div></div></div>
      </div>
    </div>

    <div class="pnl g">
      <div class="pt g">🫀 إدارة الأمراض</div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--r)"></div>أمراض القلب</div><div class="pbw"><div class="pb2" style="width:70%;background:var(--r)"></div></div><span style="color:var(--r);font-size:10px">↑</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--a)"></div>السكري</div><div class="pbw"><div class="pb2" style="width:55%;background:var(--a)"></div></div><span style="color:var(--a);font-size:10px">+</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--p)"></div>السرطان</div><div class="pbw"><div class="pb2" style="width:40%;background:var(--p)"></div></div><span style="color:var(--p);font-size:10px">+</span></div>
      <div class="pr"><div class="pn"><div class="pd" style="background:var(--o)"></div>أمراض تنفسية</div><div class="pbw"><div class="pb2" style="width:35%;background:var(--o)"></div></div><span style="color:var(--o);font-size:10px">↑↑</span></div>
      <div style="margin-top:5px;font-size:10px;color:var(--t2);margin-bottom:3px">أبرز 5 أمراض</div>
      <div style="height:75px"><canvas id="c-top5"></canvas></div>
    </div>

    <div class="pnl" style="flex:1">
      <div class="pt">🗺️ الخريطة الصحية</div>
      <div id="sm2" style="height:120px;border-radius:4px;border:1px solid var(--border)"></div>
      <div class="lgr"><div class="lgd" style="background:var(--g)"></div>وصول جيد</div>
      <div class="lgr"><div class="lgd" style="background:var(--o)"></div>وصول متوسط</div>
      <div class="lgr"><div class="lgd" style="background:var(--r)"></div>وصول ضعيف</div>
      <div style="height:55px;margin-top:4px"><canvas id="c-acc"></canvas></div>
    </div>
  </div>

  <!-- CENTER -->
  <div class="cf">
    <div class="pnl">
      <div class="pt">🏥 حالة المستشفيات</div>
      <div class="kpi3">
        <div class="kb"><div class="kv">245</div><div class="kl">🏥 مستشفيات</div></div>
        <div class="kb"><div class="kv" style="color:var(--g)">520</div><div class="kl">🏢 مراكز الصحة</div></div>
        <div class="kb"><div class="kv" style="color:var(--o)">15,300</div><div class="kl">🛏️ الأسرة</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
        <span style="font-size:11px;color:var(--t2)">نسبة الإشغال</span>
        <span style="font-size:14px;font-weight:900;color:var(--o)">78%</span>
      </div>
      <div class="pb"><div class="pf" style="width:78%;background:linear-gradient(90deg,var(--a),var(--o))"></div></div>
    </div>

    <div class="pnl" style="flex:2">
      <div class="pt">🗺️ التوزيع الاستشفائي — الجزائر</div>
      <div id="sm1" style="height:225px;border-radius:4px;border:1px solid var(--border)"></div>
    </div>

    <div class="g3">
      <div class="pnl o">
        <div class="pt o">💊 استهلاك الأدوية</div>
        <div class="sr"><span class="sl">الأدوية الموزّعة</span><span class="sv o">2,3 م</span></div>
        <div class="sr"><span class="sl" style="color:var(--r)">⚠️ نفاد المخزون</span><span class="sv r">15</span></div>
        <div class="sr"><span class="sl">الإنتاج المحلي</span><span class="sv g">58%</span></div>
        <div style="height:55px;margin-top:4px"><canvas id="c-med"></canvas></div>
        <div class="mr"><span>Paracetamol</span><span class="bdg bok">مستقر</span></div>
        <div class="mr"><span>Insulin Lantus</span><span class="bdg bwn">حرج</span></div>
        <div class="mr"><span>Amoxicillin 1g</span><span class="bdg bbd">نفاد</span></div>
      </div>
      <div class="pnl g">
        <div class="pt g">👨‍⚕️ الموارد الطبية</div>
        <div class="sr"><span class="sl">أطباء</span><span class="sv b">8,200</span></div>
        <div class="sr"><span class="sl">ممرضون</span><span class="sv g">14,500</span></div>
        <div class="sr"><span class="sl">إسعاف</span><span class="sv o">850</span></div>
        <div class="pb-w" style="margin-top:5px"><div class="pb-l"><span>تكوين وتوظيف</span><span>74%</span></div><div class="pb"><div class="pf" style="width:74%;background:var(--g)"></div></div></div>
        <div class="pb-w"><div class="pb-l"><span>تجهيزات طبية</span><span>62%</span></div><div class="pb"><div class="pf" style="width:62%;background:var(--a)"></div></div></div>
        <div class="g3" style="margin-top:5px;text-align:center">
          <div><div style="font-size:12px;font-weight:700;color:var(--a)">210</div><div style="font-size:9px;color:var(--t2)">سكانير</div></div>
          <div><div style="font-size:12px;font-weight:700;color:var(--p)">120</div><div style="font-size:9px;color:var(--t2)">رنين</div></div>
          <div><div style="font-size:12px;font-weight:700;color:var(--g)">850</div><div style="font-size:9px;color:var(--t2)">مختبر</div></div>
        </div>
      </div>
      <div class="pnl p">
        <div class="pt p">🏨 السياحة الصحية</div>
        <div style="height:90px"><canvas id="c-tour"></canvas></div>
        <div class="sr" style="margin-top:3px"><span class="sl">مرضى أجانب</span><span class="sv" style="color:var(--p)">3,200</span></div>
        <div class="sr"><span class="sl">الإيرادات</span><span class="sv o">42 م$</span></div>
      </div>
    </div>

    <div class="pnl">
      <div class="pt">📈 مؤشرات الصحة العامة</div>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--a)">24,5%</div><div style="font-size:10px;color:var(--t2)">معدل السمنة</div></div>
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--o)">12,8%</div><div style="font-size:10px;color:var(--t2)">سوء تغذية الأطفال</div></div>
        <div style="text-align:center"><div style="font-size:17px;font-weight:900;color:var(--p)">17,4%</div><div style="font-size:10px;color:var(--t2)">الأمراض المزمنة</div></div>
        <div style="flex:1;min-width:100px;height:55px"><canvas id="c-ind"></canvas></div>
      </div>
    </div>
  </div>

  <!-- RIGHT -->
  <div class="cf">
    <div class="pnl r">
      <div class="pt r">🔬 المراقبة الوبائية</div>
      <div class="alb"><span class="pulse">🔴</span>تنبيهات وبائية نشطة</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:11px;color:var(--t2)">🎯 معدل الكشف</span>
        <span style="font-size:22px;font-weight:900;color:var(--g)">92%</span>
      </div>
      <div style="font-size:10px;color:var(--t2);margin-bottom:3px">مؤشر العدوى</div>
      <div style="height:65px"><canvas id="c-cont"></canvas></div>
    </div>

    <div class="g2">
      <div class="pnl r" style="padding:6px">
        <div class="pt r" style="font-size:10px">🦠 كوفيد-19</div>
        <div style="height:58px"><canvas id="c-cov"></canvas></div>
        <div style="font-size:10px;color:var(--t2);text-align:center;margin-top:2px">↓ في تراجع</div>
      </div>
      <div class="pnl o" style="padding:6px">
        <div class="pt o" style="font-size:10px">🤧 إنفلونزا موسمية</div>
        <div style="height:58px"><canvas id="c-flu"></canvas></div>
        <div style="font-size:10px;color:var(--t2);text-align:center;margin-top:2px">↑ ذروة الشتاء</div>
      </div>
    </div>

    <div class="pnl" style="flex:1">
      <div class="pt">🤖 التوقعات والتخطيط</div>
      <div style="font-size:10px;color:var(--t2);margin-bottom:2px">📊 احتياجات المستشفيات</div>
      <div style="height:55px"><canvas id="c-ph"></canvas></div>
      <div style="font-size:10px;color:var(--t2);margin:5px 0 2px">💊 توقعات الأدوية</div>
      <div style="height:55px"><canvas id="c-pm"></canvas></div>
      <div style="font-size:10px;color:var(--t2);margin:5px 0 2px">💰 ميزانية الصحة</div>
      <div style="font-size:20px;font-weight:900;color:var(--o);text-align:center;margin:3px 0">15,4 مليار دج</div>
      <div class="g2" style="text-align:center;margin-top:3px">
        <div><div style="font-size:10px;color:var(--t2)">🟡 مشاريع جارية</div><div style="font-size:14px;font-weight:700;color:var(--o)">38</div></div>
        <div><div style="font-size:10px;color:var(--t2)">🏗️ بناء جديد</div><div style="font-size:14px;font-weight:700;color:var(--a)">12</div></div>
      </div>
      <div style="display:flex;gap:4px;margin-top:8px;justify-content:center;font-size:17px">🏥🏨🏗️🏢</div>
    </div>
  </div>

</div>
</div>

<!-- ======= TAB: MAP ======= -->
<div id="t-map" class="tc">
<div class="dp">
  <div class="dtitle">🗺️ الخريطة الصحية التفاعلية — الجزائر</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">إجمالي الولايات</div><div class="big">58</div></div>
    <div class="kc g"><div class="lbl">ولايات مستقرة</div><div class="big g">38</div></div>
    <div class="kc o"><div class="lbl">خطورة متوسطة</div><div class="big o">14</div></div>
    <div class="kc r"><div class="lbl">خطورة عالية</div><div class="big r">6</div></div>
  </div>
  <div id="mapFull"></div>
  <div class="mleg">
    <div class="lgr"><div class="lgd" style="background:var(--r)"></div>خطورة عالية (الجزائر، وهران، عنابة)</div>
    <div class="lgr"><div class="lgd" style="background:var(--o)"></div>خطورة متوسطة (سطيف، قسنطينة، البليدة)</div>
    <div class="lgr"><div class="lgd" style="background:var(--g)"></div>وضع مستقر (تمنراست، أدرار، الجنوب)</div>
  </div>
</div>
</div>

<!-- ======= TAB: EPIDEMIO ======= -->
<div id="t-epi" class="tc">
<div class="dp">
  <div class="dtitle">🔬 الوبائيات والأمراض</div>
  <div class="alb"><span class="pulse">🔴</span><b>تنبيه:</b> ارتفاع متوقع 15% في حالات الربو بالولايات الشمالية الأسبوع القادم.</div>
  <div class="alb wn"><span class="pulse">🟡</span><b>تنبيه:</b> تزايد حالات الحمى المالطية في الأرياف — يُنصح بتعزيز التفتيش البيطري.</div>
  <div class="dg4">
    <div class="kc r"><div class="lbl">حالات وبائية نشطة</div><div class="big r">4,230</div></div>
    <div class="kc"><div class="lbl">معدل الكشف</div><div class="big">92%</div></div>
    <div class="kc o"><div class="lbl">حالات العزل</div><div class="big o">1,840</div></div>
    <div class="kc g"><div class="lbl">حالات شُفيت</div><div class="big g">128,400</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📈 تطور الإصابات (30 يوماً)</h4><div style="height:220px"><canvas id="d-e1"></canvas></div></div>
    <div class="cw"><h4>🦠 توزيع الأمراض حسب النوع</h4><div style="height:220px"><canvas id="d-e2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt r" style="margin-bottom:8px">🦠 جدول الأوبئة النشطة</div>
    <table class="tbl">
      <thead><tr><th>المرض</th><th>الولاية</th><th>الحالات</th><th>معدل الانتشار</th><th>الحالة</th></tr></thead>
      <tbody>
        <tr><td>إنفلونزا موسمية</td><td>الجزائر العاصمة</td><td>1,240</td><td>0.8%</td><td><span class="bdg bwn">نشط</span></td></tr>
        <tr><td>التهاب الكبد B</td><td>وهران</td><td>380</td><td>0.3%</td><td><span class="bdg bwn">مراقبة</span></td></tr>
        <tr><td>السل الرئوي</td><td>قسنطينة</td><td>210</td><td>0.2%</td><td><span class="bdg bok">مضبوط</span></td></tr>
        <tr><td>كوفيد-19</td><td>وطني</td><td>850</td><td>0.1%</td><td><span class="bdg bok">في تراجع</span></td></tr>
        <tr><td>حمى مالطية</td><td>الريف</td><td>520</td><td>0.4%</td><td><span class="bdg bbd">متصاعد</span></td></tr>
        <tr><td>التهاب السحايا</td><td>سطيف</td><td>95</td><td>0.05%</td><td><span class="bdg bwn">مراقبة</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: CAPACITY ======= -->
<div id="t-cap" class="tc">
<div class="dp">
  <div class="dtitle">🏥 الاستشفاء والطاقة الاستيعابية</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">إجمالي الأسرة</div><div class="big">40,000</div></div>
    <div class="kc o"><div class="lbl">نسبة الإشغال</div><div class="big o">78%</div></div>
    <div class="kc r"><div class="lbl">أسرة العناية المركزة</div><div class="big r">4,000</div></div>
    <div class="kc g"><div class="lbl">متوسط مدة الإقامة</div><div class="big g">4,3 أيام</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📊 نسبة إشغال الأسرة حسب الولايات</h4><div style="height:220px"><canvas id="d-c1"></canvas></div></div>
    <div class="cw"><h4>🛏️ توزيع الأسرة حسب التخصص</h4><div style="height:220px"><canvas id="d-c2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt" style="margin-bottom:8px">🏥 تفصيل المستشفيات الكبرى</div>
    <table class="tbl">
      <thead><tr><th>المستشفى</th><th>الولاية</th><th>الأسرة</th><th>الإشغال</th><th>العناية المركزة</th><th>الحالة</th></tr></thead>
      <tbody>
        <tr><td>مستشفى مصطفى باشا</td><td>الجزائر</td><td>2,200</td><td>88%</td><td>320</td><td><span class="bdg bbd">مكتظ</span></td></tr>
        <tr><td>مستشفى ابن سينا</td><td>وهران</td><td>1,800</td><td>75%</td><td>280</td><td><span class="bdg bwn">مرتفع</span></td></tr>
        <tr><td>مستشفى ابن بادي</td><td>قسنطينة</td><td>1,400</td><td>62%</td><td>210</td><td><span class="bdg bok">طبيعي</span></td></tr>
        <tr><td>مستشفى سطيف</td><td>سطيف</td><td>1,200</td><td>70%</td><td>180</td><td><span class="bdg bwn">مرتفع</span></td></tr>
        <tr><td>مستشفى باتنة</td><td>باتنة</td><td>1,000</td><td>55%</td><td>150</td><td><span class="bdg bok">طبيعي</span></td></tr>
        <tr><td>مستشفى عنابة</td><td>عنابة</td><td>900</td><td>68%</td><td>130</td><td><span class="bdg bwn">مرتفع</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: RESOURCES ======= -->
<div id="t-res" class="tc">
<div class="dp">
  <div class="dtitle">👨‍⚕️ الموارد البشرية والتجهيزات</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">أطباء عامون</div><div class="big">23,000</div></div>
    <div class="kc g"><div class="lbl">أطباء متخصصون</div><div class="big g">18,000</div></div>
    <div class="kc o"><div class="lbl">ممرضون وشبه طبيين</div><div class="big o">55,000</div></div>
    <div class="kc r"><div class="lbl">نقص في تخصصات</div><div class="big r">12</div></div>
  </div>
  <div class="dg2">
    <div class="tp">
      <div class="pt g" style="margin-bottom:8px">👨‍⚕️ توزيع الكوادر الطبية</div>
      <table class="tbl">
        <thead><tr><th>الفئة</th><th>العدد</th><th>المعيار الوطني</th><th>الفجوة</th></tr></thead>
        <tbody>
          <tr><td>أطباء عامون</td><td>23,000</td><td>25,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>أطباء متخصصون</td><td>18,000</td><td>20,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>ممرضون</td><td>55,000</td><td>50,000</td><td><span class="bdg bok">+5,000</span></td></tr>
          <tr><td>قابلات</td><td>12,000</td><td>14,000</td><td><span class="bdg bwn">-2,000</span></td></tr>
          <tr><td>صيادلة</td><td>8,500</td><td>9,000</td><td><span class="bdg bwn">-500</span></td></tr>
          <tr><td>تقنيون طبيون</td><td>30,000</td><td>28,000</td><td><span class="bdg bok">+2,000</span></td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <div class="cw" style="margin-bottom:10px"><h4>📊 توزيع الكوادر حسب الجهات</h4><div style="height:160px"><canvas id="d-r1"></canvas></div></div>
      <div class="tp">
        <div class="pt" style="margin-bottom:8px">🏗️ التجهيزات الكبرى</div>
        <ul class="il">
          <li><span>سكانير (Scanner CT)</span><span>210 جهاز</span></li>
          <li><span>رنين مغناطيسي (IRM)</span><span>120 جهاز</span></li>
          <li><span>مختبرات التحليل</span><span>850 مختبر</span></li>
          <li><span>أجهزة الغسيل الكلوي</span><span>3,200 جهاز</span></li>
          <li><span>غرف العمليات</span><span>1,400 غرفة</span></li>
          <li><span>أجهزة إشعاع علاجي</span><span>48 جهاز</span></li>
        </ul>
      </div>
    </div>
  </div>
</div>
</div>

<!-- ======= TAB: PHARMACY ======= -->
<div id="t-ph" class="tc">
<div class="dp">
  <div class="dtitle">💊 الأدوية والمخزون الاستراتيجي</div>
  <div class="alb"><span class="pulse">🔴</span><b>تنبيه عاجل:</b> نفاد مخزون Amoxicillin 1g — طلب استعجالي مرفوع.</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">الأدوية الموزعة</div><div class="big">2,3 م</div></div>
    <div class="kc g"><div class="lbl">الإنتاج المحلي</div><div class="big g">58%</div></div>
    <div class="kc r"><div class="lbl">حالات نفاد المخزون</div><div class="big r">15</div></div>
    <div class="kc o"><div class="lbl">قيمة المخزون</div><div class="big o">4,2 م دج</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📊 استهلاك الأدوية الشهري 2024</h4><div style="height:200px"><canvas id="d-p1"></canvas></div></div>
    <div class="cw"><h4>🏭 الإنتاج المحلي مقابل الاستيراد</h4><div style="height:200px"><canvas id="d-p2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt o" style="margin-bottom:8px">💊 مراقبة المخزون الاستراتيجي</div>
    <table class="tbl">
      <thead><tr><th>الدواء</th><th>المخزون الحالي</th><th>الاستهلاك الشهري</th><th>الاحتياطي</th><th>الحالة</th><th>التوقع</th></tr></thead>
      <tbody>
        <tr><td>Paracetamol 500mg</td><td>2.1 م وحدة</td><td>400 ألف</td><td>5 أشهر</td><td><span class="bdg bok">آمن</span></td><td>يكفي 5 أشهر</td></tr>
        <tr><td>Metformin 500mg</td><td>800 ألف</td><td>200 ألف</td><td>4 أشهر</td><td><span class="bdg bok">آمن</span></td><td>يكفي 4 أشهر</td></tr>
        <tr><td>Amlodipine 5mg</td><td>600 ألف</td><td>180 ألف</td><td>3.3 أشهر</td><td><span class="bdg bok">آمن</span></td><td>يكفي 3 أشهر</td></tr>
        <tr><td>Insulin Lantus</td><td>150 ألف</td><td>120 ألف</td><td>15 يوماً</td><td><span class="bdg bwn">حرج</span></td><td>طلب عاجل</td></tr>
        <tr><td>Omeprazole 20mg</td><td>90 ألف</td><td>150 ألف</td><td>18 يوماً</td><td><span class="bdg bwn">حرج</span></td><td>طلب عاجل</td></tr>
        <tr><td>Amoxicillin 1g</td><td>5 آلاف</td><td>90 ألف</td><td>يومان</td><td><span class="bdg bbd">نفاد</span></td><td>استعجالي</td></tr>
        <tr><td>Salbutamol inhaler</td><td>12 ألف</td><td>80 ألف</td><td>5 أيام</td><td><span class="bdg bbd">نفاد قريباً</span></td><td>استيراد عاجل</td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: VACCINES ======= -->
<div id="t-vac" class="tc">
<div class="dp">
  <div class="dtitle">💉 البرنامج الوطني للتلقيح</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">إجمالي الجرعات الممنوحة</div><div class="big g">28 م</div></div>
    <div class="kc"><div class="lbl">نسبة التلقيح الوطنية</div><div class="big">82%</div></div>
    <div class="kc o"><div class="lbl">جرعات هذا الشهر</div><div class="big o">420 ألف</div></div>
    <div class="kc r"><div class="lbl">ولايات بنسبة أقل 70%</div><div class="big r">8</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📈 تطور التلقيح خلال 2024</h4><div style="height:200px"><canvas id="d-v1"></canvas></div></div>
    <div class="cw"><h4>💉 نسبة التغطية حسب نوع اللقاح</h4><div style="height:200px"><canvas id="d-v2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt g" style="margin-bottom:8px">💉 التلقيحات الإلزامية — نسب التغطية</div>
    <table class="tbl">
      <thead><tr><th>اللقاح</th><th>الفئة المستهدفة</th><th>نسبة التغطية</th><th>الهدف</th><th>الحالة</th></tr></thead>
      <tbody>
        <tr><td>BCG (السل)</td><td>المواليد</td><td>95%</td><td>95%</td><td><span class="bdg bok">محقق ✅</span></td></tr>
        <tr><td>DTP (الدفتيريا)</td><td>الأطفال 0-5 سنة</td><td>88%</td><td>90%</td><td><span class="bdg bwn">قريب</span></td></tr>
        <tr><td>ROR (الحصبة)</td><td>الأطفال</td><td>85%</td><td>95%</td><td><span class="bdg bwn">ناقص</span></td></tr>
        <tr><td>إنفلونزا موسمية</td><td>60 سنة فأكثر</td><td>72%</td><td>80%</td><td><span class="bdg bwn">ناقص</span></td></tr>
        <tr><td>كوفيد-19</td><td>البالغون</td><td>78%</td><td>70%</td><td><span class="bdg bok">محقق ✅</span></td></tr>
        <tr><td>الكزاز</td><td>النساء الحوامل</td><td>90%</td><td>90%</td><td><span class="bdg bok">محقق ✅</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: MOTHER ======= -->
<div id="t-mc" class="tc">
<div class="dp">
  <div class="dtitle">🍼 صحة الأم والطفل</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">الولادات المشرف عليها</div><div class="big g">94%</div></div>
    <div class="kc"><div class="lbl">وفيات الأمهات / 100 ألف</div><div class="big">72</div></div>
    <div class="kc o"><div class="lbl">وفيات الرضع / 1000</div><div class="big o">18,4</div></div>
    <div class="kc r"><div class="lbl">سوء تغذية الأطفال</div><div class="big r">12,8%</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📈 وفيات الأمهات والرضع (2019-2024)</h4><div style="height:200px"><canvas id="d-m1"></canvas></div></div>
    <div class="cw"><h4>🤱 معدلات الرضاعة الطبيعية والرعاية قبل الولادة</h4><div style="height:200px"><canvas id="d-m2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt g" style="margin-bottom:8px">🍼 المؤشرات حسب الفئة العمرية للأطفال</div>
    <table class="tbl">
      <thead><tr><th>الفئة العمرية</th><th>التطعيم</th><th>الرضاعة الطبيعية</th><th>الوزن الطبيعي</th><th>التقييم</th></tr></thead>
      <tbody>
        <tr><td>0 - 6 أشهر</td><td>95%</td><td>68%</td><td>92%</td><td><span class="bdg bok">ممتاز</span></td></tr>
        <tr><td>6 أشهر - سنة</td><td>90%</td><td>42%</td><td>88%</td><td><span class="bdg bok">جيد</span></td></tr>
        <tr><td>1 - 3 سنوات</td><td>87%</td><td>—</td><td>84%</td><td><span class="bdg bwn">متوسط</span></td></tr>
        <tr><td>3 - 6 سنوات</td><td>82%</td><td>—</td><td>80%</td><td><span class="bdg bwn">متوسط</span></td></tr>
        <tr><td>6 - 12 سنة</td><td>78%</td><td>—</td><td>76%</td><td><span class="bdg bwn">متوسط</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ======= TAB: ACCESS ======= -->
<div id="t-acc" class="tc">
<div class="dp">
  <div class="dtitle">🚑 الوصول للرعاية الصحية والعدالة</div>
  <div class="dg4">
    <div class="kc g"><div class="lbl">سكان بوصول جيد</div><div class="big g">68%</div></div>
    <div class="kc o"><div class="lbl">سكان بوصول متوسط</div><div class="big o">22%</div></div>
    <div class="kc r"><div class="lbl">سكان بوصول ضعيف</div><div class="big r">10%</div></div>
    <div class="kc"><div class="lbl">متوسط المسافة لأقرب مرفق</div><div class="big">14 كم</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>🗺️ الوصول للرعاية حسب الجهات</h4><div style="height:200px"><canvas id="d-a1"></canvas></div></div>
    <div class="cw"><h4>📊 التفاوت في الخدمات بين الولايات</h4><div style="height:200px"><canvas id="d-a2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt" style="margin-bottom:8px">🚑 الخدمات الطارئة والنقل الصحي</div>
    <ul class="il">
      <li><span>عدد سيارات الإسعاف</span><span>850 سيارة</span></li>
      <li><span>متوسط زمن الاستجابة (حضري)</span><span>8 دقائق</span></li>
      <li><span>متوسط زمن الاستجابة (ريفي)</span><span>28 دقيقة</span></li>
      <li><span>المراكز في المناطق النائية</span><span>124 مركز</span></li>
      <li><span>مروحيات الإسعاف</span><span>12 مروحية</span></li>
      <li><span>وحدات طبية متنقلة</span><span>320 وحدة</span></li>
    </ul>
  </div>
</div>
</div>

<!-- ======= TAB: AI ======= -->
<div id="t-ai" class="tc">
<div class="dp">
  <div class="dtitle">🤖 التوقعات الذكية بالذكاء الاصطناعي</div>
  <div class="alb wn"><span>🤖</span><b>تنبيه الذكاء الاصطناعي:</b> ارتفاع متوقع 15% في حالات الربو شمالاً الأسبوع القادم.</div>
  <div class="alb ok"><span>🤖</span><b>توقع إيجابي:</b> انخفاض متوقع 8% في حالات كوفيد-19 خلال مارس 2025.</div>
  <div class="dg4">
    <div class="kc"><div class="lbl">دقة النموذج التنبؤي</div><div class="big">94,2%</div></div>
    <div class="kc g"><div class="lbl">تنبيهات مُعالجة</div><div class="big g">1,248</div></div>
    <div class="kc o"><div class="lbl">توقع الأسبوع القادم</div><div class="big o">+12%</div></div>
    <div class="kc r"><div class="lbl">خطر وباء محتمل</div><div class="big r">منخفض</div></div>
  </div>
  <div class="dg2">
    <div class="cw"><h4>📈 التنبؤ بانتشار الأوبئة — 6 أشهر قادمة</h4><div style="height:200px"><canvas id="d-ai1"></canvas></div></div>
    <div class="cw"><h4>💊 التنبؤ باحتياجات الأدوية</h4><div style="height:200px"><canvas id="d-ai2"></canvas></div></div>
  </div>
  <div class="tp">
    <div class="pt p" style="margin-bottom:8px">🤖 التوصيات الذكية العاجلة</div>
    <table class="tbl">
      <thead><tr><th>التوصية</th><th>الأولوية</th><th>الجهة المعنية</th><th>الموعد</th></tr></thead>
      <tbody>
        <tr><td>تعزيز مخزون Salbutamol في الشمال</td><td><span class="bdg bbd">عاجل</span></td><td>إدارة الأدوية</td><td>3 أيام</td></tr>
        <tr><td>رفع طاقة مستشفى مصطفى باشا</td><td><span class="bdg bwn">مرتفعة</span></td><td>مديرية الجزائر</td><td>أسبوع</td></tr>
        <tr><td>حملة تلقيح ضد الحصبة في 8 ولايات</td><td><span class="bdg bwn">مرتفعة</span></td><td>المديريات المعنية</td><td>أسبوعان</td></tr>
        <tr><td>تعزيز الرقابة البيطرية في الريف</td><td><span class="bdg bok">متوسطة</span></td><td>وزارة الفلاحة</td><td>شهر</td></tr>
        <tr><td>توظيف 500 طبيب عام جديد</td><td><span class="bdg bok">متوسطة</span></td><td>إدارة الموارد البشرية</td><td>3 أشهر</td></tr>
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
B_('c-top5',['قلب','سكري','سرطان','تنفس','كلى'],[70,55,40,35,25],['#ef4444','#1a9fd4','#8b5cf6','#f59e0b','#22c55e']);
B_('c-acc',['شمال','وسط','جنوب','شرق','غرب'],[85,72,45,68,79],['#22c55e','#22c55e','#ef4444','#f59e0b','#22c55e']);
L_('c-cont',Array.from({length:12},(_,i)=>i),[3,5,4,7,6,9,8,11,7,5,8,10],'#ef4444',true);
L_('c-cov',Array.from({length:10},(_,i)=>i),[800,620,480,520,400,350,410,380,290,250],'#ef4444',true);
L_('c-flu',Array.from({length:10},(_,i)=>i),[200,350,600,900,1200,950,700,500,300,200],'#f59e0b',true);
B_('c-med',['يناير','فبراير','مارس','أبريل','مايو','يونيو'],[400,450,380,500,420,460],'#f59e0b');
L_('c-tour',['ي','ف','م','أ','م','ج','ج','أ','س','أ','ن','د'],[80,95,110,130,150,140,160,155,130,120,100,90],'#8b5cf6',true);
B_('c-ph',['أكت','نوف','ديس','جانف','فيف','مارس'],[280,310,350,320,290,270],['#1a9fd4','#1a9fd4','#ef4444','#f59e0b','#1a9fd4','#22c55e']);
L_('c-pm',['أكت','نوف','ديس','جانف','فيف','مارس'],[8000,9500,12000,15000,11000,8000],'#22c55e',true);
B_('c-ind',['سمنة','سوء تغذية','مزمنة','أمومة','رضع'],[24.5,12.8,17.4,8.2,5.3],['#ef4444','#f59e0b','#8b5cf6','#1a9fd4','#22c55e']);

// DETAIL CHARTS
L_('d-e1',['1','5','10','15','20','25','30'],[3200,3400,3800,3600,4100,4000,4230],'#ef4444',true);
D_('d-e2',['إنفلونزا','كوفيد','السل','كبد B','مالطية','أخرى'],[35,20,15,12,10,8],['#ef4444','#f59e0b','#8b5cf6','#1a9fd4','#22c55e','#94a3b8']);
B_('d-c1',['الجزائر','وهران','قسنطينة','سطيف','باتنة','عنابة'],[88,75,62,70,55,68],['#ef4444','#f59e0b','#22c55e','#f59e0b','#22c55e','#f59e0b'],true);
D_('d-c2',['طب عام','جراحة','قلبية','أطفال','نساء','أخرى'],[30,20,15,12,10,13],['#1a9fd4','#ef4444','#8b5cf6','#22c55e','#f59e0b','#94a3b8']);
B_('d-r1',['شمال','وسط','شرق','غرب','جنوب'],[45,25,15,10,5],['#1a9fd4','#22c55e','#f59e0b','#8b5cf6','#ef4444'],true);
L_('d-p1',['يناير','مارس','مايو','يوليو','سبتمبر','نوفمبر'],[350,390,420,440,420,480],'#f59e0b',true);
D_('d-p2',['إنتاج محلي','استيراد'],[58,42],['#22c55e','#1a9fd4']);
L_('d-v1',['يناير','مارس','مايو','يوليو','سبتمبر','نوفمبر'],[380,420,460,500,520,540],'#22c55e',true);
D_('d-v2',['BCG','DTP','ROR','إنفلونزا','كوفيد','كزاز'],[95,88,85,72,78,90],['#22c55e','#1a9fd4','#f59e0b','#8b5cf6','#ef4444','#f59e0b']);
L_('d-m1',['2019','2020','2021','2022','2023','2024'],[95,90,82,78,75,72],'#ef4444');
LL_('d-m2',[{label:'رعاية ما قبل الولادة',data:[80,83,86,89,91,94],backgroundColor:'#1a9fd4',borderRadius:3,type:'bar'},{label:'إرضاع طبيعي',data:[55,58,60,63,66,68],backgroundColor:'#22c55e',borderRadius:3,type:'bar'}]);
D_('d-a1',['جيد','متوسط','ضعيف'],[68,22,10],['#22c55e','#f59e0b','#ef4444']);
B_('d-a2',['الجزائر','وهران','سطيف','باتنة','تمنراست','أدرار'],[92,85,78,72,48,44],['#22c55e','#22c55e','#f59e0b','#f59e0b','#ef4444','#ef4444'],true);
L_('d-ai1',['أكت','نوف','ديس','جانف','فيف','مارس'],[5000,8500,12000,15000,11000,6000],'#f59e0b');
B_('d-ai2',['مضادات','أنسولين','قلبية','مسكّنات','ربو'],[800,600,400,700,350],['#1a9fd4','#22c55e','#ef4444','#f59e0b','#8b5cf6']);

// ======= MAPS =======
const wilayas=[
  {n:'الجزائر',lat:36.7538,lng:3.0588,c:'#ef4444',r:35000,s:'حرج'},
  {n:'وهران',lat:35.6971,lng:-0.6308,c:'#ef4444',r:28000,s:'مرتفع'},
  {n:'قسنطينة',lat:36.365,lng:6.6147,c:'#f59e0b',r:22000,s:'متوسط'},
  {n:'سطيف',lat:36.1911,lng:5.4103,c:'#f59e0b',r:20000,s:'متوسط'},
  {n:'عنابة',lat:36.9,lng:7.7667,c:'#f59e0b',r:18000,s:'متوسط'},
  {n:'البليدة',lat:36.47,lng:2.83,c:'#f59e0b',r:18000,s:'متوسط'},
  {n:'باتنة',lat:35.555,lng:6.1741,c:'#22c55e',r:15000,s:'مستقر'},
  {n:'بجاية',lat:36.7523,lng:5.0564,c:'#22c55e',r:14000,s:'مستقر'},
  {n:'تلمسان',lat:34.8828,lng:-1.3165,c:'#22c55e',r:14000,s:'مستقر'},
  {n:'بسكرة',lat:34.8498,lng:5.7277,c:'#22c55e',r:12000,s:'مستقر'},
  {n:'تمنراست',lat:22.785,lng:5.5228,c:'#22c55e',r:10000,s:'مستقر'},
  {n:'أدرار',lat:27.874,lng:-0.294,c:'#22c55e',r:10000,s:'مستقر'},
  {n:'ورقلة',lat:31.949,lng:5.3241,c:'#f59e0b',r:12000,s:'متوسط'},
  {n:'غرداية',lat:32.49,lng:3.673,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'المدية',lat:36.267,lng:2.753,c:'#f59e0b',r:14000,s:'متوسط'},
  {n:'تيزي وزو',lat:36.716,lng:4.05,c:'#22c55e',r:16000,s:'مستقر'},
  {n:'جيجل',lat:36.818,lng:5.766,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'سكيكدة',lat:36.875,lng:6.907,c:'#f59e0b',r:13000,s:'متوسط'},
  {n:'تيارت',lat:35.37,lng:1.321,c:'#22c55e',r:12000,s:'مستقر'},
  {n:'مستغانم',lat:35.931,lng:0.089,c:'#22c55e',r:12000,s:'مستقر'},
  {n:'المسيلة',lat:35.705,lng:4.541,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'معسكر',lat:35.396,lng:0.14,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'قالمة',lat:36.462,lng:7.431,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'الوادي',lat:33.368,lng:6.867,c:'#22c55e',r:11000,s:'مستقر'},
  {n:'الأغواط',lat:33.8,lng:2.866,c:'#22c55e',r:10000,s:'مستقر'},
];

function mkMap(divId, zoom) {
  const m=L.map(divId,{zoomControl:false,attributionControl:false}).setView([28.03,1.66],zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(m);
  return m;
}

const m1=mkMap('sm1',4.8), m2=mkMap('sm2',4.2);
wilayas.forEach(w=>{
  const pop=`<div dir="rtl" style="font-family:Cairo;font-size:12px"><b>${w.n}</b><br>الحالة: <b style="color:${w.c}">${w.s}</b></div>`;
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
    const pop=`<div dir="rtl" style="font-family:Cairo;font-size:13px"><b>${w.n}</b><br>الحالة: <b style="color:${w.c}">${w.s}</b></div>`;
    L.circle([w.lat,w.lng],{color:w.c,fillColor:w.c,fillOpacity:.5,radius:w.r*2.2,weight:2}).addTo(mf).bindPopup(pop);
    L.marker([w.lat,w.lng],{icon:L.divIcon({html:`<div style="background:${w.c};width:10px;height:10px;border-radius:50%;border:1.5px solid white;box-shadow:0 0 8px ${w.c}"></div>`,iconSize:[10,10],className:''})}).addTo(mf).bindPopup(pop);
  });
}
</script>
</body>
</html>