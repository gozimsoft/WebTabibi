<?php
// بيانات افتراضية للمحاكاة
$stats = [
    "hospital_occupancy" => 68,
    "r0" => 1.12,
    "icu_beds" => "2,450 / 4,000",
    "total_vaccines" => "28.5M",
    "mortality_rate" => 2.4
];
?>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم الصحية الوطنية | وزارة الصحة</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --sidebar-bg: #1e272e; --main-bg: #f4f7f6; --accent: #05c46b; }
        body { background-color: var(--main-bg); font-family: 'Segoe UI', Tahoma, sans-serif; }
        
        /* Sidebar Styles */
        .sidebar { height: 100vh; background: var(--sidebar-bg); color: white; position: fixed; right: 0; width: 260px; padding-top: 20px; overflow-y: auto; z-index: 1000; }
        .sidebar-brand { padding: 10px 20px; border-bottom: 1px solid #3d3d3d; margin-bottom: 20px; text-align: center; }
        .nav-link { color: #d2dae2; padding: 12px 20px; border-radius: 0; transition: 0.3s; font-size: 0.9rem; border-right: 4px solid transparent; cursor: pointer; }
        .nav-link:hover, .nav-link.active { background: #3d464d; color: white; border-right-color: var(--accent); }
        .nav-link i { margin-left: 10px; width: 20px; }

        /* Content Styles */
        .main-content { margin-right: 260px; padding: 30px; transition: 0.3s; }
        .card { border: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 25px; }
        .kpi-card { background: white; padding: 20px; border-right: 5px solid var(--accent); }
        .kpi-card h3 { font-weight: bold; margin-top: 10px; }
        
        .alert-header { background: #ff3f34; color: white; padding: 10px 25px; border-radius: 50px; animation: blink 2s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }

        section { display: none; }
        section.active { display: block; }
    </style>
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
    <div class="sidebar-brand">
        <i class="fas fa-hospital-user fa-3x text-info"></i>
        <h5 class="mt-2">وزارة الصحة</h5>
        <small class="text-muted">نظام المراقبة الوبائية</small>
    </div>
    <div class="nav flex-column p-2">
        <a class="nav-link active" onclick="showSection('overview')"><i class="fas fa-th-large"></i> الملخص الوبائي العام</a>
        <a class="nav-link" onclick="showSection('mapping')"><i class="fas fa-map-marked-alt"></i> خريطة انتشار الأمراض</a>
        <a class="nav-link" onclick="showSection('trends')"><i class="fas fa-chart-line"></i> تحليل التطور الزمني</a>
        <a class="nav-link" onclick="showSection('demographics')"><i class="fas fa-users"></i> التحليل الديموغرافي</a>
        <a class="nav-link" onclick="showSection('mortality')"><i class="fas fa-skull-crossbones"></i> مؤشرات الوفيات</a>
        <a class="nav-link" onclick="showSection('chronic')"><i class="fas fa-heartbeat"></i> الأمراض المزمنة</a>
        <a class="nav-link" onclick="showSection('infectious')"><i class="fas fa-biohazard"></i> الأمراض المعدية</a>
        <a class="nav-link" onclick="showSection('capacity')"><i class="fas fa-bed"></i> قدرة النظام الصحي</a>
        <a class="nav-link" onclick="showSection('hospitalization')"><i class="fas fa-procedures"></i> بيانات الاستشفاء</a>
        <a class="nav-link" onclick="showSection('vaccines')"><i class="fas fa-syringe"></i> مؤشرات اللقاحات</a>
        <a class="nav-link" onclick="showSection('outbreak')"><i class="fas fa-bullhorn text-danger"></i> اكتشاف الأوبئة</a>
    </div>
</div>

<!-- Main Content -->
<div class="main-content">
    
    <!-- Header Area -->
    <header class="d-flex justify-content-between align-items-center mb-5">
        <div>
            <h2 class="fw-bold" id="section-title">الملخص الوبائي العام</h2>
            <p class="text-muted">البيانات المحدثة لليوم: <?php echo date('d/m/Y'); ?></p>
        </div>
        <div class="alert-header">
            <i class="fas fa-exclamation-triangle"></i> تنبيه: ارتفاع حالات الحصبة (ولاية ورقلة)
        </div>
    </header>

    <!-- SECTION 1: OVERVIEW -->
    <section id="overview" class="active">
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="card kpi-card">
                    <small class="text-muted">معدل الانتشار R0</small>
                    <h3 class="text-danger"><?php echo $stats['r0']; ?></h3>
                    <small><i class="fas fa-arrow-up"></i> 0.05% منذ الأسبوع الماضي</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card" style="border-right-color: #38ada9;">
                    <small class="text-muted">إشغال أسرة الإنعاش</small>
                    <h3><?php echo $stats['icu_beds']; ?></h3>
                    <div class="progress mt-2" style="height: 5px;"><div class="progress-bar bg-success" style="width: 61%"></div></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card" style="border-right-color: #f6b93b;">
                    <small class="text-muted">معدل الحدوث (Incidence)</small>
                    <h3>340/100K</h3>
                    <small>حالات جديدة لكل مائة ألف</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card" style="border-right-color: #079992;">
                    <small class="text-muted">تغطية اللقاحات</small>
                    <h3>92.4%</h3>
                    <small>النسبة الوطنية الشاملة</small>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card p-4">
                    <h5 class="fw-bold">أكثر 10 أمراض انتشاراً (حسب الحالات الكلية)</h5>
                    <canvas id="overviewChart" height="150"></canvas>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-4">
                    <h5 class="fw-bold">معدل الوفيات حسب الفئة</h5>
                    <canvas id="mortalityPie"></canvas>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 2: MAPPING -->
    <section id="mapping">
        <div class="card p-4 text-center">
            <h3><i class="fas fa-map-marked-alt text-info mb-3"></i> خريطة الكثافة المرضية بالجزائر</h3>
            <div class="table-responsive">
                <table class="table table-hover mt-3 text-end">
                    <thead class="table-dark">
                        <tr>
                            <th>الولاية</th>
                            <th>المرض الأكثر انتشاراً</th>
                            <th>عدد الحالات</th>
                            <th>معدل الإصابة/1000</th>
                            <th>درجة الخطورة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>الجزائر العاصمة</td><td>ضغط الدم</td><td>45,000</td><td>15.2</td><td><span class="badge bg-danger">مرتفع</span></td></tr>
                        <tr><td>سطيف</td><td>السكري</td><td>28,000</td><td>12.8</td><td><span class="badge bg-warning">متوسط</span></td></tr>
                        <tr><td>وهران</td><td>الربو</td><td>19,500</td><td>10.5</td><td><span class="badge bg-success">مستقر</span></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- SECTION 3: TRENDS -->
    <section id="trends">
        <div class="card p-4">
            <h5>تطور الأوبئة (يومي / أسبوعي / شهري)</h5>
            <canvas id="trendsChart" height="120"></canvas>
            <div class="alert alert-info mt-4">نلاحظ ارتفاعاً تدريجياً في الأمراض التنفسية مع دخول موسم الخريف.</div>
        </div>
    </section>

    <!-- SECTION 4: DEMOGRAPHICS -->
    <section id="demographics">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card p-4">
                    <h5>التوزيع حسب الجنس</h5>
                    <canvas id="genderChart"></canvas>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card p-4">
                    <h5>الفئات العمرية الأكثر عرضة</h5>
                    <canvas id="ageChart"></canvas>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 5: MORTALITY -->
    <section id="mortality">
        <div class="card p-4 border-end border-5 border-danger">
            <h4 class="text-danger fw-bold">Case Fatality Rate (CFR) - مؤشرات الفتك</h4>
            <div class="row mt-4">
                <div class="col-md-3"><h5>مرض السكري: 2.1%</h5></div>
                <div class="col-md-3"><h5>أمراض القلب: 4.5%</h5></div>
                <div class="col-md-3"><h5>السرطان: 8.2%</h5></div>
                <div class="col-md-3"><h5>السل: 1.2%</h5></div>
            </div>
        </div>
    </section>

    <!-- SECTION: CAPACITY & OTHERS (Simulation) -->
    <section id="capacity">
        <div class="card p-4">
            <h4>قدرات النظام الصحي (Infrastructure)</h4>
            <div class="row g-4 mt-2 text-center">
                <div class="col-md-3"><div class="p-3 bg-light rounded shadow-sm"><h6>أطباء/1000 فرد</h6><h5>1.8</h5></div></div>
                <div class="col-md-3"><div class="p-3 bg-light rounded shadow-sm"><h6>ممرضين/1000 فرد</h6><h5>3.5</h5></div></div>
                <div class="col-md-3"><div class="p-3 bg-light rounded shadow-sm"><h6>سيارات الإسعاف</h6><h5>14,200</h5></div></div>
                <div class="col-md-3"><div class="p-3 bg-light rounded shadow-sm"><h6>غرف العمليات</h6><h5>1,150</h5></div></div>
            </div>
        </div>
    </section>

</div>

<script>
    // نظام التنقل بين الأقسام
    function showSection(sectionId) {
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        document.getElementById(sectionId).classList.add('active');
        event.currentTarget.classList.add('active');
        
        document.getElementById('section-title').innerText = event.currentTarget.innerText;
    }

    // Charts Initialization
    const ctxOverview = document.getElementById('overviewChart').getContext('2d');
    new Chart(ctxOverview, {
        type: 'bar',
        data: {
            labels: ['السكري', 'ضغط الدم', 'الأنفلونزا', 'أمراض القلب', 'الربو', 'السرطان', 'التهاب الكبد', 'الفشل الكلوي', 'السل', 'كوفيد-19'],
            datasets: [{
                label: 'عدد الحالات المسجلة (بالآلاف)',
                data: [450, 600, 300, 250, 200, 150, 80, 70, 40, 30],
                backgroundColor: '#3498db'
            }]
        }
    });

    const ctxPie = document.getElementById('mortalityPie').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['داخل المستشفى', 'خارج المستشفى'],
            datasets: [{
                data: [75, 25],
                backgroundColor: ['#e74c3c', '#bdc3c7']
            }]
        }
    });

    const ctxTrends = document.getElementById('trendsChart').getContext('2d');
    new Chart(ctxTrends, {
        type: 'line',
        data: {
            labels: ['أسبوع 1', 'أسبوع 2', 'أسبوع 3', 'أسبوع 4'],
            datasets: [{
                label: 'الأمراض المعدية',
                data: [1200, 1900, 1700, 2400],
                borderColor: '#e67e22',
                fill: false
            }, {
                label: 'الأمراض المزمنة',
                data: [5000, 5100, 4900, 5200],
                borderColor: '#2ecc71',
                fill: false
            }]
        }
    });

    // Gender Chart
    const ctxGender = document.getElementById('genderChart').getContext('2d');
    new Chart(ctxGender, {
        type: 'pie',
        data: {
            labels: ['إناث', 'ذكور'],
            datasets: [{
                data: [54, 46],
                backgroundColor: ['#fd79a8', '#0984e3']
            }]
        }
    });
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>