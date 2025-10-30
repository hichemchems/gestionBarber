// CommonJS Syntax (.cjs)

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const csurf = require("csurf");
const { body, validationResult } = require("express-validator");
const path = require("path");
const fs = require('fs'); // Pour vérifier l'existence du fichier
// const crypto = require('node:crypto'); // Non utilisé en haut du fichier, laissé en commentaire

// Assurez-vous que ces fichiers utilisent aussi la syntaxe CommonJS (module.exports)
const config = require("./src/config.js");
const sequelize = require("./src/models/index.js");
require('./src/models/associations.js');

const { verifyJwtToken } = require("./src/lib/tokens.js");
const { jwtDecode } = require("jwt-decode");

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Routes (doivent aussi utiliser module.exports)
const authRoutes = require('./src/routes/authRoutes.js');
const userRoutes = require('./src/routes/userRoutes.js');
const packageRoutes = require('./src/routes/packageRoutes.js');
const saleRoutes = require('./src/routes/saleRoutes.js');
const receiptRoutes = require('./src/routes/receiptRoutes.js');
const expenseRoutes = require('./src/routes/expenseRoutes.js');
const salaryRoutes = require('./src/routes/salaryRoutes.js');
const adminChargeRoutes = require('./src/routes/adminChargeRoutes.js');
const analyticsRoutes = require('./src/routes/analyticsRoutes.js');

// wrapper o2switch (Phusion Passenger)
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({
    autoInstall: false,
    environment: process.env.NODE_ENV || 'production',
    logFile: process.env.PASSENGER_LOG_FILE || '/dev/null', // or a path if needed
    errorLogFile: process.env.PASSENGER_ERROR_LOG_FILE || '/dev/null'
  });
}

// Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS
app.use(cors({
  origin: config.server.cors,
  credentials: true,
}));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));

// File upload
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
}));

// Cookie parser
app.use(cookieParser());

// CSRF protection
app.use(csurf({ cookie: true }));

// Static files for uploads (API)
app.use("/uploads", express.static("uploads"));

// =================================================================
// === CORRECTION : Servir les fichiers statiques du frontend (SPA) ==
// =================================================================

// Utilisation de __dirname pour un chemin absolu et fiable.
// Le chemin est relatif au dossier de ce fichier (root/).
const frontendPath = path.join(__dirname, 'dist', 'public');

// Serve frontend static files (CSS, JS, assets)
app.use(express.static(frontendPath));

// =================================================================

// Database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Database connection failed:', err));

// Définir l'URL du serveur via le env
const { url } = config.server;

// Configuration Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'EasyGestion API',
      version: '1.0.0',
      description: 'API pour la gestion d\'un salon de coiffure',
    },
    servers: [
      {
        url: url,
        description: `API Serveur - ${url}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/api/v1/auth', authRoutes);

// =================================================================
// === NOUVELLE ROUTE : Obtenir le jeton CSRF pour les requêtes POST/PUT/DELETE ==
// =================================================================
app.get('/api/v1/csrf-token', (req, res) => {
  // Cette fonction est ajoutée au req par le middleware csurf()
  res.json({ csrfToken: req.csrfToken() });
});
// =================================================================

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/salaries', salaryRoutes);
app.use('/api/v1/admin-charges', adminChargeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back index.html for any non-API routes (SPA routing)
// Cette route doit être la dernière, avant le gestionnaire d'erreurs.
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');

  // Si c'est une route API, on renvoie 404
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
     return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Si l'index est trouvé, on le sert pour le routage côté client
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si l'index n'est pas trouvé, c'est que le chemin ou le build est incorrect.
    console.error(`Frontend index.html not found at: ${indexPath}`);
    res.status(503).send("Frontend application is unavailable (Build missing).");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Pour le CSRF, on renvoie une 403
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// wrapper o2switch
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
} else {
  // HTTP server
  const { port, host } = config.server;
  app.listen(port, host, () => {
    console.log(`🚀 Server listening on http://${host}:${port}`);
  });
}

// ==================================================
// =========== Authentication middleware ============
// ==================================================

// Exportation des fonctions utilitaires en CommonJS
module.exports = {
  isAuthenticated: function (req, res, next) {
    const accessToken = req.headers?.["authorization"]?.split("Bearer ")[1] ||
                       req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ status: 401, message: "No access token provided" });
    }

    const decodedToken = verifyJwtToken(accessToken);
    if (!decodedToken) {
      return res.status(401).json({ status: 401, message: "Invalid access token" });
    }

    req.user = decodedToken;
    req.accessToken = accessToken;
    next();
  },

  requireRole: function (roles) {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ status: 403, message: "Insufficient permissions" });
      }
      next();
    };
  },

  validateRequest: function (validations) {
    return async (req, res, next) => {
      for (let validation of validations) {
        const result = await validation.run(req);
        if (result.errors.length) break;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    };
  }
}

// ==================================================
// =========== Phusion Passenger Error Logging ============
// ==================================================

// Gestion des erreurs non capturées pour Phusion Passenger
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // En production, on peut logger dans un fichier ou envoyer à un service de monitoring
  if (typeof(PhusionPassenger) !== 'undefined') {
    // Passenger gère le processus, on peut laisser le process continuer ou exit
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Similairement pour les promesses rejetées
});

// Middleware pour logger les erreurs de Passenger
if (typeof(PhusionPassenger) !== 'undefined') {
  app.use((err, req, res, next) => {
    console.error('Passenger Error:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });
}
