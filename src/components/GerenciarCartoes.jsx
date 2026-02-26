import { useState } from 'react'
import { PlusCircle, Trash2, Pencil, Check, X, Link2, Unlink } from 'lucide-react'

const CORES_OPCOES = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899']

export default function GerenciarCartoes({
  cartoes, adicionarCartao, removerCartao, editarCartao,
  grupos, adicionarGrupo, removerGrupo, editarGrupo,
}) {
  const [form, setForm] = useState({ nome: '', limite: '', cor: '#3b82f6', grupoId: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [formGrupo, setFormGrupo] = useState({ nome: '', limiteCompartilhado: '', cor: '#eab308' })
  const [abaAtiva, setAbaAtiva] = useState('cartoes') // cartoes | grupos

  function handleSubmitCartao(e) {
    e.preventDefault()
    if (!form.nome || !form.limite) return
    adicionarCartao(form)
    setForm({ nome: '', limite: '', cor: '#3b82f6', grupoId: '' })
  }

  function handleSubmitGrupo(e) {
    e.preventDefault()
    if (!formGrupo.nome || !formGrupo.limiteCompartilhado) return
    adicionarGrupo(formGrupo)
    setFormGrupo({ nome: '', limiteCompartilhado: '', cor: '#eab308' })
  }

  function iniciarEdicao(cartao) {
    setEditandoId(cartao.id)
    setEditForm({ nome: cartao.nome, limite: cartao.limite, cor: cartao.cor, grupoId: cartao.grupoId || '' })
  }

  function salvarEdicao(id) {
    editarCartao(id, editForm)
    setEditandoId(null)
  }

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Gerenciar Cartões</h2>

      {/* Abas */}
      <div className="flex gap-2">
        <button
          onClick={() => setAbaAtiva('cartoes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            abaAtiva === 'cartoes' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          Cartões
        </button>
        <button
          onClick={() => setAbaAtiva('grupos')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            abaAtiva === 'grupos' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          🔗 Limite Compartilhado
        </button>
      </div>

      {/* ── ABA CARTÕES ── */}
      {abaAtiva === 'cartoes' && (
        <>
          {/* Formulário novo cartão */}
          <form onSubmit={handleSubmitCartao} className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
            <p className="text-sm font-semibold text-slate-300">Adicionar novo cartão</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: BB Visa, Nubank..."
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

            {/* Vincular a grupo */}
            {grupos.length > 0 && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Limite compartilhado (opcional)</label>
                <select
                  value={form.grupoId}
                  onChange={(e) => setForm((p) => ({ ...p, grupoId: e.target.value }))}
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhum (limite individual)</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome} — R$ {g.limiteCompartilhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              cartoes.map((cartao) => {
                const grupo = grupos.find((g) => g.id === cartao.grupoId)
                return (
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
                        {grupos.length > 0 && (
                          <select
                            value={editForm.grupoId}
                            onChange={(e) => setEditForm((p) => ({ ...p, grupoId: e.target.value }))}
                            className="w-full bg-slate-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Nenhum (limite individual)</option>
                            {grupos.map((g) => (
                              <option key={g.id} value={g.id}>{g.nome}</option>
                            ))}
                          </select>
                        )}
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white">{cartao.nome}</p>
                              {grupo && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Link2 size={10} /> {grupo.nome}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              Limite: R$ {cartao.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              {grupo && <span className="text-yellow-500/70"> · compartilhado</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => iniciarEdicao(cartao)} className="text-slate-400 hover:text-blue-400 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => removerCartao(cartao.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* ── ABA GRUPOS ── */}
      {abaAtiva === 'grupos' && (
        <>
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 text-sm text-yellow-300">
            🔗 <strong>Limite compartilhado</strong> permite que dois ou mais cartões dividam um mesmo limite total. Ideal para os cartões do BB que somam R$ 35.000 juntos.
          </div>

          {/* Formulário novo grupo */}
          <form onSubmit={handleSubmitGrupo} className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
            <p className="text-sm font-semibold text-slate-300">Criar grupo de limite</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome do grupo *</label>
                <input
                  value={formGrupo.nome}
                  onChange={(e) => setFormGrupo((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Cartões BB"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Limite total (R$) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formGrupo.limiteCompartilhado}
                  onChange={(e) => setFormGrupo((p) => ({ ...p, limiteCompartilhado: e.target.value }))}
                  placeholder="35000,00"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <PlusCircle size={16} />
              Criar Grupo
            </button>
          </form>

          {/* Lista de grupos */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Grupos criados</p>
            </div>
            {grupos.length === 0 ? (
              <p className="text-slate-500 text-sm p-4">Nenhum grupo criado ainda.</p>
            ) : (
              grupos.map((grupo) => {
                const cartoesDoGrupo = cartoes.filter((c) => c.grupoId === grupo.id)
                return (
                  <div key={grupo.id} className="px-4 py-3 border-b border-slate-700/50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <Link2 size={14} className="text-yellow-400" />
                          {grupo.nome}
                        </p>
                        <p className="text-xs text-slate-400">
                          Limite total: R$ {grupo.limiteCompartilhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button onClick={() => removerGrupo(grupo.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {cartoesDoGrupo.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cartoesDoGrupo.map((c) => (
                          <span key={c.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.cor + '33', border: `1px solid ${c.cor}` }}>
                            {c.nome}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Nenhum cartão vinculado ainda. Edite um cartão e vincule a este grupo.</p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}