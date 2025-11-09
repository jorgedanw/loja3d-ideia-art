const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // CATEGORIAS
  const decor = await prisma.category.upsert({
    where: { slug: 'decoracao' },
    update: {},
    create: {
      name: 'Decoração & Design',
      slug: 'decoracao',
      description: 'Peças decorativas e elementos de design em impressão 3D.',
    },
  })

  const organizacao = await prisma.category.upsert({
    where: { slug: 'organizacao' },
    update: {},
    create: {
      name: 'Organização & Mesa',
      slug: 'organizacao',
      description: 'Suportes e organizadores funcionais para o dia a dia.',
    },
  })

  // PRODUTO 1 — Vaso Paramétrico
  const vaso = await prisma.product.upsert({
    where: { slug: 'vaso-parametrico' },
    update: {},
    create: {
      name: 'Vaso Paramétrico iDeia & Art',
      slug: 'vaso-parametrico',
      description:
        'Vaso com design paramétrico, ideal para decorar mesas e prateleiras.',
      basePrice: 49.9,
      categoryId: decor.id,
      productionLeadTimeDays: 3,
    },
  })

  // PRODUTO 2 — Suporte Minimalista
  await prisma.product.upsert({
    where: { slug: 'suporte-headset-minimal' },
    update: {},
    create: {
      name: 'Suporte Minimalista para Headset',
      slug: 'suporte-headset-minimal',
      description:
        'Suporte clean para fone de ouvido, perfeito para setups organizados.',
      basePrice: 39.9,
      categoryId: organizacao.id,
      productionLeadTimeDays: 2,
    },
  })

  // PRODUTO 3 — Organizador de Cabos
  await prisma.product.upsert({
    where: { slug: 'organizador-cabos-clips' },
    update: {},
    create: {
      name: 'Organizador de Cabos Clips 3D (Kit com 5)',
      slug: 'organizador-cabos-clips',
      description:
        'Clips impressos em 3D para manter cabos alinhados na mesa ou bancada.',
      basePrice: 19.9,
      categoryId: organizacao.id,
      productionLeadTimeDays: 1,
    },
  })

  // CONFIG PADRÃO DA LOJA
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

    // PRICE CONFIG DO VASO (exemplo real)
  const priceConfigData = {
    consumoGramas: 120,
    custoPorKg: 80,
    tempoImpressaoHoras: 3,
    custoHoraMaquina: 6,
    consumoKwhHora: 0.25,
    tarifaKwh: 0.9,
    tempoPosProcessoHoras: 0.5,
    custoHoraPos: 8,
    insumosPos: 2,
    taxaFalhaPercent: 10,
    embalagem: 4,
    impostosPercent: 8,
    margemLucroPercent: 40,
    descontoPercent: 0,
  }

  const existingConfig = await prisma.priceConfig.findFirst({
    where: {
      productId: vaso.id,
      variantId: null,
    },
  })

  if (existingConfig) {
    await prisma.priceConfig.update({
      where: { id: existingConfig.id },
      data: { config: priceConfigData },
    })
  } else {
    await prisma.priceConfig.create({
      data: {
        productId: vaso.id,
        variantId: null,
        config: priceConfigData,
      },
    })
  }

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
