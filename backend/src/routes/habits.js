import { Router } from 'express';
import { createHabit, toggleHabit, listHabits, deleteHabit, updateHabit, hideHabit } from '../controllers/habitsController.js';

const router = Router();

router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabit);
router.patch('/:id/hide', hideHabit);
router.put('/:id', updateHabit);
router.get('/', listHabits);
router.delete('/:id', deleteHabit);

export default router;

