import { Router } from 'express';
import { getSummary, getDay } from '../controllers/daysController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/day', getDay);

export default router;
