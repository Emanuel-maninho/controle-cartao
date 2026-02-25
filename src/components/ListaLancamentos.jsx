import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function ListaLancamentos({ lancamentos, cartoes, removerLancamento }) {
  const [filtroCartao, setFiltroCartao] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  const categorias = [...new Set(lancamentos.map((l) => l.categoria))]

  const filtrados = lancamentos.filter((l) => {
    const okCartao = filtroCartao === 'todos' || l.cartaoId === filtroCartao
    const okCategoria = filtroCategoria === 'todas' || l.categoria === filtroCategoria
    return okCartao && okCategoria
  })

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Lançamentos</h2>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={filtroCartao}
          onChange={(e) => setFiltroCartao(e.target.value)}
          className="bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os cartões</option>
          {cartoes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todas">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm">Nenhum lançamento encontrado.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {filtrados.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.cartaoCor }} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{l.descricao}</p>
                    {l.impulsivo && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">impulsivo</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{l.cartaoNome} · {l.categoria} · {l.data}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {l.parcelas > 1 && (
                    <p className="text-xs text-slate-400">{l.parcelas}x de R$ {(l.valor / l.parcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                </div>
                <button
                  onClick={() => removerLancamento(l.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}