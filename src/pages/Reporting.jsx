import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowRight, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const WEEKLY_METRICS = [
  { key: 'interacciones', label: 'Interacciones' },
  { key: 'positivas', label: 'Respuestas positivas' },
  { key: 'empresas_tocadas', label: 'Empresas tocadas' },
  { key: 'movimientos_pipeline', label: 'Movimientos pipeline' },
]

export default function Reporting() {
  const [semanal, setSemanal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('v_reporting_semanal')
      .select('*')
      .maybeSingle()
    if (error) {
      setErr(error.message)
    } else {
      setSemanal(data ?? {})
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <header className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Medición
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Reporting
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
          Medición de pipeline y actividad
        </p>
      </header>

      {err && (
        <ErrorBanner message={err} onRetry={load} />
      )}

      <Section title="Esta semana vs semana anterior">
        {loading ? (
          <WeeklyGridSkeleton />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {WEEKLY_METRICS.map(({ key, label }) => (
              <WeeklyMetric
                key={key}
                label={label}
                current={semanal?.[`${key}_7d`] ?? 0}
                previous={semanal?.[`${key}_7d_prev`] ?? 0}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function WeeklyMetric({ label, current, previous }) {
  const curr = Number(current) || 0
  const prev = Number(previous) || 0
  const diff = curr - prev

  let compLabel
  let compClass
  let Icon

  if (curr === 0 && prev === 0) {
    compLabel = 'sin actividad'
    compClass = 'text-zinc-400'
    Icon = ArrowRight
  } else if (prev === 0 && curr > 0) {
    compLabel = 'primera semana con actividad'
    compClass = 'text-emerald-700'
    Icon = ArrowUp
  } else if (diff > 0) {
    const pct = Math.round((diff / prev) * 100)
    compLabel = `+${diff} (${pct}%) vs ${prev} la sem. anterior`
    compClass = 'text-emerald-700'
    Icon = ArrowUp
  } else if (diff < 0) {
    const pct = Math.round((diff / prev) * 100)
    compLabel = `${diff} (${pct}%) vs ${prev}`
    compClass = 'text-rust-700'
    Icon = ArrowDown
  } else {
    compLabel = `sin cambio vs ${prev}`
    compClass = 'text-zinc-500'
    Icon = ArrowRight
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
        {label}
      </div>
      <div className="font-serif text-4xl sm:text-5xl text-ink tracking-tight tabular-nums mt-2">
        {curr}
      </div>
      <div
        className={cn(
          'text-xs mt-2 inline-flex items-center gap-1 tabular-nums',
          compClass,
        )}
      >
        <Icon size={12} />
        {compLabel}
      </div>
    </div>
  )
}

function WeeklyGridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
      {WEEKLY_METRICS.map((m) => (
        <div key={m.key} className="card p-4 sm:p-5">
          <div className="h-3 bg-zinc-100 rounded w-24 mb-3 animate-pulse" />
          <div className="h-10 bg-zinc-100 rounded w-16 mb-3 animate-pulse" />
          <div className="h-3 bg-zinc-100 rounded w-40 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-ink/60 mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4 flex items-center justify-between gap-2">
      <span>Error cargando datos: {message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1 text-red-900 hover:underline font-medium"
      >
        <RefreshCw size={12} />
        Reintentar
      </button>
    </div>
  )
}
