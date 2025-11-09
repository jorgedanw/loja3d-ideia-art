import { CheckoutClient } from "./CheckoutClient"

export default function CheckoutPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Finalizar compra</h1>
      <CheckoutClient />
    </section>
  )
}
