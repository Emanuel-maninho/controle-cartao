import { useState, useEffect } from 'react'
import { mesChave, calcProjecaoMensal, calcTotalFaturaAtual, calcTotalParcelasFuturas } from '../utils/calcParcelas'

const STORAGE_KEY_LANCAMENTOS = 'controle_cartao_lancamentos'
const STORAGE_KEY_CARTOES = 'controle_cartao_cartoes'
const STORAGE_KEY_GRUPOS = 'controle_cartao_grupos'

const CARTOES_INICIAIS = [
  { id: '1', nome: 'Nubank', limite: 5000, cor: '#8b5cf6', grupoId: null },
  { id: '2', nome: 'Inter', limite: 3000, cor: '#f97316', grupoId: null },
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

  // Grupos de limite compartilhado (ex: BB Cartão 1 + BB Cartão 2)
  const [grupos, setGrupos] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_GRUPOS)
      return salvo ? JSON.parse(salvo) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANCAMENTOS, JSON.stringify(lancamentos))
  }, [lancamentos])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CARTOES, JSON.stringify(cartoes))
  }, [cartoes])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GRUPOS, JSON.stringify(grupos))
  }, [grupos])

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
      grupoId: dados.grupoId || null,
    }
    setCartoes((prev) => [...prev, novo])
  }

  function removerCartao(id) {
    setCartoes((prev) => prev.filter((c) => c.id !== id))
  }

  function editarCartao(id, dados) {
    setCartoes((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...dados, limite: parseFloat(dados.limite), grupoId: dados.grupoId || null }
          : c
      )
    )
  }

  // ---------- Grupos de Limite Compartilhado ----------
  function adicionarGrupo(dados) {
    const novo = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      limiteCompartilhado: parseFloat(dados.limiteCompartilhado),
      cor: dados.cor || '#eab308',
    }
    setGrupos((prev) => [...prev, novo])
    return novo.id
  }

  function removerGrupo(id) {
    // Remove o grupo e desvincula os cartões
    setGrupos((prev) => prev.filter((g) => g.id !== id))
    setCartoes((prev) =>
      prev.map((c) => (c.grupoId === id ? { ...c, grupoId: null } : c))
    )
  }

  function editarGrupo(id, dados) {
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, ...dados, limiteCompartilhado: parseFloat(dados.limiteCompartilhado) }
          : g
      )
    )
  }

  // ---------- Cálculos ----------
  const projecaoMensal = calcProjecaoMensal(lancamentos)

  // Resumo individual por cartão
  const resumoPorCartao = cartoes.map((cartao) => {
    const lancCartao = lancamentos.filter((l) => l.cartaoId === cartao.id)
    const faturaAtual = calcTotalFaturaAtual(lancCartao, mesAtual)
    const parcelasFuturas = calcTotalParcelasFuturas(lancCartao, mesAtual)

    // Se pertence a um grupo, o disponível real usa o limite do grupo
    const grupo = grupos.find((g) => g.id === cartao.grupoId)
    const limiteReferencia = grupo ? grupo.limiteCompartilhado : cartao.limite
    const disponivelReal = cartao.limite - faturaAtual - parcelasFuturas
    const percConsumo = ((faturaAtual / cartao.limite) * 100).toFixed(1)

    return {
      ...cartao,
      faturaAtual: parseFloat(faturaAtual.toFixed(2)),
      parcelasFuturas: parseFloat(parcelasFuturas.toFixed(2)),
      disponivelReal: parseFloat(disponivelReal.toFixed(2)),
      percConsumo: parseFloat(percConsumo),
      grupoNome: grupo?.nome || null,
    }
  })

  // Resumo por grupo (limite compartilhado)
  const resumoPorGrupo = grupos.map((grupo) => {
    const cartoesDoGrupo = cartoes.filter((c) => c.grupoId === grupo.id)
    const resumoCartoes = resumoPorCartao.filter((r) => r.grupoId === grupo.id)

    const faturaAtualTotal = resumoCartoes.reduce((a, c) => a + c.faturaAtual, 0)
    const parcelasFuturasTotal = resumoCartoes.reduce((a, c) => a + c.parcelasFuturas, 0)
    const disponivelReal = grupo.limiteCompartilhado - faturaAtualTotal - parcelasFuturasTotal
    const percConsumo = ((faturaAtualTotal / grupo.limiteCompartilhado) * 100).toFixed(1)

    return {
      ...grupo,
      cartoes: resumoCartoes,
      faturaAtualTotal: parseFloat(faturaAtualTotal.toFixed(2)),
      parcelasFuturasTotal: parseFloat(parcelasFuturasTotal.toFixed(2)),
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
    grupos,
    mesAtual,
    // ações - lançamentos
    adicionarLancamento,
    removerLancamento,
    // ações - cartões
    adicionarCartao,
    removerCartao,
    editarCartao,
    // ações - grupos
    adicionarGrupo,
    removerGrupo,
    editarGrupo,
    // cálculos
    projecaoMensal,
    resumoPorCartao,
    resumoPorGrupo,
    totalLimite,
    totalFaturaAtual,
    totalParcelasFuturas,
    totalDisponivelReal,
    totalImpulsivo,
    percImpulsivo,
  }
}