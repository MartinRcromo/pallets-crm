import { useEffect, useRef, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function InlineEditField({
  label,
  value,
  onSave,
  type = 'text',
  placeholder = '—',
  link,
  multiline = false,
  rows = 4,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setDraft(value ?? '')
  }, [value, editing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select && !multiline) inputRef.current.select()
    }
  }, [editing, multiline])

  const startEdit = () => {
    setDraft(value ?? '')
    setErr(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(value ?? '')
    setErr(null)
  }

  const commit = async () => {
    const next = draft.trim() === '' ? null : draft.trim()
    if (next === (value ?? null)) {
      setEditing(false)
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await onSave(next)
      setEditing(false)
    } catch (e) {
      setErr(e?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      commit()
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commit()
    }
  }

  if (editing) {
    return (
      <div className={cn(multiline ? '' : 'card p-3')}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1 flex items-center justify-between">
          <span>{label}</span>
          {multiline && (
            <span className="text-ink/30 normal-case tracking-normal font-sans">
              Enter = nueva línea · ⌘/Ctrl+Enter para guardar
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            ref={inputRef}
            rows={rows}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            disabled={saving}
            placeholder={placeholder}
            className="input resize-y"
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            disabled={saving}
            placeholder={placeholder}
            className="input"
          />
        )}
        {err && (
          <div className="mt-1 rounded border border-red-200 bg-red-50 text-red-800 text-xs px-2 py-1">
            {err}
          </div>
        )}
        {saving && (
          <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-ink/40">
            guardando…
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative',
        multiline ? 'card p-4' : 'card p-3',
      )}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-0.5 flex items-center justify-between gap-2">
        <span>{label}</span>
        <button
          type="button"
          onClick={startEdit}
          title={`Editar ${label}`}
          className={cn(
            'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
            'text-ink/40 hover:text-ink p-0.5 rounded',
          )}
        >
          <Pencil size={11} />
        </button>
      </div>
      {value ? (
        link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className={cn(
              multiline ? 'text-sm text-ink/90 whitespace-pre-wrap' : 'text-sm text-ink hover:text-rust-600 break-all',
            )}
          >
            {value}
          </a>
        ) : (
          <div
            className={cn(
              multiline
                ? 'text-sm text-ink/90 whitespace-pre-wrap'
                : 'text-sm text-ink break-all',
            )}
          >
            {value}
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="text-sm text-ink/30 italic hover:text-ink/60 text-left"
        >
          {placeholder}
        </button>
      )}
    </div>
  )
}
