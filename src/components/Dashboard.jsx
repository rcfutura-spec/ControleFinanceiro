import React, { useMemo, useContext } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts'
import { formatCurrency, getMonthLabel, getDaysInMonth, getDayOfMonth } from '../utils/helpers.js'
import { ThemeContext } from '../App.jsx'
import Icon from './Icon.jsx'
import {
  Wallet, TrendingDown, TrendingUp, PiggyBank, Target, AlertTriangle,
  CircleAlert, ChevronDown, BarChart3, PieChartIcon, Activity, ArrowUpRight, ArrowDownRight,
  CreditCard, CheckCircle2,
} from 'lucide-react'

function HealthBadge({ percentage, c }) {
  let bg, fg, label
  if (percentage <= 50) { bg = '#22c55e20'; fg = '#22c55e'; label = 'Excelente' }
  else if (percentage <= 70) { bg = '#3b82f620'; fg = '#3b82f6'; label = 'Bom' }
  else if (percentage <= 85) { bg = '#f59e0b20'; fg = '#f59e0b'; label = 'Atenção' }
  else if (percentage <= 100) { bg = '#f9731620'; fg = '#f97316'; label = 'Crítico' }
  else { bg = '#ef444420'; fg = '#ef4444'; label = 'Estourado' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: bg, color: fg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: fg }} />
      {label}
    </span>
  )
}

function CategoryCard({ category, spent, limit, theme }) {
  const c = theme.colors
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const isWarning = pct > 80 && pct <= 100
  const isDanger = pct > 100
  const barColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : category.color || c.accent

  return (
    <div className="rounded-xl p-4 border transition-all hover:translate-y-[-1px] hover:shadow-lg"
      style={{ background: c.bg800, borderColor: isDanger ? '#ef444440' : c.bg600 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: (category.color || c.accent) + '18' }}>
            <Icon name={category.icon} size={16} style={{ color: category.color || c.accent }} />
          </div>
          <span className="text-sm font-medium">{category.name}</span>
        </div>
        {isDanger && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ef444418', color: '#ef4444' }}>
            Estourado
          </span>
        )}
        {isWarning && !isDanger && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f59e0b18', color: '#f59e0b' }}>
            Atenção
          </span>
        )}
      </div>
      <div className="flex justify-between text-xs mb-2" style={{ color: c.textMuted }}>
        <span>{formatCurrency(spent)}</span>
        <span>de {formatCurrency(limit)}</span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ background: c.bg600 }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
      </div>
      <div className="flex justify-between mt-2 text-[11px]" style={{ color: c.textDim }}>
        <span>{limit > 0 ? (pct > 100 ? `+${formatCurrency(spent - limit)}` : `${formatCurrency(limit - spent)} restam`) : '—'}</span>
        <span style={{ color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : c.textDim }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}

function EmptyDashboard({ c }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: c.accent + '15' }}>
        <BarChart3 size={28} style={{ color: c.accent }} />
      </div>
      <h3 className="text-lg font-semibold mb-2">Seu dashboard está vazio</h3>
      <p className="text-sm text-center max-w-sm" style={{ color: c.textMuted }}>
        Importe um extrato CSV ou adicione transações manualmente na aba Transações para visualizar seus gastos.
      </p>
    </div>
  )
}

