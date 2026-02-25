import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CORES = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#6366f1']

export default function GastosImpulsivos({ lancamentos, totalFaturaAtual, percImpulsivo }) {
  const impulsivos = lancamentos.filter((l) => l.impulsivo)

  // Agrupa por categoria
  const porCategoria = impulsivos.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + l.valor
    return acc
  }, {})

  const dadosPizza = Object.entries(porCategoria).map(([nome, valor]) => ({ nome, valor }))
  const totalImpulsivo = impulsivos.reduce((a, l) => a + l.valor, 0)

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Gastos Impulsivos</h2>

      {impulsivos.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-white font-semibold">Nenhum gasto impulsivo registrado!</p>
          <p className="text-slate-400 text-sm mt-1">Continue assim, ótimo controle financeiro.</p>
        </div>
      ) : (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-4 border border-orange-700/40">
              <p className="text-xs text-slate-400 mb-1">Total impulsivo</p>
              <p className="text-xl font-bold text-orange-400">
                R$ {totalImpulsivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-orange-700/40">
              <p className="text-xs text-slate-400 mb-1">% da fatura</p>
              <p className={`text-xl font-bold ${parseFloat(percImpulsivo) > 30 ? 'text-red-400' : 'text-yellow-400'}`}>
                {percImpulsivo}%
              </p>
            </div>
          </div>

          {/* Alerta */}
          {parseFloat(percImpulsivo) > 30 && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-sm text-red-300">
              ⚠️ Mais de 30% da sua fatura é composta por gastos impulsivos. Considere revisar seus hábitos de consumo.
            </div>
          )}

          {/* Gráfico pizza */}
          {dadosPizza.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Por categoria</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dadosPizza.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Total']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Lista */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Lançamentos impulsivos</p>
            </div>
            {impulsivos.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{l.descricao}</p>
                  <p className="text-xs text-slate-400">{l.categoria} · {l.data}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-400">
                    R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {l.parcelas > 1 && (
                    <p className="text-xs text-slate-500">{l.parcelas}x</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}