import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iDeia & Art - Loja 3D',
  description: 'Loja online de produtos personalizados em impressão 3D da iDeia & Art.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="w-full border-b bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 py-3 px-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo-ideia-art-selo.png"
                  alt="iDeia & Art selo"
                  className="h-8 w-8 rounded-full"
                />
                <img
                  src="/images/logo-ideia-art.png"
                  alt="iDeia & Art"
                  className="h-8"
                />
              </div>
              <nav className="flex items-center gap-4 text-sm">
                <a href="/" className="hover:text-zinc-800">Início</a>
                <a href="/produtos" className="hover:text-zinc-800">Produtos</a>
                <a href="/contato" className="hover:text-zinc-800">Contato</a>
              </nav>
            </div>
          </header>

          {/* Conteúdo */}
          <main className="flex-1">
            {children}
          </main>

          {/* Rodapé */}
          <footer className="border-t mt-8">
            <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-zinc-500 flex items-center justify-between">
              <span>© {new Date().getFullYear()} iDeia & Art. Todos os direitos reservados.</span>
              <span className="hidden sm:inline">Produzido com Next.js & Tailwind.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
