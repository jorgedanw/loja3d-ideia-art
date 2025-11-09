import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularPreco, type PriceConfigInput } from "@/lib/price-calculator"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()

    const cfg: PriceConfigInput = {
      consumoGramas: Number(data.consumoGramas) || 0,
      custoPorKg: Number(data.custoPorKg) || 0,
      tempoImpressaoHoras: Number(data.tempoImpressaoHoras) || 0,
      custoHoraMaquina: Number(data.custoHoraMaquina) || 0,
      consumoKwhHora: Number(data.consumoKwhHora) || 0,
      tarifaKwh: Number(data.tarifaKwh) || 0,
      tempoPosProcessoHoras: Number(data.tempoPosProcessoHoras) || 0,
      custoHoraPos: Number(data.custoHoraPos) || 0,
      insumosPos: Number(data.insumosPos) || 0,
      taxaFalhaPercent: Number(data.taxaFalhaPercent) || 0,
      embalagem: Number(data.embalagem) || 0,
      impostosPercent: Number(data.impostosPercent) || 0,
      margemLucroPercent: Number(data.margemLucroPercent) || 0,
      descontoPercent: Number(data.descontoPercent) || 0,
    }

    const produto = await prisma.product.findUnique({ where: { id } })
    if (!produto) {
      return NextResponse.json(
        { ok: false, message: "Produto não encontrado" },
        { status: 404 }
      )
    }

    // Cria ou atualiza a PriceConfig (productId + variantId null)
    const existing = await prisma.priceConfig.findFirst({
      where: { productId: id, variantId: null },
    })

    if (existing) {
      await prisma.priceConfig.update({
        where: { id: existing.id },
        data: { config: cfg },
      })
    } else {
      await prisma.priceConfig.create({
        data: {
          productId: id,
          variantId: null,
          config: cfg,
        },
      })
    }

    // Calcula o preço final a partir da config
    const calculo = calcularPreco(cfg)

    // Atualiza o preço exibido na loja (basePrice) com o PreçoFinal calculado
    await prisma.product.update({
      where: { id },
      data: {
        basePrice: Number(calculo.precoFinal.toFixed(2)),
      },
    })

    return NextResponse.json({
      ok: true,
      message: "Configuração de preço salva e preço do produto atualizado.",
      calculo,
    })
  } catch (error) {
    console.error("Erro ao salvar preço:", error)
    return NextResponse.json(
      {
        ok: false,
        message:
          "Erro ao salvar configuração de preço. Verifique os dados e tente novamente.",
      },
      { status: 500 }
    )
  }
}
