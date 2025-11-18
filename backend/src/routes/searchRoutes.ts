import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { validateSearchRequest } from '../middleware/validation';

const router = Router();
const searchController = new SearchController();

router.post('/', validateSearchRequest, searchController.search);
router.post('/places', validateSearchRequest, searchController.searchPlaces);
router.post('/restaurants', validateSearchRequest, searchController.searchRestaurants);
router.post('/activities', validateSearchRequest, searchController.searchActivities);

export default router;