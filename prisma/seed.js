const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const decor = await prisma.category.upsert({
    where: { slug: 'decoracao' },
    update: {},
    create: {
      name: 'Decoração & Design',
      slug: 'decoracao',
      description: 'Peças decorativas, vasos paramétricos e elementos de design.',
    },
  })

  const organizacao = await prisma.category.upsert({
    where: { slug: 'organizacao' },
    update: {},
    create: {
      name: 'Organização & Mesa',
      slug: 'organizacao',
      description: 'Suportes, organizadores e soluções funcionais para o dia a dia.',
    },
  })

  await prisma.product.create({
    data: {
      name: 'Vaso Paramétrico iDeia & Art',
      slug: 'vaso-parametrico',
      description:
        'Vaso decorativo com design paramétrico, ideal para ambientes modernos.',
      basePrice: 49.9,
      categoryId: decor.id,
      productionLeadTimeDays: 3,
    },
  })

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'iDeia & Art',
      defaultMarginPercent: 30.0,
      defaultTaxPercent: 8.0,
      defaultFailurePercent: 5.0,
      defaultPackagingCost: 3.0,
    },
  })

  console.log('✅ Seed executado com sucesso.')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
