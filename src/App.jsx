import { useState } from 'react'
import { LayoutDashboard, PlusCircle, TrendingUp, Flame, List, CreditCard, Upload } from 'lucide-react'
import { useCartao } from './hooks/useCartao'
import Dashboard from './components/Dashboard'
import LancamentoForm from './components/LancamentoForm'
import ProjecaoMensal from './components/ProjecaoMensal'
import GastosImpulsivos from './components/GastosImpulsivos'
import ListaLancamentos from './components/ListaLancamentos'
import GerenciarCartoes from './components/GerenciarCartoes'
import ImportarCSV from './components/ImportarCSV'

const ABAS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'lancar',     label: 'Lançar',       icon: PlusCircle      },
  { id: 'importar',   label: 'Importar CSV', icon: Upload          },
  { id: 'projecao',   label: 'Projeção',     icon: TrendingUp      },
  { id: 'impulsivos', label: 'Impulsivos',   icon: Flame           },
  { id: 'lista',      label: 'Lançamentos',  icon: List            },
  { id: 'cartoes',    label: 'Cartões',      icon: CreditCard      },
]

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  const {
    lancamentos,
    cartoes,
    grupos,
    mesAtual,
    carregando,
    adicionarLancamento,
    removerLancamento,
    adicionarCartao,
    removerCartao,
    editarCartao,
    adicionarGrupo,
    removerGrupo,
    editarGrupo,
    projecaoMensal,
    resumoPorCartao,
    resumoPorGrupo,
    totalLimite,
    totalFaturaAtual,
    totalParcelasFuturas,
    totalDisponivelReal,
    totalImpulsivo,
    percImpulsivo,
  } = useCartao()

  // Logo após o useCartao, antes do return:
  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Sincronizando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* Header */}
        <div className="pt-8 pb-2">
          <h1 className="text-2xl font-bold text-white">💳 Controle de Cartões</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie seus gastos com inteligência</p>
        </div>

        {/* Conteúdo da aba ativa */}
        {abaAtiva === 'dashboard' && (
          <Dashboard
            resumoPorCartao={resumoPorCartao}
            resumoPorGrupo={resumoPorGrupo}
            totalLimite={totalLimite}
            totalFaturaAtual={totalFaturaAtual}
            totalParcelasFuturas={totalParcelasFuturas}
            totalDisponivelReal={totalDisponivelReal}
            totalImpulsivo={totalImpulsivo}
            percImpulsivo={percImpulsivo}
          />
        )}

        {abaAtiva === 'lancar' && (
          <LancamentoForm
            cartoes={cartoes}
            adicionarLancamento={adicionarLancamento}
            aoSalvar={() => setAbaAtiva('dashboard')}
          />
        )}

        {abaAtiva === 'importar' && (
          <ImportarCSV
            cartoes={cartoes}
            adicionarLancamento={adicionarLancamento}
          />
        )}

        {abaAtiva === 'projecao' && (
          <ProjecaoMensal
            projecaoMensal={projecaoMensal}
            mesAtual={mesAtual}
          />
        )}

        {abaAtiva === 'impulsivos' && (
          <GastosImpulsivos
            lancamentos={lancamentos}
            totalFaturaAtual={totalFaturaAtual}
            percImpulsivo={percImpulsivo}
          />
        )}

        {abaAtiva === 'lista' && (
          <ListaLancamentos
            lancamentos={lancamentos}
            cartoes={cartoes}
            removerLancamento={removerLancamento}
          />
        )}

        {abaAtiva === 'cartoes' && (
          <GerenciarCartoes
            cartoes={cartoes}
            adicionarCartao={adicionarCartao}
            removerCartao={removerCartao}
            editarCartao={editarCartao}
            grupos={grupos}
            adicionarGrupo={adicionarGrupo}
            removerGrupo={removerGrupo}
            editarGrupo={editarGrupo}
          />
        )}

      </div>

      {/* Navbar inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 z-50">
        <div className="max-w-2xl mx-auto flex justify-around items-center py-2">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAbaAtiva(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                abaAtiva === id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}