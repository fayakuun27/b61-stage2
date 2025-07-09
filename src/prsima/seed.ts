import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Buat beberapa produk
  const product1 = await prisma.product.upsert({
    where: { name: 'Smart TV 4K' },
    update: {},
    create: { name: 'Smart TV 4K', description: 'Televisi cerdas resolusi 4K.' },
  })
  const product2 = await prisma.product.upsert({
    where: { name: 'Laptop Gaming' },
    update: {},
    create: { name: 'Laptop Gaming', description: 'Laptop performa tinggi untuk gaming.' },
  })
  const product3 = await prisma.product.upsert({
    where: { name: 'Smartphone Pro' },
    update: {},
    create: { name: 'Smartphone Pro', description: 'Smartphone canggih dengan kamera superior.' },
  })
  console.log({ product1, product2, product3 })

  // Buat beberapa supplier
  const supplier1 = await prisma.supplier.upsert({
    where: { name: 'Tech Distributor A' },
    update: {},
    create: { name: 'Tech Distributor A', contact: 'contact@distributora.com' },
  })
  const supplier2 = await prisma.supplier.upsert({
    where: { name: 'Global Gadgets Inc.' },
    update: {},
    create: { name: 'Global Gadgets Inc.', contact: 'info@globalgadgets.com' },
  })
  console.log({ supplier1, supplier2 })

  // Contoh data stok awal (opsional, akan di-upsert oleh endpoint)
  // await prisma.stock.upsert({
  //   where: { productId_supplierId: { productId: product1.id, supplierId: supplier1.id } },
  //   update: { quantity: 10 },
  //   create: { productId: product1.id, supplierId: supplier1.id, quantity: 10 },
  // })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })