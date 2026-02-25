import LimiteGauge from './LimiteGauge'
import { TrendingUp, TrendingDown, CreditCard, AlertTriangle } from 'lucide-react'

export default function Dashboard({
  resumoPorCartao,
  totalLimite,
  totalFaturaAtual,
  totalParcelasFuturas,
  totalDisponivelReal,
  totalImpulsivo,
  percImpulsivo,
}) {
  return (
    <div className="space-y-6 mt-4">

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Limite total</p>
          <p className="text-xl font-bold text-white">R$ {totalLimite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Fatura atual</p>
          <p className="text-xl font-bold text-blue-400">R$ {totalFaturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Parcelas futuras</p>
          <p className="text-xl font-bold text-yellow-400">R$ {totalParcelasFuturas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Disponível real</p>
          <p className={`text-xl font-bold ${totalDisponivelReal < 0 ? 'text-red-400' : 'text-green-400'}`}>
            R$ {totalDisponivelReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Alerta impulsivo */}
      {percImpulsivo > 30 && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={22} />
          <div>
            <p className="font-semibold text-red-300">Atenção: gastos impulsivos elevados!</p>
            <p className="text-sm text-red-400">{percImpulsivo}% da sua fatura atual é composta por gastos impulsivos.</p>
          </div>
        </div>
      )}

      {/* Gauge por cartão */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Cartões</h2>
        <div className="space-y-3">
          {resumoPorCartao.map((cartao) => (
            <LimiteGauge key={cartao.id} {...cartao} />
          ))}
          {resumoPorCartao.length === 0 && (
            <p className="text-slate-500 text-sm">Nenhum cartão cadastrado. Vá em <span className="text-blue-400">Cartões</span> para adicionar.</p>
          )}
        </div>
      </div>

      {/* Resumo impulsivos */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <AlertTriangle className="text-orange-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Gastos impulsivos</p>
            <p className="font-bold text-white">R$ {totalImpulsivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">{percImpulsivo}%</p>
          <p className="text-xs text-slate-500">da fatura atual</p>
        </div>
      </div>

    </div>
  )
}