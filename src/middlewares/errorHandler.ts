// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

// Custom error class untuk error spesifik aplikasi
export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

// Middleware penanganan error utama
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error caught by middleware:', err); // Log error untuk debugging

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Penanganan error default untuk error tak terduga
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server. Mohon coba lagi nanti.',
  });
};

export default errorHandler;