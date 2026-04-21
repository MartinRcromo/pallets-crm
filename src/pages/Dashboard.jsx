import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fmtUSD } from '../lib/utils'
import { PrioridadBadge, SectorChip, DecisorPill } from '../components/ui/Badges'
import { ArrowUpRight, Flame, Users, Building2, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [topEmpresas, setTopEmpresas] = useState([])
  const [decisoresCriticos, setDecisoresCriticos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)

    const [
      { count: empresasCount },
      { count: criticasCount },
      { count: contactosCount },
      { count: decisoresCount },
      { data: fobRows },
      { data: top },
      { data: deciCrit },
    ] = await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('prioridad_comercial', 'critica'),
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('es_decisor', true),
      supabase
        .from('companies')
        .select('fob_usd_12m')
        .not('fob_usd_12m', 'is', null),
      supabase
        .from('companies')
        .select(
          'id, razon_social, sector, fob_usd_12m, prioridad_comercial, estado_relacion, clasificacion',
        )
        .not('fob_usd_12m', 'is', null)
        .neq('clasificacion', 'competidor')
        .neq('clasificacion', 'excluido')
        .order('fob_usd_12m', { ascending: false })
        .limit(5),
      supabase
        .from('contacts')
        .select(
          'id, nombre_completo, cargo, company_id, companies!inner(razon_social, prioridad_comercial, sector)',
        )
        .eq('es_decisor', true)
        .eq('companies.prioridad_comercial', 'critica')
        .limit(8),
    ])

    const fobTotal = (fobRows ?? []).reduce(
      (acc, x) => acc + Number(x.fob_usd_12m || 0),
      0,
    )

    setStats({
      empresas: empresasCount ?? 0,
      criticas: criticasCount ?? 0,
      contactos: contactosCount ?? 0,
      decisores: decisoresCount ?? 0,
      fobTotal,
    })
    setTopEmpresas(top ?? [])
    setDecisoresCriticos(deciCrit ?? [])
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Dashboard
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Panorama comercial
        </h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <Kpi
          label="Empresas"
          value={stats?.empresas}
          hint={`${stats?.criticas ?? 0} críticas`}
          icon={Building2}
          loading={loading}
        />
        <Kpi
          label="Contactos"
          value={stats?.contactos}
          hint={`${stats?.decisores ?? 0} decisores`}
          icon={Users}
          loading={loading}
        />
        <Kpi
          label="Críticas"
          value={stats?.criticas}
          hint="Prioridad máxima"
          icon={Flame}
          accent
          loading={loading}
        />
        <Kpi
          label="FOB agregado 12m"
          value={stats?.fobTotal != null ? fmtUSD(stats.fobTotal) : null}
          hint="Universo relevado"
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        {/* Top empresas */}
        <section className="card overflow-hidden">
          <header className="px-5 py-3 border-b border-ink/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                Ranking FOB 12m
              </div>
              <h2 className="font-serif text-lg text-ink">Usuarios finales · Top 5</h2>
            </div>
            <Link
              to="/empresas"
              className="text-xs text-ink/60 hover:text-ink inline-flex items-center gap-1"
            >
              Ver todas <ArrowUpRight size={12} />
            </Link>
          </header>
          <ul>
            {topEmpresas.map((e, i) => (
              <li key={e.id} className="border-b border-ink/5 last:border-0">
                <Link
                  to={`/empresas/${e.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.02] transition-colors group"
                >
                  <div className="font-mono text-xs text-ink/30 tabular-nums w-5">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink font-medium truncate group-hover:text-rust-600">
                      {e.razon_social}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <SectorChip sector={e.sector} />
                      <PrioridadBadge value={e.prioridad_comercial} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono tabular-nums text-ink">
                      {fmtUSD(e.fob_usd_12m)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {!loading && topEmpresas.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink/40">
                Sin datos
              </li>
            )}
          </ul>
        </section>

        {/* Decisores críticos */}
        <section className="card overflow-hidden">
          <header className="px-5 py-3 border-b border-ink/5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
              Próxima acción sugerida
            </div>
            <h2 className="font-serif text-lg text-ink">Decisores · empresas críticas</h2>
          </header>
          <ul>
            {decisoresCriticos.map((c) => (
              <li key={c.id} className="border-b border-ink/5 last:border-0">
                <Link
                  to={`/contactos/${c.id}`}
                  className="block px-5 py-3 hover:bg-ink/[0.02] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink group-hover:text-rust-600 truncate">
                        {c.nombre_completo}
                      </div>
                      <div className="text-xs text-ink/60 mt-0.5 truncate">
                        {c.cargo}
                      </div>
                      <div className="text-[11px] text-ink/40 mt-0.5 truncate">
                        → {c.companies?.razon_social}
                      </div>
                    </div>
                    <DecisorPill />
                  </div>
                </Link>
              </li>
            ))}
            {!loading && decisoresCriticos.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink/40">
                Sin decisores críticos
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Kpi({ label, value, hint, icon: Icon, accent, loading }) {
  return (
    <div
      className={
        accent
          ? 'card p-4 sm:p-5 bg-ink text-paper border-ink'
          : 'card p-4 sm:p-5'
      }
    >
      <div className="flex items-start justify-between">
        <div className={accent ? 'text-paper/60' : 'text-ink/50'}>
          <Icon size={16} />
        </div>
        <div
          className={
            accent
              ? 'text-[9px] font-mono uppercase tracking-widest text-paper/50'
              : 'text-[9px] font-mono uppercase tracking-widest text-ink/40'
          }
        >
          {label}
        </div>
      </div>
      <div
        className={
          accent
            ? 'font-serif text-3xl sm:text-4xl mt-3 tracking-tight tabular-nums'
            : 'font-serif text-3xl sm:text-4xl mt-3 tracking-tight tabular-nums text-ink'
        }
      >
        {loading ? '…' : value ?? '—'}
      </div>
      <div
        className={
          accent
            ? 'text-xs mt-1 text-paper/50'
            : 'text-xs mt-1 text-ink/50'
        }
      >
        {hint}
      </div>
    </div>
  )
}
