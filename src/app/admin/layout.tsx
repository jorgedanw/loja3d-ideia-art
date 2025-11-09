import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 py-3 px-6 flex justify-between items-center">
        <h1 className="font-semibold text-zinc-900">Painel Administrativo</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/produtos" className="text-zinc-700 hover:text-zinc-900">
            Produtos
          </Link>
          <Link href="/" className="text-zinc-500 hover:text-zinc-800">
            Voltar à loja
          </Link>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto py-10 px-4">{children}</main>
    </div>
  )
}
