require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const registrationRoutes = require('./routes/registration');

const app = express();

// ── CORS (UPDATED FOR YOUR FRONTEND) ─────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://ieee-hackthone.vercel.app' // ✅ your frontend
  ],
  methods: ['GET', 'POST'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB Connection (Serverless Safe) ─────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

// Connect DB before every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/register', registrationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ── Error Handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Image too large (max 10MB)'
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ❌ DO NOT USE app.listen()

module.exports = app;