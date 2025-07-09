import express, { Express, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import errorHandler, { CustomError } from './middlewares/errorHandler';

const app: Express = express();
const port = process.env.PORT || 3000;

export const prisma = new PrismaClient(); // Inisialisasi Prisma Client

app.use(express.json()); // Middleware untuk parsing body JSON

// Definisi interface untuk payload update stok
interface StockUpdatePayload {
  productId: number;
  supplierId: number;
  quantity: number; // Ini adalah kuantitas stok baru, bukan perubahan
}

// Endpoint untuk memperbarui stok barang dari beberapa supplier sekaligus
// Menggunakan Transactions dan Batch Queries
app.post('/suppliers/stock', async (req: Request, res: Response, next: NextFunction) => {
  const stockUpdates: StockUpdatePayload[] = req.body.updates; // Asumsi body berisi array of updates

  // Validasi awal payload
  if (!stockUpdates || !Array.isArray(stockUpdates) || stockUpdates.length === 0) {
    return next(new CustomError('Payload update stok tidak valid atau kosong.', 400));
  }

  try {
    // 1. Custom Validation: Memastikan stok baru tidak negatif
    for (const update of stockUpdates) {
      if (update.quantity < 0) {
        throw new CustomError(`Kuantitas stok untuk produk ID ${update.productId} dari supplier ID ${update.supplierId} tidak boleh negatif.`, 400);
      }
    }

    // 2. Validasi keberadaan Produk dan Supplier (Penting untuk integritas data)
    // Kita akan memeriksa semua produk dan supplier yang terlibat dalam batch.
    const productIds = Array.from(new Set(stockUpdates.map(u => u.productId)));
    const supplierIds = Array.from(new Set(stockUpdates.map(u => u.supplierId)));

    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });
    const existingSuppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true }
    });

    const foundProductIds = new Set(existingProducts.map(p => p.id));
    const foundSupplierIds = new Set(existingSuppliers.map(s => s.id));

    for (const update of stockUpdates) {
      if (!foundProductIds.has(update.productId)) {
        throw new CustomError(`Produk dengan ID ${update.productId} tidak ditemukan.`, 404);
      }
      if (!foundSupplierIds.has(update.supplierId)) {
        throw new CustomError(`Supplier dengan ID ${update.supplierId} tidak ditemukan.`, 404);
      }
    }

    // 3. Mengelola update stok menggunakan Transactions dan Batch Queries (upsert)
    const updateOperations = stockUpdates.map(update =>
      prisma.stock.upsert({ // `upsert` akan membuat entri jika tidak ada, atau mengupdate jika ada
        where: {
          productId_supplierId: { // Kombinasi unik produkId dan supplierId
            productId: update.productId,
            supplierId: update.supplierId,
          },
        },
        update: {
          quantity: update.quantity,
          lastUpdated: new Date(),
        },
        create: {
          productId: update.productId,
          supplierId: update.supplierId,
          quantity: update.quantity,
        },
      })
    );

    // Menjalankan semua operasi dalam satu transaksi atomik
    const results = await prisma.$transaction(updateOperations);

    res.status(200).json({
      status: 'success',
      message: 'Stok berhasil diperbarui untuk semua supplier yang terkait.',
      data: results,
    });

  } catch (error) {
    // Meneruskan error ke middleware penanganan error
    next(error);
  }
});

// Middleware penanganan error harus ditempatkan PALING AKHIR setelah semua route
app.use(errorHandler);

// Fungsi untuk memulai server dan menyambungkan ke database
const startServer = async () => {
  try {
    await prisma.$connect(); // Sambungkan Prisma ke database
    console.log('Database connected successfully!');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error connecting to database or starting server:', error);
    process.exit(1); // Keluar jika koneksi database gagal
  } finally {
    // Optional: Disconnect Prisma Client saat aplikasi dimatikan
    // process.on('beforeExit', async () => {
    //   await prisma.$disconnect();
    //   console.log('Prisma Client disconnected.');
    // });
  }
};

startServer();