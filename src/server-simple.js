import express from "express";
import cors from "cors";
import path from "path";

// wrapper o2switch
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// Express app
const app = express();

// CORS
app.use(cors({
  origin: "https://loft-barber.com",
  credentials: true,
}));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));

// Static files
app.use("/uploads", express.static("uploads"));

// Serve frontend static files (built to dist/public)
const frontendPath = path.join(process.cwd(), 'dist', 'public');
app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API test route
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Catch-all handler: send back index.html for any non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(process.cwd(), 'index.html'));
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
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`🚀 Server listening on http://${host}:${port}`);
  });
}
