import React, { useState, useMemo, useContext } from 'react'
import { formatCurrency, formatDate, generateId, validateAmount, validateDescription, getTodayISO } from '../utils/helpers.js'
import { ThemeContext } from '../App.jsx'
import Icon from './Icon.jsx'
import {
  Plus, Pencil, Trash2, Check, X, CreditCard, Calendar, DollarSign,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, Banknote,
  TrendingDown, CircleDollarSign, Receipt,
} from 'lucide-react'

/* ─── Add/Edit Debt Modal ─── */
function DebtModal({ debt, onSave, onCancel, theme }) {
  const c = theme.colors
  const isEdit = !!debt?.id
  const [form, setForm] = useState({
    name: debt?.name || '',
    description: debt?.description || '',
    totalAmount: debt?.totalAmount ? String(debt.totalAmount) : '',
    installments: debt?.installments ? String(debt.installments) : '',
    installmentValue: debt?.installmentValue ? String(debt.installmentValue) : '',
    startDate: debt?.startDate || getTodayISO(),
    dueDay: debt?.dueDay ? String(debt.dueDay) : '10',
    interestRate: debt?.interestRate ? String(debt.interestRate) : '0',
  })
  const [errors, setErrors] = useState({})

  // Auto-calculate installment value
  const handleTotalChange = (val) => {
    setForm(f => {
      const newForm = { ...f, totalAmount: val }
      const total = parseFloat(val)
      const inst = parseInt(f.installments)
      if (total > 0 && inst > 0) newForm.installmentValue = (total / inst).toFixed(2)
      return newForm
    })
  }

  const handleInstallmentsChange = (val) => {
    setForm(f => {
      const newForm = { ...f, installments: val }
      const total = parseFloat(f.totalAmount)
      const inst = parseInt(val)
      if (total > 0 && inst > 0) newForm.installmentValue = (total / inst).toFixed(2)
      return newForm
    })
  }

  const handleSave = () => {
    const errs = {}
    const nameV = validateDescription(form.name)
    const totalV = validateAmount(form.totalAmount)
    if (!nameV.valid) errs.name = nameV.error
    if (!totalV.valid) errs.totalAmount = totalV.error
    const inst = parseInt(form.installments)
    if (isNaN(inst) || inst < 1 || inst > 360) errs.installments = 'Entre 1 e 360'
    const day = parseInt(form.dueDay)
    if (isNaN(day) || day < 1 || day > 31) errs.dueDay = 'Dia inválido'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSave({
      id: debt?.id || generateId(),
      name: nameV.value,
      description: form.description.trim(),
      totalAmount: totalV.value,
      installments: inst,
      installmentValue: parseFloat(form.installmentValue) || (totalV.value / inst),
      startDate: form.startDate,
      dueDay: day,
      interestRate: parseFloat(form.interestRate) || 0,
      payments: debt?.payments || [],
      createdAt: debt?.createdAt || new Date().toISOString(),
    })
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
  const field = (err) => ({ background: c.bg700, borderColor: err ? '#ef4444' : c.bg500, color: c.text })

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={onCancel}>
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl px-5 pt-6 pb-8 sm:p-6 border-t sm:border animate-scale-in overflow-y-auto max-h-[85vh]"
        style={{ background: c.bg800, borderColor: c.bg600, color: c.text, boxShadow: `0 -4px 32px rgba(0,0,0,0.4)` }}
        onClick={e => e.stopPropagation()}>

        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: c.bg500 }} />
        </div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">{isEdit ? 'Editar dívida' : 'Nova dívida'}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: c.textDim }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Nome da dívida</label>
            <input type="text" value={form.name} maxLength={100} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Celular Samsung, Notebook, Empréstimo..." autoFocus
              className={inputClass} style={field(errors.name)} />
            {errors.name && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Descrição (opcional)</label>
            <input type="text" value={form.description} maxLength={200} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detalhes adicionais..." className={inputClass} style={field()} />
          </div>

          {/* Total + Installments row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Valor total (R$)</label>
              <input type="number" value={form.totalAmount} min="0" step="0.01" onChange={e => handleTotalChange(e.target.value)}
                placeholder="0,00" className={inputClass} style={field(errors.totalAmount)} />
              {errors.totalAmount && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.totalAmount}</p>}
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Parcelas</label>
              <input type="number" value={form.installments} min="1" max="360" onChange={e => handleInstallmentsChange(e.target.value)}
                placeholder="12" className={inputClass} style={field(errors.installments)} />
              {errors.installments && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.installments}</p>}
            </div>
          </div>

          {/* Installment value + Due day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Valor da parcela (R$)</label>
              <input type="number" value={form.installmentValue} min="0" step="0.01"
                onChange={e => setForm(f => ({ ...f, installmentValue: e.target.value }))}
                placeholder="Calculado automaticamente" className={inputClass} style={field()} />
              <p className="text-[10px] mt-1" style={{ color: c.textDim }}>Calculado ao preencher total e parcelas</p>
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Dia de vencimento</label>
              <input type="number" value={form.dueDay} min="1" max="31"
                onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))}
                className={inputClass} style={field(errors.dueDay)} />
              {errors.dueDay && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{errors.dueDay}</p>}
            </div>
          </div>

          {/* Start date + Interest */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Data de início</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className={inputClass} style={{ ...field(), colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1.5 block uppercase tracking-wider" style={{ color: c.textDim }}>Juros mensal (%)</label>
              <input type="number" value={form.interestRate} min="0" step="0.1"
                onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))}
                placeholder="0" className={inputClass} style={field()} />
              <p className="text-[10px] mt-1" style={{ color: c.textDim }}>0 se não houver juros</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: c.accent, color: '#fff' }}>
            {isEdit ? <><Pencil size={14} /> Salvar</> : <><Plus size={14} /> Adicionar</>}
          </button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm font-medium border"
            style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Payment Modal ─── */
