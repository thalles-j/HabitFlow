import { Router } from 'express';
import { createHabit, toggleHabit, listHabits, deleteHabit } from '../controllers/habitsController.js';

const router = Router();

router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabit);
router.get('/', listHabits);
router.delete('/:id', deleteHabit);

export default router;

