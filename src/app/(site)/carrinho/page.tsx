import { CartPageClient } from "./CartPageClient"

export default function CarrinhoPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Carrinho</h1>
      <CartPageClient />
    </section>
  )
}
