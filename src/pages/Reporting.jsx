import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Columns3,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const WEEKLY_METRICS = [
  { key: 'interacciones', label: 'Interacciones' },
  { key: 'positivas', label: 'Respuestas positivas' },
  { key: 'empresas_tocadas', label: 'Empresas tocadas' },
  { key: 'movimientos_pipeline', label: 'Movimientos pipeline' },
]

const FUNNEL_STAGES = [
  { key: 'lvl_universo', label: 'Universo', prev: null },
  { key: 'lvl_prospect_o_mas', label: 'Prospect o más', prev: 'lvl_universo' },
  { key: 'lvl_contactado_o_mas', label: 'Contactado o más', prev: 'lvl_prospect_o_mas' },
  { key: 'lvl_calificado_o_mas', label: 'Calificado o más', prev: 'lvl_contactado_o_mas' },
  { key: 'lvl_cotizacion_o_mas', label: 'Cotización o más', prev: 'lvl_calificado_o_mas' },
  { key: 'lvl_negociando_o_mas', label: 'Negociando o más', prev: 'lvl_cotizacion_o_mas' },
  { key: 'lvl_ganado', label: 'Ganado', prev: 'lvl_negociando_o_mas' },
]

export default function Reporting() {
  const [semanal, setSemanal] = useState(null)
  const [funnel, setFunnel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const [semRes, funRes] = await Promise.all([
      supabase.from('v_reporting_semanal').select('*').maybeSingle(),
      supabase.from('v_funnel_conversion').select('*').maybeSingle(),
    ])
    if (semRes.error || funRes.error) {
      setErr(semRes.error?.message || funRes.error?.message)
    } else {
      setSemanal(semRes.data ?? {})
      setFunnel(funRes.data ?? {})
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

      <Section title="Funnel de conversión">
        {loading ? (
          <FunnelSkeleton />
        ) : (funnel?.lvl_universo ?? 0) === 0 ? (
          <FunnelEmpty />
        ) : (
          <div className="card p-4 sm:p-6 space-y-2">
            {FUNNEL_STAGES.map((stage, idx) => (
              <FunnelRow
                key={stage.key}
                label={stage.label}
                count={Number(funnel[stage.key] ?? 0)}
                universo={Number(funnel.lvl_universo ?? 0)}
                prevCount={
                  stage.prev ? Number(funnel[stage.prev] ?? 0) : null
                }
                isFirst={idx === 0}
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

function FunnelRow({ label, count, universo, prevCount, isFirst }) {
  const pctUniverso = universo > 0 ? Math.round((count / universo) * 100) : 0
  const barWidth = universo > 0 ? (count / universo) * 100 : 0
  const convRate =
    !isFirst && prevCount > 0 ? Math.round((count / prevCount) * 100) : null

  return (
    <div className="group py-2">
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="w-full sm:w-40 shrink-0 text-[10px] font-mono uppercase tracking-widest text-ink/60">
          {label}
        </div>
        <div className="flex-1 min-w-[160px] h-8 bg-zinc-100 group-hover:bg-zinc-200 transition-colors rounded overflow-hidden relative">
          <div
            className="h-full bg-rust-400 transition-all duration-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs sm:text-sm font-mono tabular-nums">
          <span className="text-ink font-medium w-10 text-right">
            {count}
          </span>
          <span className="text-ink/40 w-14 text-right">
            ({pctUniverso}%)
          </span>
          <span className="text-ink/70 w-16 text-right inline-flex items-center justify-end gap-1">
            {isFirst ? (
              <span className="text-ink/30">—</span>
            ) : convRate == null ? (
              <span className="text-ink/30">—</span>
            ) : (
              <>
                <ArrowDown size={11} className="text-ink/40" />
                {convRate}%
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

function FunnelSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      {FUNNEL_STAGES.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3">
          <div className="w-40 h-3 bg-zinc-100 rounded animate-pulse" />
          <div
            className="flex-1 h-8 bg-zinc-100 rounded animate-pulse"
            style={{ opacity: 1 - i * 0.1 }}
          />
        </div>
      ))}
    </div>
  )
}

function FunnelEmpty() {
  return (
    <div className="card p-10 text-center">
      <Columns3 size={32} className="mx-auto text-zinc-400 mb-3" />
      <p className="font-serif text-lg text-ink">
        Sin datos suficientes para reportar
      </p>
      <p className="text-sm text-ink/50 mt-1">
        Empezá a mover empresas en el{' '}
        <Link to="/pipeline" className="underline hover:text-rust-600">
          Pipeline
        </Link>{' '}
        para ver métricas de conversión.
      </p>
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
