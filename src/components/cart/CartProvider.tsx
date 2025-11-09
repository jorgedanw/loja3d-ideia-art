"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { CartItem, CartState } from "@/lib/cart-types"

const STORAGE_KEY = "ideiaart_cart_v1"

type CartContextValue = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] })

  // Carrega do localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.items)) {
          setState({ items: parsed.items })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Salva no localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const addItem = (item: Omit<CartItem, "qty">, qty: number = 1) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.id === item.id)
      if (existing) {
        return {
          items: prev.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i
          ),
        }
      }
      return {
        items: [...prev.items, { ...item, qty }],
      }
    })
  }

  const removeItem = (productId: string) => {
    setState((prev) => ({
      items: prev.items.filter((i) => i.id !== productId),
    }))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId)
    setState((prev) => ({
      items: prev.items.map((i) =>
        i.id === productId ? { ...i, qty } : i
      ),
    }))
  }

  const clear = () => setState({ items: [] })

  const subtotal = state.items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  )

  const value: CartContextValue = {
    items: state.items,
    addItem,
    removeItem,
    updateQty,
    clear,
    subtotal,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de CartProvider")
  }
  return ctx
}
