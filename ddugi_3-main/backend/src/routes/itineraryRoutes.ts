import { Router } from 'express';
import { ItineraryController } from '../controllers/itineraryController';
import { validateItineraryRequest } from '../middleware/validation';

const router = Router();
const itineraryController = new ItineraryController();

router.post('/generate', validateItineraryRequest, itineraryController.generateItinerary);
router.get('/:id', itineraryController.getItinerary);
router.put('/:id', validateItineraryRequest, itineraryController.updateItinerary);
router.post('/:id/optimize', itineraryController.optimizeItinerary);

export default router;