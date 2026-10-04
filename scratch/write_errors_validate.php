<?php
$backendDir = 'D:/Github/Utopia_react/backend';
@mkdir("$backendDir/src/errors", 0777, true);
@mkdir("$backendDir/src/middleware", 0777, true);

// AppError.js
$appError = <<<'JS'
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Données de requête invalides', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Accès non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Droits insuffisants pour cette action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflit de ressource ou stock insuffisant') {
    super(message, 409, 'CONFLICT');
  }
}
JS;
file_put_contents("$backendDir/src/errors/AppError.js", $appError);

// validate.js
$validate = <<<'JS'
import { ValidationError } from '../errors/AppError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with sanitized/validated data
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;
    next();
  } catch (err) {
    if (err.errors) {
      const details = err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      next(new ValidationError('Erreur de validation des paramètres', details));
    } else {
      next(err);
    }
  }
};
JS;
file_put_contents("$backendDir/src/middleware/validate.js", $validate);

// errorHandler.js
$errorHandler = <<<'JS'
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Une erreur interne est survenue sur le serveur';

  // Log in development / debug
  if (process.env.NODE_ENV !== 'production' || statusCode === 500) {
    console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.url} -> [${statusCode}] ${message}`);
    if (err.stack && statusCode === 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {})
    }
  });
};
JS;
file_put_contents("$backendDir/src/middleware/errorHandler.js", $errorHandler);

echo "Error and validation middleware generated.\n";
