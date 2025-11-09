import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminProdutosPage() {
  const produtos = await prisma.product.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Produtos</h2>

      <table className="w-full text-sm border-collapse border border-zinc-200">
        <thead className="bg-zinc-100 text-zinc-700">
          <tr>
            <th className="border p-2 text-left">Nome</th>
            <th className="border p-2 text-left">Preço base (R$)</th>
            <th className="border p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id} className="hover:bg-zinc-50">
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">
                {Number(p.basePrice).toFixed(2)}
              </td>
              <td className="border p-2">
                <Link
                  href={`/admin/produtos/${p.id}/preco`}
                  className="text-blue-600 hover:underline"
                >
                  Editar preço
                </Link>
              </td>
            </tr>
          ))}
          {produtos.length === 0 && (
            <tr>
              <td className="border p-2 text-zinc-500" colSpan={3}>
                Nenhum produto cadastrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
