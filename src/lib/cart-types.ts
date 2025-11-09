export type CartItem = {
  id: string          // productId
  name: string
  slug: string
  image?: string | null
  price: number       // preço unitário no momento da adição
  qty: number
}

export type CartState = {
  items: CartItem[]
}
