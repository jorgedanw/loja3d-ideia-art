"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type OrderItem = {
  id: string
  name: string | null
  sku: string | null
  quantity: number
  unitPrice: number
  total: number | null
}

type OrderDTO = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingPostalCode: string | null
  shippingAddress: string | null
  shippingNumber: string | null
  shippingCity: string | null
  shippingState: string | null
  subtotal: number
  shippingCost: number
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

// value == o que o Prisma aceita hoje
const STATUS_OPTIONS = [
  { value: "PENDING",          label: "Pendente" },
  { value: "PENDING_PAYMENT",  label: "Aguard. pagamento" },
  { value: "PAID",             label: "Pago" },
  { value: "IN_PRODUCTION",    label: "Em produção" },
  { value: "SHIPPED",          label: "Enviado" },
  { value: "COMPLETED",        label: "Entregue" }, // importante!
  { value: "CANCELLED",        label: "Cancelado" }, // grafia do enum
] as const

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map(o => [o.value, o.label])
)

function brl(v: number) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

export default function PedidoAdminDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [data, setData] = useState<OrderDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Em client components, NEXT_PUBLIC_* é embutido no bundle
  const adminKey = useMemo(() => process.env.NEXT_PUBLIC_ADMIN_KEY || "", [])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message || "Erro ao carregar")
      setData(json.order as OrderDTO)
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar o pedido.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function updateStatus(next: string) {
    if (!data || saving) return
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/admin/pedidos/${id}/status`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ status: next }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message || "Erro ao atualizar status.")
      await load()
    } catch (e: any) {
      setError(e?.message ?? "Falha ao atualizar o status.")
    } finally {
      setSaving(false)
    }
  }

  async function copyOrderNumber() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.orderNumber)
      alert("Número do pedido copiado!")
    } catch {
      alert("Não foi possível copiar.")
    }
  }

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-zinc-500">Carregando pedido…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <button onClick={() => router.back()} className="text-sm text-zinc-600 hover:underline">
          ← Voltar
        </button>
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm bg-zinc-900 text-white hover:opacity-90"
        >
          Recarregar
        </button>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-zinc-500">Pedido não encontrado.</p>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-zinc-600 hover:underline">
          ← Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyOrderNumber}
            className="text-xs border rounded-lg px-2 py-1 hover:bg-zinc-50"
            title="Copiar número do pedido"
          >
            Copiar Nº
          </button>
          <button
            onClick={load}
            className="text-xs border rounded-lg px-2 py-1 hover:bg-zinc-50"
            title="Recarregar"
          >
            Recarregar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-2xl font-semibold">Pedido {data.orderNumber}</h1>
        <span className="text-sm px-2 py-0.5 rounded-full bg-zinc-100">
          {STATUS_LABEL[data.status] ?? data.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 space-y-2 text-sm">
          <h2 className="font-semibold mb-2">Cliente</h2>
          <p>{data.customerName}</p>
          <p>{data.customerEmail}</p>
          {data.customerPhone && <p>{data.customerPhone}</p>}
          <h3 className="font-semibold mt-4">Entrega</h3>
          <p>
            {data.shippingAddress} {data.shippingNumber ? `— ${data.shippingNumber}` : ""} —{" "}
            {data.shippingCity}/{data.shippingState} — {data.shippingPostalCode}
          </p>
        </div>

        <div className="border rounded-xl p-4 text-sm">
          <h2 className="font-semibold mb-2">Totais</h2>
          <p>Subtotal: {brl(data.subtotal)}</p>
          <p>Frete: {brl(data.shippingCost)}</p>
          <p className="font-semibold">Total: {brl(data.total)}</p>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Qtde</th>
              <th className="text-left p-3">Unit.</th>
              <th className="text-left p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.sku}</td>
                <td className="p-3">{it.name}</td>
                <td className="p-3">{it.quantity}</td>
                <td className="p-3">{brl(it.unitPrice)}</td>
                <td className="p-3">{brl(it.total ?? it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-zinc-600">Alterar status:</span>
        <select
          className="border rounded-lg px-2 py-1 text-sm"
          value={data.status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={saving}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {saving && <span className="text-xs text-zinc-500">Salvando…</span>}
      </div>
    </section>
  )
}
