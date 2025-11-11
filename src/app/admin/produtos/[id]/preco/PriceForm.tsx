"use client"

import { useMemo, useState } from "react"

export type Config = {
  consumoGramas: number
  custoPorKg: number
  tempoImpressaoHoras: number
  custoHoraMaquina: number
  consumoKwhHora: number
  tarifaKwh: number
  tempoPosProcessoHoras: number
  custoHoraPos: number
  insumosPos: number
  taxaFalhaPercent: number
  embalagem: number
  impostosPercent: number
  margemLucroPercent: number
  descontoPercent?: number | undefined
}

type Props = {
  initial?: Partial<Config> | null
  defaults?: Partial<Config> | null
  onSave: (payload: {
    config: Config
    applyToProduct: boolean
    newBasePrice: number
  }) => Promise<void>
}

const FALLBACK: Config = {
  consumoGramas: 0,
  custoPorKg: 80,
  tempoImpressaoHoras: 0,
  custoHoraMaquina: 6,
  consumoKwhHora: 0.25,
  tarifaKwh: 0.9,
  tempoPosProcessoHoras: 0.5,
  custoHoraPos: 1,
  insumosPos: 1,
  taxaFalhaPercent: 10,
  embalagem: 1,
  impostosPercent: 8,
  margemLucroPercent: 50,
  descontoPercent: undefined,
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function PriceForm({ initial, defaults, onSave }: Props) {
  // Mescla: FALLBACK → defaults globais → valores salvos do produto
  const merged = useMemo<Config>(() => {
    return { ...FALLBACK, ...(defaults ?? {}), ...(initial ?? {}) } as Config
  }, [initial, defaults])

  const [form, setForm] = useState<Config>(merged)
  const [applyToProduct, setApplyToProduct] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDefaults, setSavingDefaults] = useState(false)

  // simulação
  const sim = useMemo(() => {
    const g = form.consumoGramas || 0
    const kg = form.custoPorKg || 0
    const hr = form.tempoImpressaoHoras || 0
    const hrPos = form.tempoPosProcessoHoras || 0

    const custoMaterial = (g / 1000) * kg
    const custoMaquina = hr * (form.custoHoraMaquina || 0)
    const custoEnergia = (form.consumoKwhHora || 0) * (form.tarifaKwh || 0) * hr
    const custoPos = hrPos * (form.custoHoraPos || 0)
    const insumosPos = form.insumosPos || 0
    const falha =
      (custoMaterial + custoMaquina + custoEnergia + custoPos + insumosPos) *
      ((form.taxaFalhaPercent || 0) / 100)
    const embalagem = form.embalagem || 0

    const custoUnitario =
      custoMaterial + custoMaquina + custoEnergia + custoPos + insumosPos + falha + embalagem

    const impostos = custoUnitario * ((form.impostosPercent || 0) / 100)
    const margem = (custoUnitario + impostos) * ((form.margemLucroPercent || 0) / 100)

    let preco = custoUnitario + impostos + margem
    if (form.descontoPercent && form.descontoPercent > 0) {
      preco = preco * (1 - form.descontoPercent / 100)
    }

    return {
      custoUnitario,
      precoSugerido: preco,
    }
  }, [form])

  function set<K extends keyof Config>(k: K, v: any) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function handleSave() {
    try {
      setSaving(true)
      await onSave({
        config: form,
        applyToProduct,
        newBasePrice: sim.precoSugerido,
      })
      alert("Configuração salva com sucesso!")
    } catch (e: any) {
      alert(e?.message ?? "Erro ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDefaults() {
    try {
      setSavingDefaults(true)
      // Só os campos que existem no schema Setting:
      const payload = {
        margemLucroPercent: form.margemLucroPercent,
        impostosPercent: form.impostosPercent,
        taxaFalhaPercent: form.taxaFalhaPercent,
        embalagem: form.embalagem,
      }
      const res = await fetch("/api/admin/precos/defaults", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message || "Erro ao salvar padrões.")
      alert("Padrões salvos!")
    } catch (e: any) {
      alert(e?.message ?? "Erro ao salvar padrões.")
    } finally {
      setSavingDefaults(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        {/* Campos do formulário */}
        <Field label="Consumo (g)">
          <input
            className="input"
            type="number"
            value={form.consumoGramas}
            onChange={(e) => set("consumoGramas", Number(e.target.value))}
          />
        </Field>

        <Field label="Custo por Kg (R$)">
          <input
            className="input"
            type="number"
            value={form.custoPorKg}
            onChange={(e) => set("custoPorKg", Number(e.target.value))}
          />
        </Field>

        <Field label="Tempo de Impressão (h)">
          <input
            className="input"
            type="number"
            value={form.tempoImpressaoHoras}
            onChange={(e) => set("tempoImpressaoHoras", Number(e.target.value))}
          />
        </Field>

        <Field label="Custo Hora Máquina (R$)">
          <input
            className="input"
            type="number"
            value={form.custoHoraMaquina}
            onChange={(e) => set("custoHoraMaquina", Number(e.target.value))}
          />
        </Field>

        <Field label="Consumo kWh/h">
          <input
            className="input"
            type="number"
            value={form.consumoKwhHora}
            onChange={(e) => set("consumoKwhHora", Number(e.target.value))}
            step="0.01"
          />
        </Field>

        <Field label="Tarifa kWh (R$)">
          <input
            className="input"
            type="number"
            value={form.tarifaKwh}
            onChange={(e) => set("tarifaKwh", Number(e.target.value))}
            step="0.01"
          />
        </Field>

        <Field label="Pós-processo (h)">
          <input
            className="input"
            type="number"
            value={form.tempoPosProcessoHoras}
            onChange={(e) => set("tempoPosProcessoHoras", Number(e.target.value))}
            step="0.1"
          />
        </Field>

        <Field label="Custo Hora Pós (R$)">
          <input
            className="input"
            type="number"
            value={form.custoHoraPos}
            onChange={(e) => set("custoHoraPos", Number(e.target.value))}
            step="0.1"
          />
        </Field>

        <Field label="Insumos Pós (R$)">
          <input
            className="input"
            type="number"
            value={form.insumosPos}
            onChange={(e) => set("insumosPos", Number(e.target.value))}
            step="0.1"
          />
        </Field>

        <Field label="Taxa de Falha (%)">
          <input
            className="input"
            type="number"
            value={form.taxaFalhaPercent}
            onChange={(e) => set("taxaFalhaPercent", Number(e.target.value))}
          />
        </Field>

        <Field label="Embalagem (R$)">
          <input
            className="input"
            type="number"
            value={form.embalagem}
            onChange={(e) => set("embalagem", Number(e.target.value))}
          />
        </Field>

        <Field label="Impostos (%)">
          <input
            className="input"
            type="number"
            value={form.impostosPercent}
            onChange={(e) => set("impostosPercent", Number(e.target.value))}
          />
        </Field>

        <Field label="Margem (%)">
          <input
            className="input"
            type="number"
            value={form.margemLucroPercent}
            onChange={(e) => set("margemLucroPercent", Number(e.target.value))}
          />
        </Field>

        <Field label="Desconto (%)">
          <input
            className="input"
            type="number"
            value={form.descontoPercent ?? 0}
            onChange={(e) => set("descontoPercent", Number(e.target.value) || undefined)}
          />
        </Field>

        <div className="flex items-center gap-2 pt-2">
          <input
            id="apply"
            type="checkbox"
            className="checkbox"
            checked={applyToProduct}
            onChange={(e) => setApplyToProduct(e.target.checked)}
          />
          <label htmlFor="apply" className="text-sm text-zinc-700">
            Aplicar preço sugerido no produto ao salvar
          </label>
        </div>

        <div className="flex gap-2 pt-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar configuração"}
          </button>

          <button
            onClick={handleSaveDefaults}
            disabled={savingDefaults}
            className="btn-secondary"
            title="Gravar como padrão global (Margem, Impostos, Falha e Embalagem)"
          >
            {savingDefaults ? "Salvando padrões..." : "Salvar como padrão"}
          </button>
        </div>
      </div>

      <aside className="border rounded-xl p-4">
        <h3 className="font-semibold mb-2">Simulação</h3>
        <p>
          Custo unitário: <strong>{brl(sim.custoUnitario)}</strong>
        </p>
        <p>
          Preço final sugerido: <strong>{brl(sim.precoSugerido)}</strong>
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Use essa simulação como base para definir o preço exibido na loja.
        </p>
      </aside>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
        }
        .checkbox {
          width: 16px;
          height: 16px;
        }
        .btn-primary {
          background: #111827;
          color: #fff;
          border-radius: 0.5rem;
          padding: 0.5rem 0.9rem;
        }
        .btn-primary[disabled] {
          opacity: 0.7;
        }
        .btn-secondary {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.9rem;
        }
      `}</style>
    </div>
  )
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-700 mb-1">{props.label}</span>
      {props.children}
    </label>
  )
}
