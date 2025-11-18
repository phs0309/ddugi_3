import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();

// Request 객체에 timestamp 추가를 위한 미들웨어
app.use((req, res, next) => {
  req.headers['x-request-start'] = Date.now().toString();
  next();
});
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] // 실제 도메인으로 변경 필요
    : process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', rateLimiter);
app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});