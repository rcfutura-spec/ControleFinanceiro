export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR')
}

export function parseDate(dateStr) {
  if (!dateStr) return null
  const clean = dateStr.trim()

  // dd/mm/yyyy or dd-mm-yyyy
  const brMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (brMatch) {
    const day = parseInt(brMatch[1])
    const month = parseInt(brMatch[2])
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${brMatch[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // yyyy-mm-dd
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  return null
}

export function parseCurrency(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  const str = String(value).trim()
  let clean = str.replace(/R\$\s*/g, '').trim()

  if (/\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(clean)) {
    clean = clean.replace(/\./g, '').replace(',', '.')
  } else if (/\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(clean)) {
    clean = clean.replace(/,/g, '')
  }

  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

export function getMonthKey(date) {
  if (!date) return null
  return date.substring(0, 7)
}

export function getMonthLabel(monthKey) {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}

export function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getTransactionHash(t) {
  return `${t.date}|${t.description.toLowerCase().trim()}|${Math.abs(t.amount).toFixed(2)}`
}

// --- Validation ---

export function validateAmount(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return { valid: false, error: 'Valor inválido' }
  if (num < 0) return { valid: false, error: 'Valor não pode ser negativo' }
  if (num > 999999999) return { valid: false, error: 'Valor muito alto' }
  return { valid: true, value: num }
}

export function validateDescription(desc) {
  if (!desc || !desc.trim()) return { valid: false, error: 'Descrição obrigatória' }
  if (desc.trim().length > 200) return { valid: false, error: 'Máximo 200 caracteres' }
  return { valid: true, value: desc.trim() }
}

export function validateDate(dateStr) {
  const parsed = parseDate(dateStr)
  if (!parsed) return { valid: false, error: 'Data inválida (use dd/mm/aaaa)' }
  const d = new Date(parsed + 'T00:00:00')
  if (isNaN(d.getTime())) return { valid: false, error: 'Data inválida' }
  if (d.getFullYear() < 2000 || d.getFullYear() > 2100) return { valid: false, error: 'Ano fora do intervalo' }
  return { valid: true, value: parsed }
}

export function getTodayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function getDaysInMonth(monthKey) {
  if (!monthKey) return 30
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

export function getDayOfMonth() {
  return new Date().getDate()
}
