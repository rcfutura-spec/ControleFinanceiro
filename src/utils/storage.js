const PREFIX = 'cf_'
const MAX_STORAGE_MB = 4.5

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      return true
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error('localStorage cheio! Considere limpar dados antigos.')
        return false
      }
      console.error('Erro ao salvar:', e)
      return false
    }
  },

  delete(key) {
    localStorage.removeItem(PREFIX + key)
  },

  list() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k.startsWith(PREFIX)) keys.push(k.slice(PREFIX.length))
    }
    return keys
  },

  clearAll() {
    const keys = this.list()
    keys.forEach(k => this.delete(k))
  },

  getUsageMB() {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k.startsWith(PREFIX)) {
        total += (k.length + (localStorage.getItem(k)?.length || 0)) * 2
      }
    }
    return (total / (1024 * 1024)).toFixed(2)
  },

  isNearFull() {
    return parseFloat(this.getUsageMB()) > MAX_STORAGE_MB
  },

  exportAll() {
    const data = {}
    this.list().forEach(key => {
      data[key] = this.get(key)
    })
    return data
  },

  importAll(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value)
      })
      return true
    } catch {
      return false
    }
  }
}
