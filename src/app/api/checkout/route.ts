import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { CartItem } from "@/lib/cart-types"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      email,
      phone,
      cep,
      street,
      number,
      city,
      state,
      items,
      subtotal,
    } = body as {
      name: string
      email: string
      phone?: string
      cep?: string
      street?: string
      number?: string
      city?: string
      state?: string
      items: CartItem[]
      subtotal: number
    }

    if (!items || !items.length) {
      return NextResponse.json(
        { ok: false, message: "Carrinho vazio." },
        { status: 400 }
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, message: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      )
    }

    // frete e pagamento serão tratados nos próximos módulos
    const shippingCost = 0
    const total = subtotal + shippingCost

    // Cria o pedido
    const order = await prisma.order.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        shippingZip: cep || null,
        shippingAddress: street || null,
        shippingNumber: number || null,
        shippingCity: city || null,
        shippingState: state || null,
        subtotal,
        shippingCost,
        total,
        status: "PENDING", // status inicial
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            unitPrice: item.price,
          })),
        },
      },
    })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.id, // por enquanto usamos o id, depois podemos gerar um código amigável
      message: "Pedido criado com sucesso. Vamos processar o pagamento.",
    })
  } catch (error) {
    console.error("Erro no checkout:", error)
    return NextResponse.json(
      {
        ok: false,
        message: "Erro ao criar pedido. Tente novamente em instantes.",
      },
      { status: 500 }
    )
  }
}
