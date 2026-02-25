import { useState, useEffect } from 'react'
import { mesChave, calcProjecaoMensal, calcTotalFaturaAtual, calcTotalParcelasFuturas } from '../utils/calcParcelas'

const STORAGE_KEY_LANCAMENTOS = 'controle_cartao_lancamentos'
const STORAGE_KEY_CARTOES = 'controle_cartao_cartoes'

const CARTOES_INICIAIS = [
  { id: '1', nome: 'Nubank', limite: 5000, cor: '#8b5cf6' },
  { id: '2', nome: 'Inter', limite: 3000, cor: '#f97316' },
]

export function useCartao() {
  const [lancamentos, setLancamentos] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_LANCAMENTOS)
      return salvo ? JSON.parse(salvo) : []
    } catch { return [] }
  })

  const [cartoes, setCartoes] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CARTOES)
      return salvo ? JSON.parse(salvo) : CARTOES_INICIAIS
    } catch { return CARTOES_INICIAIS }
  })

  // Persiste lançamentos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANCAMENTOS, JSON.stringify(lancamentos))
  }, [lancamentos])

  // Persiste cartões
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CARTOES, JSON.stringify(cartoes))
  }, [cartoes])

  const mesAtual = mesChave(new Date())

  // ---------- Lançamentos ----------
  function adicionarLancamento(dados) {
    const cartao = cartoes.find((c) => c.id === dados.cartaoId)
    const novo = {
      id: crypto.randomUUID(),
      ...dados,
      cartaoNome: cartao?.nome || '',
      cartaoCor: cartao?.cor || '#64748b',
      valor: parseFloat(dados.valor),
      parcelas: parseInt(dados.parcelas) || 1,
      impulsivo: dados.impulsivo || false,
      data: dados.data || new Date().toISOString().slice(0, 10),
    }
    setLancamentos((prev) => [novo, ...prev])
  }

  function removerLancamento(id) {
    setLancamentos((prev) => prev.filter((l) => l.id !== id))
  }

  // ---------- Cartões ----------
  function adicionarCartao(dados) {
    const novo = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      limite: parseFloat(dados.limite),
      cor: dados.cor || '#3b82f6',
    }
    setCartoes((prev) => [...prev, novo])
  }

  function removerCartao(id) {
    setCartoes((prev) => prev.filter((c) => c.id !== id))
  }

  function editarCartao(id, dados) {
    setCartoes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados, limite: parseFloat(dados.limite) } : c))
    )
  }

  // ---------- Cálculos ----------
  const projecaoMensal = calcProjecaoMensal(lancamentos)

  const resumoPorCartao = cartoes.map((cartao) => {
    const lancCartao = lancamentos.filter((l) => l.cartaoId === cartao.id)
    const faturaAtual = calcTotalFaturaAtual(lancCartao, mesAtual)
    const parcelasFuturas = calcTotalParcelasFuturas(lancCartao, mesAtual)
    const disponivelReal = cartao.limite - faturaAtual - parcelasFuturas
    const percConsumo = ((faturaAtual / cartao.limite) * 100).toFixed(1)

    return {
      ...cartao,
      faturaAtual: parseFloat(faturaAtual.toFixed(2)),
      parcelasFuturas: parseFloat(parcelasFuturas.toFixed(2)),
      disponivelReal: parseFloat(disponivelReal.toFixed(2)),
      percConsumo: parseFloat(percConsumo),
    }
  })

  const totalLimite = cartoes.reduce((a, c) => a + c.limite, 0)
  const totalFaturaAtual = resumoPorCartao.reduce((a, c) => a + c.faturaAtual, 0)
  const totalParcelasFuturas = resumoPorCartao.reduce((a, c) => a + c.parcelasFuturas, 0)
  const totalDisponivelReal = resumoPorCartao.reduce((a, c) => a + c.disponivelReal, 0)

  const lancamentosImpulsivos = lancamentos.filter((l) => l.impulsivo)
  const totalImpulsivo = lancamentosImpulsivos.reduce((a, l) => a + l.valor, 0)
  const percImpulsivo = totalFaturaAtual > 0
    ? ((totalImpulsivo / totalFaturaAtual) * 100).toFixed(1)
    : 0

  return {
    // estado
    lancamentos,
    cartoes,
    mesAtual,
    // ações
    adicionarLancamento,
    removerLancamento,
    adicionarCartao,
    removerCartao,
    editarCartao,
    // cálculos
    projecaoMensal,
    resumoPorCartao,
    totalLimite,
    totalFaturaAtual,
    totalParcelasFuturas,
    totalDisponivelReal,
    totalImpulsivo,
    percImpulsivo,
  }
}