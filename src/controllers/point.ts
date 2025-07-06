import { Request, Response } from 'express';
import { prisma } from "../connection/clients";

export const transferPoints = async (req: Request, res: Response) => {
  const { toUserId, amount } = req.body;
  const fromUserId = req.user?.id;

  if (!fromUserId || !toUserId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer data' });
  }

  try {
    const result = await prisma.$transaction(async (tx:any) => {
      const sender = await tx.user.findUnique({ where: { id: fromUserId } });
      const receiver = await tx.user.findUnique({ where: { id: toUserId } });

      if (!sender || !receiver) throw new Error('User not found');
      if (sender.points < amount) throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: fromUserId },
        data: { points: { decrement: amount } },
      });

      await tx.user.update({
        where: { id: toUserId },
        data: { points: { increment: amount } },
      });

      return { from: sender.email, to: receiver.email, amount };
    });

    res.json({ message: 'Transfer successful', result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};