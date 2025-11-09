import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// helper: pega params corretamente no App Router
async function getParams(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return { id }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    // auth bem simples por header
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await getParams(ctx)
    const body = await req.json()
    const status = String(body?.status || "").trim()

    // set com valores *reais* do enum compilado
    const VALID = new Set<string>(Object.values(Prisma.OrderStatus))
    if (!VALID.has(status)) {
      return NextResponse.json(
        {
          ok: false,
          message: `Status inválido. Use um de: ${Array.from(VALID).join(", ")}.`,
        },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as Prisma.OrderStatus }, // <- cast seguro após validar
    })

    return NextResponse.json({ ok: true, order: updated })
  } catch (err) {
    console.error("Erro ao atualizar status:", err)
    return NextResponse.json(
      { ok: false, message: "Erro ao atualizar status." },
      { status: 500 }
    )
  }
}
