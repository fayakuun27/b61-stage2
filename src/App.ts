import express, { Application } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import pointRoutes from './routes/point';
import { corsMiddleware } from './middleware/cors';
import { limiter } from './middleware/rateLimit';

dotenv.config();

const app: Application = express();
app.use(limiter)
app.use(corsMiddleware);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/points', pointRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});