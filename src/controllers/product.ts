import { Request, Response } from 'express';
import { prisma } from "../connection/clients";

export const createProduct = async (req: Request, res: Response): Promise<any> => {
  const { name, description, price } = req.body;
  const imageUrl = req.file?.filename;
  try {
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price),imageUrl: imageUrl || null },
    });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  const { search, sort, order, page = 1, limit = 10 } = req.query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        name: search ? { contains: String(search), mode: 'insensitive' } : undefined,
      },
      orderBy: sort && order ? { [String(sort)]: String(order).toLowerCase() === 'desc' ? 'desc' : 'asc' } : undefined,
      skip,
      take,
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const imageUrl = req.file?.filename;
  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price: parseFloat(price),imageUrl: imageUrl || null },
    });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const softDeleteProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'Product soft deleted', product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const restoreProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: null },
    });
    res.json({ message: 'Product restored', product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
