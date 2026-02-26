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