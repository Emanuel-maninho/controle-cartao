import { useState } from 'react'
import { useCartao } from './hooks/useCartao'
import Dashboard from './components/Dashboard'
import LancamentoForm from './components/LancamentoForm'
import ProjecaoMensal from './components/ProjecaoMensal'
import GastosImpulsivos from './components/GastosImpulsivos'
import ListaLancamentos from './components/ListaLancamentos'
import GerenciarCartoes from './components/GerenciarCartoes'
import { exportCSV } from './utils/exportCSV'
import { CreditCard, Plus, BarChart2, List, AlertTriangle, Settings, Download } from 'lucide-react'

const ABAS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: BarChart2 },
  { id: 'lancar',      label: 'Lançar',        icon: Plus },
  { id: 'lancamentos', label: 'Lançamentos',   icon: List },
  { id: 'projecao',    label: 'Projeção',      icon: CreditCard },
  { id: 'impulsivos',  label: 'Impulsivos',    icon: AlertTriangle },
  { id: 'cartoes',     label: 'Cartões',       icon: Settings },
]

export default function App() {
  const [aba, setAba] = useState('dashboard')
  const cartaoData = useCartao()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="text-blue-400" size={24} />
          <span className="font-bold text-lg text-white">Controle de Cartão</span>
        </div>
        <button
          onClick={() => exportCSV(cartaoData.lancamentos)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </header>

      {/* Navegação */}
      <nav className="bg-slate-800 border-b border-slate-700 px-2 flex overflow-x-auto">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              aba === id
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto p-4">
        {aba === 'dashboard'   && <Dashboard   {...cartaoData} />}
        {aba === 'lancar'      && <LancamentoForm {...cartaoData} aoSalvar={() => setAba('lancamentos')} />}
        {aba === 'lancamentos' && <ListaLancamentos {...cartaoData} />}
        {aba === 'projecao'    && <ProjecaoMensal {...cartaoData} />}
        {aba === 'impulsivos'  && <GastosImpulsivos {...cartaoData} />}
        {aba === 'cartoes'     && <GerenciarCartoes {...cartaoData} />}
      </main>
    </div>
  )
}