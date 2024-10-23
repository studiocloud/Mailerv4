import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { emailQueue } from './queues/email.queue';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { campaignRoutes } from './routes/campaign.routes';
import { emailRoutes } from './routes/email.routes';
import { leadRoutes } from './routes/lead.routes';
import { templateRoutes } from './routes/template.routes';
import { settingsRoutes } from './routes/settings.routes';
import { checkSupabaseConnection } from './utils/supabase';

const app = express();
const port = process.env.PORT || 3000;

// Bull Board setup
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isSupabaseConnected = await checkSupabaseConnection();
    const isRedisConnected = emailQueue.client.status === 'ready';

    if (isSupabaseConnected && isRedisConnected) {
      res.json({ status: 'healthy', supabase: true, redis: true });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        supabase: isSupabaseConnected,
        redis: isRedisConnected
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Bull Board UI (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use('/admin/queues', serverAdapter.getRouter());
}

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;