import React, { useState, useMemo, useRef, useContext, useCallback } from 'react'
import { formatCurrency, formatDate, getMonthLabel, generateId, getTransactionHash, getMonthKey,
  validateAmount, validateDescription, validateDate, getTodayISO } from '../utils/helpers.js'
import { parseCSV } from '../utils/csvParser.js'
import { categorizeTransaction, learnCategorization, loadKeywords } from '../utils/categorizer.js'
import { ThemeContext } from '../App.jsx'
import Icon from './Icon.jsx'
import {
  Plus, Upload, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight,
  ArrowUpDown, CheckSquare, X, FileDown, Receipt, ArrowDownRight, ArrowUpRight,
} from 'lucide-react'

const PAGE_SIZE = 30

/* ─── Modal ─── */
function TransactionModal({ tx, categories, onSave, onCancel, theme }) {
  const c = theme.colors
  const isEdit = !!tx?.id
  const [form, setForm] = useState({
    date: tx?.date || getTodayISO(), description: tx?.description || '',
    amount: tx?.amount ? String(tx.amount) : '', category: tx?.category || 'outros', type: tx?.type || 'expense',
  })
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const errs = {}
    const dateV = validateDate(form.date); const descV = validateDescription(form.description); const amtV = validateAmount(form.amount)
    if (!dateV.valid) errs.date = dateV.error; if (!descV.valid) errs.description = descV.error; if (!amtV.valid) errs.amount = amtV.error
    setErrors(errs); if (Object.keys(errs).length > 0) return
    onSave({ id: tx?.id || generateId(), date: dateV.value, description: descV.value, amount: amtV.value,
      category: form.category, type: form.type, hash: getTransactionHash({ date: dateV.value, description: descV.value, amount: amtV.value }) })
  }

  const field = (err) => ({ background: c.bg700, borderColor: err ? '#ef4444' : c.bg500, color: c.text })

  const lbl = { color: c.textDim, fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }
  const err = (msg) => msg ? <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{msg}</p> : null

  const typeButtons = (
    <div style={{ display: 'flex', gap: 10 }}>
      {[{ id: 'expense', label: 'Despesa', icon: ArrowDownRight, color: '#ef4444' }, { id: 'income', label: 'Receita', icon: ArrowUpRight, color: '#22c55e' }].map(t => {
        const TIcon = t.icon; const active = form.type === t.id
        return (
          <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 12px', borderRadius: 14, fontSize: 15, fontWeight: 600,
              background: active ? t.color + '15' : c.bg800,
              border: `1.5px solid ${active ? t.color + '60' : c.bg600}`,
              color: active ? t.color : c.textMuted,
            }}>
            <TIcon size={18} /> {t.label}
          </button>
        )
      })}
    </div>
  )

  const formFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {typeButtons}
      <div>
        <span style={lbl}>Data</span>
        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          style={{ ...field(errors.date) }} />
        {err(errors.date)}
      </div>
      <div>
        <span style={lbl}>Descrição</span>
        <input type="text" value={form.description} maxLength={200}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Ex: Supermercado, Uber, Netflix..." style={field(errors.description)} />
        {err(errors.description)}
      </div>
      <div>
        <span style={lbl}>Valor (R$)</span>
        <input type="number" value={form.amount} min="0" step="0.01"
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="0,00" style={field(errors.amount)} />
        {err(errors.amount)}
      </div>
      <div>
        <span style={lbl}>Categoria</span>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          style={{ background: c.bg700, borderColor: c.bg500, color: c.text }}>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: c.bg900, color: c.text,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ padding: '16px 20px 40px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{isEdit ? 'Editar transação' : 'Nova transação'}</h3>
          <button onClick={onCancel} style={{
            width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: c.bg700, color: c.textMuted, border: 'none',
          }}><X size={20} /></button>
        </div>

        {formFields}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button onClick={handleSave} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 700,
            background: c.accent, color: '#fff', border: 'none',
          }}>
            {isEdit ? <><Pencil size={18} /> Salvar</> : <><Plus size={18} /> Adicionar</>}
          </button>
          <button onClick={onCancel} style={{
            padding: '16px 20px', borderRadius: 14, fontSize: 16, fontWeight: 600,
            background: c.bg800, color: c.textMuted, border: `1.5px solid ${c.bg600}`,
          }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ─── */
export default function Transactions({ transactions, setTransactions, categories, existingHashes, onImport, onSnapshot }) {
  const theme = useContext(ThemeContext); const c = theme.colors
  const [search, setSearch] = useState(''); const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all'); const [minAmount, setMinAmount] = useState(''); const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('date'); const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0); const [importing, setImporting] = useState(false); const [importResult, setImportResult] = useState(null)
  const [showModal, setShowModal] = useState(false); const [editingTx, setEditingTx] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set()); const [showFilters, setShowFilters] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null); const fileRef = useRef()

  const months = useMemo(() => { const s = new Set(); transactions.forEach(t => { const mk = getMonthKey(t.date); if (mk) s.add(mk) }); return [...s].sort().reverse() }, [transactions])

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (search) { const l = search.toLowerCase(); list = list.filter(t => t.description.toLowerCase().includes(l)) }
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory)
    if (filterMonth !== 'all') list = list.filter(t => t.date?.startsWith(filterMonth))
    if (minAmount) list = list.filter(t => t.amount >= parseFloat(minAmount))
    if (maxAmount) list = list.filter(t => t.amount <= parseFloat(maxAmount))
    list.sort((a, b) => { let cmp = 0; if (sortBy === 'date') cmp = (a.date || '').localeCompare(b.date || ''); else if (sortBy === 'amount') cmp = a.amount - b.amount; else if (sortBy === 'category') cmp = (a.category || '').localeCompare(b.category || ''); return sortDir === 'desc' ? -cmp : cmp })
    return list
  }, [transactions, search, filterCategory, filterMonth, minAmount, maxAmount, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page])
  const totalFiltered = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered])
  useMemo(() => setPage(0), [search, filterCategory, filterMonth, minAmount, maxAmount])

  const handleSort = (field) => { if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortDir('desc') } }

  const handleCategoryChange = useCallback((txId, newCat) => {
    const tx = transactions.find(t => t.id === txId); if (!tx) return
    onSnapshot?.(); learnCategorization(tx.description, newCat)
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, category: newCat } : t))
  }, [transactions, setTransactions, onSnapshot])

  const handleSaveTx = useCallback((tx) => {
    onSnapshot?.()
    if (editingTx?.id) setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
    else setTransactions(prev => [...prev, tx])
    setShowModal(false); setEditingTx(null)
  }, [editingTx, setTransactions, onSnapshot])

  const handleDelete = useCallback((id) => {
    if (confirmDelete === id) { onSnapshot?.(); setTransactions(prev => prev.filter(t => t.id !== id)); setConfirmDelete(null); setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n }) }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000) }
  }, [confirmDelete, setTransactions, onSnapshot])

  const handleBulkDelete = useCallback(() => { if (!selectedIds.size) return; onSnapshot?.(); setTransactions(prev => prev.filter(t => !selectedIds.has(t.id))); setSelectedIds(new Set()) }, [selectedIds, setTransactions, onSnapshot])
  const handleBulkCategory = useCallback((cat) => { if (!selectedIds.size) return; onSnapshot?.(); setTransactions(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, category: cat } : t)); setSelectedIds(new Set()) }, [selectedIds, setTransactions, onSnapshot])
  const toggleSelect = useCallback((id) => { setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }, [])
  const toggleSelectAll = useCallback(() => { if (selectedIds.size === paginated.length) setSelectedIds(new Set()); else setSelectedIds(new Set(paginated.map(t => t.id))) }, [selectedIds, paginated])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 10 * 1024 * 1024) { setImportResult({ success: false, message: 'Arquivo muito grande (máx 10MB)' }); return }
    setImporting(true); setImportResult(null)
    try {
      const text = await file.text(); const parsed = await parseCSV(text); const keywords = loadKeywords()
      let added = 0, skipped = 0; const newTx = []
      for (const t of parsed) { if (!t.date || !t.description) continue; const hash = getTransactionHash(t); if (existingHashes.has(hash)) { skipped++; continue }
        newTx.push({ id: generateId(), date: t.date, description: t.description.slice(0, 200), amount: t.amount, category: categorizeTransaction(t.description, keywords), hash, type: 'expense' }); added++ }
      if (newTx.length > 0) onImport(newTx)
      setImportResult({ success: true, message: `${added} importadas${skipped > 0 ? `, ${skipped} duplicatas` : ''}` })
    } catch (err) { setImportResult({ success: false, message: err.message }) }
    setImporting(false); if (fileRef.current) fileRef.current.value = ''
  }

  const getCat = (id) => categories.find(c => c.id === id) || { icon: 'Package', name: 'Outros', color: '#6b7280' }
  const uncategorized = filtered.filter(t => t.category === 'outros').length
  const inputStyle = { background: c.bg700, borderColor: c.bg500, color: c.text }

  return (
    <div className="space-y-4 animate-fade-in">
      {showModal && <TransactionModal tx={editingTx} categories={categories} theme={theme} onSave={handleSaveTx} onCancel={() => { setShowModal(false); setEditingTx(null) }} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Transações</h2>
          <p className="text-xs mt-0.5" style={{ color: c.textDim }}>{filtered.length} registros{totalFiltered > 0 ? ` · ${formatCurrency(totalFiltered)}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingTx(null); setShowModal(true) }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium" style={{ background: c.accent, color: '#fff' }}>
            <Plus size={15} /> Adicionar
          </button>
          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer border"
            style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
            <Upload size={15} /> CSV
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={importing} />
          </label>
          <button onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors"
            style={{ background: showFilters ? c.accent + '12' : c.bg700, borderColor: showFilters ? c.accent + '40' : c.bg500, color: showFilters ? c.accent : c.textMuted }}>
            <Filter size={15} />
          </button>
        </div>
      </div>

      {importResult && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium border animate-scale-in"
          style={{ background: importResult.success ? '#22c55e0c' : '#ef44440c', borderColor: (importResult.success ? '#22c55e' : '#ef4444') + '25', color: importResult.success ? '#22c55e' : '#ef4444' }}>
          <span>{importResult.message}</span>
          <button onClick={() => setImportResult(null)}><X size={14} /></button>
        </div>
      )}

      {uncategorized > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border"
          style={{ background: '#f59e0b0c', borderColor: '#f59e0b25', color: '#f59e0b' }}>
          <Icon name="AlertTriangle" size={14} /> {uncategorized} transações não categorizadas
        </div>
      )}

      {showFilters && (
        <div className="rounded-xl p-4 border animate-scale-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" style={{ background: c.bg800, borderColor: c.bg600 }}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.textDim }} />
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl pl-9 pr-3 py-2 text-sm border focus:outline-none focus:ring-2" style={inputStyle} />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-xl px-3 py-2 text-sm border" style={inputStyle}>
            <option value="all">Todas categorias</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="rounded-xl px-3 py-2 text-sm border" style={inputStyle}>
            <option value="all">Todos meses</option>
            {months.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
          <input type="number" placeholder="Mín R$" value={minAmount} onChange={e => setMinAmount(e.target.value)} min="0" className="rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
          <input type="number" placeholder="Máx R$" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} min="0" className="rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="rounded-xl px-4 py-3 border flex flex-wrap items-center gap-3 animate-scale-in"
          style={{ background: c.accent + '08', borderColor: c.accent + '25' }}>
          <span className="text-xs font-semibold" style={{ color: c.accent }}>{selectedIds.size} selecionada(s)</span>
          <select onChange={e => { if (e.target.value) handleBulkCategory(e.target.value); e.target.value = '' }}
            className="rounded-lg px-2 py-1 text-xs border" style={inputStyle}>
            <option value="">Mover para...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <button onClick={handleBulkDelete} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
            style={{ background: '#ef444412', color: '#ef4444', borderColor: '#ef444425' }}>
            <Trash2 size={12} /> Excluir
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs" style={{ color: c.textDim }}>Limpar</button>
        </div>
      )}

      {/* Empty state */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-20 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: c.accent + '12' }}>
            <Receipt size={24} style={{ color: c.accent }} />
          </div>
          <h3 className="text-base font-semibold mb-1">Sem transações</h3>
          <p className="text-sm text-center max-w-xs mb-5" style={{ color: c.textMuted }}>Adicione manualmente ou importe um CSV.</p>
          <div className="flex gap-3">
            <button onClick={() => { setEditingTx(null); setShowModal(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: c.accent, color: '#fff' }}>
              <Plus size={15} /> Adicionar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-xl border overflow-hidden" style={{ background: c.bg800, borderColor: c.bg600 }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.bg600}` }}>
                    <th className="px-3 py-3 w-8 text-left">
                      <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size === paginated.length && paginated.length > 0} className="rounded" />
                    </th>
                    {[{ key: 'date', label: 'Data' }, { key: 'description', label: 'Descrição' }, { key: 'amount', label: 'Valor' }, { key: 'category', label: 'Categoria' }].map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)}
                        className="text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none"
                        style={{ color: sortBy === col.key ? c.accent : c.textDim }} aria-sort={sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                        <span className="flex items-center gap-1">{col.label} {sortBy === col.key && <ArrowUpDown size={11} />}</span>
                      </th>
                    ))}
                    <th className="px-3 py-3 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: c.textDim }}>Nenhuma transação encontrada</td></tr>
                  ) : paginated.map(tx => {
                    const cat = getCat(tx.category)
                    const isUncategorized = tx.category === 'outros'
                    const selected = selectedIds.has(tx.id)
                    return (
                      <tr key={tx.id} className="group transition-colors"
                        style={{ borderBottom: `1px solid ${c.bg700}`, background: selected ? c.accent + '06' : 'transparent' }}>
                        <td className="px-3 py-2.5"><input type="checkbox" checked={selected} onChange={() => toggleSelect(tx.id)} className="rounded" /></td>
                        <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: c.textMuted }}>{formatDate(tx.date)}</td>
                        <td className="px-3 py-2.5 text-sm max-w-[240px] truncate" title={tx.description}>{tx.description}</td>
                        <td className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap tabular-nums" style={{ color: tx.type === 'income' ? '#22c55e' : '#ef4444' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: (cat.color || c.accent) + '18' }}>
                              <Icon name={cat.icon} size={12} style={{ color: cat.color || c.accent }} />
                            </div>
                            <select value={tx.category} onChange={e => handleCategoryChange(tx.id, e.target.value)}
                              className="text-xs rounded-lg px-1.5 py-1 border bg-transparent focus:outline-none"
                              style={{ borderColor: isUncategorized ? '#f59e0b30' : 'transparent', color: isUncategorized ? '#f59e0b' : c.textMuted }}>
                              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingTx(tx); setShowModal(true) }} className="p-1.5 rounded-lg" style={{ color: c.textDim }} aria-label="Editar"><Pencil size={13} /></button>
                            <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg"
                              style={{ color: confirmDelete === tx.id ? '#fff' : '#ef4444', background: confirmDelete === tx.id ? '#ef4444' : 'transparent', borderRadius: '8px' }}
                              aria-label="Excluir">{confirmDelete === tx.id ? <span className="text-[10px] font-semibold px-1">Confirmar</span> : <Trash2 size={13} />}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-lg border disabled:opacity-20" style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pn = i; if (totalPages > 7) { if (page < 4) pn = i; else if (page > totalPages - 4) pn = totalPages - 7 + i; else pn = page - 3 + i }
                return (
                  <button key={pn} onClick={() => setPage(pn)} className="w-8 h-8 rounded-lg text-xs font-medium"
                    style={{ background: page === pn ? c.accent : c.bg700, color: page === pn ? '#fff' : c.textMuted }}>{pn + 1}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border disabled:opacity-20" style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
