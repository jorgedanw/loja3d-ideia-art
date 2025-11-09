import { prisma } from "@/lib/prisma"

export default async function PrintPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) return <div>Pedido não encontrado.</div>

  return (
    <html>
      <head>
        <title>Pedido {order.orderNumber}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; padding: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 13px; }
          th { background: #f9fafb; text-align: left; }
          @media print { .no-print { display: none; } }
        `}</style>
      </head>
      <body>
        <button className="no-print" onClick={() => {}} style={{marginBottom: 12}} onMouseDown={() => window.print()}>Imprimir</button>
        <h1>Pedido {order.orderNumber}</h1>
        <p>Criado em {order.createdAt.toLocaleString("pt-BR")}</p>

        <h3>Cliente</h3>
        <p>{order.customerName} — {order.customerEmail}</p>

        <h3>Itens</h3>
        <table>
          <thead><tr><th>SKU</th><th>Produto</th><th>Qtde</th><th>Unit.</th><th>Total</th></tr></thead>
          <tbody>
            {order.items.map(i => (
              <tr key={i.id}>
                <td>{i.sku}</td>
                <td>{i.name}</td>
                <td>{i.quantity}</td>
                <td>R$ {Number(i.unitPrice).toFixed(2)}</td>
                <td>R$ {Number(i.total ?? i.unitPrice * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{marginTop: 12}}>
          Subtotal: R$ {Number(order.subtotal).toFixed(2)} — Frete: R$ {Number(order.shippingCost).toFixed(2)} —{" "}
          <strong>Total: R$ {Number(order.total).toFixed(2)}</strong>
        </p>
      </body>
    </html>
  )
}
