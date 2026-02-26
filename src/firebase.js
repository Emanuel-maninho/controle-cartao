import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Cole aqui o seu firebaseConfig copiado do console
const firebaseConfig = {
  apiKey: "AIzaSyCFNtlYVfGNY5al9VEm92kvWf8UBN2gpIw",
  authDomain: "controle-cartao-b3ca7.firebaseapp.com",
  projectId: "controle-cartao-b3ca7",
  storageBucket: "controle-cartao-b3ca7.firebasestorage.app",
  messagingSenderId: "1067621732686",
  appId: "1:1067621732686:web:2b87d77343229758fd4e1f"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)