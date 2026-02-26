// Detecta o banco pelo conteúdo do arquivo
function detectarBanco(texto) {
  const t = texto.toLowerCase()
  if (t.includes('sisbb') || t.includes('banco do brasil') || t.includes('ourocard')) return 'bb-txt'
  if (t.includes('ofx') || t.includes('<ofx>')) return 'ofx'
  const linha = t.split('\n')[0]
  if (linha.includes('date') && linha.includes('title') && linha.includes('amount')) return 'nubank'
  if (linha.includes('lançamento') && linha.includes('valor')) return 'inter'
  return 'nubank'
}

function parseMoeda(str) {
  if (!str) return 0
  const s = str.toString().trim()
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(s) || 0
}

function parseData(str, ano, formato = 'dmy') {
  if (!str) return new Date().toISOString().slice(0, 10)
  const s = str.trim()
  if (formato === 'ymd') return s.slice(0, 10)
  if (formato === 'ddmm') {
    const [d, m] = s.split('/')
    if (!d || !m) return new Date().toISOString().slice(0, 10)
    return `${ano}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const [d, m, a] = s.split('/')
  if (!d || !m || !a) return new Date().toISOString().slice(0, 10)
  return `${a.slice(0, 4)}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function detectarCategoria(descricao) {
  const d = descricao.toLowerCase()
  if (/ifood|rappi|uber\s*eat|delivery|pizz|burguer|lanche|restaurante|mcdonalds|subway/i.test(d)) return 'Delivery'
  if (/mercado|supermercado|hortifruti|atacado|carrefour|extra|assaí|pão de açúcar/i.test(d)) return 'Alimentação'
  if (/uber|99|taxi|combustivel|gasolina|etanol|shell|posto|ipiranga|semparar|carone/i.test(d)) return 'Transporte'
  if (/farmacia|drogaria|medico|consulta|laboratorio|exame|hospital|unimed/i.test(d)) return 'Saúde'
  if (/netflix|spotify|amazon|prime|disney|hbo|youtube|apple|google/i.test(d)) return 'Assinaturas'
  if (/curso|escola|faculdade|udemy|alura|livro|livraria/i.test(d)) return 'Educação'
  if (/renner|riachuelo|zara|shein|hering|c&a|roupa|calcado|tenis|sapato/i.test(d)) return 'Roupas'
  if (/amazon|americanas|shopee|magalu|magazine|eletro|celular|notebook/i.test(d)) return 'Eletrônicos'
  if (/cinema|show|teatro|ingresso|bar|balada/i.test(d)) return 'Lazer'
  if (/barbearia|salao|estetica|beleza/i.test(d)) return 'Beleza'
  if (/cacau|doce|confeitaria|padaria/i.test(d)) return 'Alimentação'
  return 'Outros'
}

// ── Parser BB TXT ─────────────────────────────────────────────
function parseBBTxt(texto) {
  const linhas = texto.split('\n')

  // Extrai mês e ano do cabeçalho da fatura (ex: "25/02/2026")
  let anoFatura = new Date().getFullYear()
  let mesFatura = new Date().getMonth() + 1
  for (const linha of linhas) {
    const matchData = linha.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (matchData) {
      mesFatura = parseInt(matchData[2])
      anoFatura = parseInt(matchData[3])
      break
    }
  }

  const lancamentos = []
  const regexLinha = /^(\d{2}\/\d{2})\s{2,}(.+?)\s{2,}([\d.,]+)\s+([\d.,]+)\s*$/

  for (const linha of linhas) {
    const match = linha.match(regexLinha)
    if (!match) continue

    const dataStr  = match[1].trim()
    const descRaw  = match[2].trim()
    const valorStr = match[3].trim()

    const valor = parseMoeda(valorStr)
    if (valor <= 0) continue
    if (/pgto|pagamento|saldo fatura|doacao|arredt/i.test(descRaw)) continue

    const descricao = descRaw
      .replace(/\s{2,}[A-Z\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim()

    // ── Determina o ano correto da transação ──────────────────
    // Numa fatura de fev/2026: transações em meses > 02 são de 2025 (ano anterior)
    const [diaStr, mesStr] = dataStr.split('/')
    const mesTransacao = parseInt(mesStr)
    const anoTransacao = mesTransacao > mesFatura ? anoFatura - 1 : anoFatura
    const dataTransacao = `${anoTransacao}-${mesStr.padStart(2, '0')}-${diaStr.padStart(2, '0')}`

    // ── Detecta parcelas (ex: "PARC 04/21") ──────────────────
    const matchParcela = descricao.match(/(\d{2})\/(\d{2})/)
    const parcelaAtual  = matchParcela ? parseInt(matchParcela[1]) : 1
    const totalParcelas = matchParcela ? parseInt(matchParcela[2]) : 1
    const valorTotal    = totalParcelas > 1
      ? parseFloat((valor * totalParcelas).toFixed(2))
      : valor

    // ── Calcula a data REAL de início da compra ───────────────
    // "PARC 04/21" na data 2025-11-22 → compra iniciou 3 meses antes → 2025-08-22
    let dataBase = dataTransacao
    if (parcelaAtual > 1) {
      const d = new Date(dataTransacao)
      d.setMonth(d.getMonth() - (parcelaAtual - 1))
      dataBase = d.toISOString().slice(0, 10)
    }

    lancamentos.push({
      data: dataBase,
      descricao,
      valor: valorTotal,
      categoria: detectarCategoria(descricao),
      parcelas: totalParcelas,
      impulsivo: false,
      origem: 'bb-txt',
      _parcelaAtual: parcelaAtual,
    })
  }

  return lancamentos
}

// ── Parser OFX ────────────────────────────────────────────────
function parseOFX(texto) {
  const lancamentos = []
  const transacoes = texto.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g) || []

  for (const bloco of transacoes) {
    const tipo     = (bloco.match(/<TRNTYPE>(.*?)[\r\n<]/) || [])[1]?.trim()
    const dataRaw  = (bloco.match(/<DTPOSTED>(.*?)[\r\n<]/) || [])[1]?.trim()
    const valorRaw = (bloco.match(/<TRNAMT>(.*?)[\r\n<]/)  || [])[1]?.trim()
    const desc     = (bloco.match(/<MEMO>(.*?)[\r\n<]/)    || [])[1]?.trim()
               || (bloco.match(/<NAME>(.*?)[\r\n<]/)    || [])[1]?.trim()
               || 'Sem descrição'

    const valor = Math.abs(parseFloat(valorRaw?.replace(',', '.')) || 0)
    if (valor <= 0) continue
    if (tipo === 'CREDIT') continue

    const anoOFX = dataRaw?.slice(0, 4) || ''
    const mesOFX = dataRaw?.slice(4, 6) || ''
    const diaOFX = dataRaw?.slice(6, 8) || ''
    const data   = anoOFX && mesOFX && diaOFX
      ? `${anoOFX}-${mesOFX}-${diaOFX}`
      : new Date().toISOString().slice(0, 10)

    lancamentos.push({
      data,
      descricao: desc,
      valor,
      categoria: detectarCategoria(desc),
      parcelas: 1,
      impulsivo: false,
      origem: 'ofx',
    })
  }

  return lancamentos
}

// ── Parser Nubank CSV ─────────────────────────────────────────
function parseNubank(texto) {
  const linhas = texto.trim().split('\n').slice(1)
  return linhas
    .filter((l) => l.trim())
    .map((linha) => {
      const colunas   = linha.split(',')
      const data      = colunas[0]?.trim().slice(0, 10) || ''
      const descricao = colunas[1]?.replace(/"/g, '').trim() || 'Sem descrição'
      const valor     = parseMoeda(colunas[2])
      if (valor <= 0) return null
      return {
        data,
        descricao,
        valor,
        categoria: detectarCategoria(descricao),
        parcelas: 1,
        impulsivo: false,
        origem: 'csv-nubank',
      }
    })
    .filter(Boolean)
}

// ── Parser Inter CSV ──────────────────────────────────────────
function parseInter(texto) {
  const linhas = texto.trim().split('\n').slice(1)
  return linhas
    .filter((l) => l.trim())
    .map((linha) => {
      const colunas   = linha.split(';')
      const data      = parseData(colunas[0], '', 'dmy')
      const descricao = colunas[1]?.replace(/"/g, '').trim() || 'Sem descrição'
      const tipo      = colunas[2]?.toLowerCase() || ''
      const valor     = parseMoeda(colunas[3])
      if (valor <= 0 || tipo.includes('pagamento')) return null
      return {
        data,
        descricao,
        valor,
        categoria: detectarCategoria(descricao),
        parcelas: 1,
        impulsivo: false,
        origem: 'csv-inter',
      }
    })
    .filter(Boolean)
}

// ── Função principal ──────────────────────────────────────────
export function importarCSV(texto, bancoForcado = null) {
  const banco = bancoForcado || detectarBanco(texto)

  let lancamentos = []
  switch (banco) {
    case 'bb-txt': lancamentos = parseBBTxt(texto);  break
    case 'ofx':    lancamentos = parseOFX(texto);    break
    case 'nubank': lancamentos = parseNubank(texto); break
    case 'inter':  lancamentos = parseInter(texto);  break
    default:       lancamentos = parseNubank(texto); break
  }

  return { banco, lancamentos }
}