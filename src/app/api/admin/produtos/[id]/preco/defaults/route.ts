import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function toNum(v: any, d = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const s = await prisma.setting.findFirst()
    if (!s) {
      return NextResponse.json({
        ok: true,
        defaults: {
          margemLucroPercent: 50,
          impostosPercent: 8,
          taxaFalhaPercent: 10,
          embalagem: 1,
        },
      })
    }

    const defaults = {
      margemLucroPercent: Number(s.defaultMarginPercent ?? 50),
      impostosPercent: Number(s.defaultTaxPercent ?? 8),
      taxaFalhaPercent: Number(s.defaultFailurePercent ?? 10),
      embalagem: Number(s.defaultPackagingCost ?? 1),
    }

    return NextResponse.json({ ok: true, defaults })
  } catch (err) {
    console.error("GET /api/admin/precos/defaults error:", err)
    return NextResponse.json({ ok: false, message: "Erro ao carregar defaults." }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const margemLucroPercent = toNum(body.margemLucroPercent, 50)
    const impostosPercent = toNum(body.impostosPercent, 8)
    const taxaFalhaPercent = toNum(body.taxaFalhaPercent, 10)
    const embalagem = toNum(body.embalagem, 1)

    // upsert do singleton Setting(id=1 por default do schema)
    const updated = await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        defaultMarginPercent: margemLucroPercent,
        defaultTaxPercent: impostosPercent,
        defaultFailurePercent: taxaFalhaPercent,
        defaultPackagingCost: embalagem,
      },
      create: {
        id: 1,
        storeName: "iDeia & Art",
        defaultMarginPercent: margemLucroPercent,
        defaultTaxPercent: impostosPercent,
        defaultFailurePercent: taxaFalhaPercent,
        defaultPackagingCost: embalagem,
      },
    })

    return NextResponse.json({ ok: true, defaults: updated })
  } catch (err) {
    console.error("PUT /api/admin/precos/defaults error:", err)
    return NextResponse.json({ ok: false, message: "Erro ao salvar defaults." }, { status: 500 })
  }
}
