import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { mesChave, calcProjecaoMensal, calcTotalFaturaAtual, calcTotalParcelasFuturas } from '../utils/calcParcelas'

const COLECAO = 'controle-cartao'
const DOC_ID  = 'dados-principais'

const CARTOES_INICIAIS = [
  { id: '1', nome: 'Nubank', limite: 5000, cor: '#8b5cf6', grupoId: null },
  { id: '2', nome: 'Inter',  limite: 3000, cor: '#f97316', grupoId: null },
]

export function useCartao() {
  const [lancamentos, setLancamentos] = useState([])
  const [cartoes,     setCartoes]     = useState(CARTOES_INICIAIS)
  const [grupos,      setGrupos]      = useState([])
  const [carregando,  setCarregando]  = useState(true)

  const inicializado = useRef(false)

  useEffect(() => {
    const ref = doc(db, COLECAO, DOC_ID)

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const dados = snap.data()
        if (dados.lancamentos) setLancamentos(dados.lancamentos)
        if (dados.cartoes)     setCartoes(dados.cartoes)
        if (dados.grupos)      setGrupos(dados.grupos)
      }
      inicializado.current = true
      setCarregando(false)
    }, (erro) => {
      console.error('Erro ao conectar com Firestore:', erro)
      try {
        const l = localStorage.getItem('controle_cartao_lancamentos')
        const c = localStorage.getItem('controle_cartao_cartoes')
        const g = localStorage.getItem('controle_cartao_grupos')
        if (l) setLancamentos(JSON.parse(l))
        if (c) setCartoes(JSON.parse(c))
        if (g) setGrupos(JSON.parse(g))
      } catch {}
      setCarregando(false)
    })

    return () => unsub()
  }, [])

  const timerRef = useRef(null)

  function salvarNoFirestore(novoLanc, novosCartoes, novosGrupos) {
    if (!inicializado.current) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const ref = doc(db, COLECAO, DOC_ID)
      setDoc(ref, {
        lancamentos: novoLanc,
        cartoes: novosCartoes,
        grupos: novosGrupos,
        atualizadoEm: new Date().toISOString(),
      }).catch(console.error)
    }, 800)
  }

  useEffect(() => {
    if (!inicializado.current) return
    localStorage.setItem('controle_cartao_lancamentos', JSON.stringify(lancamentos))
    localStorage.setItem('controle_cartao_cartoes',     JSON.stringify(cartoes))
    localStorage.setItem('controle_cartao_grupos',      JSON.stringify(grupos))
    salvarNoFirestore(lancamentos, cartoes, grupos)
  }, [lancamentos, cartoes, grupos])

  const mesAtual = mesChave(new Date())

  function adicionarLancamento(dados) {
    const cartao = cartoes.find((c) => c.id === dados.cartaoId)
    const novo = {
      id: crypto.randomUUID(),
      ...dados,
      cartaoNome: cartao?.nome || '',
      cartaoCor:  cartao?.cor  || '#64748b',
      valor:    parseFloat(dados.valor),
      parcelas: parseInt(dados.parcelas) || 1,
      impulsivo: dados.impulsivo || false,
      data: dados.data || new Date().toISOString().slice(0, 10),
    }
    setLancamentos((prev) => [novo, ...prev])
  }

  function removerLancamento(id) {
    setLancamentos((prev) => prev.filter((l) => l.id !== id))
  }

  function adicionarCartao(dados) {
    const novo = {
      id: crypto.randomUUID(),
      nome:   dados.nome,
      limite: parseFloat(dados.limite),
      cor:    dados.cor || '#3b82f6',
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
    setGrupos((prev) => prev.filter((g) => g.id !== id))
    setCartoes((prev) => prev.map((c) => c.grupoId === id ? { ...c, grupoId: null } : c))
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

  const projecaoMensal = calcProjecaoMensal(lancamentos)

  const resumoPorCartao = cartoes.map((cartao) => {
    const lancCartao      = lancamentos.filter((l) => l.cartaoId === cartao.id)
    const faturaAtual     = calcTotalFaturaAtual(lancCartao, mesAtual)
    const parcelasFuturas = calcTotalParcelasFuturas(lancCartao, mesAtual)
    const grupo           = grupos.find((g) => g.id === cartao.grupoId)
    const disponivelReal  = cartao.limite - faturaAtual - parcelasFuturas
    const percConsumo     = ((faturaAtual / cartao.limite) * 100).toFixed(1)

    return {
      ...cartao,
      faturaAtual:      parseFloat(faturaAtual.toFixed(2)),
      parcelasFuturas:  parseFloat(parcelasFuturas.toFixed(2)),
      disponivelReal:   parseFloat(disponivelReal.toFixed(2)),
      percConsumo:      parseFloat(percConsumo),
      grupoNome:        grupo?.nome || null,
    }
  })

  const resumoPorGrupo = grupos.map((grupo) => {
    const resumoCartoes        = resumoPorCartao.filter((r) => r.grupoId === grupo.id)
    const faturaAtualTotal     = resumoCartoes.reduce((a, c) => a + c.faturaAtual, 0)
    const parcelasFuturasTotal = resumoCartoes.reduce((a, c) => a + c.parcelasFuturas, 0)
    const disponivelReal       = grupo.limiteCompartilhado - faturaAtualTotal - parcelasFuturasTotal
    const percConsumo          = ((faturaAtualTotal / grupo.limiteCompartilhado) * 100).toFixed(1)

    return {
      ...grupo,
      cartoes: resumoCartoes,
      faturaAtualTotal:     parseFloat(faturaAtualTotal.toFixed(2)),
      parcelasFuturasTotal: parseFloat(parcelasFuturasTotal.toFixed(2)),
      disponivelReal:       parseFloat(disponivelReal.toFixed(2)),
      percConsumo:          parseFloat(percConsumo),
    }
  })

  const cartoesSemGrupo      = cartoes.filter((c) => !c.grupoId)
  const limiteSemGrupo       = cartoesSemGrupo.reduce((a, c) => a + c.limite, 0)
  const limiteComGrupo       = grupos.reduce((a, g) => a + g.limiteCompartilhado, 0)
  const totalLimite          = limiteSemGrupo + limiteComGrupo
  const totalFaturaAtual     = resumoPorCartao.reduce((a, c) => a + c.faturaAtual, 0)
  const totalParcelasFuturas = resumoPorCartao.reduce((a, c) => a + c.parcelasFuturas, 0)
  const totalDisponivelReal  = totalLimite - totalFaturaAtual - totalParcelasFuturas

  const lancamentosImpulsivos = lancamentos.filter((l) => l.impulsivo)
  const totalImpulsivo  = lancamentosImpulsivos.reduce((a, l) => a + l.valor, 0)
  const percImpulsivo   = totalFaturaAtual > 0
    ? ((totalImpulsivo / totalFaturaAtual) * 100).toFixed(1)
    : 0

  return {
    lancamentos, cartoes, grupos, mesAtual, carregando,
    adicionarLancamento, removerLancamento,
    adicionarCartao, removerCartao, editarCartao,
    adicionarGrupo, removerGrupo, editarGrupo,
    projecaoMensal, resumoPorCartao, resumoPorGrupo,
    totalLimite, totalFaturaAtual, totalParcelasFuturas,
    totalDisponivelReal, totalImpulsivo, percImpulsivo,
  }
}