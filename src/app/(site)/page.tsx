export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[2fr,1.2fr] items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-4">
            iDeia & Art — Impressão 3D com propósito e personalidade
          </h1>
          <p className="text-zinc-600 mb-4">
            Produtos funcionais, decorativos e personalizados criados com impressão 3D.
            Uma experiência simples, transparente e pensada para o dia a dia.
          </p>
          <ul className="text-sm text-zinc-700 space-y-1 mb-6">
            <li>• Catálogo organizado por categorias, cores e materiais</li>
            <li>• Cálculo de preço transparente por produto</li>
            <li>• Pagamentos via PIX e cartão (Brasil)</li>
            <li>• Frete por CEP com prazo de produção + envio</li>
          </ul>
          <div className="flex gap-3">
            <a
              href="/produtos"
              className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm hover:bg-zinc-800"
            >
              Ver produtos
            </a>
            <a
              href="/contato"
              className="px-4 py-2 rounded-full border text-sm hover:bg-zinc-100"
            >
              Falar com a iDeia & Art
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <img
            src="/images/logo-ideia-art.png"
            alt="Logo iDeia & Art"
            className="w-40 md:w-52"
          />
          <img
            src="/images/logo-ideia-art-selo.png"
            alt="Selo iDeia & Art"
            className="w-20 h-20 rounded-full shadow-sm"
          />
          <p className="text-xs text-zinc-500 text-center">
            O selo 500x500 será usado em cards de produto, selos de confiança e páginas
            internas para reforçar a identidade visual.
          </p>
        </div>
      </div>
    </section>
  )
}
