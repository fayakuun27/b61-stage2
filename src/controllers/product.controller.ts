import { Request, Response } from "express";
import prisma from "../prisma/client";

export const addProduct = async (req: Request, res: Response) => {
  const { name, price } = req.body;
  const supplierId = (req as any).user.id;
  if (!name || name.length < 3) return res.status(400).json({ message: "Name min 3 chars" });
  if (price < 0) return res.status(400).json({ message: "Price must be positive" });

  const product = await prisma.product.create({
    data: { name, price, supplierId },
  });
  res.status(201).json(product);
};

export const getSupplierProducts = async (req: Request, res: Response) => {
  const supplierId = (req as any).user.id;
  const products = await prisma.product.findMany({ where: { supplierId } });
  res.json(products);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const user = (req as any).user;

  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product || product.supplierId !== user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: { name, price },
  });

  res.json(updated);
};