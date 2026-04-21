import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, CheckSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, fmtUSD } from '../lib/utils'
import {
  PrioridadBadge,
  SectorChip,
} from '../components/ui/Badges'
import {
  ESTADO_RELACION,
  PRIORIDAD_COMERCIAL,
  labelOf,
} from '../lib/constants'

const PIPELINE_ORDER = [
  'sin_contactar',
  'prospect',
  'contactado',
  'calificado',
  'cotizacion_enviada',
  'negociando',
  'cerrado_ganado',
  'cerrado_perdido',
  'en_pausa',
]

export default function Pipeline() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [prioFilter, setPrioFilter] = useState('todas')
  const [q, setQ] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('companies_with_stats')
      .select(
        'id, razon_social, prioridad_comercial, clasificacion, estado_relacion, sector, fob_usd_12m, ultima_interaccion, contactos_total, tasks_pendientes',
      )
      .not('clasificacion', 'in', '(competidor,excluido)')
    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }
    setEmpresas(data ?? [])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    const qLow = q.trim().toLowerCase()
    return empresas.filter((e) => {
      if (prioFilter !== 'todas' && e.prioridad_comercial !== prioFilter) {
        return false
      }
      if (qLow && !(e.razon_social ?? '').toLowerCase().includes(qLow)) {
        return false
      }
      return true
    })
  }, [empresas, prioFilter, q])

  const grouped = useMemo(() => {
    const g = Object.fromEntries(PIPELINE_ORDER.map((k) => [k, []]))
    for (const e of filtered) {
      if (g[e.estado_relacion]) g[e.estado_relacion].push(e)
    }
    return g
  }, [filtered])

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <header className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Pipeline
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Estado del pipeline
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
          Empresas agrupadas por estado · cambios desde el detalle de empresa
        </p>
      </header>

      {err && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4">
          {err}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-1">
          <PrioChip
            active={prioFilter === 'todas'}
            onClick={() => setPrioFilter('todas')}
          >
            Todas
          </PrioChip>
          {PRIORIDAD_COMERCIAL.map((p) => (
            <PrioChip
              key={p.value}
              active={prioFilter === p.value}
              onClick={() => setPrioFilter(p.value)}
            >
              {p.label}
            </PrioChip>
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
            placeholder="Buscar empresa…"
            className="input !pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
          cargando…
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
          <div className="flex gap-3 items-start min-w-max">
            {PIPELINE_ORDER.map((key) => (
              <Column
                key={key}
                estado={key}
                empresas={grouped[key] ?? []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Column({ estado, empresas }) {
  return (
    <div className="w-[280px] shrink-0 flex flex-col">
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-ink/60">
          {labelOf(ESTADO_RELACION, estado)}
        </h2>
        <span className="font-mono tabular-nums text-[11px] text-ink/40">
          {empresas.length}
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
        {empresas.length === 0 ? (
          <div className="text-center text-zinc-400 text-sm py-6">—</div>
        ) : (
          empresas.map((e) => <PipelineCard key={e.id} empresa={e} />)
        )}
      </div>
    </div>
  )
}

function PipelineCard({ empresa }) {
  return (
    <Link
      to={`/empresas/${empresa.id}`}
      className="card p-3 block hover:border-rust-300 transition-colors animate-slide-up"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-sm font-medium text-ink truncate flex-1 min-w-0">
          {empresa.razon_social}
        </div>
        <PrioridadBadge value={empresa.prioridad_comercial} />
      </div>
      {empresa.sector && (
        <div className="text-xs text-zinc-500 mb-1 truncate">
          {empresa.sector}
        </div>
      )}
      {empresa.fob_usd_12m != null && (
        <div className="text-xs font-mono tabular-nums text-ink/70">
          {fmtUSD(empresa.fob_usd_12m)}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
        <span className="text-ink/40">
          {empresa.ultima_interaccion
            ? `últ. ${formatDistance(new Date(empresa.ultima_interaccion), new Date(), { locale: es })}`
            : 'nunca'}
        </span>
        {empresa.tasks_pendientes > 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded bg-rust-50 text-rust-700 px-1.5 py-0.5',
              'font-mono tabular-nums',
            )}
          >
            <CheckSquare size={10} />
            {empresa.tasks_pendientes}
          </span>
        )}
      </div>
    </Link>
  )
}

function PrioChip({ active, onClick, children }) {
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
