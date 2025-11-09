import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import Link from "next/link"
import { revalidatePath } from "next/cache"

async function updateStatus(orderId: string, formData: FormData) {
  "use server"
  const status = formData.get("status") as OrderStatus
  if (!status) return
  await prisma.order.update({ where: { id: orderId }, data: { status } })
  revalidatePath(`/admin/pedidos/${orderId}`)
  revalidatePath(`/admin/pedidos`)
}

export default async function PedidoDetalhe({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          total: true,
        },
      },
    },
  })

  if (!order) {
    return <p>Pedido não encontrado.</p>
  }

  const statuses = Object.values(OrderStatus)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Pedido <span className="font-mono">{order.orderNumber}</span>
        </h1>
        <Link
          href="/admin/pedidos"
          className="rounded-md border px-3 py-1 text-sm"
        >
          Voltar
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Cliente</h3>
          <p>{order.customerName}</p>
          <p className="text-zinc-600">{order.customerEmail}</p>
          {order.customerPhone && <p>{order.customerPhone}</p>}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Entrega</h3>
          <p>{order.shippingAddress} {order.shippingNumber}</p>
          <p>{order.shippingCity} - {order.shippingState}</p>
          <p>CEP: {order.shippingPostalCode}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Totais</h3>
          <p>Subtotal: <strong>R$ {Number(order.subtotal).toFixed(2)}</strong></p>
          <p>Frete: <strong>R$ {Number(order.shippingCost).toFixed(2)}</strong></p>
          <p>Total: <strong>R$ {Number(order.total).toFixed(2)}</strong></p>
        </div>
      </div>

      {/* Itens */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Qtd</th>
              <th className="p-3">Unitário</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3 font-mono">{it.sku}</td>
                <td className="p-3">{it.quantity}</td>
                <td className="p-3">R$ {Number(it.unitPrice).toFixed(2)}</td>
                <td className="p-3">R$ {Number(it.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status */}
      <form action={updateStatus.bind(null, order.id)} className="flex items-center gap-3">
        <label htmlFor="status" className="text-sm text-zinc-600">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={order.status}
          className="rounded-md border px-3 py-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Atualizar
        </button>
      </form>
    </section>
  )
}
