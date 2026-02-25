import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

const CATEGORIAS = [
  'Alimentação', 'Delivery', 'Transporte', 'Saúde', 'Educação',
  'Lazer', 'Roupas', 'Eletrônicos', 'Assinaturas', 'Outros'
]

export default function LancamentoForm({ cartoes, adicionarLancamento, aoSalvar }) {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    cartaoId: cartoes[0]?.id || '',
    categoria: 'Outros',
    parcelas: '1',
    impulsivo: false,
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.descricao || !form.valor || !form.cartaoId) return
    adicionarLancamento(form)
    setForm({
      descricao: '',
      valor: '',
      data: new Date().toISOString().slice(0, 10),
      cartaoId: cartoes[0]?.id || '',
      categoria: 'Outros',
      parcelas: '1',
      impulsivo: false,
    })
    aoSalvar()
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold text-white mb-4">Novo Lançamento</h2>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">

        {/* Descrição */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Descrição *</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Ex: iFood, Netflix, Sapato..."
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Valor + Parcelas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Valor total (R$) *</label>
            <input
              name="valor"
              type="number"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={handleChange}
              placeholder="0,00"
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Parcelas</label>
            <input
              name="parcelas"
              type="number"
              min="1"
              max="48"
              value={form.parcelas}
              onChange={handleChange}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data + Cartão */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Data *</label>
            <input
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Cartão *</label>
            <select
              name="cartaoId"
              value={form.cartaoId}
              onChange={handleChange}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Impulsivo */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              name="impulsivo"
              checked={form.impulsivo}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${form.impulsivo ? 'bg-orange-500' : 'bg-slate-600'}`} />
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.impulsivo ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-sm text-slate-300">Marcar como gasto impulsivo</span>
        </label>

        {/* Parcela preview */}
        {parseInt(form.parcelas) > 1 && form.valor && (
          <div className="bg-slate-700/50 rounded-lg p-3 text-sm text-slate-300">
            💳 {form.parcelas}x de <span className="text-white font-semibold">R$ {(parseFloat(form.valor) / parseInt(form.parcelas)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> por mês
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle size={18} />
          Adicionar Lançamento
        </button>
      </form>
    </div>
  )
}