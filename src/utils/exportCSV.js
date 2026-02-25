export function exportCSV(lancamentos) {
  if (!lancamentos.length) {
    alert('Nenhum lançamento para exportar.')
    return
  }

  const cabecalho = ['Data', 'Descrição', 'Cartão', 'Categoria', 'Valor', 'Parcelas', 'Impulsivo']
  const linhas = lancamentos.map((l) => [
    l.data,
    `"${l.descricao}"`,
    `"${l.cartaoNome}"`,
    `"${l.categoria}"`,
    l.valor.toFixed(2).replace('.', ','),
    l.parcelas,
    l.impulsivo ? 'Sim' : 'Não',
  ])

  const conteudo = [cabecalho, ...linhas].map((r) => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lancamentos_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}