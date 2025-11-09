import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      customerName: true,
    },
  })

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Pedidos</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Criado em</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-mono">{o.orderNumber}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">R$ {Number(o.total).toFixed(2)}</td>
                <td className="p-3">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="rounded-md bg-black px-3 py-1 text-white"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-500">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
