import { Router } from 'express';
import { newChatRoutes } from './newChatRoutes';
import enhancedChatRoutes from './enhancedChatRoutes';
import chatRoutes from './chatRoutes';
import searchRoutes from './searchRoutes';
import itineraryRoutes from './itineraryRoutes';
import { naverRoutes } from './naverRoutes';

const router = Router();

// 새로운 간단한 AI 시스템 (최우선순위)
router.use('/chat', newChatRoutes);

// 네이버 API 엔드포인트들
router.use('/naver', naverRoutes);

// 기존 시스템들 (백업용)
router.use('/chat-enhanced', enhancedChatRoutes);
router.use('/chat-legacy', chatRoutes);
router.use('/search', searchRoutes);
router.use('/itinerary', itineraryRoutes);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;