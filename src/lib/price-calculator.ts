export type PriceConfigInput = {
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
  descontoPercent?: number
}

export type PriceBreakdown = {
  custoMaterial: number
  custoMaquina: number
  custoEnergia: number
  custoPos: number
  custoFalha: number
  custoUnitario: number
  precoBruto: number
  precoComImposto: number
  descontoAplicado: number
  precoFinal: number
}

export function calcularPreco(cfg: PriceConfigInput): PriceBreakdown {
  const taxaFalha = cfg.taxaFalhaPercent / 100
  const margem = cfg.margemLucroPercent / 100
  const imposto = cfg.impostosPercent / 100
  const desconto = (cfg.descontoPercent || 0) / 100

  const custoMaterial = (cfg.consumoGramas / 1000) * cfg.custoPorKg
  const custoMaquina = cfg.tempoImpressaoHoras * cfg.custoHoraMaquina
  const custoEnergia =
    cfg.tempoImpressaoHoras * cfg.consumoKwhHora * cfg.tarifaKwh
  const custoPos =
    cfg.tempoPosProcessoHoras * cfg.custoHoraPos + cfg.insumosPos

  const baseSemFalha =
    custoMaterial + custoMaquina + custoEnergia + custoPos

  const custoFalha = baseSemFalha * taxaFalha

  const custoUnitario = baseSemFalha + custoFalha + cfg.embalagem
  const precoBruto = custoUnitario * (1 + margem)
  const precoComImposto = precoBruto * (1 + imposto)
  const descontoAplicado = precoComImposto * desconto
  const precoFinal = precoComImposto - descontoAplicado

  const arred = (n: number) => Number(n.toFixed(2))

  return {
    custoMaterial: arred(custoMaterial),
    custoMaquina: arred(custoMaquina),
    custoEnergia: arred(custoEnergia),
    custoPos: arred(custoPos),
    custoFalha: arred(custoFalha),
    custoUnitario: arred(custoUnitario),
    precoBruto: arred(precoBruto),
    precoComImposto: arred(precoComImposto),
    descontoAplicado: arred(descontoAplicado),
    precoFinal: arred(precoFinal),
  }
}
