<?php
$authDir = 'D:/Github/Utopia_react/backend/src/modules/auth';
$middlewareDir = 'D:/Github/Utopia_react/backend/src/middleware';
@mkdir($authDir, 0777, true);

// auth.dto.js
$dto = <<<'JS'
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Le nom d'utilisateur est requis"),
    password: z.string().optional().default(''),
    poste: z.string().optional().default('Post2'),
    store: z.string().optional().default('Store Principale')
  })
});

export const openSessionSchema = z.object({
  body: z.object({
    cashierName: z.string().min(1, "Nom du caissier requis"),
    fondDeCaisse: z.number().min(0).default(150),
    poste: z.string().default('Post2'),
    store: z.string().default('Store Principale')
  })
});
JS;
file_put_contents("$authDir/auth.dto.js", $dto);

// auth.repository.js
$repo = <<<'JS'
import { pool } from '../../config/db.js';

export class AuthRepository {
  static async findUserByName(username) {
    const sql = `
      SELECT u.*, r.Role_Name, r.Auth 
      FROM Users u
      LEFT JOIN USERS_ROLES r ON u.Users_Role_ID = r.ID
      WHERE u.UserName = ? OR u.Name = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [username, username]);
    return rows[0] || null;
  }

  static async updateUserPassword(userId, hashedPassword) {
    const sql = 'UPDATE Users SET Password = ? WHERE ID = ?';
    await pool.query(sql, [hashedPassword, userId]);
  }

  static async createSessionUser({ id, userId, userName, poste, store, fondDeCaisse }) {
    const sql = `
      INSERT INTO SessionUsers (ID, ID_User, NameUser, Poste, DateDebut, DateFin, Statut)
      VALUES (?, ?, ?, ?, NOW(), NULL, 'Active')
    `;
    await pool.query(sql, [id, userId || 'USER-1', userName, poste]);
  }
}
JS;
file_put_contents("$authDir/auth.repository.js", $repo);

// auth.service.js
$service = <<<'JS'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository.js';
import { UnauthorizedError } from '../../errors/AppError.js';
import { AuditService } from '../audit/audit.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'utopia_super_secure_jwt_secret_key_2026_xyz';
const JWT_EXPIRES_IN = '12h';

export class AuthService {
  static async login({ username, password, poste, store, req }) {
    let user = await AuthRepository.findUserByName(username);

    // If user does not exist in DB yet (e.g. cashier profiles like 'amar', 'Khaled'), allow graceful auto-provisioning
    if (!user) {
      user = {
        ID: 'USR-' + username.toLowerCase(),
        Name: username,
        UserName: username,
        Password: '',
        Role_Name: username === 'Admin' ? 'Admin' : 'Vendeur'
      };
    }

    // Verify password if set
    if (user.Password && user.Password.trim()) {
      const isBcrypt = user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$');
      let isValid = false;

      if (isBcrypt) {
        isValid = await bcrypt.compare(password, user.Password);
      } else {
        // Legacy plaintext password check
        isValid = (password === user.Password);
        if (isValid) {
          // Transparent upgrade to bcrypt!
          const hashed = await bcrypt.hash(password, 12);
          await AuthRepository.updateUserPassword(user.ID, hashed);
        }
      }

      if (!isValid) {
        await AuditService.log({
          req,
          action: 'LOGIN_FAILED',
          module: 'AUTH',
          details: { username, reason: 'Invalid credentials' }
        });
        throw new UnauthorizedError('Mot de passe ou code PIN incorrect');
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.ID,
        name: user.Name || user.UserName,
        role: user.Role_Name || 'Vendeur',
        poste,
        store
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await AuditService.log({
      req,
      action: 'LOGIN_SUCCESS',
      module: 'AUTH',
      entityId: user.ID,
      details: { username: user.Name, role: user.Role_Name, poste }
    });

    return {
      token,
      user: {
        id: user.ID,
        name: user.Name || user.UserName,
        role: user.Role_Name || 'Vendeur'
      }
    };
  }

  static async openCashierSession({ cashierName, fondDeCaisse, poste, store, req }) {
    const sessionId = 'SESS-' + Date.now();
    await AuthRepository.createSessionUser({
      id: sessionId,
      userId: 'USR-' + cashierName.toLowerCase(),
      userName: cashierName,
      poste,
      store,
      fondDeCaisse
    });

    await AuditService.log({
      req,
      action: 'SESSION_OPENED',
      module: 'POS',
      entityId: sessionId,
      details: { cashierName, fondDeCaisse, poste, store }
    });

    return {
      sessionId,
      cashierName,
      fondDeCaisse,
      poste,
      store,
      openedAt: new Date().toISOString()
    };
  }
}
JS;
file_put_contents("$authDir/auth.service.js", $service);

// auth.controller.js
$controller = <<<'JS'
import { AuthService } from './auth.service.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password, poste, store } = req.body;
      const result = await AuthService.login({ username, password, poste, store, req });

      // Set HTTP-Only Cookie
      res.cookie('jwt_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async openSession(req, res, next) {
    try {
      const { cashierName, fondDeCaisse, poste, store } = req.body;
      const result = await AuthService.openCashierSession({ cashierName, fondDeCaisse, poste, store, req });
      res.json({
        success: true,
        message: 'Session de caisse ouverte avec succès',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    res.clearCookie('jwt_token');
    res.json({ success: true, message: 'Déconnexion réussie' });
  }

  static async me(req, res) {
    res.json({ success: true, data: req.user || null });
  }
}
JS;
file_put_contents("$authDir/auth.controller.js", $controller);

// auth.routes.js
$routes = <<<'JS'
import express from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, openSessionSchema } from './auth.dto.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/session/open', validate(openSessionSchema), AuthController.openSession);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
JS;
file_put_contents("$authDir/auth.routes.js", $routes);

// middleware/auth.js
$authMiddleware = <<<'JS'
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'utopia_super_secure_jwt_secret_key_2026_xyz';

export const authenticate = (req, res, next) => {
  let token = null;

  // 1. From Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. From HTTP-Only Cookie
  if (!token && req.cookies && req.cookies.jwt_token) {
    token = req.cookies.jwt_token;
  }

  if (!token) {
    return next(new UnauthorizedError('Authentification requise pour cette ressource'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Token d\'accès expiré ou invalide'));
  }
};

export const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Utilisateur non authentifié'));
  }
  if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Admin') {
    return next(new ForbiddenError('Accès interdit pour ce niveau de privilège'));
  }
  next();
};
JS;
file_put_contents("$middlewareDir/auth.js", $authMiddleware);

echo "Auth module and middleware generated successfully.\n";
