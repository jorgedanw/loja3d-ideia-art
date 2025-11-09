import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  image?: string
}

export function ProductCard({ id, name, slug, price, image }: ProductCardProps) {
  return (
    <div
      key={id}
      className={cn(
        "bg-white rounded-2xl shadow-sm hover:shadow-md transition p-3 flex flex-col"
      )}
    >
      <Link href={`/produto/${slug}`}>
        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100 mb-3">
          <Image
            src={image || "/images/logo-ideia-art-selo.png"}
            alt={name}
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
        <h3 className="font-medium text-zinc-900 line-clamp-2">{name}</h3>
        <p className="text-sm text-zinc-600 mt-1">
          {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </Link>

      {/* Botão também com link */}
      <Link href={`/produto/${slug}`} className="mt-3">
        <Button className="w-full">Ver detalhes</Button>
      </Link>
    </div>
  )
}
