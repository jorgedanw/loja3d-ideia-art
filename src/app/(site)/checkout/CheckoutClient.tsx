"use client"

import { useState } from "react"
import { useCart } from "@/components/cart/CartProvider"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export function CheckoutClient() {
  const { items, subtotal, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  if (!items.length && !orderNumber) {
    return (
      <div className="text-sm text-zinc-600">
        Seu carrinho está vazio.
        <div className="mt-3">
          <Link
            href="/produtos"
            className="text-blue-600 hover:underline"
          >
            Voltar para o catálogo
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!items.length) return

    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      cep: String(formData.get("cep") || ""),
      street: String(formData.get("street") || ""),
      number: String(formData.get("number") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      items,
      subtotal,
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Erro ao finalizar compra.")
      }

      setOrderNumber(json.orderNumber)
      setMessage(
        "Pedido criado com sucesso! Em breve você receberá instruções de pagamento por e-mail."
      )
      clear()
    } catch (err: any) {
      console.error(err)
      setMessage(
        err.message ||
          "Não foi possível finalizar o pedido. Tente novamente."
      )
    } finally {
      setLoading(false)
    }
  }

  if (orderNumber) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-emerald-600 font-medium">
          {message}
        </p>
        <p>
          Número do pedido:{" "}
          <strong>{orderNumber}</strong>
        </p>
        <p className="text-zinc-600">
          Você pode acompanhar o status do seu pedido pelo contato com a
          iDeia & Art. (No próximo módulo vamos expor isso na área do cliente.)
        </p>
        <Link href="/produtos">
          <Button className="mt-3">Voltar para a loja</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-[1.6fr,1.4fr] gap-8">
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <h2 className="font-semibold mb-1">Dados do cliente</h2>

        <div>
          <label className="block text-xs text-zinc-600 mb-1">
            Nome completo *
          </label>
          <input
            name="name"
            required
            className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-600 mb-1">
            E-mail *
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-600 mb-1">
            WhatsApp / Telefone
          </label>
          <input
            name="phone"
            className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
          />
        </div>

        <h2 className="font-semibold mt-4 mb-1">Endereço de entrega</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              CEP
            </label>
            <input
              name="cep"
              className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Número
            </label>
            <input
              name="number"
              className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-600 mb-1">
            Rua / Logradouro
          </label>
          <input
            name="street"
            className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Cidade
            </label>
            <input
              name="city"
              className="w-full border border-zinc-300 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              UF
            </label>
            <input
              name="state"
              maxLength={2}
              className="w-full border border-zinc-300 rounded-lg px-2 py-1.5 uppercase"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || !items.length}
            className="w-full md:w-auto"
          >
            {loading
              ? "Finalizando..."
              : "Confirmar pedido (sem pagamento ainda)"}
          </Button>
        </div>

        {message && (
          <p className="text-xs mt-2 text-red-600">
            {message}
          </p>
        )}
      </form>

      {/* Resumo */}
      <aside className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm">
        <h2 className="font-semibold mb-3">
          Resumo do pedido
        </h2>
        <ul className="space-y-2 mb-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-2 text-xs"
            >
              <span>
                {item.qty}x {item.name}
              </span>
              <span>
                {(item.price * item.qty).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal</span>
          <span>
            {subtotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>Frete</span>
          <span>Será calculado</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total estimado</span>
          <span>
            {subtotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <p className="mt-2 text-[10px] text-zinc-500">
          Pagamento e frete serão integrados nos próximos passos
          (Mercado Pago + cálculo por CEP).
        </p>
      </aside>
    </div>
  )
}
