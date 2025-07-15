<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Réserver un rendez-vous | GozimSoft</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --main-blue: #08A6A0;
            --light-blue: #EAF1FE;
            --text-color: #333;
        }

        body {
            font-family: 'Segoe UI', sans-serif;
            color: var(--text-color);
            background-color: white;
        }

        .navbar {
            background-color: white !important;
        }

        .navbar-brand, .nav-link {
            color: var(--main-blue) !important;
            font-weight: bold;
        }

        .hero {
            background-color: var(--main-blue);
            background-image: url('https://www.maiia.com/_nuxt/img/homepage-hero.abc123.jpg');
            background-size: cover;
            background-position: center;
            height: 80vh;
            display: flex;
            align-items: center;
            color: white;
        }

        .hero-content {
            background-color: rgba(0, 0, 0, 0.4);
            padding: 30px;
            border-radius: 10px;
        }

        .btn-primary {
            background-color: var(--main-blue);
            border-color: var(--main-blue);
        }

        .btn-primary:hover {
            background-color: #08A6A0;
            border-color: #08A6A0;
        }

        .features h4 {
            color: var(--main-blue);
        }

        footer {
            background-color: var(--light-blue);
            color: var(--main-blue);
        }
    </style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg shadow-sm">
  <div class="container">
    <a class="navbar-brand" href="#">GozimSoft</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#">Accueil</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Services</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<div class="hero">
  <div class="container text-center">
    <div class="hero-content">
      <h1 class="display-5">Prenez rendez-vous avec un professionnel de santé</h1>
      <p class="lead">Simple, rapide et sécurisé</p>
      <form action="reserver.php" method="POST" class="row g-2 mt-3">
        <div class="col-md-4">
          <input type="text" name="specialite" class="form-control" placeholder="Spécialité ou médecin">
        </div>
        <div class="col-md-4">
          <input type="text" name="ville" class="form-control" placeholder="Ville">
        </div>
        <div class="col-md-4">
          <button type="submit" class="btn btn-primary w-100">Rechercher</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Features -->
<div class="container py-5 features">
  <div class="row text-center">
    <div class="col-md-4">
      <h4>Consultation en ligne</h4>
      <p>Consultez votre médecin depuis chez vous.</p>
    </div>
    <div class="col-md-4">
      <h4>Rappel automatique</h4>
      <p>Recevez un SMS de rappel pour votre RDV.</p>
    </div>
    <div class="col-md-4">
      <h4>100% gratuit</h4>
      <p>La réservation est totalement gratuite.</p>
    </div>
  </div>
</div>

<!-- Footer -->
<footer class="py-4 text-center">
  <div class="container">
    <p>&copy; 2025 GozimSoft. Tous droits réservés.</p>
  </div>
</footer>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
