<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'kutoqkmy_WPLOX');

/** Database username */
define('DB_USER', 'kutoqkmy_WPLOX');

/** Database password */
define('DB_PASSWORD', 'p*bTLGPn{((9=(a0N');

/** Database hostname */
define('DB_HOST', 'localhost');

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'b7cb91c11397fd830c5aa6067272995e32f3903ca30277eec1e606d9a4a5979b');
define('SECURE_AUTH_KEY', 'a91fcd8870ea4d0d7bbba3588e048eb9af8f7fa67724d3ee6acb2c540e668a23');
define('LOGGED_IN_KEY', '7c5b7280e4263210d30aaf28841db5e070cc53d99ed6c0e95d95740b7009dc61');
define('NONCE_KEY', 'ec078b9210a6a511cd385664da6819a80861e7bcedfe5d03d559aa1d0d3e78bf');
define('AUTH_SALT', '0b0a8b5eeb2ed3040a857beaea56d2e45e79e279bd18a6046bf6bcd0f4f1808d');
define('SECURE_AUTH_SALT', '50bdc975a01f9a607c9c5fa50826349a32f8b3055beb3b7f2b83b8d1ac988c0c');
define('LOGGED_IN_SALT', 'f907f736040890b28da8fd819caea20df2313c8ca7fc29eb90d45cde95b641f9');
define('NONCE_SALT', '5a81e1a1416833611bcc190941869260c412dc2257bcc085431bc678b9985fa8');

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'OR2_';
define('WP_CRON_LOCK_TIMEOUT', 120);
define('AUTOSAVE_INTERVAL', 300);
define('WP_POST_REVISIONS', 20);
define('EMPTY_TRASH_DAYS', 7);
define('WP_AUTO_UPDATE_CORE', true);

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
