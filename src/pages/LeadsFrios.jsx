import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Snowflake } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmtUSD } from '../lib/utils'
import {
  PrioridadBadge,
  EstadoRelacionBadge,
  SectorChip,
} from '../components/ui/Badges'

export default function LeadsFrios() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('v_leads_frios')
      .select(
        'id, razon_social, nombre_comercial, prioridad_comercial, estado_relacion, sector, fob_usd_12m, dias_sin_actividad',
      )
      .order('dias_sin_actividad', { ascending: false })
    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }
    setLeads(data ?? [])
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <header className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Alertas
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Leads fríos
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
          Empresas en estado activo sin interacción hace más de 14 días
        </p>
      </header>

      {err && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
          cargando…
        </div>
      ) : leads.length === 0 ? (
        <div className="card p-10 text-center">
          <Snowflake size={36} className="mx-auto text-zinc-400 mb-3" />
          <p className="font-serif text-xl text-ink">
            Sin leads fríos. Todo está al día.
          </p>
          <p className="text-xs text-ink/50 mt-2">
            Volvé aquí cuando alguna empresa activa se enfríe.
          </p>
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="card overflow-hidden hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.02] border-b border-ink/10">
                <tr className="text-left">
                  <Th>Empresa</Th>
                  <Th>Prioridad</Th>
                  <Th>Estado</Th>
                  <Th right>Días sin actividad</Th>
                  <Th right>FOB 12m</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => navigate(`/empresas/${l.id}`)}
                    className="border-b border-ink/5 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-ink">
                        {l.razon_social}
                      </div>
                      {l.sector && (
                        <div className="mt-1">
                          <SectorChip sector={l.sector} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadBadge value={l.prioridad_comercial} />
                    </td>
                    <td className="px-4 py-3">
                      <EstadoRelacionBadge value={l.estado_relacion} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-rust-700">
                      {l.dias_sin_actividad}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-ink/80">
                      {l.fob_usd_12m != null ? fmtUSD(l.fob_usd_12m) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="card divide-y divide-zinc-200 sm:hidden">
            {leads.map((l) => (
              <Link
                key={l.id}
                to={`/empresas/${l.id}`}
                className="block p-3 hover:bg-ink/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-medium text-ink flex-1 min-w-0">
                    {l.razon_social}
                  </div>
                  <PrioridadBadge value={l.prioridad_comercial} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <EstadoRelacionBadge value={l.estado_relacion} />
                  {l.sector && <SectorChip sector={l.sector} />}
                </div>
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="text-rust-700 font-mono tabular-nums">
                    {l.dias_sin_actividad} días sin actividad
                  </span>
                  {l.fob_usd_12m != null && (
                    <span className="text-ink/60 font-mono tabular-nums">
                      {fmtUSD(l.fob_usd_12m)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Th({ children, right = false }) {
  return (
    <th
      className={
        'px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink/50' +
        (right ? ' text-right' : '')
      }
    >
      {children}
    </th>
  )
}
