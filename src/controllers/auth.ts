import { prisma } from "../connection/clients";
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) : Promise<any>=> {
  const { email, password} = req.body;
  const image = req.file?.filename;
  try {
    
 

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ error: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'USER',
      profileImage: image || null,
    },
  });

  res.status(201).json({ message: 'User registered' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }, // ✅ email sudah pasti string
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
 