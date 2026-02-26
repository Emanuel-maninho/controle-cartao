import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { importarCSV } from '../utils/importCSV'

const BANCOS = [
  { id: 'auto',   label: 'Detectar automaticamente' },
  { id: 'nubank', label: 'Nubank (CSV)'             },
  { id: 'inter',  label: 'Inter (CSV)'              },
  { id: 'bb-txt', label: 'Banco do Brasil (TXT)'    },
  { id: 'ofx',    label: 'Qualquer banco (OFX)'     },
]

export default function ImportarCSV({ cartoes, adicionarLancamento }) {
  const [etapa, setEtapa] = useState('upload') // upload | revisao | concluido
  const [bancoSelecionado, setBancoSelecionado] = useState('auto')
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id || '')
  const [preview, setPreview] = useState([])
  const [bancoDetetado, setBancoDetetado] = useState('')
  const [selecionados, setSelecionados] = useState([])
  const [erro, setErro] = useState('')
  const inputRef = useRef()

  function handleArquivo(e) {
    const file = e.target.files[0]
    if (!file) return
    setErro('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const texto = ev.target.result
        const banco = bancoSelecionado === 'auto' ? null : bancoSelecionado
        const { banco: bancoDet, lancamentos } = importarCSV(texto, banco)

        if (!lancamentos.length) {
          setErro('Nenhum lançamento encontrado. Verifique se o arquivo é o extrato correto.')
          return
        }

        setBancoDetetado(bancoDet)
        setPreview(lancamentos)
        setSelecionados(lancamentos.map((_, i) => i)) // seleciona todos por padrão
        setEtapa('revisao')
      } catch (err) {
        setErro('Erro ao ler o arquivo. Certifique-se de que é um CSV válido.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function toggleSelecionado(idx) {
    setSelecionados((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  function toggleTodos() {
    if (selecionados.length === preview.length) {
      setSelecionados([])
    } else {
      setSelecionados(preview.map((_, i) => i))
    }
  }

  function handleImportar() {
    const cartao = cartoes.find((c) => c.id === cartaoId)
    selecionados.forEach((idx) => {
      const lanc = preview[idx]
      adicionarLancamento({
        ...lanc,
        cartaoId,
        cartaoNome: cartao?.nome || '',
        cartaoCor: cartao?.cor || '#64748b',
      })
    })
    setEtapa('concluido')
  }

  function reiniciar() {
    setEtapa('upload')
    setPreview([])
    setSelecionados([])
    setErro('')
    setBancoDetetado('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── ETAPA: CONCLUÍDO ──────────────────────────────────────────
  if (etapa === 'concluido') {
    return (
      <div className="mt-4 flex flex-col items-center justify-center gap-4 py-12">
        <CheckCircle size={56} className="text-green-400" />
        <p className="text-xl font-bold text-white">Importação concluída!</p>
        <p className="text-slate-400 text-sm">{selecionados.length} lançamentos adicionados com sucesso.</p>
        <button
          onClick={reiniciar}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={16} />
          Importar outro arquivo
        </button>
      </div>
    )
  }

  // ── ETAPA: REVISÃO ────────────────────────────────────────────
  if (etapa === 'revisao') {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Revisar Importação</h2>
          <button onClick={reiniciar} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Info banco detectado */}
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center gap-3">
          <FileText className="text-blue-400 shrink-0" size={20} />
          <div>
            <p className="text-sm text-white font-medium">
              Banco identificado: <span className="text-blue-400 capitalize">{bancoDetetado}</span>
            </p>
            <p className="text-xs text-slate-400">{preview.length} lançamentos encontrados no arquivo</p>
          </div>
        </div>

        {/* Selecionar cartão */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Vincular ao cartão *</label>
          <select
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* Selecionar todos */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{selecionados.length} de {preview.length} selecionados</p>
          <button
            onClick={toggleTodos}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {selecionados.length === preview.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        </div>

        {/* Lista de lançamentos */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden max-h-[420px] overflow-y-auto">
          {preview.map((lanc, idx) => (
            <div
              key={idx}
              onClick={() => toggleSelecionado(idx)}
              className={`flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 last:border-0 cursor-pointer transition-colors ${
                selecionados.includes(idx) ? 'bg-blue-500/10' : 'hover:bg-slate-700/30'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                selecionados.includes(idx) ? 'bg-blue-600 border-blue-600' : 'border-slate-600'
              }`}>
                {selecionados.includes(idx) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{lanc.descricao}</p>
                <p className="text-xs text-slate-400">{lanc.categoria} · {lanc.data}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white">
                  R$ {lanc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {lanc.parcelas > 1 && (
                  <p className="text-xs text-slate-400">{lanc.parcelas}x</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botão importar */}
        <button
          onClick={handleImportar}
          disabled={selecionados.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Upload size={18} />
          Importar {selecionados.length} lançamento{selecionados.length !== 1 ? 's' : ''}
        </button>
      </div>
    )
  }

  // ── ETAPA: UPLOAD ─────────────────────────────────────────────
  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Importar Extrato CSV</h2>

      {/* Seletor de banco */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Banco</label>
        <select
          value={bancoSelecionado}
          onChange={(e) => setBancoSelecionado(e.target.value)}
          className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          {BANCOS.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Área de upload */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
      >
        <Upload size={36} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
        <p className="text-slate-300 font-medium">Clique para selecionar o arquivo CSV</p>
        <p className="text-slate-500 text-xs">Nubank, Inter e Banco do Brasil suportados</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.ofx"
          onChange={handleArquivo}
          className="hidden"
        />
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 flex items-center gap-2 text-sm text-red-300">
          <AlertTriangle size={16} className="shrink-0" />
          {erro}
        </div>
      )}

      {/* Instruções por banco */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Como exportar o CSV</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p>🟣 <span className="font-medium text-white">Nubank:</span> App → Meu perfil → Extrato → Exportar fatura</p>
          <p>🟠 <span className="font-medium text-white">Inter:</span> App → Cartão de crédito → Fatura → Exportar</p>
          <p>🟡 <span className="font-medium text-white">BB:</span> App/Internet Banking → Extrato → Exportar → CSV</p>
        </div>
      </div>
    </div>
  )
}