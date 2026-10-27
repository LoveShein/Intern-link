import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
app.use(
  cors({
    // Only the configured frontend(s) may call the API from a browser.
    origin: (origin, callback) => callback(null, !origin || env.CLIENT_URLS.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'WMSU CareerLink backend is running.' });
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
