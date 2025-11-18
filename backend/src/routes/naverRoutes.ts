import { Router } from 'express';
import { NaverController } from '../controllers/naverController';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();
const naverController = new NaverController();

// 네이버 API 검색 라우트들
router.get('/restaurants', rateLimitMiddleware, naverController.searchRestaurants);
router.get('/accommodations', rateLimitMiddleware, naverController.searchAccommodations);
router.get('/local', rateLimitMiddleware, naverController.searchLocal);

export { router as naverRoutes };