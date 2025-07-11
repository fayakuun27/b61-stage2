import { Request, Response } from 'express';
import { prisma } from "../connection/clients";

export const createOrder = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  try {
    if (!req.user?.id) {
  return res.status(401).json({ error: 'User not authenticated' });
}

const order = await prisma.order.create({
  data: {
    userId: req.user.id, // ✅ Sekarang dijamin number
    productId,
    quantity,
  },
});
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user?.id },
      include: { product: true },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;
  try {
    const groupedOrders = await prisma.user.findMany({
      include: {
        orders: {
          include: { product: true },
          orderBy: { [String(sort)]: String(order) === 'desc' ? 'desc' : 'asc' },
        },
      },
      skip,
      take,
    });
    res.json(groupedOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};