<?php
$serverPath = 'D:/Github/Utopia_react/backend/src/server.js';

$serverCode = <<<'JS'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import posRoutes from './modules/pos/pos.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import productsRoutes from './routes/products.js';
import clientsRoutes from './routes/clients.js';
import suppliersRoutes from './routes/suppliers.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow local development resources
  crossOriginEmbedderPolicy: false
}));

// 2. Strict CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par la politique CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Rate Limiting for Authentication (Anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 tentatives
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', authLimiter);

// 5. Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/sales', posRoutes); // Alias
app.use('/api/products', productsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    security: 'enterprise-hardened',
    timestamp: new Date().toISOString(),
    system: 'Utopia ERP Pro API'
  });
});

// 6. Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`🛡️  Utopia Enterprise Backend running on http://localhost:${PORT}`);
  console.log(`🔒 Security: Helmet, CORS strict, Rate-limiting, Zod Validation, AuditLogs active`);
  await testConnection();
});
JS;
file_put_contents($serverPath, $serverCode);
echo "Successfully updated server.js with hardened security.\n";
