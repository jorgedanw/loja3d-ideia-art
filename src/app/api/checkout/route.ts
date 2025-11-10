import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client" // ✅ usar enum gerado pelo Prisma

const ORDER_STATUS_MAP = OrderStatus as Record<string, OrderStatus>
const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS_MAP) as OrderStatus[]

if (ORDER_STATUS_VALUES.length === 0) {
  throw new Error("Nenhum status configurado no enum OrderStatus.")
}

// Fallback seguro: usa PENDING se existir; senão, o primeiro valor do enum
const DEFAULT_STATUS: OrderStatus =
  ORDER_STATUS_MAP.PENDING ?? ORDER_STATUS_VALUES[0]
// Gera número do pedido
function generateOrderNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `IA-${y}${m}${d}-${rand}`
}

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  sku?: string
}

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

    // validações básicas
    if (!items?.length) {
      return NextResponse.json(
        { ok: false, message: "Carrinho vazio." },
        { status: 400 },
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, message: "Nome e e-mail são obrigatórios." },
        { status: 400 },
      )
    }

    const normalizedStreet = street?.trim()
    const normalizedNumber = number?.trim()
    const normalizedCity = city?.trim()
    const normalizedState = state?.trim()
    const postalCode = (cep || "").replace(/\D/g, "")

    if (!postalCode || !normalizedStreet || !normalizedNumber || !normalizedCity || !normalizedState) {
      return NextResponse.json(
        {
          ok: false,
          message: "Endereço incompleto. Informe CEP, rua, número, cidade e estado.",
        },
        { status: 400 },
      )
    }

    const shippingCost = 0
    const total = Number(subtotal || 0) + Number(shippingCost || 0)
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,

        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,

        shippingPostalCode: postalCode, // só dígitos
        shippingAddress: normalizedStreet,
        shippingNumber: normalizedNumber,
        shippingCity: normalizedCity,
        shippingState: normalizedState,

        subtotal: Number(subtotal || 0),
        shippingCost: Number(shippingCost || 0),
        total: Number(total || 0),

        status: DEFAULT_STATUS, // ✅ enum sempre válido

        items: {
          create: items.map((item, index) => {
            const unitPrice = Number(item.price) || 0
            const quantity = Number(item.qty) || 0

            return {
              productId: item.id,
              quantity,
              unitPrice,
              total: unitPrice * quantity, // requerido no seu schema
              name: item.name || `Produto ${index + 1}`,
              sku: item.sku || `SKU-${item.id}-${index + 1}`,
            }
          }),
        },
      },
    })

    return NextResponse.json(
      {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: "Pedido criado com sucesso.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro no checkout:", error)
    return NextResponse.json(
      { ok: false, message: "Erro ao criar pedido. Tente novamente em instantes." },
      { status: 500 },
    )
  }
}
