import express from 'express';
import { createOrder, getMyOrders, getAllOrders } from '../controllers/order';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('USER'), createOrder);
router.get('/my', authenticateToken, authorizeRole('USER'), getMyOrders);
router.get('/', authenticateToken, authorizeRole('ADMIN'), getAllOrders);

export default router;