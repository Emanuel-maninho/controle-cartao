export default function LimiteGauge({ nome, cor, limite, faturaAtual, parcelasFuturas, disponivelReal, percConsumo }) {
  const percFatura = (faturaAtual / limite) * 100
  const percFuturas = (parcelasFuturas / limite) * 100

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
          <span className="font-semibold text-white">{nome}</span>
        </div>
        <span className="text-sm text-slate-400">Limite: <span className="text-white font-medium">R$ {limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
      </div>

      {/* Barra de progresso */}
      <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex mb-3">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${Math.min(percFatura, 100)}%`, backgroundColor: cor }}
        />
        <div
          className="h-full transition-all duration-500 opacity-40"
          style={{ width: `${Math.min(percFuturas, 100 - percFatura)}%`, backgroundColor: cor }}
        />
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-slate-400 text-xs">Fatura atual</p>
          <p className="font-semibold text-white">R$ {faturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs" style={{ color: cor }}>{percConsumo}% do limite</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Parcelas futuras</p>
          <p className="font-semibold text-yellow-400">R$ {parcelasFuturas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Disponível real</p>
          <p className={`font-semibold ${disponivelReal < 0 ? 'text-red-400' : 'text-green-400'}`}>
            R$ {disponivelReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}