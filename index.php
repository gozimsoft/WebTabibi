<?php
// index.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello Tabibi</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
   <!-- Navigation bar --> 
  <div class="animated-bg" style="position: relative; overflow: hidden;">  <!-- Animated div  -->
   <nav class="navbar navbar-expand-lg navbar-dark bg-teal shadow-sm mb-4">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center text-white fw-bold" href="#">
        <img src="img/logoWhite.png" alt="Tabibi Logo" width="30" class="me-2">
        Tabibi
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link text-white active" aria-current="page" href="#">Home</a>
          </li>
           <li class="nav-item">
            <a class="nav-link text-white active" aria-current="page" href="#">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white"  href="login.html" >Login</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
 <!-- Navigation bar -->
  <!-- Feature Section Style Based on Reference Image -->
  <div class="container my-5">
    <div class="row  justify-content-center">
      <div class="col-md-8">
        <div class="card feature-card shadow-lg text-white position-relative overflow-hidden">
          <img src="img/CardBG.png" class="card-img" alt="Medical background">
          <div class="card-img-overlay d-flex flex-column justify-content-center align-items-center">
            <h5 class="card-title mb-4">Trouvez votre rendez-vous médical</h5>
            <form class="row g-3 justify-content-center w-100 px-3">
              <div class="col-md-5">
                <input type="text" class="form-control" placeholder="Nom du médecin ou spécialité">
              </div>
              <div class="col-md-5">
                <input type="text" class="form-control" placeholder="Ville ou région">
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-light w-100">Rechercher</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!-- QR Code Card -->
      <div class="col-md-4 ">
        <div class="card feature-card shadow-lg text-center">
          <div class="card-body">
            <h5 class="card-title">Download Tabibi</h5>
            <p class="card-text">Scan the QR code to install Tabibi on your phone.</p>
            <img src="img/qr.png" alt="QR Code Tabibi" class="img-fluid" style="max-width: 150px; margin-bottom: 10px;">
            <br>
            <a href="#" class="btn btn-success">Open in Store</a>
          </div>
        </div>
      </div>
   </div>
    </div>
    <!-- Three Equal Cards Section -->
 <div class="container my-5">
   <div class="row g-4 justify-content-center">
  <div class="col-md-4">
    <div class="card feature-card shadow-lg h-100 text-center" style="height: 300px;">
      <div class="card-body d-flex flex-column justify-content-center align-items-center">
        <div class="mb-3">
          <img src="img/onlineConsultation.png" alt="Service Icon 1" style="width: 100px; height: 100px;">
        </div>
        <h5 class="card-title">Online consultation</h5>
        <p class="card-text">Connect with your doctor from anywhere via secure video consultation—no travel, no waiting room.</p>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card feature-card shadow-lg h-100 text-center" style="height: 300px;">
      <div class="card-body d-flex flex-column justify-content-center align-items-center">
        <div class="mb-3">
          <img src="img/reminder.png" alt="Service Icon 2" style="width: 100px; width: 100px;">
        </div>
        <h5 class="card-title">Automatic reminder</h5>
        <p class="card-text">recieve sms to remind you your appontement,you may recieve ceveral reminders between the day you booked and your appointement.</p>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card feature-card shadow-lg h-100 text-center" style="height: 300px;">
      <div class="card-body d-flex flex-column justify-content-center align-items-center">
        <div class="mb-3">
          <img src="img/happy.png" alt="Service Icon 3" style="width: 100px; width: 100px;">
        </div>
        <h5 class="card-title">100 Free service</h5>
        <p class="card-text">All your bookings are 100 free, our goal is to facilitate the access to your health care and make your life easier.</p>
      </div>
    </div>
  </div>