function PaymentModal({ debt, onSave, onCancel, theme }) {
  const c = theme.colors
  const [form, setForm] = useState({
    amount: String(debt.installmentValue),
    date: getTodayISO(),
    note: '',
  })
  const [error, setError] = useState('')

  const handleSave = () => {
    const v = validateAmount(form.amount)
    if (!v.valid) { setError(v.error); return }
    setError('')
    onSave({
      id: generateId(),
      amount: v.value,
      date: form.date,
      note: form.note.trim(),
      paidAt: new Date().toISOString(),
    })
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
  const field = (err) => ({ background: c.bg700, borderColor: err ? '#ef4444' : c.bg500, color: c.text })

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={onCancel}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl px-5 pt-6 pb-8 sm:p-5 border-t sm:border animate-scale-in max-h-[85vh] overflow-y-auto"
        style={{ background: c.bg800, borderColor: c.bg600, color: c.text, boxShadow: '0 -4px 32px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: c.bg500 }} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Registrar pagamento</h3>
          <button onClick={onCancel} className="p-1.5 rounded-lg" style={{ color: c.textDim }}><X size={16} /></button>
        </div>

        <p className="text-xs mb-4" style={{ color: c.textMuted }}>
          {debt.name} — Parcela sugerida: <span className="font-semibold" style={{ color: c.accent }}>{formatCurrency(debt.installmentValue)}</span>
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium mb-1 block uppercase tracking-wider" style={{ color: c.textDim }}>Valor pago (R$)</label>
            <input type="number" value={form.amount} min="0" step="0.01" onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className={inputClass} style={field(error)} autoFocus />
            {error && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{error}</p>}
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1 block uppercase tracking-wider" style={{ color: c.textDim }}>Data</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={inputClass} style={{ ...field(), colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="text-[11px] font-medium mb-1 block uppercase tracking-wider" style={{ color: c.textDim }}>Observação (opcional)</label>
            <input type="text" value={form.note} maxLength={100} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Ex: Paguei adiantado, parcela com desconto..." className={inputClass} style={field()} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#22c55e', color: '#fff' }}>
            <Check size={14} /> Confirmar pagamento
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Debt Card ─── */
function DebtCard({ debt, onEdit, onDelete, onPay, onToggleExpand, expanded, theme }) {
  const c = theme.colors
  const totalPaid = debt.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = debt.totalAmount - totalPaid
  const paidInstallments = debt.payments.length
  const progress = debt.totalAmount > 0 ? (totalPaid / debt.totalAmount) * 100 : 0
  const isComplete = remaining <= 0

  // Next due date
  const now = new Date()
  const currentDay = now.getDate()
  const isOverdue = !isComplete && currentDay > debt.dueDay && paidInstallments < debt.installments
  const isDueSoon = !isComplete && !isOverdue && (debt.dueDay - currentDay <= 5 && debt.dueDay - currentDay >= 0)

  let statusColor = c.accent
  let statusLabel = `${paidInstallments}/${debt.installments} parcelas`
  if (isComplete) { statusColor = '#22c55e'; statusLabel = 'Quitada' }
  else if (isOverdue) { statusColor = '#ef4444'; statusLabel = 'Vencida' }
  else if (isDueSoon) { statusColor = '#f59e0b'; statusLabel = `Vence dia ${debt.dueDay}` }

  return (
    <div className="rounded-xl border transition-all" style={{ background: c.bg800, borderColor: isOverdue ? '#ef444430' : c.bg600 }}>
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isComplete ? '#22c55e18' : statusColor + '18' }}>
            {isComplete ? <CheckCircle2 size={20} style={{ color: '#22c55e' }} /> : <CreditCard size={20} style={{ color: statusColor }} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold truncate">{debt.name}</h4>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: statusColor + '15', color: statusColor }}>
                  {statusLabel}
                </span>
                {expanded ? <ChevronUp size={14} style={{ color: c.textDim }} /> : <ChevronDown size={14} style={{ color: c.textDim }} />}
              </div>
            </div>

            {debt.description && <p className="text-[11px] mt-0.5 truncate" style={{ color: c.textDim }}>{debt.description}</p>}

            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span style={{ color: c.textMuted }}>Pago: <span className="font-semibold" style={{ color: '#22c55e' }}>{formatCurrency(totalPaid)}</span></span>
                <span style={{ color: c.textMuted }}>Total: <span className="font-semibold">{formatCurrency(debt.totalAmount)}</span></span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: c.bg600 }}>
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(progress, 100)}%`, background: isComplete ? '#22c55e' : `linear-gradient(90deg, ${c.accent}, ${c.accentLight})` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: c.textDim }}>
                <span>{progress.toFixed(0)}% pago</span>
                <span>{isComplete ? 'Concluída!' : `Faltam ${formatCurrency(remaining)}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 animate-fade-in" style={{ borderColor: c.bg600 }}>
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { icon: Banknote, label: 'Parcela', value: formatCurrency(debt.installmentValue), color: c.accent },
              { icon: Calendar, label: 'Vencimento', value: `Dia ${debt.dueDay}`, color: c.textMuted },
              { icon: TrendingDown, label: 'Restante', value: formatCurrency(remaining), color: remaining > 0 ? '#ef4444' : '#22c55e' },
              { icon: Receipt, label: 'Pagas', value: `${paidInstallments} de ${debt.installments}`, color: c.accent },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <div key={i} className="rounded-lg p-2.5 border" style={{ background: c.bg700, borderColor: c.bg600 }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ItemIcon size={11} style={{ color: c.textDim }} />
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: c.textDim }}>{item.label}</span>
                  </div>
                  <p className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.value}</p>
                </div>
              )
            })}
          </div>

          {debt.interestRate > 0 && (
            <p className="text-[11px] mb-3 px-1" style={{ color: c.textDim }}>
              Juros: {debt.interestRate}% ao mês
            </p>
          )}

          {/* Payment history */}
          {debt.payments.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textDim }}>Histórico de pagamentos</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {debt.payments.slice().reverse().map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
                    style={{ background: c.bg700 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#22c55e18' }}>
                      <Check size={10} style={{ color: '#22c55e' }} />
                    </div>
                    <span className="text-[11px] tabular-nums" style={{ color: c.textDim }}>{formatDate(p.date)}</span>
                    <span className="flex-1 truncate" style={{ color: c.textMuted }}>{p.note || `Parcela ${debt.payments.length - i}`}</span>
                    <span className="font-semibold tabular-nums" style={{ color: '#22c55e' }}>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isComplete && (
              <button onClick={() => onPay(debt)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#22c55e', color: '#fff' }}>
                <DollarSign size={13} /> Registrar pagamento
              </button>
            )}
            <button onClick={() => onEdit(debt)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border"
              style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
              <Pencil size={12} /> Editar
            </button>
            <button onClick={() => onDelete(debt.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border"
              style={{ background: '#ef444410', borderColor: '#ef444425', color: '#ef4444' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Debts Page ─── */
export default function Debts({ debts, setDebts }) {
  const theme = useContext(ThemeContext)
  const c = theme.colors

  const [showModal, setShowModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [payingDebt, setPayingDebt] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, completed

  const filtered = useMemo(() => {
    if (filter === 'active') return debts.filter(d => d.payments.reduce((s, p) => s + p.amount, 0) < d.totalAmount)
    if (filter === 'completed') return debts.filter(d => d.payments.reduce((s, p) => s + p.amount, 0) >= d.totalAmount)
    return debts
  }, [debts, filter])

  const summary = useMemo(() => {
    let totalDebt = 0, totalPaid = 0, totalRemaining = 0, activeCount = 0, completedCount = 0, monthlyPayment = 0
    debts.forEach(d => {
      const paid = d.payments.reduce((s, p) => s + p.amount, 0)
      totalDebt += d.totalAmount; totalPaid += paid
      const rem = d.totalAmount - paid
      if (rem > 0) { totalRemaining += rem; activeCount++; monthlyPayment += d.installmentValue }
      else completedCount++
    })
    return { totalDebt, totalPaid, totalRemaining, activeCount, completedCount, monthlyPayment }
  }, [debts])

  const handleSaveDebt = (debt) => {
    if (editingDebt?.id) setDebts(prev => prev.map(d => d.id === debt.id ? { ...debt, payments: d.payments } : d))
    else setDebts(prev => [...prev, debt])
    setShowModal(false); setEditingDebt(null)
  }

  const handlePayment = (payment) => {
    setDebts(prev => prev.map(d => d.id === payingDebt.id ? { ...d, payments: [...d.payments, payment] } : d))
    setPayingDebt(null)
  }

  const handleDelete = (id) => {
    if (confirmDelete === id) { setDebts(prev => prev.filter(d => d.id !== id)); setConfirmDelete(null); if (expandedId === id) setExpandedId(null) }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {showModal && <DebtModal debt={editingDebt} theme={theme} onSave={handleSaveDebt} onCancel={() => { setShowModal(false); setEditingDebt(null) }} />}
      {payingDebt && <PaymentModal debt={payingDebt} theme={theme} onSave={handlePayment} onCancel={() => setPayingDebt(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Dívidas</h2>
          <p className="text-xs mt-0.5" style={{ color: c.textDim }}>Acompanhe seus parcelamentos e financiamentos</p>
        </div>
        <button onClick={() => { setEditingDebt(null); setShowModal(true) }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium"
          style={{ background: c.accent, color: '#fff' }}>
          <Plus size={15} /> Nova dívida
        </button>
      </div>

      {/* Summary cards */}
      {debts.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: CreditCard, label: 'Total em dívidas', value: formatCurrency(summary.totalDebt), color: c.text },
            { icon: CheckCircle2, label: 'Total pago', value: formatCurrency(summary.totalPaid), color: '#22c55e' },
            { icon: TrendingDown, label: 'Falta pagar', value: formatCurrency(summary.totalRemaining), color: '#ef4444' },
            { icon: CircleDollarSign, label: 'Parcelas/mês', value: formatCurrency(summary.monthlyPayment), color: '#f59e0b' },
          ].map((card, i) => {
            const CardIcon = card.icon
            return (
              <div key={i} className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: c.textDim }}>{card.label}</span>
                  <CardIcon size={14} style={{ color: c.textDim }} />
                </div>
                <p className="text-lg font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      {debts.length > 0 && (
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: `Todas (${debts.length})` },
            { id: 'active', label: `Ativas (${summary.activeCount})` },
            { id: 'completed', label: `Quitadas (${summary.completedCount})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: filter === f.id ? c.accent + '15' : c.bg700, color: filter === f.id ? c.accent : c.textMuted }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {debts.length === 0 ? (
        <div className="flex flex-col items-center py-20 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: c.accent + '12' }}>
            <CreditCard size={24} style={{ color: c.accent }} />
          </div>
          <h3 className="text-base font-semibold mb-1">Sem dívidas</h3>
          <p className="text-sm text-center max-w-xs mb-5" style={{ color: c.textMuted }}>
            Adicione seus parcelamentos, financiamentos e empréstimos para acompanhar o progresso dos pagamentos.
          </p>
          <button onClick={() => { setEditingDebt(null); setShowModal(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: c.accent, color: '#fff' }}>
            <Plus size={15} /> Adicionar primeira dívida
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(debt => (
            <DebtCard key={debt.id} debt={debt} theme={theme}
              expanded={expandedId === debt.id}
              onToggleExpand={() => setExpandedId(expandedId === debt.id ? null : debt.id)}
              onEdit={(d) => { setEditingDebt(d); setShowModal(true) }}
              onDelete={handleDelete}
              onPay={(d) => setPayingDebt(d)} />
          ))}
        </div>
      )}

      {/* Confirm delete toast */}
      {confirmDelete && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium animate-scale-in border flex items-center gap-3"
          style={{ background: c.bg700, borderColor: '#ef444430', color: '#ef4444' }}>
          <AlertTriangle size={14} />
          Clique novamente em excluir para confirmar
        </div>
      )}
    </div>
  )
}
