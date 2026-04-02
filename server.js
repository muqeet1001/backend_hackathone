require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const registrationRoutes = require('./routes/registration');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Vite dev + preview ports
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/register', registrationRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Error Handling ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Image is too large. Please upload an image smaller than 10MB.' });
  }
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── MongoDB Connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
