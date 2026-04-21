import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { cn, parseDateOnly } from '../lib/utils'
import { labelOf, TIPO_INTERACCION, ESTADO_RELACION } from '../lib/constants'
import { PrioridadBadge } from '../components/ui/Badges'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [proximasTareas, setProximasTareas] = useState([])
  const [ultimasInter, setUltimasInter] = useState([])
  const [leadsFriosList, setLeadsFriosList] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const [kpisRes, tareasRes, interRes, friosRes] = await Promise.all([
      supabase.from('v_dashboard_kpis').select('*').maybeSingle(),
      supabase
        .from('tasks')
        .select(
          'id, titulo, due_date, company_id, contact_id, companies(id, razon_social), contacts(nombre_completo)',
        )
        .eq('completada', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(5),
      supabase
        .from('interactions')
        .select(
          'id, tipo, fecha, resumen, company_id, contact_id, companies(id, razon_social), contacts(nombre_completo)',
        )
        .order('fecha', { ascending: false })
        .limit(5),
      supabase
        .from('v_leads_frios')
        .select(
          'id, razon_social, prioridad_comercial, estado_relacion, dias_sin_actividad',
        )
        .limit(5),
    ])
    if (kpisRes.error) {
      setErr(kpisRes.error.message)
      setLoading(false)
      return
    }
    setKpis(kpisRes.data ?? {})
    setProximasTareas(tareasRes.data ?? [])
    setUltimasInter(interRes.data ?? [])
    setLeadsFriosList(friosRes.data ?? [])
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

      {/* Widgets row */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Widget title="Próximas tareas" linkTo="/tareas" linkLabel="Ver todas">
          {loading ? (
            <EmptyHint>cargando…</EmptyHint>
          ) : proximasTareas.length === 0 ? (
            <EmptyHint>Sin tareas pendientes.</EmptyHint>
          ) : (
            <ul className="divide-y divide-ink/5">
              {proximasTareas.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.companies?.id ? `/empresas/${t.companies.id}` : '/tareas'}
                    className="block px-4 py-2.5 hover:bg-ink/[0.02] transition-colors group"
                  >
                    <div className="text-sm font-medium text-ink group-hover:text-rust-600 truncate">
                      {t.titulo}
                    </div>
                    <div className="text-[11px] text-ink/50 mt-0.5 truncate">
                      {[
                        t.companies?.razon_social,
                        t.contacts?.nombre_completo,
                        dueLabel(t.due_date),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Últimas interacciones">
          {loading ? (
            <EmptyHint>cargando…</EmptyHint>
          ) : ultimasInter.length === 0 ? (
            <EmptyHint>Sin interacciones registradas.</EmptyHint>
          ) : (
            <ul className="divide-y divide-ink/5">
              {ultimasInter.map((i) => (
                <li key={i.id}>
                  <Link
                    to={i.companies?.id ? `/empresas/${i.companies.id}` : '#'}
                    className="block px-4 py-2.5 hover:bg-ink/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-rust-600 bg-rust-50 px-1.5 py-0.5 rounded">
                        {labelOf(TIPO_INTERACCION, i.tipo)}
                      </span>
                      <span className="text-sm font-medium text-ink group-hover:text-rust-600 truncate">
                        {i.companies?.razon_social ?? '—'}
                      </span>
                      {i.contacts?.nombre_completo && (
                        <span className="text-[11px] text-ink/40 truncate">
                          · {i.contacts.nombre_completo}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink/50 mt-0.5 truncate">
                      {[agoLabel(i.fecha), truncate(i.resumen, 60)]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget
          title="Leads fríos"
          linkTo={leadsFrios > 5 ? '/leads-frios' : undefined}
          linkLabel="Ver todos"
        >
          {loading ? (
            <EmptyHint>cargando…</EmptyHint>
          ) : leadsFriosList.length === 0 ? (
            <EmptyHint>Sin leads fríos 🎯</EmptyHint>
          ) : (
            <ul className="divide-y divide-ink/5">
              {leadsFriosList.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/empresas/${l.id}`}
                    className="block px-4 py-2.5 hover:bg-ink/[0.02] transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink group-hover:text-rust-600 truncate flex-1">
                        {l.razon_social}
                      </span>
                      <PrioridadBadge value={l.prioridad_comercial} />
                    </div>
                    <div className="text-[11px] text-rust-700/80 mt-0.5 truncate">
                      {l.dias_sin_actividad} días sin actividad ·{' '}
                      {labelOf(ESTADO_RELACION, l.estado_relacion)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </div>
    </div>
  )
}

function Widget({ title, linkTo, linkLabel, children }) {
  return (
    <section className="card overflow-hidden">
      <header className="px-4 py-2.5 border-b border-ink/5 flex items-center justify-between">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-ink/60">
          {title}
        </h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-[11px] text-ink/50 hover:text-ink transition-colors"
          >
            {linkLabel ?? 'Ver todos'} →
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

function EmptyHint({ children }) {
  return (
    <div className="px-4 py-6 text-sm text-center text-ink/40">{children}</div>
  )
}

function dueLabel(dueDate) {
  const d = parseDateOnly(dueDate)
  if (!d) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'vence hoy'
  if (diffDays === 1) return 'vence mañana'
  if (diffDays === -1) return 'venció ayer'
  if (diffDays < 0) return `venció hace ${Math.abs(diffDays)} días`
  return `vence en ${diffDays} días`
}

function agoLabel(d) {
  if (!d) return null
  try {
    return `hace ${formatDistance(new Date(d), new Date(), { locale: es })}`
  } catch {
    return null
  }
}

function truncate(s, n) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n).trim() + '…' : s
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
