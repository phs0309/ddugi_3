import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import chatRoutes from '../backend/src/routes/chatRoutes';
import enhancedChatRoutes from '../backend/src/routes/enhancedChatRoutes';
import itineraryRoutes from '../backend/src/routes/itineraryRoutes';
import searchRoutes from '../backend/src/routes/searchRoutes';

// Import middleware
import { errorHandler } from '../backend/src/middleware/errorHandler';
import { rateLimiter } from '../backend/src/middleware/rateLimiter';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app'] 
    : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/enhanced-chat', enhancedChatRoutes);
app.use('/api/travel', itineraryRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};