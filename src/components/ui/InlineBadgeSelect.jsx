import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function InlineBadgeSelect({
  value,
  options,
  onChange,
  renderBadge,
  title,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = async (next) => {
    if (next === value) {
      setOpen(false)
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await onChange(next)
      setOpen(false)
    } catch (e) {
      setErr(e?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled || saving}
        onClick={() => setOpen((v) => !v)}
        title={title ?? 'Cambiar'}
        className={cn(
          'inline-flex items-center gap-1 rounded group transition-opacity',
          'hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-ink/30',
          (disabled || saving) && 'opacity-50 cursor-not-allowed',
        )}
      >
        {renderBadge(value)}
        <ChevronDown
          size={11}
          className="text-ink/40 group-hover:text-ink/70 transition-colors"
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 top-full mt-1 z-20 min-w-[180px]',
            'card p-1 shadow-lg animate-fade-in',
          )}
        >
          <ul className="max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const selected = opt.value === value
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => pick(opt.value)}
                    disabled={saving}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm',
                      'hover:bg-ink/5 transition-colors',
                      selected && 'bg-ink/5',
                    )}
                  >
                    <span className="flex-1">{opt.label}</span>
                    {selected && <Check size={13} className="text-rust-600" />}
                  </button>
                </li>
              )
            })}
          </ul>
          {err && (
            <div className="mt-1 rounded border border-red-200 bg-red-50 text-red-800 text-xs px-2 py-1">
              {err}
            </div>
          )}
        </div>
      )}
    </span>
  )
}
