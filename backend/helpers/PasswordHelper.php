<?php
// ============================================================
// helpers/PasswordHelper.php
// ============================================================
// Helper centralisé pour la gestion sécurisée des mots de passe TABIBI.
//
// Stratégie : Migration progressive "on-the-fly"
//   - Les anciens comptes (Base64) sont migrés silencieusement lors du login.
//   - Les nouveaux comptes utilisent password_hash() (Bcrypt).
//   - Aucun mot de passe n'est stocké, retourné ou loggé.
// ============================================================

class PasswordHelper {

    /**
     * Détecte si un hash stocké est un ancien format (Base64 / texte clair)
     * et non un hash PHP valide (Bcrypt, Argon2, etc.).
     *
     * Utilise password_get_info() — fonction native PHP.
     * Un hash PHP valide retourne un algoName connu (ex: 'bcrypt').
     * Un mot de passe Base64 retourne algoName = 'unknown'.
     *
     * @param string $stored La valeur stockée dans la base de données.
     * @return bool true si c'est un ancien format (à migrer), false si c'est un hash PHP valide.
     */
    public static function isLegacy(string $stored): bool {
        $info = password_get_info($stored);
        // Un hash PHP valide (Bcrypt, Argon2...) a un algoName reconnu et non vide.
        // Une valeur Base64 ou texte clair retourne algoName = 'unknown' ou algo = ''.
        return empty($info['algo']) || $info['algoName'] === 'unknown';
    }

    /**
     * Vérifie un mot de passe saisi contre la valeur stockée en base.
     * Supporte les deux formats : Base64 (legacy) et hash PHP (Bcrypt).
     *
     * NE PAS appeler cette méthode pour créer un hash. Utiliser hash().
     *
     * @param string $input   Le mot de passe saisi par l'utilisateur (en clair).
     * @param string $stored  La valeur stockée en base de données.
     * @return bool true si le mot de passe correspond, false sinon.
     */
    public static function verify(string $input, string $stored): bool {
        if (self::isLegacy($stored)) {
            // Ancien format : comparaison Base64
            return base64_encode($input) === $stored;
        }
        // Nouveau format : hash PHP (Bcrypt)
        return password_verify($input, $stored);
    }

    /**
     * Crée un hash sécurisé d'un mot de passe.
     * Utilise PASSWORD_DEFAULT (Bcrypt sur PHP 8.x).
     *
     * NE JAMAIS stocker, retourner ou logger le mot de passe en clair.
     *
     * @param string $password Le mot de passe en clair.
     * @return string Le hash sécurisé à stocker en base de données.
     */
    public static function hash(string $password): string {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Indique si un hash stocké doit être migré vers un format plus sécurisé.
     * Retourne true si la valeur est en format legacy (Base64) OU si password_needs_rehash()
     * indique que le hash doit être mis à jour (ex: augmentation du cost).
     *
     * @param string $stored La valeur stockée en base de données.
     * @return bool true si une migration est nécessaire.
     */
    public static function needsMigration(string $stored): bool {
        if (self::isLegacy($stored)) {
            return true;
        }
        // Vérifier si le hash actuel utilise l'algorithme et les options recommandés
        return password_needs_rehash($stored, PASSWORD_DEFAULT);
    }
}
