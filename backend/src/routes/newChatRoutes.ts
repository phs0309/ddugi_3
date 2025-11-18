import { Router } from 'express';
import { NewChatController } from '../controllers/newChatController';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();
const chatController = new NewChatController();

// 새로운 AI 채팅 엔드포인트
router.post('/', rateLimitMiddleware, (req, res) => {
  chatController.chat(req, res);
});

// AI 시스템 상태 확인
router.get('/health', (req, res) => {
  chatController.health(req, res);
});

export { router as newChatRoutes };