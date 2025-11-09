import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

async function getParams(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return { id }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await getParams(ctx)

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, order })
  } catch (err) {
    console.error("Erro ao buscar pedido:", err)
    return NextResponse.json({ ok: false, message: "Erro ao buscar pedido." }, { status: 500 })
  }
}
