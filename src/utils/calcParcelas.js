export function calcProjecaoMensal(lancamentos) {
  const projecao = {}

  lancamentos.forEach((lanc) => {
    if (!lanc.parcelas || lanc.parcelas <= 1) {
      // Gasto à vista — entra só no mês atual
      const chave = lanc.mesReferencia || mesChave(new Date(lanc.data))
      projecao[chave] = (projecao[chave] || 0) + lanc.valor
      return
    }

    // Parcelado — distribui nos meses seguintes
    const valorParcela = lanc.valor / lanc.parcelas
    const dataBase = new Date(lanc.data)

    for (let i = 0; i < lanc.parcelas; i++) {
      const d = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, 1)
      const chave = mesChave(d)
      projecao[chave] = (projecao[chave] || 0) + valorParcela
    }
  })

  // Retorna ordenado por data
  return Object.entries(projecao)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total: parseFloat(total.toFixed(2)) }))
}

export function mesChave(date) {
  const d = new Date(date)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${ano}-${mes}`
}

export function mesLabel(chave) {
  const [ano, mes] = chave.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[parseInt(mes) - 1]}/${ano}`
}

export function calcTotalFaturaAtual(lancamentos, mesAtual) {
  return lancamentos
    .filter((l) => {
      // À vista: usa mesReferencia se existir (importado do BB), senão usa data
      if (!l.parcelas || l.parcelas <= 1) {
        const mesRef = l.mesReferencia || mesChave(new Date(l.data))
        return mesRef === mesAtual
      }
      // Parcelado: verifica se alguma parcela cai no mês atual
      const dataBase = new Date(l.data)
      for (let i = 0; i < l.parcelas; i++) {
        const d = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, 1)
        if (mesChave(d) === mesAtual) return true
      }
      return false
    })
    .reduce((acc, l) => {
      if (!l.parcelas || l.parcelas <= 1) return acc + l.valor
      return acc + l.valor / l.parcelas
    }, 0)
}

export function calcTotalParcelasFuturas(lancamentos, mesAtual) {
  return lancamentos
    .filter((l) => l.parcelas > 1)
    .reduce((acc, lanc) => {
      const dataBase = new Date(lanc.data)
      const valorParcela = lanc.valor / lanc.parcelas
      let soma = 0
      for (let i = 0; i < lanc.parcelas; i++) {
        const d = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, 1)
        if (mesChave(d) > mesAtual) soma += valorParcela
      }
      return acc + soma
    }, 0)
}