import { prisma } from "@/lib/prisma"
import { type PriceConfigInput } from "@/lib/price-calculator"
import { PriceForm } from "./PriceForm"

export const dynamic = "force-dynamic"

export default async function EditarPrecoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const produto = await prisma.product.findUnique({
    where: { id },
    include: { priceConfigs: true },
  })

  if (!produto) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Produto não encontrado
        </h2>
        <p className="text-sm text-zinc-600">
          Verifique o endereço ou volte para a lista de produtos.
        </p>
      </section>
    )
  }

  const initialConfig =
    (produto.priceConfigs[0]?.config as Partial<PriceConfigInput>) || {}

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">
        Editar preço — {produto.name}
      </h2>

      <PriceForm
        productId={produto.id}
        initialConfig={initialConfig}
      />
    </section>
  )
}
