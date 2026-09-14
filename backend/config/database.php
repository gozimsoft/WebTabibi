<?php
// ============================================================
// config/database.php  —  Tabibi API
// ============================================================

if (!function_exists('tabibi_load_env')) {
    /**
     * Chargeur natif autonome pour fichier .env (sans dépendance externe)
     */
    function tabibi_load_env(string $path): void {
        if (!file_exists($path) || !is_readable($path)) {
            return;
        }
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Retrait des guillemets englobants si présents
            $len = strlen($value);
            if ($len >= 2) {
                $firstChar = $value[0];
                $lastChar = $value[$len - 1];
                if (($firstChar === '"' && $lastChar === '"') || ($firstChar === "'" && $lastChar === "'")) {
                    $value = substr($value, 1, -1);
                }
            }

            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Chargement de l'environnement : priorité à backend/.env, puis racine
$envBackend = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
$envRoot    = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env';

if (file_exists($envBackend)) {
    tabibi_load_env($envBackend);
} elseif (file_exists($envRoot)) {
    tabibi_load_env($envRoot);
}

// Fonction utilitaire pour récupérer une valeur d'environnement avec valeur de repli par défaut
$getEnvVal = function(string $key, $fallback = '') {
    $val = getenv($key);
    if ($val !== false) {
        return $val;
    }
    if (array_key_exists($key, $_ENV)) {
        return $_ENV[$key];
    }
    if (array_key_exists($key, $_SERVER)) {
        return $_SERVER[$key];
    }
    return $fallback;
};

// ============================================================
// CONSTANTES GLOBALES (Consommées par Database.php, EmailHelper, etc.)
// ============================================================

// Base de Données (aucun secret en dur ni en fallback)
define('DB_HOST',     $getEnvVal('DB_HOST', '127.0.0.1'));
define('DB_PORT',     $getEnvVal('DB_PORT', '3306'));
define('DB_NAME',     $getEnvVal('DB_NAME', ''));
define('DB_USER',     $getEnvVal('DB_USER', 'root'));
define('DB_PASS',     $getEnvVal('DB_PASS', ''));
define('DB_CHARSET',  $getEnvVal('DB_CHARSET', 'utf8mb4'));

// Messagerie SMTP (PHPMailer / SMTP natif)
define('MAIL_HOST',   $getEnvVal('MAIL_HOST', 'smtp.gmail.com'));
define('MAIL_USER',   $getEnvVal('MAIL_USER', ''));
define('MAIL_PASS',   $getEnvVal('MAIL_PASS', ''));
define('MAIL_PORT',   (int)$getEnvVal('MAIL_PORT', 587));
define('MAIL_NAME',   $getEnvVal('MAIL_NAME', 'Tabibi - طبيبي'));

// URLs Application
define('APP_URL',     $getEnvVal('APP_URL', 'http://localhost:8000'));
define('FRONTEND_URL',$getEnvVal('FRONTEND_URL', 'http://localhost:80'));

// Expiration Session / Token (secondes)
define('TOKEN_EXPIRY', (int)$getEnvVal('TOKEN_EXPIRY', 86400 * 30)); // 30 jours