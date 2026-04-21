import { useEffect, useState } from 'react'
import { X, ClipboardCheck, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import { TIPO_INTERACCION, labelOf } from '../lib/constants'

export default function TemplatePickerModal({ tipo, onPicked, onClose }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])

  const load = async () => {
    setLoading(true)
    setErr(null)
    let query = supabase.from('message_templates').select('*').order('nombre')
    if (tipo) {
      query = query.or(`canal.eq.${tipo},canal.is.null`)
    }
    const { data, error } = await query
    if (error) {
      setErr(error.message)
    } else {
      setTemplates(data ?? [])
    }
    setLoading(false)
  }

  const qLow = q.trim().toLowerCase()
  const filtered = qLow
    ? templates.filter(
        (t) =>
          t.nombre.toLowerCase().includes(qLow) ||
          (t.asunto ?? '').toLowerCase().includes(qLow) ||
          t.cuerpo.toLowerCase().includes(qLow),
      )
    : templates

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-ink/50 sm:p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-paper w-full sm:max-w-2xl sm:rounded-lg shadow-xl flex flex-col max-h-screen sm:max-h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 shrink-0">
          <div>
            <h2 className="font-serif text-xl text-ink">Usar plantilla</h2>
            {tipo && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-ink/50 mt-1">
                Canal actual: {labelOf(TIPO_INTERACCION, tipo)} · también
                plantillas sin canal
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !p-1.5"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-ink/5 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en plantillas…"
              className="input !pl-8"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {err && (
            <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
              {err}
            </div>
          )}
          {loading ? (
            <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
              cargando…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-ink/50 text-sm">
              {templates.length === 0
                ? 'No hay plantillas para este canal.'
                : 'Sin resultados para la búsqueda.'}
            </div>
          ) : (
            filtered.map((t) => (
              <TemplateItem key={t.id} template={t} onPicked={onPicked} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TemplateItem({ template, onPicked }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-base text-ink truncate">
            {template.nombre}
          </h3>
          {template.asunto && (
            <div className="text-[11px] font-mono text-ink/50 mt-0.5 truncate">
              Asunto: {template.asunto}
            </div>
          )}
        </div>
        <CanalBadge canal={template.canal} />
      </div>
      <div
        className={cn(
          'text-sm text-ink/80 whitespace-pre-wrap mb-2',
          'line-clamp-2',
        )}
      >
        {template.cuerpo}
      </div>
      {template.variables?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.variables.map((v) => (
            <span
              key={v}
              className="text-[10px] font-mono bg-ink/5 text-ink/70 px-1.5 py-0.5 rounded"
            >
              {`{${v}}`}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onPicked(template)}
          className="btn-rust !text-xs !py-1.5"
        >
          <ClipboardCheck size={13} />
          Usar esta
        </button>
      </div>
    </div>
  )
}

function CanalBadge({ canal }) {
  if (!canal) {
    return (
      <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide bg-ink/5 text-ink/60 px-1.5 py-0.5 rounded">
        Genérica
      </span>
    )
  }
  return (
    <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide bg-rust-50 text-rust-700 px-1.5 py-0.5 rounded">
      {labelOf(TIPO_INTERACCION, canal)}
    </span>
  )
}
