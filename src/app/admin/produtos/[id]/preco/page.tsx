"use client"

import { use, useEffect, useMemo, useState } from "react"
import PriceForm, { Config } from "./PriceForm"

type LoadResp = {
  ok: boolean
  config: Config | null
  defaults: Partial<Config> | null
  message?: string
}

export default function PrecoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ Next 16: params é Promise → use(params)
  const { id } = use(params)

  const adminKey = useMemo(() => process.env.NEXT_PUBLIC_ADMIN_KEY || "", [])
  const [config, setConfig] = useState<Config | null>(null)
  const [defaults, setDefaults] = useState<Partial<Config> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/produtos/${id}/preco`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      })
      const json: LoadResp = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message || "Falha ao carregar")
      setConfig(json.config)
      setDefaults(json.defaults)
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // handler chamado pelo PriceForm
  async function handleSave(payload: {
    config: Config
    applyToProduct: boolean
    newBasePrice: number
  }) {
    const res = await fetch(`/api/admin/produtos/${id}/preco`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      throw new Error(json.message || "Erro ao salvar configuração.")
    }
    // recarrega para refletir mudanças
    await load()
  }

  if (loading) return <div className="p-4 text-zinc-500">Carregando…</div>

  if (error) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded bg-zinc-900 text-white text-sm"
        >
          Recarregar
        </button>
      </section>
    )
  }

  if (!defaults) return <div className="p-4">Padrões globais não encontrados.</div>

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Calculadora de Preço</h1>

      <PriceForm
        initial={config}
        defaults={defaults}
        onSave={handleSave}
      />
    </section>
  )
}
