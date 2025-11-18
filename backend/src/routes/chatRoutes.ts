import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { validateChatRequest } from '../middleware/validation';

const router = Router();
const chatController = new ChatController();

router.post('/', validateChatRequest, chatController.handleChat);
router.get('/history', chatController.getChatHistory);
router.delete('/history/:id', chatController.deleteChatMessage);

export default router;