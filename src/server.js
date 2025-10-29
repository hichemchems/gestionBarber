import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";
import csurf from "csurf";
import { body, validationResult } from "express-validator";
import path from "path";
import crypto from "node:crypto";

import config from "./config.js";
import sequelize from "./models/index.js";
import './models/associations.js';

import { verifyJwtToken } from "./lib/tokens.js";
import { jwtDecode } from "jwt-decode";

import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import adminChargeRoutes from './routes/adminChargeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// wrapper o2switch
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
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

// Static files
app.use("/uploads", express.static("uploads"));

// Serve frontend static files (assuming frontend is built to ../frontend/dist or similar)
const frontendPath = path.join(process.cwd(), '..', 'frontend', 'dist'); // Adjust path as needed
app.use(express.static(frontendPath));

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
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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

export function isAuthenticated(req, res, next) {
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
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 403, message: "Insufficient permissions" });
    }
    next();
  };
}

export function validateRequest(validations) {
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
