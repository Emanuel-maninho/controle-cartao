// Detecta o banco pelo cabeçalho do CSV
function detectarBanco(texto) {
  const linha = texto.split('\n')[0].toLowerCase()
  if (linha.includes('nubank')) return 'nubank'
  if (linha.includes('inter')) return 'inter'
  if (linha.includes('banco do brasil') || linha.includes('lançamentos')) return 'bb'
  // Tenta detectar pelo padrão de colunas
  if (linha.includes('date') && linha.includes('title') && linha.includes('amount')) return 'nubank'
  if (linha.includes('lançamento') && linha.includes('valor')) return 'inter'
  return 'desconhecido'
}

// Limpa valor monetário de qualquer formato pra número
function parseMoeda(str) {
  if (!str) return 0
  const s = str.toString().trim()
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return Math.abs(parseFloat(s) || 0)
}

// Converte data pra formato YYYY-MM-DD
function parseData(str, formato = 'dmy') {
  if (!str) return new Date().toISOString().slice(0, 10)
  const s = str.trim()
  if (formato === 'ymd') {
    // YYYY-MM-DD (Nubank)
    return s.slice(0, 10)
  }
  // DD/MM/YYYY (Inter, BB)
  const [d, m, a] = s.split('/')
  if (!d || !m || !a) return new Date().toISOString().slice(0, 10)
  return `${a.slice(0, 4)}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// Detecta categoria automaticamente pela descrição
function detectarCategoria(descricao) {
  const d = descricao.toLowerCase()
  if (/ifood|rappi|uber\s*eat|delivery|pizz|burguer|lanche|restaurante|mcdonalds|subway/i.test(d)) return 'Delivery'
  if (/mercado|supermercado|hortifruti|atacado|carrefour|extra|assaí|pão de açúcar/i.test(d)) return 'Alimentação'
  if (/uber|99|taxi|combustivel|gasolina|etanol|shell|posto|ipiranga/i.test(d)) return 'Transporte'
  if (/farmacia|drogaria|medico|consulta|laboratorio|exame|hospital|unimed/i.test(d)) return 'Saúde'
  if (/netflix|spotify|amazon|prime|disney|hbo|youtube|apple|google/i.test(d)) return 'Assinaturas'
  if (/curso|escola|faculdade|udemy|alura|livro|livraria/i.test(d)) return 'Educação'
  if (/renner|riachuelo|zara|shein|hering|c&a|roupa|calcado|tenis|sapato/i.test(d)) return 'Roupas'
  if (/amazon|americanas|shopee|magalu|magazine|eletro|celular|notebook/i.test(d)) return 'Eletrônicos'
  if (/cinema|show|teatro|ingresso|bar|balada/i.test(d)) return 'Lazer'
  return 'Outros'
}

// Parser Nubank
// Formato: date,title,amount
function parseNubank(texto) {
  const linhas = texto.trim().split('\n').slice(1) // pula cabeçalho
  return linhas
    .filter((l) => l.trim())
    .map((linha) => {
      const colunas = linha.split(',')
      const data = parseData(colunas[0], 'ymd')
      const descricao = colunas[1]?.replace(/"/g, '').trim() || 'Sem descrição'
      const valor = parseMoeda(colunas[2])
      if (valor <= 0) return null // ignora estornos e pagamentos
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

// Parser Inter
// Formato: Data;Lançamento;Tipo;Valor
function parseInter(texto) {
  const linhas = texto.trim().split('\n').slice(1)
  return linhas
    .filter((l) => l.trim())
    .map((linha) => {
      const colunas = linha.split(';')
      const data = parseData(colunas[0], 'dmy')
      const descricao = colunas[1]?.replace(/"/g, '').trim() || 'Sem descrição'
      const tipo = colunas[2]?.toLowerCase() || ''
      const valor = parseMoeda(colunas[3])
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

// Parser Banco do Brasil
// Formato: Data;Dependência Origem;História;Docto.;Crédito (R$);Débito (R$);Saldo (R$)
function parseBB(texto) {
  const linhas = texto.trim().split('\n')
  // Acha a linha do cabeçalho
  const idxCabecalho = linhas.findIndex((l) =>
    l.toLowerCase().includes('data') && l.toLowerCase().includes('hist')
  )
  const dados = idxCabecalho >= 0 ? linhas.slice(idxCabecalho + 1) : linhas.slice(1)

  return dados
    .filter((l) => l.trim())
    .map((linha) => {
      const colunas = linha.split(';')
      const data = parseData(colunas[0], 'dmy')
      const descricao = colunas[2]?.replace(/"/g, '').trim() || 'Sem descrição'
      // BB tem coluna separada pra crédito e débito
      const debito = parseMoeda(colunas[5])
      const credito = parseMoeda(colunas[4])
      const valor = debito > 0 ? debito : 0
      if (valor <= 0) return null // ignora créditos (pagamentos)
      // Detecta parcelas no nome (ex: "COMPRA 02/06")
      const matchParcela = descricao.match(/(\d{2})\/(\d{2})/)
      const parcelaAtual = matchParcela ? parseInt(matchParcela[1]) : 1
      const totalParcelas = matchParcela ? parseInt(matchParcela[2]) : 1
      return {
        data,
        descricao,
        valor,
        categoria: detectarCategoria(descricao),
        parcelas: totalParcelas,
        impulsivo: false,
        origem: 'csv-bb',
        _parcelaAtual: parcelaAtual,
      }
    })
    .filter(Boolean)
}

// Função principal — detecta banco e chama o parser certo
export function importarCSV(texto, bancoForcado = null) {
  const banco = bancoForcado || detectarBanco(texto)

  let lancamentos = []
  switch (banco) {
    case 'nubank': lancamentos = parseNubank(texto); break
    case 'inter':  lancamentos = parseInter(texto);  break
    case 'bb':     lancamentos = parseBB(texto);     break
    default:       lancamentos = parseNubank(texto); break // tenta nubank como fallback
  }

  return { banco, lancamentos }
}