</div>
</div>
<!-- Media Layout Section: 1/3 image, 2/3 content (Image left) -->
 <div class="container my-5">
    <div class="row  justify-content-center">
  <div class="col-12">
    <div class="d-flex flex-wrap align-items-center p-3 border rounded shadow" style="background-color: #ffffff;">
      <div class="col-md-4 text-center mb-3 mb-md-0">
        <img src="img/users.png" alt="Illustration" class="img-fluid" style="max-height: 250px; ">
      </div>
      <div class="col-md-8">
        <h4 class="text-teal"> Millions Rely on Tabibi: Healthcare at Their Fingertip</h4>
        <p>Every day, millions of users using  Tabibi app to take control of their health with confidence and convenience. Whether booking appointments, consulting medical professionals, or accessing vital health information, Tabibi makes healthcare more accessible and personalized than ever. With a growing global community, the app is revolutionizing how people manage their well-being—anytime, anywhere.</p>
      </div>
    </div>
  </div>
</div>
</div>
<!-- Media Layout Section (Image Right) -->
<div class="container my-5">
    <div class="row  justify-content-center">
  <div class="col-12">
    <div class="d-flex flex-wrap align-items-center p-3 border rounded shadow" style="background-color: #ffffff;">
      <div class="col-md-8">
        <h4 class="text-teal">Your Privacy, Our Priority: Confidentiality at the Core of Tabibi</h4>
        <p>Millions of users trust Tabibi not only for its top-tier healthcare features but also for its unwavering commitment to confidentiality. Every interaction, appointment, and medical detail is protected by industry-leading security measures. Tabibi ensures that your personal information stays private—because your health journey is yours alone. Safe. Secure. Confidential.

Would you like me to expand this into a policy outline, add technical details, or tailor it for a specific audience?
</p>
      </div>
      <div class="col-md-4 text-center mt-3 mt-md-0">
        <img src="img/Confidentiality.png" alt="Illustration Droite" class="img-fluid" style="max-height: 250px;">
      </div>
    </div>
  </div>
</div></div>

<!-- Media Layout Section-->
<div class="container my-5">
    <div class="row  justify-content-center">
  <div class="col-12">
    <div class="d-flex flex-wrap align-items-center p-3 border rounded shadow" style="background-color: #ffffff;">
      <div class="col-md-4 text-center mt-3 mt-md-0">
        <img src="img/practicien1.png" alt="Illustration Droite" class="img-fluid" style="max-height: 200px;">
      </div>
      <div class="col-md-4">
        <h4 class="text-teal">Are you a caregiver?</h4>
        <p>Discover Tabibi for caregivers and improve your daily life </p>
         <p>Provide the best possible care to your patients </p>
         <p>Enjoy a better quality of life at work </p>
         <p>Increase your business revenue </p>
         <p>Adopt the solutions used by more than 11000 caregivers in Algeria</p>

</p>
      </div>
      <div class="col-md-4 text-center mt-3 mt-md-0">
        <img src="img/practicien2.png" alt="Illustration Droite" class="img-fluid" style="max-height: 200px;">
      </div>
    </div>
  </div>
</div></div>





<!-- Footer  -->
<footer style="background-color: #08A6A0; color: white; padding: 20px 0; text-align: center; font-family: Arial, sans-serif;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <p>&copy; 2025 Tabibi Health Solutions. All rights reserved.</p>
    <p>
      <a href="/privacy-policy" style="color: white; text-decoration: underline;">Privacy Policy</a> |
      <a href="/terms" style="color: white; text-decoration: underline;">Terms of Service</a> |
      <a href="/contact" style="color: white; text-decoration: underline;">Contact Us</a>
    </p>
    <p>Follow us:
      <a href="https://twitter.com/TabibiApp" style="color: white; margin: 0 5px;">Twitter</a> |
      <a href="https://facebook.com/TabibiApp" style="color: white; margin: 0 5px;">Facebook</a>
    </p>
  </div>
</footer>
<!-- Footer -->  
  </div><!-- Animated div  -->
    <!-- Bootstrap Bundle JS + Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>

