import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { authRouter } from './api/routes/auth';
import { opportunitiesRouter } from './api/routes/opportunities';
import { profileRouter } from './api/routes/profile';
import { recommendationsRouter } from './api/routes/recommendations';
import { searchRouter } from './api/routes/search';
import { savedRouter } from './api/routes/saved';
import { trackedRouter } from './api/routes/tracked';
import { remindersRouter } from './api/routes/reminders';
import { notificationsRouter } from './api/routes/notifications';
import { adminRouter } from './api/routes/admin';
import { errorHandler } from './api/middleware/errorHandler';
import { BackgroundWorkerScheduler } from './workers/scheduler';

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Global Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Security & Anti-Abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'GovAlert REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/opportunities`, opportunitiesRouter);
app.use(`${API_PREFIX}/profile`, profileRouter);
app.use(`${API_PREFIX}/recommendations`, recommendationsRouter);
app.use(`${API_PREFIX}/search`, searchRouter);
app.use(`${API_PREFIX}/saved`, savedRouter);
app.use(`${API_PREFIX}/tracked`, trackedRouter);
app.use(`${API_PREFIX}/reminders`, remindersRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 GovAlert Server running on port ${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}${API_PREFIX}`);
    console.log(`🛡️ Official Source First Engine Active`);
    console.log(`=========================================`);
    BackgroundWorkerScheduler.init();
  });
}

export default app;
