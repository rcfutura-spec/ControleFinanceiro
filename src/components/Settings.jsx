import React, { useState, useMemo, useContext } from 'react'
import { formatCurrency, getMonthKey, getMonthLabel, generateId, validateAmount, validateDescription } from '../utils/helpers.js'
import { storage } from '../utils/storage.js'
import { ThemeContext } from '../App.jsx'
import ThemePicker from './ThemePicker.jsx'
import Icon from './Icon.jsx'
import {
  DollarSign, Target, TrendingUp, RefreshCw, Plus, Trash2, Check, X,
  Download, Upload, FileSpreadsheet, FileText, Database, AlertTriangle,
  BarChart3, Calendar, Tags, Receipt, HardDrive,
} from 'lucide-react'

function Section({ title, icon: SectionIcon, children, theme, danger }) {
  const c = theme.colors
  return (
    <div className="rounded-xl p-5 border" style={{ background: c.bg800, borderColor: danger ? '#ef444420' : c.bg600 }}>
      <div className="flex items-center gap-2 mb-4">
        <SectionIcon size={16} style={{ color: danger ? '#ef4444' : c.textMuted }} />
        <h3 className="text-sm font-semibold" style={{ color: danger ? '#ef4444' : c.text }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function RecurringSection({ recurring, setRecurring, categories, theme }) {
  const c = theme.colors
  const [form, setForm] = useState({ description: '', amount: '', category: 'outros', dayOfMonth: '1' })
  const inputStyle = { background: c.bg700, borderColor: c.bg500, color: c.text }

  const handleAdd = () => {
    const desc = form.description.trim(); const amt = parseFloat(form.amount); const day = parseInt(form.dayOfMonth)
    if (!desc || isNaN(amt) || amt <= 0 || isNaN(day) || day < 1 || day > 31) return
    setRecurring(prev => [...prev, { id: generateId(), description: desc, amount: amt, category: form.category, dayOfMonth: day, active: true }])
    setForm({ description: '', amount: '', category: 'outros', dayOfMonth: '1' })
  }

  return (
    <Section title="Gastos recorrentes" icon={RefreshCw} theme={theme}>
      <p className="text-xs mb-4" style={{ color: c.textDim }}>Aluguel, assinaturas e contas fixas mensais.</p>
      {recurring.length > 0 && (
        <div className="space-y-2 mb-4">
          {recurring.map(r => {
            const cat = categories.find(ct => ct.id === r.category)
            return (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm"
                style={{ background: c.bg700, borderColor: c.bg600, opacity: r.active ? 1 : 0.4 }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: (cat?.color || '#6b7280') + '18' }}>
                  <Icon name={cat?.icon || 'Package'} size={12} style={{ color: cat?.color || '#6b7280' }} />
                </div>
                <span className="flex-1 truncate text-xs">{r.description}</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: '#ef4444' }}>{formatCurrency(r.amount)}</span>
                <span className="text-[10px]" style={{ color: c.textDim }}>dia {r.dayOfMonth}</span>
                <button onClick={() => setRecurring(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))}
                  className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: r.active ? '#22c55e18' : c.bg600 }}>
                  {r.active ? <Check size={12} style={{ color: '#22c55e' }} /> : <X size={12} style={{ color: c.textDim }} />}
                </button>
                <button onClick={() => setRecurring(prev => prev.filter(x => x.id !== r.id))} className="p-1" style={{ color: '#ef4444' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
          <p className="text-[11px]" style={{ color: c.textDim }}>
            Total recorrente: <span style={{ color: '#ef4444' }}>{formatCurrency(recurring.filter(r => r.active).reduce((s, r) => s + r.amount, 0))}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descrição" className="sm:col-span-2 rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
        <input type="number" value={form.amount} min="0" step="0.01" onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="Valor" className="rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="rounded-xl px-3 py-2 text-sm border" style={inputStyle}>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="number" value={form.dayOfMonth} min="1" max="31" onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
            placeholder="Dia" className="w-16 rounded-xl px-2 py-2 text-sm border text-center" style={inputStyle} />
          <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: c.accent, color: '#fff' }}><Plus size={14} /></button>
        </div>
      </div>
    </Section>
  )
}

function IncomeSection({ incomes, setIncomes, theme }) {
  const c = theme.colors
  const [form, setForm] = useState({ description: '', amount: '', recurring: false })
  const inputStyle = { background: c.bg700, borderColor: c.bg500, color: c.text }

  const handleAdd = () => {
    const desc = form.description.trim(); const amt = parseFloat(form.amount)
    if (!desc || isNaN(amt) || amt <= 0) return
    setIncomes(prev => [...prev, { id: generateId(), description: desc, amount: amt, recurring: form.recurring }])
    setForm({ description: '', amount: '', recurring: false })
  }

  return (
    <Section title="Receitas extras" icon={TrendingUp} theme={theme}>
      <p className="text-xs mb-4" style={{ color: c.textDim }}>Freelance, bônus e outras rendas além do salário.</p>
      {incomes.length > 0 && (
        <div className="space-y-2 mb-4">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm"
              style={{ background: c.bg700, borderColor: c.bg600 }}>
              <DollarSign size={14} style={{ color: '#22c55e' }} />
              <span className="flex-1 truncate text-xs">{inc.description}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: '#22c55e' }}>+{formatCurrency(inc.amount)}</span>
              {inc.recurring && <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: c.accent + '18', color: c.accent }}>Mensal</span>}
              <button onClick={() => setIncomes(prev => prev.filter(i => i.id !== inc.id))} className="p-1" style={{ color: '#ef4444' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descrição" className="rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
        <input type="number" value={form.amount} min="0" step="0.01" onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="Valor" className="rounded-xl px-3 py-2 text-sm border" style={inputStyle} />
        <label className="flex items-center gap-2 text-xs cursor-pointer px-3" style={{ color: c.textMuted }}>
          <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} className="rounded" />
          Mensal
        </label>
        <button onClick={handleAdd} className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium"
          style={{ background: '#22c55e', color: '#fff' }}><Plus size={14} /> Adicionar</button>
      </div>
    </Section>
  )
}

export default function Settings({ salary, setSalary, transactions, categories, onReset, themeId, onThemeChange,
  savingsGoal, setSavingsGoal, recurring, setRecurring, incomes, setIncomes, onAppUpdate }) {
  const theme = useContext(ThemeContext); const c = theme.colors
  const [salaryInput, setSalaryInput] = useState(String(salary))
  const [salaryError, setSalaryError] = useState('')
  const [goalInput, setGoalInput] = useState(String(savingsGoal || ''))
  const [confirmReset, setConfirmReset] = useState(false)
  const [exportMonth, setExportMonth] = useState('')
  const [backupMsg, setBackupMsg] = useState('')

  const months = useMemo(() => { const s = new Set(); transactions.forEach(t => { const mk = getMonthKey(t.date); if (mk) s.add(mk) }); return [...s].sort().reverse() }, [transactions])

  const handleSalarySave = () => { const v = validateAmount(salaryInput); if (!v.valid) { setSalaryError(v.error); return }; setSalaryError(''); setSalary(v.value) }
  const handleGoalSave = () => { setSavingsGoal(Math.max(0, parseFloat(goalInput) || 0)) }
  const handleReset = () => { if (confirmReset) { onReset(); setConfirmReset(false) } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 5000) } }

  function dl(filename, content, type) { const b = new Blob([content], { type }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = filename; a.click(); URL.revokeObjectURL(u) }

  const handleExportCSV = () => { const m = exportMonth || months[0]; if (!m) return; const tx = transactions.filter(t => t.date?.startsWith(m)); const h = 'Data,Descrição,Valor,Categoria,Tipo'; const rows = tx.map(t => { const cat = categories.find(ct => ct.id === t.category); return `${t.date},"${t.description.replace(/"/g, '""')}",${t.amount.toFixed(2)},${cat?.name || 'Outros'},${t.type || 'expense'}` }); dl(`transacoes-${m}.csv`, [h, ...rows].join('\n'), 'text/csv;charset=utf-8') }

  const handleExportTxt = () => { const m = exportMonth || months[0]; if (!m) return; const tx = transactions.filter(t => t.date?.startsWith(m)); const total = tx.reduce((s, t) => s + t.amount, 0); let text = `RESUMO - ${getMonthLabel(m)}\n${'='.repeat(40)}\nSalário: ${formatCurrency(salary)}\nGasto: ${formatCurrency(total)}\nSaldo: ${formatCurrency(salary - total)}\n\nCATEGORIAS\n${'-'.repeat(40)}\n`; const byC = {}; categories.forEach(cat => { byC[cat.id] = { ...cat, spent: 0 } }); tx.forEach(t => { if (byC[t.category]) byC[t.category].spent += t.amount }); Object.values(byC).filter(cat => cat.spent > 0).forEach(cat => { text += `${cat.name}: ${formatCurrency(cat.spent)} / ${formatCurrency(cat.limit)}\n` }); text += `\nTRANSAÇÕES (${tx.length})\n${'-'.repeat(40)}\n`; tx.sort((a, b) => a.date.localeCompare(b.date)).forEach(t => { const cat = categories.find(ct => ct.id === t.category); text += `${t.date} | ${t.description.slice(0, 35).padEnd(35)} | ${formatCurrency(t.amount).padStart(12)} | ${cat?.name || 'Outros'}\n` }); dl(`resumo-${m}.txt`, text, 'text/plain;charset=utf-8') }

  const handleBackup = () => { dl(`backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(storage.exportAll(), null, 2), 'application/json'); setBackupMsg('Backup salvo!'); setTimeout(() => setBackupMsg(''), 3000) }
  const handleRestore = async (e) => { const f = e.target.files?.[0]; if (!f) return; try { storage.importAll(JSON.parse(await f.text())); setBackupMsg('Restaurado! Recarregue a página.') } catch { setBackupMsg('Arquivo inválido') }; setTimeout(() => setBackupMsg(''), 5000) }

  const inputStyle = { background: c.bg700, borderColor: c.bg500, color: c.text }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Configurações</h2>
        <p className="text-xs mt-0.5" style={{ color: c.textDim }}>Personalize seu controle financeiro</p>
      </div>

      {/* App Update */}
      <Section title="Atualização do app" icon={RefreshCw} theme={theme}>
        <p className="text-xs mb-3" style={{ color: c.textDim }}>
          Verifique se há uma nova versão disponível e atualize o app.
        </p>
        <button onClick={onAppUpdate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full justify-center"
          style={{ background: c.accent, color: '#fff' }}>
          <RefreshCw size={15} /> Verificar e atualizar
        </button>
      </Section>

      {/* Theme */}
      <div className="rounded-xl p-5 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
        <ThemePicker currentTheme={themeId} onThemeChange={onThemeChange} />
      </div>

      {/* Salary */}
      <Section title="Salário mensal" icon={DollarSign} theme={theme}>
        <div className="flex gap-3">
          <input type="number" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} min="0" step="100"
            placeholder="Valor em R$" className="flex-1" style={inputStyle} />
          <button onClick={handleSalarySave} className="px-5 rounded-xl text-sm font-semibold shrink-0" style={{ background: c.accent, color: '#fff' }}>Salvar</button>
        </div>
        {salaryError && <p className="text-[11px] mt-1" style={{ color: '#ef4444' }}>{salaryError}</p>}
        {salary > 0 && <p className="text-[11px] mt-2" style={{ color: c.textDim }}>Atual: {formatCurrency(salary)}</p>}
      </Section>

      {/* Goal */}
      <Section title="Meta de economia" icon={Target} theme={theme}>
        <p className="text-xs mb-3" style={{ color: c.textDim }}>Quanto quer guardar por mês? Acompanhe no Dashboard.</p>
        <div className="flex gap-3">
          <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} min="0" step="50"
            placeholder="Valor em R$" className="flex-1" style={inputStyle} />
          <button onClick={handleGoalSave} className="px-5 rounded-xl text-sm font-semibold shrink-0" style={{ background: c.accent, color: '#fff' }}>Salvar</button>
        </div>
      </Section>

      <IncomeSection incomes={incomes} setIncomes={setIncomes} theme={theme} />
      <RecurringSection recurring={recurring} setRecurring={setRecurring} categories={categories} theme={theme} />

      {/* Export */}
      <Section title="Exportar dados" icon={Download} theme={theme}>
        <div className="flex flex-wrap gap-3">
          <select value={exportMonth} onChange={e => setExportMonth(e.target.value)}
            className="flex-1 min-w-[160px] rounded-xl px-3 py-2.5 text-sm border" style={inputStyle}>
            {months.length === 0 && <option value="">Nenhum mês</option>}
            {months.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
          <button onClick={handleExportCSV} disabled={!months.length} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: c.accent, color: '#fff' }}><FileSpreadsheet size={14} /> CSV</button>
          <button onClick={handleExportTxt} disabled={!months.length} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: c.accentDark, color: '#fff' }}><FileText size={14} /> Relatório</button>
        </div>
      </Section>

      {/* Backup */}
      <Section title="Backup" icon={Database} theme={theme}>
        <p className="text-xs mb-3" style={{ color: c.textDim }}>Salve ou restaure todos os seus dados.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleBackup} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: c.accent, color: '#fff' }}><Download size={14} /> Baixar backup</button>
          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer border"
            style={{ background: c.bg700, borderColor: c.bg500, color: c.textMuted }}>
            <Upload size={14} /> Restaurar
            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </label>
        </div>
        {backupMsg && <p className="text-xs mt-2" style={{ color: backupMsg.includes('salvo') || backupMsg.includes('Restaurado') ? '#22c55e' : '#ef4444' }}>{backupMsg}</p>}
      </Section>

      {/* Stats */}
      <Section title="Estatísticas" icon={BarChart3} theme={theme}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Receipt, label: 'Transações', value: transactions.length, color: c.accent },
            { icon: Calendar, label: 'Meses', value: months.length, color: c.accent },
            { icon: Tags, label: 'Categorias', value: categories.length, color: c.accent },
            { icon: DollarSign, label: 'Total gasto', value: formatCurrency(transactions.reduce((s, t) => s + t.amount, 0)), color: '#ef4444' },
          ].map((s, i) => { const SI = s.icon; return (
            <div key={i}>
              <div className="flex items-center gap-1.5 mb-1"><SI size={12} style={{ color: c.textDim }} /><span className="text-[11px]" style={{ color: c.textDim }}>{s.label}</span></div>
              <p className="text-lg font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            </div>
          )})}
        </div>
        <div className="mt-3 pt-3 flex items-center gap-1.5" style={{ borderTop: `1px solid ${c.bg600}` }}>
          <HardDrive size={12} style={{ color: c.textDim }} />
          <p className="text-[11px]" style={{ color: c.textDim }}>
            Storage: {storage.getUsageMB()} MB / ~5 MB
            {storage.isNearFull() && <span style={{ color: '#f59e0b' }}> — Quase cheio</span>}
          </p>
        </div>
      </Section>

      {/* Reset */}
      <Section title="Zona de perigo" icon={AlertTriangle} theme={theme} danger>
        <p className="text-xs mb-4" style={{ color: c.textMuted }}>Apagar todos os dados permanentemente. O tema será mantido.</p>
        <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{ background: confirmReset ? '#ef4444' : '#ef444410', borderColor: '#ef444430', color: confirmReset ? '#fff' : '#ef4444' }}>
          <Trash2 size={14} /> {confirmReset ? 'Clique para confirmar' : 'Resetar dados'}
        </button>
      </Section>
    </div>
  )
}
