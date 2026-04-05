import React from 'react'
import { THEMES } from '../utils/themes.js'
import { Check, Palette } from 'lucide-react'

export default function ThemePicker({ currentTheme, onThemeChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette size={16} className="opacity-60" />
        <h3 className="text-sm font-semibold">Tema</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map(theme => {
          const isActive = currentTheme === theme.id
          const c = theme.colors
          return (
            <button key={theme.id} onClick={() => onThemeChange(theme.id)}
              className="relative text-left rounded-xl p-4 transition-all duration-200 border-2"
              style={{
                background: c.bg800,
                borderColor: isActive ? c.accent : c.bg600,
                boxShadow: isActive ? `0 0 0 1px ${c.accent}40, 0 4px 16px ${c.accent}15` : 'none',
              }}>
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: c.accent }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: c.accent }} />
                <span className="text-xs font-semibold" style={{ color: c.text }}>{theme.name}</span>
              </div>

              {/* Swatches */}
              <div className="flex gap-1 mb-3">
                {[c.bg900, c.bg700, c.accent, c.accentLight, c.success, c.warning, c.danger].map((color, i) => (
                  <div key={i} className="w-5 h-5 rounded-md" style={{ background: color }} />
                ))}
              </div>

              {/* Mini preview */}
              <div className="rounded-lg p-2 space-y-1.5" style={{ background: c.bg900 }}>
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-12 rounded-full" style={{ background: c.accent }} />
                  <div className="h-1.5 w-6 rounded-full" style={{ background: c.bg500 }} />
                </div>
                <div className="flex gap-1">
                  {[c.accent, c.success, c.danger].map((color, i) => (
                    <div key={i} className="flex-1 h-6 rounded-md" style={{ background: c.bg800, border: `1px solid ${c.bg600}` }}>
                      <div className="h-full w-1/2 rounded-l-md" style={{ background: color + '20' }} />
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-0.5 h-5">
                  {(c.chart || [c.accent, c.accentLight, c.success, c.warning, c.danger]).slice(0, 6).map((color, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{ background: color, height: `${[55, 80, 40, 100, 65, 85][i]}%`, opacity: 0.8 }} />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
