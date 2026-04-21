import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Check, Search, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, fmtDate } from '../lib/utils'
import { TIPO_INTERACCION, labelOf } from '../lib/constants'

const CANAL_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'linkedin_mensaje', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [canalFilter, setCanalFilter] = useState('todas')
  const [q, setQ] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    load()
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('nombre')
    if (error) {
      setErr(error.message)
    } else {
      setTemplates(data ?? [])
    }
    setLoading(false)
  }

  const showToast = (msg) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const handleCopy = async (template) => {
    const payload = template.asunto
      ? `Asunto: ${template.asunto}\n\n${template.cuerpo}`
      : template.cuerpo
    try {
      await navigator.clipboard.writeText(payload)
      showToast(`Copiado: "${template.nombre}"`)
    } catch {
      showToast('No se pudo copiar automáticamente.')
    }
  }

  const filtered = useMemo(() => {
    const qLow = q.trim().toLowerCase()
    return templates.filter((t) => {
      if (canalFilter !== 'todas' && t.canal !== canalFilter) return false
      if (!qLow) return true
      return (
        t.nombre.toLowerCase().includes(qLow) ||
        (t.asunto ?? '').toLowerCase().includes(qLow) ||
        t.cuerpo.toLowerCase().includes(qLow)
      )
    })
  }, [templates, canalFilter, q])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <header className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Biblioteca
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Plantillas
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
          Mensajes pre-armados para acelerar el outreach
        </p>
      </header>

      {err && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4">
          {err}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-1">
          {CANAL_FILTERS.map((f) => (
            <CanalChip
              key={f.value}
              active={canalFilter === f.value}
              onClick={() => setCanalFilter(f.value)}
            >
              {f.label}
            </CanalChip>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:max-w-xs w-full">
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
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
          cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText size={32} className="mx-auto text-zinc-400 mb-3" />
          <p className="text-sm text-ink/60">
            {templates.length === 0
              ? 'No hay plantillas cargadas todavía.'
              : 'Sin resultados para estos filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm px-4 py-2 shadow-lg flex items-center gap-2 max-w-md">
            <Check size={14} />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template, onCopy }) {
  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif text-lg text-ink truncate flex-1">
          {template.nombre}
        </h3>
        <CanalBadge canal={template.canal} />
      </div>
      {template.asunto && (
        <div className="text-[11px] font-mono text-ink/50 mb-2 truncate">
          Asunto: {template.asunto}
        </div>
      )}
      <div className="bg-ink/[0.02] rounded border border-ink/5 p-3 mb-3 flex-1">
        <pre className="whitespace-pre-wrap font-sans text-sm text-ink/80 max-h-52 overflow-y-auto leading-relaxed">
          {template.cuerpo}
        </pre>
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
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-ink/30">
          {fmtDate(template.created_at)}
        </span>
        <button
          type="button"
          onClick={() => onCopy(template)}
          className="btn-rust !text-xs !py-1.5"
        >
          <Copy size={13} />
          Copiar
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

function CanalChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded text-[11px] font-medium border transition-colors',
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-white text-ink/70 border-zinc-300 hover:border-ink/50',
      )}
    >
      {children}
    </button>
  )
}
