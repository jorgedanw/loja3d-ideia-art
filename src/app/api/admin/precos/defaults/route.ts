import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Atualiza/Cria os padrões globais na tabela Setting (linha única id=1)
export async function PUT(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const data = {
      defaultMarginPercent: Number(body?.margemLucroPercent ?? 0),
      defaultTaxPercent: Number(body?.impostosPercent ?? 0),
      defaultFailurePercent: Number(body?.taxaFalhaPercent ?? 0),
      defaultPackagingCost: Number(body?.embalagem ?? 0),
    }

    // Se não existir a linha 1, cria; senão, atualiza
    await prisma.setting.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Erro ao salvar defaults:", err)
    return NextResponse.json({ ok: false, message: "Erro ao salvar padrões." }, { status: 500 })
  }
}
