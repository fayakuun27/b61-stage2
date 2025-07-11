import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.sendStatus(403);
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!roles.includes(user.role)) return res.sendStatus(403);
    next();
  };
};