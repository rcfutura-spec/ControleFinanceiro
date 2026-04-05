import Papa from 'papaparse'
import { parseDate, parseCurrency } from './helpers.js'

// Bank-specific column mappings
const BANK_PROFILES = [
  {
    name: 'Nubank',
    detect: (headers) => headers.includes('date') && headers.includes('title') && headers.includes('amount'),
    map: (row) => ({
      date: parseDate(row['date'] || row['Data']),
      description: row['title'] || row['Título'] || row['Descrição'] || '',
      amount: parseCurrency(row['amount'] || row['Valor']),
    }),
  },
  {
    name: 'Inter',
    detect: (headers) =>
      (headers.includes('Data Lançamento') || headers.includes('data lancamento')) &&
      headers.includes('Descrição'),
    map: (row) => ({
      date: parseDate(row['Data Lançamento'] || row['data lancamento'] || row['Data']),
      description: row['Descrição'] || row['Historico'] || '',
      amount: parseCurrency(row['Valor'] || row['Valor (R$)']),
    }),
  },
  {
    name: 'Itaú',
    detect: (headers) => headers.some(h => h.toLowerCase().includes('lançamento')),
    map: (row) => {
      const keys = Object.keys(row)
      const dateKey = keys.find(k => k.toLowerCase().includes('data')) || keys[0]
      const descKey = keys.find(k => k.toLowerCase().includes('lançamento') || k.toLowerCase().includes('descri')) || keys[1]
      const valKey = keys.find(k => k.toLowerCase().includes('valor')) || keys[2]
      return {
        date: parseDate(row[dateKey]),
        description: row[descKey] || '',
        amount: parseCurrency(row[valKey]),
      }
    },
  },
  {
    name: 'Bradesco',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('histórico') || h.toLowerCase().includes('historico')),
    map: (row) => {
      const keys = Object.keys(row)
      const dateKey = keys.find(k => k.toLowerCase().includes('data')) || keys[0]
      const descKey = keys.find(k =>
        k.toLowerCase().includes('histórico') || k.toLowerCase().includes('historico') || k.toLowerCase().includes('descri')
      ) || keys[1]
      const valKey = keys.find(k => k.toLowerCase().includes('valor')) || keys[2]
      return {
        date: parseDate(row[dateKey]),
        description: row[descKey] || '',
        amount: parseCurrency(row[valKey]),
      }
    },
  },
]

// Generic fallback: try to detect date, description, and value columns
function genericMap(row) {
  const keys = Object.keys(row)
  let dateKey = null, descKey = null, valKey = null

  for (const k of keys) {
    const lower = k.toLowerCase()
    if (!dateKey && (lower.includes('data') || lower === 'date')) dateKey = k
    if (!descKey && (lower.includes('descri') || lower.includes('title') || lower.includes('histor') || lower.includes('lança'))) descKey = k
    if (!valKey && (lower.includes('valor') || lower.includes('amount') || lower.includes('quantia'))) valKey = k
  }

  // Fallback to column positions
  if (!dateKey) dateKey = keys[0]
  if (!descKey) descKey = keys[1]
  if (!valKey) valKey = keys[keys.length - 1]

  return {
    date: parseDate(row[dateKey]),
    description: row[descKey] || '',
    amount: parseCurrency(row[valKey]),
  }
}

export function parseCSV(fileContent) {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete(results) {
        if (!results.data || results.data.length === 0) {
          reject(new Error('Arquivo CSV vazio ou inválido'))
          return
        }

        const headers = Object.keys(results.data[0])
        const normalizedHeaders = headers.map(h => h.trim())

        // Find matching bank profile
        let mapper = null
        for (const profile of BANK_PROFILES) {
          if (profile.detect(normalizedHeaders)) {
            mapper = profile.map
            break
          }
        }

        if (!mapper) mapper = genericMap

        const transactions = results.data
          .map(row => {
            try {
              const t = mapper(row)
              if (!t.date || !t.description) return null
              return {
                ...t,
                description: t.description.trim(),
                amount: Math.abs(t.amount), // Always store as positive (expenses)
              }
            } catch {
              return null
            }
          })
          .filter(Boolean)

        resolve(transactions)
      },
      error(err) {
        reject(err)
      },
    })
  })
}
