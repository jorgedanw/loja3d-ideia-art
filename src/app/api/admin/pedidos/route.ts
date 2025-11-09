import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get("page") || 1)
    const perPage = Math.min(Number(searchParams.get("perPage") || 10), 100)
    const status = searchParams.get("status") || undefined
    const q = searchParams.get("q")?.trim() || undefined
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined
    const format = searchParams.get("format") || undefined

    const where: any = {}

    if (status) where.status = status
    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ]
    }
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from + "T00:00:00")
      if (to) where.createdAt.lte = new Date(to + "T23:59:59")
    }

    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    if (format === "csv") {
      const header = "orderNumber;customerName;customerEmail;status;total;createdAt\n"
      const body = rows
        .map(
          (r) =>
            `${r.orderNumber};${r.customerName};${r.customerEmail};${r.status};${r.total};${r.createdAt.toISOString()}`
        )
        .join("\n")
      return new NextResponse(header + body, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="pedidos.csv"`,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      rows,
      pagination: { page, perPage, total, pages: Math.ceil(total / perPage) },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: "Erro ao listar pedidos." }, { status: 500 })
  }
}
