import express from 'express';
import { register, login } from '../controllers/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login);

export default router;