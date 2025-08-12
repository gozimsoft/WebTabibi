<?php

session_start();

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}


include 'database.php';
$stmt = $db->prepare("SELECT points FROM users WHERE id = :id");
$stmt->bindParam(':id',$_SESSION['user_id']);

$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$points = $user['points'];


?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>الصفحة الرئيسية</title>
    <style>
        #loader {
            display: none;
            text-align: center;
            margin-top: 20px;
        }

        #result {
            display: none;
            text-align: center;
            margin-top: 20px;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0PX 10PX;
            padding: 0PX 10PX;
            display: flex;
            flex-direction: column;
            align-items: center;
            direction: rtl;
        }

        #bar_top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: green;
            color: white;
            padding: 10px 20px;
            width: 100%;
            box-shadow: 0 2px 5px rgba(123, 184, 117, 0.73);
            font-family: 'Cairo', sans-serif;
        }

        #div_img {
            height: 250px;
            width: 500px;
        }

        #img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #bar_top .bar_link {
            color: white;
            text-decoration: none;
            margin: 0px 20px;
        }

        #bar_top .bar_link:hover {
            text-decoration: underline;
            font-family: 'Cairo', sans-serif;
        }

        h1 {
            color: green;
            margin-top: 20px;
        }

        form {
            background-color: #fff;
            border: 2px solid green;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-top: 5px;
        }

        form a {
            text-align: center;
            font-family: 'Cairo', sans-serif;
        }

        form label {
            display: block;
            margin-bottom: 3px;
            color: green;
            font-family: 'Cairo', sans-serif;
            display: flex;
        }

        form input {
            width: 100%;
            padding: 8px 0px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-family: 'Cairo', sans-serif;
        }

        form button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: green;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s;
            width: 100%;
            font-family: 'Cairo', sans-serif;
        }

        form button:hover {
            background-color: darkgreen;
        }

        #loader,
        #result {
            margin-top: 20px;
            text-align: center;
        }

        #loader img {
            width: 50px;
        }

        #result a {
            color: green;
            text-decoration: none;
            font-weight: bold;
        }

        #result a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div id="bar_top">
        <div class="left">
            <a class="bar_link" href="Profile.php"><?php echo htmlspecialchars($_SESSION['username']); ?></a>
            <a class="bar_link" href="view_payments.php">سجل المدفوعات</a>
            <a class="bar_link" href="charge_points.php">شحن النقاط</a>
            <a>عدد النقاط: <span id="id_point"><?php echo $points ?></span></a>

            <?php
            $typeuser = $_SESSION['typeuser'];
            if ($typeuser == 1) {
                echo '<a class="bar_link" href="dashbord.php">لوحة التحكم  </a>';
                echo '<a class="bar_link" href="view_messages.php"> الرسائل  </a>';



            }
            ?>
        </div>
        <div class="center">

        </div>
        <div class="right">
            <a class="bar_link" href="logout.php">تسجيل الخروج</a>
            <a class="bar_link" href="contact.php">اتصل بنا</a>
        </div>
    </div>
    <div id="div_img">
        <img id="img" src="img.png" alt="" />
    </div>

    <form id="uploadForm" method="POST" enctype="multipart/form-data">
        <a href="DatabaseDesignRequirements.php">شروط تصميم قاعدة البيانات</a>
        <label for="projectName">اسم المشروع:</label>
        <input type="text" id="projectName" name="projectName"  pattern="[A-Za-z]+" title="يرجى إدخال حروف إنجليزية فقط" required >
        <label for="file">اختر ملف قاعدة البيانات:</label>
        <input type="file" id="file" name="file" accept=".db,.accdb,.mdb,.bak" required>
        <button type="submit">بداء المعالجة</button>
    </form>

    <div id="loader">
        <p>جاري المعالجة ، يرجى الانتظار...</p>
        <img src="loader.gif" alt="جاري المعالجة" />
    </div>
 


    <div id="result">
        <p id="message"></p>
        <ul id="tablesList"></ul>  <!-- هنا ستُعرض أسماء الجداول -->
        <a id="download_link"></a>
    </div>


    <script>
        document.getElementById('uploadForm').addEventListener('submit', function (e) {
           e.preventDefault(); // منع الإرسال الافتراضي
            document.getElementById('loader').style.display = 'block'; // إظهار مؤشر التحميل
            document.getElementById('result').style.display = 'none'; // إخفاء النتائج السابقة

            const formData = new FormData(this); // تجهيز البيانات لإرسالها

            fetch('upload_process.php', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json()) // تحويل الاستجابة إلى JSON
                .then(data => {

                    document.getElementById('loader').style.display = 'none'; // إخفاء مؤشر التحميل

                    if (data.state === 1) {
                        document.getElementById('id_point').textContent = data.userPoints ;
                        document.getElementById('message').textContent = "تم معالجة الملف بنجاح .";

                        let downloadContainer = document.getElementById('download_link');
                        downloadContainer.innerHTML = ''; // تفريغ المحتوى السابق

                        // إنشاء رابط التحميل
                        let downloadLink = document.createElement('a');
                        downloadLink.href = data.download_link; // وضع رابط التحميل
                        downloadLink.textContent =  "اضغط هنا لتحميل الملف";
                        downloadLink.setAttribute('download', 'clinic.zip'); // تحديد اسم الملف عند التحميل
                        downloadLink.style.display = 'block';
                        downloadLink.style.marginTop = '10px';
                        downloadLink.style.color = 'blue';
                        downloadLink.style.fontWeight = 'bold';

                        downloadContainer.appendChild(downloadLink); // إضافة الرابط إلى الصفحة
                    } else {
                        document.getElementById('message').textContent = "حدث خطأ أثناء معالجة الملف!";
                    }

                    document.getElementById('result').style.display = 'block'; // إظهار النتائج

                })
                .catch(error => {
                    document.getElementById('loader').style.display = 'none'; // إخفاء التحميل
                    document.getElementById('message').textContent = "حدث خطأ غير متوقع.";
                    console.error(error);
                });
        });
    </script>

</body>

</html>