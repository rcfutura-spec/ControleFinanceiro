import * as pdfjsLib from 'pdfjs-dist'
import { parseDate } from './helpers.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const SKIP_PATTERNS = [
  /^saldo do dia$/i,
  /^saldo em conta/i,
  /^limite da conta/i,
  /^período de visualização/i,
  /^emitido em/i,
  /^extrato conta/i,
  /^data\s+lançamentos/i,
  /^valor\s*\(R\$/i,
  /^saldo\s*\(R\$/i,
  /^aviso!/i,
]

function parseBRCurrency(str) {
  if (!str) return null
  const clean = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const val = parseFloat(clean)
  return isNaN(val) ? null : val
}

export async function parsePDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const lines = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Group text items by Y position (same line)
    const rows = {}
    for (const item of content.items) {
      if (!item.str.trim()) continue
      const y = Math.round(item.transform[5])
      if (!rows[y]) rows[y] = []
      rows[y].push({ x: item.transform[4], text: item.str.trim() })
    }

    // Sort rows by Y descending (PDF coordinates are bottom-up)
    const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a)
    for (const y of sortedYs) {
      const items = rows[y].sort((a, b) => a.x - b.x)
      const lineText = items.map(i => i.text).join(' ')
      lines.push({ text: lineText, items })
    }
  }

  const transactions = []

  for (const line of lines) {
    const text = line.text
    if (SKIP_PATTERNS.some(p => p.test(text))) continue

    // Match: DD/MM/YYYY  description  value
    const match = text.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\-]?[\d\.]+,\d{2})\s*$/)
    if (!match) {
      // Try: date at start, value might be separate item
      const dateMatch = text.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+)/)
      if (dateMatch && line.items.length >= 2) {
        const lastItem = line.items[line.items.length - 1].text
        const valMatch = lastItem.match(/^[\-]?[\d\.]+,\d{2}$/)
        if (valMatch) {
          const date = parseDate(dateMatch[1])
          const val = parseBRCurrency(lastItem)
          // Remove the value from the description
          const desc = line.items.slice(1, -1).map(i => i.text).join(' ').trim()
          if (date && val !== null && desc && !SKIP_PATTERNS.some(p => p.test(desc))) {
            transactions.push({ date, description: desc, amount: Math.abs(val), type: val < 0 ? 'expense' : 'income' })
          }
          continue
        }
      }
      continue
    }

    const date = parseDate(match[1])
    const description = match[2].trim()
    const value = parseBRCurrency(match[3])

    if (!date || value === null) continue
    if (SKIP_PATTERNS.some(p => p.test(description))) continue
    // Skip "SALDO DO DIA" that might have passed
    if (/saldo do dia/i.test(description)) continue

    transactions.push({
      date,
      description,
      amount: Math.abs(value),
      type: value < 0 ? 'expense' : 'income',
    })
  }

  return transactions
}
