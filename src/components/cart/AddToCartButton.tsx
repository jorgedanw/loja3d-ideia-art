"use client"

import { useState } from "react"
import { useCart } from "./CartProvider"
import { Button } from "@/components/ui/Button"

type Props = {
  productId: string
  name: string
  slug: string
  price: number
  image?: string | null
}

export function AddToCartButton({
  productId,
  name,
  slug,
  price,
  image,
}: Props) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    setLoading(true)
    addItem({ id: productId, name, slug, price, image }, 1)
    setLoading(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full"
    >
      {added ? "Adicionado!" : "Adicionar ao carrinho"}
    </Button>
  )
}
