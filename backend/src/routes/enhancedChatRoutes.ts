import { Router } from 'express';
import { EnhancedChatController } from '../controllers/enhancedChatController';
import { validateChatRequest } from '../middleware/validation';

const router = Router();
const chatController = new EnhancedChatController();

// 메인 채팅 엔드포인트
router.post('/', validateChatRequest, chatController.handleChat);

// 대화 히스토리 관리
router.get('/history', chatController.getChatHistory);
router.delete('/history', chatController.clearChatHistory);

// 대화 통계
router.get('/stats', chatController.getConversationStats);

// 개발용 엔드포인트
router.get('/sessions', chatController.getActiveSessions);

export default router;