const express = require("express");
const cors = require("cors");
const path = require("path");

// Phusion Passenger wrapper
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

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

// Serve frontend static files
const frontendPath = path.join(process.cwd(), 'dist', 'public');
app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Ultra minimal server is running'
  });
});

// API test route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Ultra minimal API is working!',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: send back index.html for SPA routing
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
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Phusion Passenger wrapper
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
} else {
  // HTTP server
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`🚀 Ultra minimal server listening on http://${host}:${port}`);
  });
}
