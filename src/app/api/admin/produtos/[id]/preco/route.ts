import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Fallbacks caso não haja Setting
const FALLBACK = {
  margemLucroPercent: 50,
  impostosPercent: 8,
  taxaFalhaPercent: 10,
  embalagem: 1,
}

type Config = {
  consumoGramas: number
  custoPorKg: number
  tempoImpressaoHoras: number
  custoHoraMaquina: number
  consumoKwhHora: number
  tarifaKwh: number
  tempoPosProcessoHoras: number
  custoHoraPos: number
  insumosPos: number
  taxaFalhaPercent: number
  embalagem: number
  impostosPercent: number
  margemLucroPercent: number
  descontoPercent?: number | null
}

// Helpers numéricos
const num = (v: any) => (typeof v === "number" ? v : Number(v) || 0)
const numU = (v: any) =>
  v === undefined || v === null || v === "" ? undefined : Number(v) || 0

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await ctx.params
    const body = await req.json()

    const config: Config = {
      consumoGramas: num(body?.config?.consumoGramas),
      custoPorKg: num(body?.config?.custoPorKg),
      tempoImpressaoHoras: num(body?.config?.tempoImpressaoHoras),
      custoHoraMaquina: num(body?.config?.custoHoraMaquina),
      consumoKwhHora: num(body?.config?.consumoKwhHora),
      tarifaKwh: num(body?.config?.tarifaKwh),
      tempoPosProcessoHoras: num(body?.config?.tempoPosProcessoHoras),
      custoHoraPos: num(body?.config?.custoHoraPos),
      insumosPos: num(body?.config?.insumosPos),
      taxaFalhaPercent: num(body?.config?.taxaFalhaPercent),
      embalagem: num(body?.config?.embalagem),
      impostosPercent: num(body?.config?.impostosPercent),
      margemLucroPercent: num(body?.config?.margemLucroPercent),
      descontoPercent: numU(body?.config?.descontoPercent),
    }

    const applyToProduct = !!body?.applyToProduct
    const newBasePrice = Number(body?.newBasePrice) || 0

    // Garantir que o produto existe
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ ok: false, message: "Produto não encontrado." }, { status: 404 })
    }

    // NÃO usar upsert com composite unique contendo null
    // → usar findFirst + create/update
    const existing = await prisma.priceConfig.findFirst({
      where: { productId: id, variantId: null },
    })

    if (!existing) {
      await prisma.priceConfig.create({
        data: {
          productId: id,
          config,
        },
      })
    } else {
      await prisma.priceConfig.update({
        where: { id: existing.id },
        data: { config },
      })
    }

    // opcionalmente atualiza o preço base do produto
    if (applyToProduct) {
      await prisma.product.update({
        where: { id },
        data: { basePrice: newBasePrice },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Erro ao salvar configuração de preço:", err)
    return NextResponse.json(
      { ok: false, message: "Erro ao salvar configuração." },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await ctx.params

    // carrega configuração do produto (sem variant)
    const cfg = await prisma.priceConfig.findFirst({
      where: { productId: id, variantId: null },
    })

    // carrega padrões globais
    const set = await prisma.setting.findUnique({ where: { id: 1 } })

    const defaults = {
      margemLucroPercent: Number(set?.defaultMarginPercent ?? FALLBACK.margemLucroPercent),
      impostosPercent: Number(set?.defaultTaxPercent ?? FALLBACK.impostosPercent),
      taxaFalhaPercent: Number(set?.defaultFailurePercent ?? FALLBACK.taxaFalhaPercent),
      embalagem: Number(set?.defaultPackagingCost ?? FALLBACK.embalagem),
    }

    return NextResponse.json({
      ok: true,
      config: (cfg?.config as Config) ?? null,
      defaults,
    })
  } catch (err) {
    console.error("GET /preco error:", err)
    return NextResponse.json({ ok: false, message: "Erro ao carregar." }, { status: 500 })
  }
}
