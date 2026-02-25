import { useState } from 'react'
import { PlusCircle, Trash2, Pencil, Check, X } from 'lucide-react'

const CORES_OPCOES = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899']

export default function GerenciarCartoes({ cartoes, adicionarCartao, removerCartao, editarCartao }) {
  const [form, setForm] = useState({ nome: '', limite: '', cor: '#3b82f6' })
  const [editandoId, setEditandoId] = useState(null)
  const [editForm, setEditForm] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome || !form.limite) return
    adicionarCartao(form)
    setForm({ nome: '', limite: '', cor: '#3b82f6' })
  }

  function iniciarEdicao(cartao) {
    setEditandoId(cartao.id)
    setEditForm({ nome: cartao.nome, limite: cartao.limite, cor: cartao.cor })
  }

  function salvarEdicao(id) {
    editarCartao(id, editForm)
    setEditandoId(null)
  }

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Gerenciar Cartões</h2>

      {/* Formulário novo cartão */}
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
        <p className="text-sm font-semibold text-slate-300">Adicionar novo cartão</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Nubank, Inter..."
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Limite (R$) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.limite}
              onChange={(e) => setForm((p) => ({ ...p, limite: e.target.value }))}
              placeholder="0,00"
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Seletor de cor */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Cor</label>
          <div className="flex gap-2">
            {CORES_OPCOES.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => setForm((p) => ({ ...p, cor }))}
                className={`w-7 h-7 rounded-full transition-transform ${form.cor === cor ? 'scale-125 ring-2 ring-white' : ''}`}
                style={{ backgroundColor: cor }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <PlusCircle size={16} />
          Adicionar Cartão
        </button>
      </form>

      {/* Lista de cartões */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Seus cartões</p>
        </div>

        {cartoes.length === 0 ? (
          <p className="text-slate-500 text-sm p-4">Nenhum cartão cadastrado.</p>
        ) : (
          cartoes.map((cartao) => (
            <div key={cartao.id} className="px-4 py-3 border-b border-slate-700/50 last:border-0">
              {editandoId === cartao.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editForm.nome}
                      onChange={(e) => setEditForm((p) => ({ ...p, nome: e.target.value }))}
                      className="bg-slate-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={editForm.limite}
                      onChange={(e) => setEditForm((p) => ({ ...p, limite: e.target.value }))}
                      className="bg-slate-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {CORES_OPCOES.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setEditForm((p) => ({ ...p, cor }))}
                        className={`w-6 h-6 rounded-full transition-transform ${editForm.cor === cor ? 'scale-125 ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarEdicao(cartao.id)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Check size={13} /> Salvar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="flex items-center gap-1 bg-slate-600 hover:bg-slate-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cartao.cor }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{cartao.nome}</p>
                      <p className="text-xs text-slate-400">Limite: R$ {cartao.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicao(cartao)}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => removerCartao(cartao.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}