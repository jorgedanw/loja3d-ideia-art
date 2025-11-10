import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

export const dynamic = "force-dynamic"

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      priceConfigs: true,
    },
  })

  if (!product) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-zinc-600">Produto não encontrado.</p>
        <Link href="/produtos">
          <Button className="mt-4" variant="outline">
            Voltar para o catálogo
          </Button>
        </Link>
      </section>
    )
  }

  const image = product.images[0]?.url || "/images/logo-ideia-art-selo.png"

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid gap-10 md:grid-cols-[1.4fr,1.6fr] items-start">
        {/* Imagem */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-center">
          <div className="w-full max-w-[380px] rounded-xl overflow-hidden bg-zinc-100">
            <Image
              src={image}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Informações */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            {product.category?.name || "iDeia & Art"}
          </p>

          <h1 className="text-3xl font-semibold mt-2 mb-3">
            {product.name}
          </h1>

          <p className="text-2xl font-semibold text-zinc-900 mb-2">
            {Number(product.basePrice).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          {product.productionLeadTimeDays && (
            <p className="text-sm text-zinc-600 mb-1">
              Prazo de produção:{" "}
              <strong>
                {product.productionLeadTimeDays} dia(s) úteis
              </strong>
            </p>
          )}

          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Ações */}
          <div className="flex gap-3 mb-2">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={Number(product.basePrice)}
              image={image}
            />
            <Link href="/produtos">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>

          <p className="text-[10px] text-zinc-500 mt-1">
            O preço exibido já considera insumos, operação e margem
            da iDeia & Art.
          </p>
        </div>
      </div>
    </section>
  )
}
