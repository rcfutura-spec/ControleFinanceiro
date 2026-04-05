import React, { useState, useContext } from 'react'
import { formatCurrency, generateId, validateAmount } from '../utils/helpers.js'
import { ThemeContext } from '../App.jsx'
import { ICON_OPTIONS, COLOR_OPTIONS } from '../utils/categories.js'
import Icon from './Icon.jsx'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

function CategoryForm({ form, setForm, onSave, onCancel, theme, existingNames, editId }) {
  const c = theme.colors
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const errs = {}; const name = form.name.trim()
    if (!name) errs.name = 'Nome obrigatório'
    else if (name.length > 30) errs.name = 'Máximo 30 caracteres'
    else if (existingNames.some(n => n.toLowerCase() === name.toLowerCase() && n !== editId)) errs.name = 'Já existe'
    const limV = validateAmount(form.limit || '0'); if (!limV.valid) errs.limit = limV.error
    setErrors(errs); if (Object.keys(errs).length > 0) return; onSave()
  }

  const field = (err) => ({ background: c.bg700, borderColor: err ? '#ef4444' : c.bg500, color: c.text })

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Nome</label>
        <input type="text" value={form.name} maxLength={30} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Nome da categoria" autoFocus
          className="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2" style={field(errors.name)} />
        {errors.name && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Ícone</label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map(iconName => (
            <button key={iconName} onClick={() => setForm(f => ({ ...f, icon: iconName }))}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{ background: form.icon === iconName ? (form.color || c.accent) + '25' : c.bg600,
                boxShadow: form.icon === iconName ? `0 0 0 2px ${form.color || c.accent}` : 'none' }}>
              <Icon name={iconName} size={16} style={{ color: form.icon === iconName ? (form.color || c.accent) : c.textDim }} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Cor</label>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map(color => (
            <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
              className="w-7 h-7 rounded-full transition-all flex items-center justify-center"
              style={{ background: color, boxShadow: form.color === color ? `0 0 0 3px ${c.bg800}, 0 0 0 5px ${color}` : 'none' }}>
              {form.color === color && <Check size={12} color="#fff" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Limite mensal (R$)</label>
        <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
          placeholder="0,00" min="0" step="50"
          className="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2" style={field(errors.limit)} />
        {errors.limit && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.limit}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: c.accent, color: '#fff' }}><Check size={15} /> Salvar</button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm border"
          style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Categories({ categories, setCategories, transactions }) {
  const theme = useContext(ThemeContext); const c = theme.colors
  const [editing, setEditing] = useState(null); const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', icon: 'Package', color: '#6366f1', limit: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const startEdit = (cat) => { setEditing(cat.id); setForm({ name: cat.name, icon: cat.icon, color: cat.color || '#6366f1', limit: String(cat.limit) }); setShowNew(false) }
  const startNew = () => { setEditing(null); setForm({ name: '', icon: 'Package', color: '#6366f1', limit: '' }); setShowNew(true) }

  const save = () => {
    const name = form.name.trim(); if (!name) return
    const limit = Math.max(0, parseFloat(form.limit) || 0)
    if (editing) { setCategories(prev => prev.map(cat => cat.id === editing ? { ...cat, name, icon: form.icon, color: form.color, limit } : cat)); setEditing(null) }
    else { const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') || generateId(); setCategories(prev => [...prev, { id, name, icon: form.icon, color: form.color, limit }]); setShowNew(false) }
    setForm({ name: '', icon: 'Package', color: '#6366f1', limit: '' })
  }

  const remove = (id) => {
    if (id === 'outros') return
    if (confirmDelete === id) { setCategories(prev => prev.filter(cat => cat.id !== id)); if (editing === id) setEditing(null); setConfirmDelete(null) }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000) }
  }

  const cancel = () => { setEditing(null); setShowNew(false); setForm({ name: '', icon: 'Package', color: '#6366f1', limit: '' }) }
  const totalLimit = categories.reduce((s, cat) => s + cat.limit, 0)
  const existingNames = categories.map(cat => cat.name)
  const countByCategory = {}; (transactions || []).forEach(t => { countByCategory[t.category] = (countByCategory[t.category] || 0) + 1 })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Categorias</h2>
          <p className="text-xs mt-0.5" style={{ color: c.textDim }}>
            {categories.length} categorias · Orçamento: {formatCurrency(totalLimit)}
          </p>
        </div>
        <button onClick={startNew} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium"
          style={{ background: c.accent, color: '#fff' }}><Plus size={15} /> Nova</button>
      </div>

      {showNew && (
        <div className="rounded-xl p-5 border animate-scale-in" style={{ background: c.bg800, borderColor: c.accent + '40' }}>
          <h3 className="text-sm font-semibold mb-4">Nova categoria</h3>
          <CategoryForm form={form} setForm={setForm} onSave={save} onCancel={cancel} theme={theme} existingNames={existingNames} editId={null} />
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center py-16 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: c.accent + '12' }}>
            <Icon name="Tags" size={24} style={{ color: c.accent }} />
          </div>
          <h3 className="text-base font-semibold mb-1">Sem categorias</h3>
          <p className="text-sm" style={{ color: c.textMuted }}>Crie categorias para organizar seus gastos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="rounded-xl border overflow-hidden transition-all"
              style={{ background: c.bg800, borderColor: editing === cat.id ? c.accent + '50' : c.bg600 }}>
              {editing === cat.id ? (
                <div className="p-4">
                  <CategoryForm form={form} setForm={setForm} onSave={save} onCancel={cancel} theme={theme} existingNames={existingNames} editId={cat.name} />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: (cat.color || c.accent) + '18' }}>
                        <Icon name={cat.icon} size={20} style={{ color: cat.color || c.accent }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{cat.name}</h4>
                        <p className="text-[11px]" style={{ color: c.textDim }}>
                          Limite: {formatCurrency(cat.limit)} · {countByCategory[cat.id] || 0} transações
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors"
                      style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
                      <Pencil size={12} /> Editar
                    </button>
                    {cat.id !== 'outros' && (
                      <button onClick={() => remove(cat.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{ background: confirmDelete === cat.id ? '#ef4444' : '#ef444410', borderColor: '#ef444425', color: confirmDelete === cat.id ? '#fff' : '#ef4444' }}>
                        <Trash2 size={12} /> {confirmDelete === cat.id ? 'Confirmar' : ''}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
