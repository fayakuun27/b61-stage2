import express from 'express';
import { transferPoints } from '../controllers/point';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/transfer', authenticateToken, authorizeRole('USER'), transferPoints);

export default router;