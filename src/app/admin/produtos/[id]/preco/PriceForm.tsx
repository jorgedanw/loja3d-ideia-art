"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { type PriceConfigInput, calcularPreco } from "@/lib/price-calculator"

type PriceFormProps = {
  productId: string
  initialConfig: Partial<PriceConfigInput>
}

export function PriceForm({ productId, initialConfig }: PriceFormProps) {
  const [form, setForm] = useState<Partial<PriceConfigInput>>(initialConfig)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  )
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState(
    hasMinimum(form) ? calcularPreco(form as PriceConfigInput) : null
  )

  function handleChange(
    key: keyof PriceConfigInput,
    value: string
  ) {
    const num = value === "" ? undefined : Number(value)
    const updated = { ...form, [key]: isNaN(num as number) ? undefined : num }
    setForm(updated)

    if (hasMinimum(updated)) {
      setPreview(calcularPreco(updated as PriceConfigInput))
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    setMessage(null)

    try {
      const res = await fetch(
        `/api/admin/produtos/${productId}/preco`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      )

      const json = await res.json()

      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Erro ao salvar")
      }

      setStatus("success")
      setMessage(json.message || "Salvo com sucesso.")

      if (hasMinimum(form)) {
        setPreview(calcularPreco(form as PriceConfigInput))
      }
    } catch (err: any) {
      console.error(err)
      setStatus("error")
      setMessage(
        err.message || "Erro ao salvar configuração de preço."
      )
    } finally {
      setTimeout(() => setStatus("idle"), 1500)
    }
  }

  const loading = status === "saving"

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <form onSubmit={handleSubmit} className="space-y-3">
        {renderInput("consumoGramas", "Consumo (g)")}
        {renderInput("custoPorKg", "Custo por Kg (R$)")}
        {renderInput("tempoImpressaoHoras", "Tempo de Impressão (h)")}
        {renderInput("custoHoraMaquina", "Custo Hora Máquina (R$)")}
        {renderInput("consumoKwhHora", "Consumo kWh/h")}
        {renderInput("tarifaKwh", "Tarifa kWh (R$)")}
        {renderInput("tempoPosProcessoHoras", "Pós-processo (h)")}
        {renderInput("custoHoraPos", "Custo Hora Pós (R$)")}
        {renderInput("insumosPos", "Insumos Pós (R$)")}
        {renderInput("taxaFalhaPercent", "Taxa de Falha (%)")}
        {renderInput("embalagem", "Embalagem (R$)")}
        {renderInput("impostosPercent", "Impostos (%)")}
        {renderInput("margemLucroPercent", "Margem (%)")}
        {renderInput("descontoPercent", "Desconto (%)")}

        <div className="pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar configuração"}
          </Button>
        </div>

        {message && (
          <p
            className={`text-xs mt-1 ${
              status === "error"
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm">
        <h3 className="font-semibold mb-2">Simulação</h3>
        {preview ? (
          <>
            <p>
              Custo unitário:{" "}
              <strong>R$ {preview.custoUnitario.toFixed(2)}</strong>
            </p>
            <p>
              Preço final sugerido:{" "}
              <strong>R$ {preview.precoFinal.toFixed(2)}</strong>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Use essa simulação como base para definir o preço exibido na
              loja.
            </p>
          </>
        ) : (
          <p className="text-zinc-500 text-xs">
            Preencha os campos mínimos (consumo, custo/kg, tempo e
            custo hora) para ver o cálculo completo.
          </p>
        )}
      </div>
    </div>
  )

  function renderInput(
    key: keyof PriceConfigInput,
    label: string
  ) {
    const value = form[key]
    return (
      <div>
        <label className="block text-xs text-zinc-600 mb-1">
          {label}
        </label>
        <input
          type="number"
          step="any"
          defaultValue={
            value !== undefined && value !== null ? String(value) : ""
          }
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full border border-zinc-300 rounded-lg px-2 py-1 text-sm"
        />
      </div>
    )
  }
}

function hasMinimum(cfg: Partial<PriceConfigInput>): cfg is PriceConfigInput {
  return (
    cfg.consumoGramas !== undefined &&
    cfg.custoPorKg !== undefined &&
    cfg.tempoImpressaoHoras !== undefined &&
    cfg.custoHoraMaquina !== undefined &&
    cfg.consumoKwhHora !== undefined &&
    cfg.tarifaKwh !== undefined &&
    cfg.tempoPosProcessoHoras !== undefined &&
    cfg.custoHoraPos !== undefined &&
    cfg.insumosPos !== undefined &&
    cfg.taxaFalhaPercent !== undefined &&
    cfg.embalagem !== undefined &&
    cfg.impostosPercent !== undefined &&
    cfg.margemLucroPercent !== undefined
  )
}
