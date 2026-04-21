import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('v_dashboard_kpis')
      .select('*')
      .maybeSingle()
    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }
    setKpis(data ?? {})
    setLoading(false)
  }

  const tareasHoy = kpis?.tareas_hoy ?? 0
  const tareasVencidas = kpis?.tareas_vencidas ?? 0
  const tareasSemana = kpis?.tareas_proxima_semana ?? 0
  const leadsFrios = kpis?.leads_frios_count ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Dashboard
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Hoy
        </h1>
      </div>

      {err && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-6">
          {err}
        </div>
      )}

      {/* HERO */}
      <Link
        to="/tareas"
        className="block card p-6 sm:p-8 mb-6 hover:border-rust-300 transition-colors group"
      >
        {loading ? (
          <div className="text-ink/40 font-mono text-xs uppercase tracking-widest">
            cargando…
          </div>
        ) : tareasHoy === 0 ? (
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight">
              Nada urgente hoy ✓
            </h2>
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink/40 mt-2">
              {tareasVencidas} vencidas · {tareasSemana} esta semana
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-6xl sm:text-7xl text-ink tracking-tight tabular-nums group-hover:text-rust-600 transition-colors">
                {tareasHoy}
              </span>
              <span className="font-serif text-2xl sm:text-3xl text-ink/70">
                {tareasHoy === 1 ? 'tarea hoy' : 'tareas hoy'}
              </span>
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
              <span className={cn(tareasVencidas > 0 && 'text-rust-700')}>
                {tareasVencidas} vencidas
              </span>
              {' · '}
              <span>{tareasSemana} esta semana</span>
            </div>
          </div>
        )}
      </Link>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <KpiCard
          label="Interacciones 7d"
          value={kpis?.interacciones_7d}
          sub={
            kpis?.respuestas_positivas_7d != null
              ? `${kpis.respuestas_positivas_7d} positivas`
              : '—'
          }
          loading={loading}
        />
        <KpiCard
          label="Empresas tocadas 7d"
          value={kpis?.empresas_tocadas_7d}
          sub={
            kpis?.empresas_sin_contactar != null
              ? `de ${kpis.empresas_sin_contactar} prospectables`
              : '—'
          }
          loading={loading}
        />
        <KpiCard
          label="Pipeline activo"
          value={kpis?.empresas_activas}
          sub="empresas conversando"
          loading={loading}
        />
        <KpiCard
          label="Leads fríos"
          value={leadsFrios}
          sub=">14 días sin contacto"
          loading={loading}
          to="/leads-frios"
          alert={leadsFrios > 0}
        />
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, loading, to, alert = false }) {
  const content = (
    <>
      <div
        className={cn(
          'text-[9px] font-mono uppercase tracking-widest',
          alert ? 'text-rust-700' : 'text-ink/40',
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-serif text-3xl sm:text-4xl mt-2 tracking-tight tabular-nums',
          alert ? 'text-rust-700' : 'text-ink',
        )}
      >
        {loading ? '…' : value ?? '—'}
      </div>
      <div
        className={cn(
          'text-xs mt-1',
          alert ? 'text-rust-700/80' : 'text-zinc-500',
        )}
      >
        {sub}
      </div>
    </>
  )

  const className = cn(
    'card p-4 sm:p-5',
    to && 'hover:border-rust-300 transition-colors cursor-pointer block',
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
