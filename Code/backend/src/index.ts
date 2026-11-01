import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import habitsRouter from './routes/habits';
import profileRouter from './routes/profile';
import reengagementRouter from './routes/reengagement';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { runSeed } from './seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api', profileRouter);
app.use('/api', reengagementRouter);
app.use('/api', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Tumbuh V2 Backend API',
    database: 'PostgreSQL 17 (port 5433)',
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  try {
    // Run seed to ensure default demo user and badges are ready
    await runSeed();

    app.listen(Number(PORT), HOST as string, () => {
      console.log(`🌿 Tumbuh V2 Backend Server running at http://${HOST}:${PORT}`);
      console.log(`🌱 Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
