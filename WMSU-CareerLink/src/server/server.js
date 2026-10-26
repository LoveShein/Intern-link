import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS for all origins (fixes "Connection to server failed")
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Auth API Routes
app.use('/api/auth', authRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send('WMSU CareerLink API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});