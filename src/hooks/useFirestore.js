import { useEffect, useState } from 'react'
import {
  doc, getDoc, setDoc, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

// ID fixo do documento — um único doc guarda todos os dados
// Se quiser multi-usuário no futuro, troca por uid do usuário
const DOC_ID = 'dados-principais'
const COLECAO = 'controle-cartao'

export function useFirestore(dadosLocais, setDados) {
  const [sincronizado, setSincronizado] = useState(false)

  // Carrega dados do Firestore na inicialização
  useEffect(() => {
    const ref = doc(db, COLECAO, DOC_ID)

    // Escuta em tempo real — atualiza automaticamente entre dispositivos
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const dados = snap.data()
        setDados(dados)
      }
      setSincronizado(true)
    })

    return () => unsub()
  }, [])

  // Salva no Firestore sempre que os dados mudarem localmente
  useEffect(() => {
    if (!sincronizado) return // Aguarda carregar antes de salvar
    if (!dadosLocais) return

    const ref = doc(db, COLECAO, DOC_ID)
    setDoc(ref, dadosLocais).catch(console.error)
  }, [dadosLocais, sincronizado])

  return { sincronizado }
}