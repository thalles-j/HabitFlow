import { Router } from 'express';
import { listLogs, createLog, updateLog, deleteLog } from '../controllers/logsController.js';

const router = Router();

router.get('/', listLogs);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

export default router;
