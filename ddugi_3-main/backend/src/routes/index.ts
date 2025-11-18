import { Router } from 'express';
import enhancedChatRoutes from './enhancedChatRoutes';
import chatRoutes from './chatRoutes';
import searchRoutes from './searchRoutes';
import itineraryRoutes from './itineraryRoutes';

const router = Router();

// Enhanced Claude API 통합 채팅 (우선순위)
router.use('/chat', enhancedChatRoutes);

// 기존 API 엔드포인트들
router.use('/chat-legacy', chatRoutes); // 기존 채팅을 legacy로 이동
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