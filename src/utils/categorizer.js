import { DEFAULT_KEYWORDS } from './categories.js'
import { storage } from './storage.js'

export function loadKeywords() {
  return storage.get('keywords') || { ...DEFAULT_KEYWORDS }
}

export function saveKeywords(keywords) {
  storage.set('keywords', keywords)
}

export function categorizeTransaction(description, keywords) {
  const lower = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // First check user-learned mappings (exact description match)
  const learned = storage.get('learnedMappings') || {}
  const descNorm = lower.trim()
  if (learned[descNorm]) return learned[descNorm]

  // Then check keyword dictionary
  for (const [categoryId, words] of Object.entries(keywords)) {
    for (const word of words) {
      const wordNorm = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (lower.includes(wordNorm)) {
        return categoryId
      }
    }
  }

  return 'outros'
}

export function learnCategorization(description, categoryId) {
  const learned = storage.get('learnedMappings') || {}
  const descNorm = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  learned[descNorm] = categoryId
  storage.set('learnedMappings', learned)
}
