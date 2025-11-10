import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ProductCard"

export const dynamic = "force-dynamic"

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    include: { images: true },
    orderBy: { name: "asc" },
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Catálogo de Produtos</h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={Number(p.basePrice)}
            image={p.images?.[0]?.url}
          />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-zinc-500 mt-6">Nenhum produto cadastrado ainda.</p>
      )}
    </section>
  )
}
