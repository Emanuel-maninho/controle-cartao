import LimiteGauge from './LimiteGauge'
import { AlertTriangle, Link2 } from 'lucide-react'

export default function Dashboard({
  resumoPorCartao,
  resumoPorGrupo,
  totalLimite,
  totalFaturaAtual,
  totalParcelasFuturas,
  totalDisponivelReal,
  totalImpulsivo,
  percImpulsivo,
}) {
  // Cartões que NÃO pertencem a nenhum grupo — aparecem individualmente
  const cartoesSemGrupo = resumoPorCartao.filter((c) => !c.grupoId)

  return (
    <div className="space-y-6 mt-4">

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Limite total</p>
          <p className="text-xl font-bold text-white">
            R$ {totalLimite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Fatura atual</p>
          <p className="text-xl font-bold text-blue-400">
            R$ {totalFaturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Parcelas futuras</p>
          <p className="text-xl font-bold text-yellow-400">
            R$ {totalParcelasFuturas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
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
            <p className="text-sm text-red-400">
              {percImpulsivo}% da sua fatura atual é composta por gastos impulsivos.
            </p>
          </div>
        </div>
      )}

      {/* ── GRUPOS DE LIMITE COMPARTILHADO ── */}
      {resumoPorGrupo?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Limite Compartilhado
          </h2>
          <div className="space-y-3">
            {resumoPorGrupo.map((grupo) => {
              const perc = Math.min(parseFloat(grupo.percConsumo), 100)
              const corBarra = perc >= 90 ? '#ef4444' : perc >= 70 ? '#f59e0b' : '#22c55e'

              return (
                <div key={grupo.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">

                  {/* Cabeçalho do grupo */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className="text-yellow-400" />
                      <span className="text-sm font-bold text-white">{grupo.nome}</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        compartilhado
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: corBarra }}>
                      {grupo.percConsumo}%
                    </span>
                  </div>

                  {/* Barra de progresso do grupo */}
                  <div className="w-full bg-slate-700 rounded-full h-2.5 mb-3">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${perc}%`, backgroundColor: corBarra }}
                    />
                  </div>

                  {/* Valores do grupo */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-slate-400">Limite total</p>
                      <p className="text-sm font-semibold text-white">
                        R$ {grupo.limiteCompartilhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Fatura atual</p>
                      <p className="text-sm font-semibold text-blue-400">
                        R$ {grupo.faturaAtualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Disponível</p>
                      <p className={`text-sm font-semibold ${grupo.disponivelReal < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        R$ {grupo.disponivelReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Cartões do grupo */}
                  <div className="border-t border-slate-700 pt-2 space-y-1">
                    {grupo.cartoes.map((cartao) => (
                      <div key={cartao.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cartao.cor }} />
                          <span className="text-xs text-slate-400">{cartao.nome}</span>
                        </div>
                        <span className="text-xs text-slate-300">
                          R$ {cartao.faturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CARTÕES INDIVIDUAIS (sem grupo) ── */}
      {cartoesSemGrupo.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Cartões
          </h2>
          <div className="space-y-3">
            {cartoesSemGrupo.map((cartao) => (
              <LimiteGauge key={cartao.id} {...cartao} />
            ))}
          </div>
        </div>
      )}

      {/* Nenhum cartão */}
      {resumoPorCartao.length === 0 && (
        <p className="text-slate-500 text-sm">
          Nenhum cartão cadastrado. Vá em <span className="text-blue-400">Cartões</span> para adicionar.
        </p>
      )}

      {/* Resumo impulsivos */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <AlertTriangle className="text-orange-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Gastos impulsivos</p>
            <p className="font-bold text-white">
              R$ {totalImpulsivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
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