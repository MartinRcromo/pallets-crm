import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fmtUSD } from '../lib/utils'
import {
  PrioridadBadge,
  ClasifBadge,
  EstadoRelacionBadge,
  SectorChip,
} from '../components/ui/Badges'
import { Search, X, ChevronDown } from 'lucide-react'
import {
  PRIORIDAD_COMERCIAL,
  CLASIFICACION_EMPRESA,
  ESTADO_RELACION,
} from '../lib/constants'

export default function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [filtroPrio, setFiltroPrio] = useState('all')
  const [filtroClasif, setFiltroClasif] = useState('not_excluded')
  const [filtroEstado, setFiltroEstado] = useState('all')
  const [filtroSector, setFiltroSector] = useState('all')
  const [sort, setSort] = useState('prioridad')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('companies_with_stats')
      .select('*')
      .order('razon_social')
    if (error) console.error(error)
    setEmpresas(data ?? [])
    setLoading(false)
  }

  const sectoresUnicos = useMemo(() => {
    const s = new Set(empresas.map((e) => e.sector).filter(Boolean))
    return Array.from(s).sort()
  }, [empresas])

  const filtradas = useMemo(() => {
    let xs = [...empresas]
    if (q) {
      const needle = q.toLowerCase()
      xs = xs.filter(
        (e) =>
          e.razon_social?.toLowerCase().includes(needle) ||
          e.nombre_comercial?.toLowerCase().includes(needle) ||
          e.sector?.toLowerCase().includes(needle) ||
          e.subsector?.toLowerCase().includes(needle),
      )
    }
    if (filtroPrio !== 'all') xs = xs.filter((e) => e.prioridad_comercial === filtroPrio)
    if (filtroClasif === 'not_excluded') {
      xs = xs.filter((e) => e.clasificacion === 'usuario_final')
    } else if (filtroClasif !== 'all') {
      xs = xs.filter((e) => e.clasificacion === filtroClasif)
    }
    if (filtroEstado !== 'all') xs = xs.filter((e) => e.estado_relacion === filtroEstado)
    if (filtroSector !== 'all') xs = xs.filter((e) => e.sector === filtroSector)

    // sort
    if (sort === 'prioridad') {
      const order = { critica: 4, alta: 3, media: 2, baja: 1 }
      xs.sort(
        (a, b) =>
          (order[b.prioridad_comercial] ?? 0) - (order[a.prioridad_comercial] ?? 0) ||
          (b.fob_usd_12m ?? 0) - (a.fob_usd_12m ?? 0),
      )
    } else if (sort === 'fob') {
      xs.sort((a, b) => (b.fob_usd_12m ?? 0) - (a.fob_usd_12m ?? 0))
    } else if (sort === 'contactos') {
      xs.sort((a, b) => (b.contactos_total ?? 0) - (a.contactos_total ?? 0))
    } else {
      xs.sort((a, b) => a.razon_social.localeCompare(b.razon_social))
    }
    return xs
  }, [empresas, q, filtroPrio, filtroClasif, filtroEstado, filtroSector, sort])

  const resetFilters = () => {
    setQ('')
    setFiltroPrio('all')
    setFiltroClasif('not_excluded')
    setFiltroEstado('all')
    setFiltroSector('all')
    setSort('prioridad')
  }

  const hasFilters =
    q ||
    filtroPrio !== 'all' ||
    filtroClasif !== 'not_excluded' ||
    filtroEstado !== 'all' ||
    filtroSector !== 'all'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
            Universo relevado
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
            Empresas
          </h1>
        </div>
        <div className="text-sm text-ink/60 font-mono tabular-nums">
          {filtradas.length} / {empresas.length}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
        />
        <input
          type="search"
          placeholder="Buscar empresa, sector, CUIT…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <Select
          label="Prioridad"
          value={filtroPrio}
          onChange={setFiltroPrio}
          options={[
            { value: 'all', label: 'Todas' },
            ...PRIORIDAD_COMERCIAL.map((p) => ({ value: p.value, label: p.label })),
          ]}
        />
        <Select
          label="Clasificación"
          value={filtroClasif}
          onChange={setFiltroClasif}
          options={[
            { value: 'not_excluded', label: 'Prospectables' },
            { value: 'all', label: 'Todas' },
            ...CLASIFICACION_EMPRESA.map((p) => ({ value: p.value, label: p.label })),
          ]}
        />
        <Select
          label="Estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          options={[
            { value: 'all', label: 'Todos' },
            ...ESTADO_RELACION.map((p) => ({ value: p.value, label: p.label })),
          ]}
        />
        <Select
          label="Sector"
          value={filtroSector}
          onChange={setFiltroSector}
          options={[
            { value: 'all', label: 'Todos' },
            ...sectoresUnicos.map((s) => ({ value: s, label: s })),
          ]}
        />
        <Select
          label="Orden"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'prioridad', label: 'Prioridad' },
            { value: 'fob', label: 'FOB USD' },
            { value: 'contactos', label: '# Contactos' },
            { value: 'nombre', label: 'A–Z' },
          ]}
        />
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="btn-ghost !text-xs"
          >
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla (desktop) */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.02] border-b border-ink/10">
            <tr className="text-left">
              <Th>Empresa</Th>
              <Th>Sector</Th>
              <Th>Prioridad</Th>
              <Th>Clasificación</Th>
              <Th>Estado</Th>
              <Th className="text-right">FOB 12m</Th>
              <Th className="text-right">Contactos</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink/40">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading &&
              filtradas.map((e) => (
                <tr key={e.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/empresas/${e.id}`}
                      className="font-medium text-ink hover:text-rust-600 block"
                    >
                      {e.razon_social}
                    </Link>
                    {e.nombre_comercial && e.nombre_comercial !== e.razon_social && (
                      <div className="text-[11px] text-ink/40 mt-0.5">
                        {e.nombre_comercial}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <SectorChip sector={e.sector} />
                  </td>
                  <td className="px-4 py-2.5">
                    <PrioridadBadge value={e.prioridad_comercial} />
                  </td>
                  <td className="px-4 py-2.5">
                    <ClasifBadge value={e.clasificacion} />
                  </td>
                  <td className="px-4 py-2.5">
                    <EstadoRelacionBadge value={e.estado_relacion} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink/80">
                    {e.fob_usd_12m ? fmtUSD(e.fob_usd_12m) : <span className="text-ink/30">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink/80">
                    {e.contactos_total ?? 0}
                    {e.contactos_alta > 0 && (
                      <span className="text-rust-500 ml-1">({e.contactos_alta})</span>
                    )}
                  </td>
                </tr>
              ))}
            {!loading && filtradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink/40">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-2">
        {loading && <div className="text-center py-10 text-ink/40">Cargando…</div>}
        {!loading &&
          filtradas.map((e) => (
            <Link
              key={e.id}
              to={`/empresas/${e.id}`}
              className="card p-3 block animate-slide-up"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink text-sm">{e.razon_social}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <SectorChip sector={e.sector} />
                    <PrioridadBadge value={e.prioridad_comercial} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono tabular-nums">
                    {e.fob_usd_12m ? fmtUSD(e.fob_usd_12m) : <span className="text-ink/30">—</span>}
                  </div>
                  <div className="text-[10px] text-ink/50 mt-0.5">
                    {e.contactos_total ?? 0} contactos
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink/50 font-medium ${className}`}>
      {children}
    </th>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-zinc-300 rounded-md pl-2.5 pr-7 py-1.5 text-xs focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
      />
    </label>
  )
}