export default function Dashboard({ transactions, categories, salary, selectedMonth, months, onMonthChange, incomes, savingsGoal, debts }) {
  const theme = useContext(ThemeContext)
  const c = theme.colors

  const CustomTooltip = ({ active, payload, label: tipLabel }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg p-3 shadow-xl border text-xs" style={{ background: c.bg800, borderColor: c.bg600 }}>
        {tipLabel && <p className="mb-1.5 font-medium" style={{ color: c.textMuted }}>{tipLabel}</p>}
        {payload.filter(p => p.value != null).map((p, i) => (
          <p key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: c.textMuted }}>{p.name}:</span>
            <span className="font-semibold" style={{ color: c.text }}>{formatCurrency(p.value)}</span>
          </p>
        ))}
      </div>
    )
  }

  const monthTx = useMemo(() => transactions.filter(t => t.date?.startsWith(selectedMonth)), [transactions, selectedMonth])
  const totalSpent = useMemo(() => monthTx.reduce((s, t) => s + t.amount, 0), [monthTx])

  const monthIncome = useMemo(() => {
    return (incomes || []).filter(i => i.recurring || i.date?.startsWith(selectedMonth)).reduce((s, i) => s + i.amount, 0)
  }, [incomes, selectedMonth])

  const totalIncome = salary + monthIncome
  const remaining = totalIncome - totalSpent
  const spentPct = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0

  const spendingByCategory = useMemo(() => {
    const map = {}; categories.forEach(cat => { map[cat.id] = 0 })
    monthTx.forEach(t => { if (map[t.category] !== undefined) map[t.category] += t.amount; else map['outros'] = (map['outros'] || 0) + t.amount })
    return map
  }, [monthTx, categories])

  const pieData = useMemo(() =>
    categories.filter(cat => spendingByCategory[cat.id] > 0)
      .map(cat => ({ name: cat.name, value: spendingByCategory[cat.id], color: cat.color }))
      .sort((a, b) => b.value - a.value),
    [categories, spendingByCategory]
  )

  const barData = useMemo(() =>
    categories.filter(cat => spendingByCategory[cat.id] > 0 || cat.limit > 0)
      .map(cat => ({ name: cat.name, Gasto: spendingByCategory[cat.id] || 0, Limite: cat.limit, color: cat.color })),
    [categories, spendingByCategory]
  )

  const trendData = useMemo(() => months.map(m => {
    const mTx = transactions.filter(t => t.date?.startsWith(m))
    return { name: getMonthLabel(m).split(' ')[0].slice(0, 3), Total: mTx.reduce((s, t) => s + t.amount, 0), Renda: totalIncome }
  }), [months, transactions, totalIncome])

  const forecastData = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth)
    const currentDay = getDayOfMonth()
    const dailyMap = {}
    monthTx.forEach(t => { const day = parseInt(t.date?.split('-')[2]) || 1; dailyMap[day] = (dailyMap[day] || 0) + t.amount })
    let cumulative = 0; const data = []
    for (let d = 1; d <= daysInMonth; d++) {
      if (d <= currentDay || dailyMap[d]) { cumulative += dailyMap[d] || 0; data.push({ day: d, Real: cumulative, Previsto: null }) }
    }
    if (currentDay > 0 && currentDay < daysInMonth) {
      const dailyAvg = cumulative / currentDay; let projected = cumulative
      for (let d = currentDay + 1; d <= daysInMonth; d++) { projected += dailyAvg; data.push({ day: d, Real: null, Previsto: Math.round(projected) }) }
      const lastReal = data.findIndex(d => d.day === currentDay)
      if (lastReal >= 0) data[lastReal].Previsto = data[lastReal].Real
    }
    return data
  }, [monthTx, selectedMonth])

  const forecastTotal = forecastData.length > 0 ? (forecastData[forecastData.length - 1].Previsto || forecastData[forecastData.length - 1].Real || 0) : 0
  const savedThisMonth = remaining > 0 ? remaining : 0
  const savingsTarget = savingsGoal || 0
  const savingsPct = savingsTarget > 0 ? (savedThisMonth / savingsTarget) * 100 : 0

  const alerts = useMemo(() => {
    const list = []
    categories.forEach(cat => {
      const spent = spendingByCategory[cat.id] || 0; const pct = cat.limit > 0 ? (spent / cat.limit) * 100 : 0
      if (pct > 100) list.push({ type: 'danger', text: `${cat.name} estourou o limite (+${formatCurrency(spent - cat.limit)})` })
      else if (pct > 80) list.push({ type: 'warning', text: `${cat.name} está em ${pct.toFixed(0)}% do limite` })
    })
    if (spentPct > 100) list.push({ type: 'danger', text: `Gastos excedem a renda em ${formatCurrency(totalSpent - totalIncome)}` })
    return list
  }, [categories, spendingByCategory, spentPct, totalSpent, totalIncome])

  if (!transactions.length && !salary) return <EmptyDashboard c={c} />

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-xs mt-0.5" style={{ color: c.textDim }}>Visão geral das suas finanças</p>
        </div>
        <select value={selectedMonth} onChange={e => onMonthChange(e.target.value)} aria-label="Selecionar mês"
          className="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2"
          style={{ background: c.bg800, borderColor: c.bg600, color: c.text }}>
          {months.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
        </select>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium border animate-scale-in"
              style={{
                background: (a.type === 'danger' ? '#ef4444' : '#f59e0b') + '0c',
                borderColor: (a.type === 'danger' ? '#ef4444' : '#f59e0b') + '25',
                color: a.type === 'danger' ? '#ef4444' : '#f59e0b',
              }}>
              {a.type === 'danger' ? <CircleAlert size={14} /> : <AlertTriangle size={14} />}
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Renda total', value: formatCurrency(totalIncome), icon: Wallet, color: c.accent, sub: monthIncome > 0 ? `+${formatCurrency(monthIncome)} extra` : null },
          { label: 'Total gasto', value: formatCurrency(totalSpent), icon: ArrowDownRight, color: '#ef4444', sub: `${monthTx.length} transações` },
          { label: 'Saldo', value: formatCurrency(remaining), icon: remaining >= 0 ? ArrowUpRight : ArrowDownRight, color: remaining >= 0 ? '#22c55e' : '#ef4444', sub: null },
          { label: 'Previsão', value: formatCurrency(forecastTotal), icon: Activity, color: forecastTotal > totalIncome ? '#f59e0b' : c.accentLight, sub: `Saldo: ${formatCurrency(totalIncome - forecastTotal)}` },
        ].map((card, i) => {
          const CardIcon = card.icon
          return (
            <div key={i} className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: c.textDim }}>{card.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: card.color + '15' }}>
                  <CardIcon size={14} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
              {card.sub && <p className="text-[11px] mt-1" style={{ color: c.textDim }}>{card.sub}</p>}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: c.textMuted }}>Uso da renda</span>
            <HealthBadge percentage={spentPct} c={c} />
          </div>
          <span className="text-xs font-semibold" style={{ color: spentPct > 100 ? '#ef4444' : c.text }}>{spentPct.toFixed(1)}%</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: c.bg600 }}>
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(spentPct, 100)}%`, background: spentPct > 100 ? '#ef4444' : spentPct > 80 ? '#f59e0b' : c.accent }} />
        </div>
      </div>

      {/* Savings goal */}
      {savingsTarget > 0 && (
        <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} style={{ color: savingsPct >= 100 ? '#22c55e' : c.accent }} />
              <span className="text-sm font-medium">Meta de economia</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: savingsPct >= 100 ? '#22c55e' : c.accent }}>
              {formatCurrency(savedThisMonth)} / {formatCurrency(savingsTarget)}
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: c.bg600 }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(savingsPct, 100)}%`, background: savingsPct >= 100 ? '#22c55e' : c.accent }} />
          </div>
          <p className="text-[11px] mt-2" style={{ color: savingsPct >= 100 ? '#22c55e' : c.textDim }}>
            {savingsPct >= 100 ? 'Meta atingida!' : `Faltam ${formatCurrency(savingsTarget - savedThisMonth)}`}
          </p>
        </div>
      )}

      {/* Debts summary */}
      {debts && debts.length > 0 && (() => {
        const activeDebts = debts.filter(d => d.payments.reduce((s, p) => s + p.amount, 0) < d.totalAmount)
        const totalRemaining = activeDebts.reduce((s, d) => s + d.totalAmount - d.payments.reduce((sp, p) => sp + p.amount, 0), 0)
        const monthlyInstallments = activeDebts.reduce((s, d) => s + d.installmentValue, 0)
        if (activeDebts.length === 0) return null
        return (
          <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={16} style={{ color: '#f59e0b' }} />
                <span className="text-sm font-semibold">Dívidas ativas</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                {activeDebts.length} {activeDebts.length === 1 ? 'dívida' : 'dívidas'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: c.textDim }}>Falta pagar</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: '#ef4444' }}>{formatCurrency(totalRemaining)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: c.textDim }}>Parcelas/mês</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: '#f59e0b' }}>{formatCurrency(monthlyInstallments)}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: c.textDim }}>Maior dívida</p>
                <p className="text-sm font-bold truncate" style={{ color: c.text }}>{activeDebts.sort((a, b) => b.totalAmount - a.totalAmount)[0]?.name}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {activeDebts.slice(0, 3).map(d => {
                const paid = d.payments.reduce((s, p) => s + p.amount, 0)
                const pct = d.totalAmount > 0 ? (paid / d.totalAmount) * 100 : 0
                return (
                  <div key={d.id} className="flex items-center gap-2.5">
                    <span className="text-xs truncate flex-1" style={{ color: c.textMuted }}>{d.name}</span>
                    <div className="w-20 rounded-full h-1.5" style={{ background: c.bg600 }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: c.accent }} />
                    </div>
                    <span className="text-[10px] tabular-nums w-8 text-right" style={{ color: c.textDim }}>{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} style={{ color: c.textMuted }} />
            <h3 className="text-sm font-semibold">Gastos por categoria</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value"
                  animationBegin={0} animationDuration={800}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color || c.chart[i % c.chart.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ color: c.textMuted, fontSize: '11px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center" style={{ color: c.textDim }}>
              <PieChartIcon size={32} className="mb-2 opacity-30" />
              <span className="text-sm">Sem dados neste mês</span>
            </div>
          )}
        </div>

        <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} style={{ color: c.textMuted }} />
            <h3 className="text-sm font-semibold">Gasto vs Limite</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.bg500 + '60'} />
              <XAxis dataKey="name" tick={{ fill: c.textDim, fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: c.textDim, fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: c.textMuted, fontSize: '11px' }}>{v}</span>} />
              <Bar dataKey="Gasto" fill={c.accent} radius={[3, 3, 0, 0]} animationDuration={600} />
              <Bar dataKey="Limite" fill={c.bg500} radius={[3, 3, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {forecastData.length > 0 && (
          <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: c.textMuted }} />
              <h3 className="text-sm font-semibold">Previsão mensal</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={forecastData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.bg500 + '60'} />
                <XAxis dataKey="day" tick={{ fill: c.textDim, fontSize: 10 }} />
                <YAxis tick={{ fill: c.textDim, fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Real" stroke={c.accent} fill={c.accent + '20'} strokeWidth={2} animationDuration={800} />
                <Area type="monotone" dataKey="Previsto" stroke="#f59e0b" fill="#f59e0b10" strokeWidth={2} strokeDasharray="6 3" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {trendData.length >= 2 && (
          <div className="rounded-xl p-4 border" style={{ background: c.bg800, borderColor: c.bg600 }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: c.textMuted }} />
              <h3 className="text-sm font-semibold">Tendência mensal</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.bg500 + '60'} />
                <XAxis dataKey="name" tick={{ fill: c.textDim, fontSize: 11 }} />
                <YAxis tick={{ fill: c.textDim, fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ color: c.textMuted, fontSize: '11px' }}>{v}</span>} />
                <Line type="monotone" dataKey="Total" stroke={c.accent} strokeWidth={2} dot={{ fill: c.accent, r: 3 }} animationDuration={800} />
                <Line type="monotone" dataKey="Renda" stroke="#22c55e60" strokeWidth={1.5} strokeDasharray="6 3" dot={false} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: c.textMuted }}>Categorias do mês</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} spent={spendingByCategory[cat.id] || 0} limit={cat.limit} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  )
}
