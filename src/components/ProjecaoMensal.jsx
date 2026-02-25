import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { mesLabel } from '../utils/calcParcelas'

export default function ProjecaoMensal({ projecaoMensal, mesAtual }) {
  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Projeção Mensal</h2>

      {projecaoMensal.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhum lançamento encontrado para projetar.</p>
      ) : (
        <>
          {/* Gráfico */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Comprometido por mês</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projecaoMensal} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="mes"
                  tickFormatter={mesLabel}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Total']}
                  labelFormatter={mesLabel}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  itemStyle={{ color: '#f1f5f9' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {projecaoMensal.map((entry) => (
                    <Cell
                      key={entry.mes}
                      fill={entry.mes === mesAtual ? '#3b82f6' : '#6366f1'}
                      opacity={entry.mes < mesAtual ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detalhada */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Detalhamento</p>
            </div>
            {projecaoMensal.map((item) => (
              <div
                key={item.mes}
                className={`flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0 ${
                  item.mes === mesAtual ? 'bg-blue-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.mes === mesAtual && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">atual</span>
                  )}
                  {item.mes > mesAtual && (
                    <span className="text-xs bg-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded-full">futuro</span>
                  )}
                  {item.mes < mesAtual && (
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">passado</span>
                  )}
                  <span className="text-sm text-slate-300">{mesLabel(item.mes)}</span>
                </div>
                <span className={`font-semibold ${
                  item.mes === mesAtual ? 'text-blue-400' :
                  item.mes > mesAtual ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}