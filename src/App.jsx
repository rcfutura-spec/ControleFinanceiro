import React, { useState, useEffect, useMemo, useCallback, createContext, useRef } from 'react'
import { storage } from './utils/storage.js'
import { DEFAULT_CATEGORIES } from './utils/categories.js'
import { getCurrentMonthKey, getMonthKey, getTransactionHash } from './utils/helpers.js'
import { getTheme, applyTheme } from './utils/themes.js'
import { createUndoManager } from './utils/undoManager.js'
import { LayoutDashboard, Receipt, Tags, Settings as SettingsIcon, Undo2, Redo2, Wallet, CreditCard, RefreshCw } from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'
import Transactions from './components/Transactions.jsx'
import Categories from './components/Categories.jsx'
import Debts from './components/Debts.jsx'
import Settings from './components/Settings.jsx'

export const ThemeContext = createContext(null)

const TABS = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações', shortLabel: 'Gastos', icon: Receipt },
  { id: 'debts', label: 'Dívidas', shortLabel: 'Dívidas', icon: CreditCard },
  { id: 'categories', label: 'Categorias', shortLabel: 'Categ.', icon: Tags },
  { id: 'settings', label: 'Config', shortLabel: 'Config', icon: SettingsIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [salary, setSalaryState] = useState(0)
  const [transactions, setTransactionsState] = useState([])
  const [categories, setCategoriesState] = useState([])
  const [incomes, setIncomesState] = useState([])
  const [recurring, setRecurringState] = useState([])
  const [debts, setDebtsState] = useState([])
  const [savingsGoal, setSavingsGoalState] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())
  const [themeId, setThemeIdState] = useState('midnight-indigo')
  const [loaded, setLoaded] = useState(false)
  const [toast, setToast] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const waitingWorker = useRef(null)

  const undoMgr = useRef(createUndoManager()).current
  const theme = useMemo(() => getTheme(themeId), [themeId])
  const c = theme.colors

  useEffect(() => {
    const s = storage.get('salary'); const t = storage.get('transactions')
    const cat = storage.get('categories'); const th = storage.get('theme')
    const inc = storage.get('incomes'); const rec = storage.get('recurring')
    const sg = storage.get('savingsGoal'); const dbt = storage.get('debts')
    if (s !== null) setSalaryState(s)
    if (t) setTransactionsState(t)
    setCategoriesState(cat || [...DEFAULT_CATEGORIES])
    if (th) setThemeIdState(th)
    if (inc) setIncomesState(inc)
    if (rec) setRecurringState(rec)
    if (sg !== null) setSavingsGoalState(sg)
    if (dbt) setDebtsState(dbt)
    setLoaded(true)
  }, [])

  useEffect(() => { if (loaded) applyTheme(theme) }, [theme, loaded])

  // Detect service worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return
      const check = (sw) => {
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker.current = sw
            setUpdateAvailable(true)
          }
        })
      }
      if (reg.waiting) { waitingWorker.current = reg.waiting; setUpdateAvailable(true) }
      if (reg.installing) check(reg.installing)
      reg.addEventListener('updatefound', () => { if (reg.installing) check(reg.installing) })
    })
    // Check for updates every 30 minutes
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then(reg => reg?.update())
    }, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleAppUpdate = useCallback(() => {
    if (waitingWorker.current) {
      waitingWorker.current.postMessage('SKIP_WAITING')
      setUpdateAvailable(false)
      setTimeout(() => window.location.reload(), 500)
    } else {
      // Force reload clearing cache
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) reg.update()
        })
      }
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n)))).then(() => {
        window.location.reload()
      })
    }
  }, [])

  const showToast = useCallback((msg, duration = 2500) => {
    setToast(msg); setTimeout(() => setToast(null), duration)
  }, [])

  const takeSnapshot = useCallback(() => {
    undoMgr.push({ transactions: [...transactions], categories: [...categories] })
  }, [transactions, categories, undoMgr])

  const handleUndo = useCallback(() => {
    const s = undoMgr.undo()
    if (s) { setTransactionsState(s.transactions); storage.set('transactions', s.transactions); setCategoriesState(s.categories); storage.set('categories', s.categories); showToast('Desfeito') }
  }, [undoMgr, showToast])

  const handleRedo = useCallback(() => {
    const s = undoMgr.redo()
    if (s) { setTransactionsState(s.transactions); storage.set('transactions', s.transactions); setCategoriesState(s.categories); storage.set('categories', s.categories); showToast('Refeito') }
  }, [undoMgr, showToast])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo])

  const setThemeId = useCallback((id) => { setThemeIdState(id); storage.set('theme', id) }, [])
  const setSalary = useCallback((val) => { setSalaryState(val); storage.set('salary', val) }, [])
  const setSavingsGoal = useCallback((val) => { setSavingsGoalState(val); storage.set('savingsGoal', val) }, [])
  const setTransactions = useCallback((updater) => {
    setTransactionsState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; storage.set('transactions', next); return next })
  }, [])
  const setCategories = useCallback((updater) => {
    setCategoriesState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; storage.set('categories', next); return next })
  }, [])
  const setIncomes = useCallback((updater) => {
    setIncomesState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; storage.set('incomes', next); return next })
  }, [])
  const setRecurring = useCallback((updater) => {
    setRecurringState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; storage.set('recurring', next); return next })
  }, [])
  const setDebts = useCallback((updater) => {
    setDebtsState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; storage.set('debts', next); return next })
  }, [])

  const existingHashes = useMemo(() => {
    const set = new Set(); transactions.forEach(t => set.add(t.hash || getTransactionHash(t))); return set
  }, [transactions])

  const months = useMemo(() => {
    const set = new Set(); set.add(getCurrentMonthKey())
    transactions.forEach(t => { const mk = getMonthKey(t.date); if (mk) set.add(mk) })
    return [...set].sort()
  }, [transactions])

  const handleImport = useCallback((newTx) => {
    takeSnapshot(); setTransactions(prev => [...prev, ...newTx]); showToast(`${newTx.length} importadas`)
  }, [setTransactions, takeSnapshot, showToast])

  const handleReset = useCallback(() => {
    const th = storage.get('theme'); storage.clearAll(); if (th) storage.set('theme', th)
    setSalaryState(0); setTransactionsState([]); setCategoriesState([...DEFAULT_CATEGORIES])
    setIncomesState([]); setRecurringState([]); setDebtsState([]); setSavingsGoalState(0)
    setSelectedMonth(getCurrentMonthKey()); undoMgr.clear(); showToast('Dados resetados')
  }, [undoMgr, showToast])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg900 }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: c.accent, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: c.bg900, color: c.text }}>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 lg:w-60 border-r shrink-0 sticky top-0 h-screen"
          style={{ background: c.bg800, borderColor: c.bg600 }}>
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.accent + '20' }}>
                <Wallet size={16} style={{ color: c.accent }} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">Financeiro</h1>
                <p className="text-[9px] tracking-wider uppercase" style={{ color: c.textDim }}>Controle pessoal</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-2 py-1 space-y-0.5" role="tablist">
            {TABS.map(tab => {
              const TabIcon = tab.icon; const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{ background: active ? c.accent + '15' : 'transparent', color: active ? c.accent : c.textMuted }}
                  role="tab" aria-selected={active}>
                  <TabIcon size={17} strokeWidth={active ? 2.2 : 1.7} /> {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="p-3 border-t flex items-center gap-1" style={{ borderColor: c.bg600 }}>
            <button onClick={handleUndo} disabled={!undoMgr.canUndo()} className="p-2 rounded-lg disabled:opacity-20" style={{ color: c.textMuted }} title="Ctrl+Z"><Undo2 size={14} /></button>
            <button onClick={handleRedo} disabled={!undoMgr.canRedo()} className="p-2 rounded-lg disabled:opacity-20" style={{ color: c.textMuted }} title="Ctrl+Y"><Redo2 size={14} /></button>
            <span className="text-[10px] ml-auto" style={{ color: c.textDim }}>{transactions.length}</span>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-5 lg:px-8 pt-4 pb-[calc(6rem+var(--safe-bottom))] md:pb-6 md:pt-6 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard transactions={transactions} categories={categories} salary={salary}
              selectedMonth={selectedMonth} months={months} onMonthChange={setSelectedMonth}
              incomes={incomes} savingsGoal={savingsGoal} debts={debts} recurring={recurring} />
          )}
          {activeTab === 'transactions' && (
            <Transactions transactions={transactions} setTransactions={setTransactions}
              categories={categories} existingHashes={existingHashes} onImport={handleImport}
              onSnapshot={takeSnapshot} />
          )}
          {activeTab === 'debts' && (
            <Debts debts={debts} setDebts={setDebts} />
          )}
          {activeTab === 'categories' && (
            <Categories categories={categories} setCategories={setCategories} transactions={transactions} />
          )}
          {activeTab === 'settings' && (
            <Settings salary={salary} setSalary={setSalary} transactions={transactions}
              categories={categories} onReset={handleReset} themeId={themeId} onThemeChange={setThemeId}
              savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal}
              recurring={recurring} setRecurring={setRecurring} incomes={incomes} setIncomes={setIncomes}
              onAppUpdate={handleAppUpdate} />
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
          style={{
            background: c.bg800 + 'f8',
            borderColor: c.bg600,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            paddingBottom: 'var(--safe-bottom)',
          }}
          role="tablist">
          <div className="flex">
            {TABS.map(tab => {
              const TabIcon = tab.icon; const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors relative"
                  style={{ color: active ? c.accent : c.textDim }}
                  role="tab" aria-selected={active}>
                  {active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: c.accent }} />
                  )}
                  <TabIcon size={20} strokeWidth={active ? 2.3 : 1.5} />
                  <span className="text-[9px] font-medium leading-tight">{tab.shortLabel}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Update banner */}
        {updateAvailable && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 rounded-xl p-4 border shadow-2xl animate-scale-in flex items-center gap-3"
            style={{ background: c.bg800, borderColor: c.accent + '40' }}>
            <RefreshCw size={18} style={{ color: c.accent }} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Atualização disponível</p>
              <p className="text-[11px]" style={{ color: c.textDim }}>Nova versão pronta</p>
            </div>
            <button onClick={handleAppUpdate} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: c.accent, color: '#fff' }}>
              Atualizar
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-[calc(5rem+var(--safe-bottom)+0.5rem)] md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl text-xs font-medium animate-scale-in border"
            style={{ background: c.bg700, borderColor: c.bg500, color: c.text }}>
            {toast}
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  )
}
