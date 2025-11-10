// src/app/api/admin/pedidos/[id]/status/route.ts
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

// helper: pega params corretamente no App Router (params é uma Promise)
async function getParams(ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return { id }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    // Autorização simples via header
    const adminKey = req.headers.get("x-admin-key")
    if (!adminKey || adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await getParams(ctx)

    const body = await req.json()
    const status = String(body?.status ?? "").trim()

    // Valida contra os valores REAIS do enum compilado pelo Prisma
    const VALID = new Set<string>(Object.values(OrderStatus))
    if (!VALID.has(status)) {
      return NextResponse.json(
        {
          ok: false,
          message: `Status inválido. Use um de: ${Array.from(VALID).join(", ")}.`,
        },
        { status: 400 }
      )
    }

    // Busca o pedido atual para registrar "fromStatus" (opcional, mas útil)
    const current = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!current) {
      return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 })
    }

    // Atualiza o status
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    })

    // Log de histórico (opcional; ignora erros silenciosamente)
    try {
      await prisma.orderStatusLog.create({
        data: {
          orderId: id,
          fromStatus: current.status,
          toStatus: status as OrderStatus,
          note: "Atualizado manualmente via painel administrativo.",
        },
      })
    } catch {
      // se der erro no log, não falhar a resposta principal
    }

    return NextResponse.json({ ok: true, order: updated })
  } catch (err) {
    console.error("Erro ao atualizar status:", err)
    return NextResponse.json(
      { ok: false, message: "Erro ao atualizar status." },
      { status: 500 }
    )
  }
}
