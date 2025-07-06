import express from 'express';
import {
  createProduct,
  getAllProducts,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
} from '../controllers/product';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('ADMIN'), upload.single('image'), createProduct);
router.get('/', authenticateToken, getAllProducts);
router.put('/:id', authenticateToken, authorizeRole('ADMIN'), upload.single('image'), updateProduct);
router.patch('/:id/delete', authenticateToken, authorizeRole('ADMIN'), softDeleteProduct);
router.patch('/:id/restore', authenticateToken, authorizeRole('ADMIN'), restoreProduct);

export default router;