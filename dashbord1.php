<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام الرصد الصحي الوطني | وزارة الصحة</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --sidebar-bg: #1e272e; --main-bg: #f8f9fa; --accent-color: #0fbcf9; }
        body { background-color: var(--main-bg); font-family: 'Segoe UI', Tahoma, sans-serif; overflow-x: hidden; }
        
        /* Sidebar */
        .sidebar { height: 100vh; background: var(--sidebar-bg); color: white; position: fixed; right: 0; width: 280px; padding-top: 10px; overflow-y: auto; z-index: 1000; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
        .sidebar-brand { padding: 20px; text-align: center; border-bottom: 1px solid #34495e; margin-bottom: 10px; }
        .nav-link { color: #d2dae2; padding: 12px 25px; transition: 0.3s; font-size: 0.85rem; border-right: 4px solid transparent; cursor: pointer; display: flex; align-items: center; }
        .nav-link i { margin-left: 12px; width: 20px; font-size: 1.1rem; }
        .nav-link:hover, .nav-link.active { background: #2f3542; color: var(--accent-color); border-right-color: var(--accent-color); }

        /* Main Content */
        .main-content { margin-right: 280px; padding: 30px; }
        .card { border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 25px; background: white; }
        .section-header { border-bottom: 2px solid var(--accent-color); padding-bottom: 10px; margin-bottom: 25px; font-weight: bold; color: #2c3e50; }
        
        .kpi-box { padding: 20px; border-radius: 12px; color: white; position: relative; overflow: hidden; }
        .kpi-box i { position: absolute; left: 10px; bottom: 10px; font-size: 3rem; opacity: 0.2; }
        
        .table-custom { font-size: 0.85rem; }
        .badge-status { font-size: 0.7rem; padding: 5px 10px; }
        
        section { display: none; animation: fadeIn 0.5s; }
        section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .alert-pulse { background: #ff4757; color: white; padding: 8px 20px; border-radius: 50px; font-size: 0.8rem; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 71, 87, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); } }
    </style>
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
    <div class="sidebar-brand">
        <i class="fas fa-microscope fa-3x text-info"></i>
        <h5 class="mt-3 fw-bold text-white">وزارة الصحة</h5>
        <p class="small text-muted">المنصة الوطنية للبيانات</p>
    </div>
    <div class="nav flex-column mt-2">
        <a class="nav-link active" onclick="showSection('sec-1')"><i class="fas fa-chart-line"></i> 1. الإحصائيات الوبائية</a>
        <a class="nav-link" onclick="showSection('sec-2')"><i class="fas fa-map-marked-alt"></i> 2. خريطة الانتشار</a>
        <a class="nav-link" onclick="showSection('sec-3')"><i class="fas fa-history"></i> 3. التطور عبر الزمن</a>
        <a class="nav-link" onclick="showSection('sec-4')"><i class="fas fa-users-cog"></i> 4. التحليل الديموغرافي</a>
        <a class="nav-link" onclick="showSection('sec-5')"><i class="fas fa-skull"></i> 5. مؤشرات الوفيات</a>
        <a class="nav-link" onclick="showSection('sec-6')"><i class="fas fa-vial"></i> 6. مؤشرات الإصابة</a>
        <a class="nav-link" onclick="showSection('sec-7')"><i class="fas fa-heartbeat"></i> 7. الأمراض المزمنة</a>
        <a class="nav-link" onclick="showSection('sec-8')"><i class="fas fa-biohazard"></i> 8. الأمراض المعدية</a>
        <a class="nav-link" onclick="showSection('sec-9')"><i class="fas fa-procedures"></i> 9. بيانات الاستشفاء</a>
        <a class="nav-link" onclick="showSection('sec-10')"><i class="fas fa-hospital"></i> 10. قدرة النظام الصحي</a>
        <a class="nav-link" onclick="showSection('sec-11')"><i class="fas fa-hand-holding-medical"></i> 11. الخدمات الصحية</a>
        <a class="nav-link" onclick="showSection('sec-12')"><i class="fas fa-syringe"></i> 12. مؤشرات اللقاحات</a>
        <a class="nav-link" onclick="showSection('sec-13')"><i class="fas fa-bell"></i> 13. اكتشاف الأوبئة</a>
        <a class="nav-link" onclick="showSection('sec-14')"><i class="fas fa-project-diagram"></i> 14. مؤشرات متقدمة (R0)</a>
        <a class="nav-link" onclick="showSection('sec-15')"><i class="fas fa-leaf"></i> 15. البيئة والصحة</a>
    </div>
</div>

<!-- Main Content -->
<div class="main-content">
    
    <header class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0" id="current-title">الإحصائيات الوبائية (Epidemiological Overview)</h2>
            <p class="text-muted">نظام المراقبة والإنذار المبكر - الجمهورية الجزائرية</p>
        </div>
        <div class="alert-pulse">
            <i class="fas fa-radiation"></i> تحذير: رصد زيادة غير نمطية في ولاية قسنطينة
        </div>
    </header>

    <!-- SECTION 1: EPIDEMIOLOGICAL OVERVIEW -->
    <section id="sec-1" class="active">
        <div class="card p-4">
            <h5 class="fw-bold mb-3">قائمة أكثر 20 مرضاً انتشاراً (تراكمي)</h5>
            <div class="table-responsive">
                <table class="table table-hover table-custom">
                    <thead class="table-dark">
                        <tr>
                            <th>المرض</th>
                            <th>ICD-10</th>
                            <th>حالات يومية</th>
                            <th>العدد الكلي</th>
                            <th>النسبة %</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $diseases = [
                            ["الأنفلونزا الموسمية", "J11", 120, "250,000", "22%", "مستقر"],
                            ["السكري (Type 2)", "E11", 85, "1,400,000", "15%", "متصاعد"],
                            ["ارتفاع ضغط الدم", "I10", 110, "2,100,000", "18%", "متصاعد"],
                            ["الربو الشعبي", "J45", 45, "600,000", "8%", "مستقر"],
                            ["السل الرئوي", "A15", 12, "18,000", "2%", "منخفض"],
                        ];
                        foreach($diseases as $d): ?>
                        <tr>
                            <td><strong><?php echo $d[0]; ?></strong></td>
                            <td><code><?php echo $d[1]; ?></code></td>
                            <td><?php echo $d[2]; ?></td>
                            <td><?php echo $d[3]; ?></td>
                            <td><?php echo $d[4]; ?></td>
                            <td><span class="badge <?php echo $d[5] == 'متصاعد' ? 'bg-danger' : 'bg-success'; ?>"><?php echo $d[5]; ?></span></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- SECTION 2: DISEASE MAPPING -->
    <section id="sec-2">
        <div class="row g-3">
            <div class="col-md-8">
                <div class="card p-4">
                    <h5>توزيع الكثافة حسب الولايات (Heatmap)</h5>
                    <div style="height: 300px; background: #e9ecef; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-map-marked-alt fa-5x text-muted"></i>
                        <p class="ms-3">خريطة الجزائر التفاعلية (SVG Map Simulation)</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4">
                    <h5>الولايات الأكثر تأثراً</h5>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between"><span>الجزائر العاصمة</span><span class="text-danger">عالي جداً</span></li>
                        <li class="list-group-item d-flex justify-content-between"><span>وهران</span><span class="text-danger">عالي</span></li>
                        <li class="list-group-item d-flex justify-content-between"><span>سطيف</span><span class="text-warning">متوسط</span></li>
                        <li class="list-group-item d-flex justify-content-between"><span>ورقلة</span><span class="text-success">منخفض</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 3: TIME TREND -->
    <section id="sec-3">
        <div class="card p-4">
            <h5>تطور الموجات الوبائية (Time Series Analysis)</h5>
            <canvas id="trendChart" height="100"></canvas>
        </div>
    </section>

    <!-- SECTION 4: DEMOGRAPHICS -->
    <section id="sec-4">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card p-4">
                    <h5>التوزيع حسب الفئات العمرية</h5>
                    <canvas id="ageChart"></canvas>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card p-4">
                    <h5>التوزيع حسب الجنس (Gender Ratio)</h5>
                    <canvas id="genderChart"></canvas>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 5: MORTALITY -->
    <section id="sec-5">
        <div class="row g-4">
            <div class="col-md-3">
                <div class="kpi-box bg-dark shadow">
                    <small>معدل الوفيات العام</small>
                    <h3>4.2%</h3>
                    <i class="fas fa-cross"></i>
                </div>
            </div>
            <div class="col-md-9">
                <div class="card p-4">
                    <h5>مؤشر فتك الحالات (Case Fatality Rate - CFR)</h5>
                    <table class="table table-sm">
                        <thead><tr><th>المرض</th><th>نسبة الوفيات</th><th>الوفيات المسجلة</th></tr></thead>
                        <tbody>
                            <tr><td>أمراض القلب</td><td>12.5%</td><td>4,500</td></tr>
                            <tr><td>السرطانات</td><td>18.2%</td><td>6,100</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 7: CHRONIC DISEASES -->
    <section id="sec-7">
        <div class="row g-3">
            <div class="col-md-4"><div class="card p-4 bg-primary text-white"><h6>مرضى السكري</h6><h3>1.4M</h3></div></div>
            <div class="col-md-4"><div class="card p-4 bg-success text-white"><h6>مرضى الكلى</h6><h3>24K</h3></div></div>
            <div class="col-md-4"><div class="card p-4 bg-warning text-dark"><h6>مرضى السمنة</h6><h3>32%</h3></div></div>
        </div>
    </section>

    <!-- SECTION 10: HEALTH SYSTEM CAPACITY -->
    <section id="sec-10">
        <div class="card p-4">
            <h5>قدرات الموارد البشرية واللوجستية</h5>
            <div class="row text-center mt-3">
                <div class="col-md-3"><h5>1.8</h5><p class="small">طبيب/1000 نسمة</p></div>
                <div class="col-md-3"><h5>3.2</h5><p class="small">ممرض/1000 نسمة</p></div>
                <div class="col-md-3"><h5>14,000</h5><p class="small">سيارة إسعاف</p></div>
                <div class="col-md-3"><h5>75%</h5><p class="small">نسبة إشغال الأسرة</p></div>
            </div>
        </div>
    </section>

    <!-- SECTION 12: VACCINES -->
    <section id="sec-12">
        <div class="card p-4">
            <h5>تغطية برامج التطعيم الوطنية</h5>
            <div class="progress mt-3" style="height: 30px;">
                <div class="progress-bar bg-success" style="width: 92%">شلل الأطفال (92%)</div>
            </div>
            <div class="progress mt-3" style="height: 30px;">
                <div class="progress-bar bg-info" style="width: 88%">الحصبة (88%)</div>
            </div>
            <div class="progress mt-3" style="height: 30px;">
                <div class="progress-bar bg-warning" style="width: 75%">الأنفلونزا (75%)</div>
            </div>
        </div>
    </section>

    <!-- SECTION 13: OUTBREAK DETECTION -->
    <section id="sec-13">
        <div class="card p-4 border-danger border-2">
            <h5 class="text-danger fw-bold"><i class="fas fa-biohazard"></i> سجل التنبيهات الوبائية النشطة</h5>
            <div class="list-group mt-3">
                <div class="list-group-item list-group-item-danger">تنبيه: ارتفاع مفاجئ في حالات التسمم الغذائي - ولاية سطيف</div>
                <div class="list-group-item list-group-item-warning">اشتباه: ظهور سلالة جديدة من الأنفلونزا في المناطق الحدودية</div>
            </div>
        </div>
    </section>

    <!-- SECTION 14: ADVANCED (R0) -->
    <section id="sec-14">
        <div class="card p-4">
            <h5>مؤشر انتشار العدوى (R0 - Basic Reproduction Number)</h5>
            <div class="text-center mt-4">
                <h1 class="display-1 fw-bold text-danger">1.25</h1>
                <p>القيمة الحالية (أي شخص مصاب ينقل العدوى لـ 1.25 شخص)</p>
                <div class="badge bg-danger p-3">الوضع: انتشار نشط</div>
            </div>
        </div>
    </section>

    <!-- باقي الأقسام سيتم تفعيلها بنفس الطريقة -->

</div>

<script>
    // وظيفة التنقل بين الأقسام
    function showSection(id) {
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        document.getElementById(id).classList.add('active');
        event.currentTarget.classList.add('active');
        
        document.getElementById('current-title').innerText = event.currentTarget.innerText;
    }

    // Chart 3: Time Trend
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: ['أسبوع 1', 'أسبوع 2', 'أسبوع 3', 'أسبوع 4', 'أسبوع 5'],
            datasets: [{
                label: 'الحالات النشطة',
                data: [4500, 5200, 6100, 5800, 7200],
                borderColor: '#0fbcf9',
                backgroundColor: 'rgba(15, 188, 249, 0.1)',
                fill: true
            }]
        }
    });

    // Chart 4: Age
    new Chart(document.getElementById('ageChart'), {
        type: 'bar',
        data: {
            labels: ['0-5', '6-18', '19-40', '40-60', '60+'],
            datasets: [{
                label: 'عدد الحالات',
                data: [1200, 3400, 8900, 5600, 2100],
                backgroundColor: '#ffa801'
            }]
        }
    });

    // Chart 4: Gender
    new Chart(document.getElementById('genderChart'), {
        type: 'pie',
        data: {
            labels: ['ذكور', 'إناث'],
            datasets: [{
                data: [52, 48],
                backgroundColor: ['#0984e3', '#fd79a8']
            }]
        }
    });
</script>

</body>
</html>