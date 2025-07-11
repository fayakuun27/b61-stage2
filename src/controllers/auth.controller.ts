import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import { signToken } from "../utils/auth";
import { encrypt } from "../utils/encryption";

export const loginSupplier = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role });
  res.json({ token });
};

export const registerSupplier = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedPhone = encrypt(phone);
  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone: encryptedPhone, role: "supplier" },
  });
  res.status(201).json({ id: newUser.id, email: newUser.email });
};
