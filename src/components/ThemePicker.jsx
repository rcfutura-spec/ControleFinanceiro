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
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map(theme => {
          const isActive = currentTheme === theme.id
          const c = theme.colors
          return (
            <button key={theme.id} onClick={() => onThemeChange(theme.id)}
              className="relative text-left rounded-2xl p-3.5 transition-all duration-200"
              style={{
                background: c.bg800,
                border: `2px solid ${isActive ? c.accent : c.bg600}`,
                boxShadow: isActive ? `0 0 0 1px ${c.accent}40` : 'none',
              }}>
              {isActive && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: c.accent }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-3 h-3 rounded-full" style={{ background: c.accent }} />
                <span className="text-xs font-semibold" style={{ color: c.text }}>{theme.name}</span>
              </div>

              {/* Color swatches only — clean and simple */}
              <div className="flex gap-1.5 flex-wrap">
                {[c.accent, c.accentLight, c.success, c.warning, c.danger, c.bg700].map((color, i) => (
                  <div key={i} className="w-5 h-5 rounded-lg" style={{ background: color }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
