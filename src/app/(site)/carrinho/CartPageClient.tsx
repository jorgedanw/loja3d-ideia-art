"use client"

import Link from "next/link"
import { useCart } from "@/components/cart/CartProvider"
import { Button } from "@/components/ui/Button"

export function CartPageClient() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-sm text-zinc-600">
        Seu carrinho está vazio.
        <div className="mt-3">
          <Link href="/produtos" className="text-blue-600 hover:underline">
            Ver produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-3"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-zinc-500">
                {item.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
                cada
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) =>
                  updateQty(item.id, Number(e.target.value) || 1)
                }
                className="w-16 border border-zinc-300 rounded-md px-1 py-0.5 text-sm text-center"
              />
              <span className="w-20 text-right text-sm font-medium">
                {(item.price * item.qty).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-zinc-600 mr-2">Subtotal:</span>
          <span className="font-semibold">
            {subtotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={clear}
          >
            Limpar
          </Button>
          <Link href="/checkout">
            <Button type="button">Finalizar compra</Button>
          </Link>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500">
        * Frete e prazo serão calculados na etapa de checkout.
      </p>
    </div>
  )
}
