import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { fmtUSD, fmtDate, fmtDateTime, timeAgo, cn, parseDateOnly } from '../lib/utils'
import {
  labelOf,
  ESTADO_RELACION,
  TIPO_INTERACCION,
  SENTIMENT,
  SENIORITY,
  PRIORIDAD_COMERCIAL,
  CLASIFICACION_EMPRESA,
} from '../lib/constants'
import {
  PrioridadBadge,
  ClasifBadge,
  EstadoRelacionBadge,
  SectorChip,
  PrioContactoBadge,
  DecisorPill,
  SeniorityChip,
  EstadoContactoBadge,
} from '../components/ui/Badges'
import InlineBadgeSelect from '../components/ui/InlineBadgeSelect'
import InteraccionForm from '../components/InteraccionForm'
import NewContactModal from '../components/NewContactModal'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Linkedin,
  Plus,
  Calendar,
  MessageSquare,
  PackageOpen,
  ScrollText,
  Users,
  CheckSquare,
  Phone,
} from 'lucide-react'

const TABS = [
  { key: 'dossier', label: 'Dossier', icon: ScrollText },
  { key: 'importaciones', label: 'Importaciones', icon: PackageOpen },
  { key: 'contactos', label: 'Contactos', icon: Users },
  { key: 'interacciones', label: 'Interacciones', icon: MessageSquare },
  { key: 'tareas', label: 'Tareas', icon: CheckSquare },
]

export default function EmpresaDetalle() {
  const { id } = useParams()
  const [empresa, setEmpresa] = useState(null)
  const [contactos, setContactos] = useState([])
  const [interacciones, setInteracciones] = useState([])
  const [imports, setImports] = useState([])
  const [tareas, setTareas] = useState([])
  const [tab, setTab] = useState('dossier')
  const [loading, setLoading] = useState(true)
  const [showInter, setShowInter] = useState(false)
  const [showNewContact, setShowNewContact] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const load = async () => {
    setLoading(true)
    const [emp, con, inter, imp, tk] = await Promise.all([
      supabase.from('companies').select('*').eq('id', id).single(),
      supabase
        .from('contacts')
        .select('*')
        .eq('company_id', id)
        .order('es_decisor', { ascending: false })
        .order('prioridad'),
      supabase
        .from('interactions')
        .select('*')
        .eq('company_id', id)
        .order('fecha', { ascending: false }),
      supabase
        .from('imports_history')
        .select(
          'id, fecha_operacion, modelo_importado, marca_importada, origen, cantidad, fob_usd',
        )
        .eq('company_id', id)
        .order('fecha_operacion', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('company_id', id)
        .order('completada')
        .order('due_date'),
    ])
    setEmpresa(emp.data)
    setContactos(con.data ?? [])
    setInteracciones(inter.data ?? [])
    setImports(imp.data ?? [])
    setTareas(tk.data ?? [])
    setLoading(false)
  }

  const updateEmpresa = async (patch) => {
    const { error } = await supabase
      .from('companies')
      .update(patch)
      .eq('id', id)
    if (error) throw error
    setEmpresa((prev) => ({ ...prev, ...patch }))
  }

  const reloadContactos = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', id)
      .order('es_decisor', { ascending: false })
      .order('prioridad')
    setContactos(data ?? [])
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-ink/40 text-sm">
        Cargando…
      </div>
    )
  }
  if (!empresa) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-ink/60">
        Empresa no encontrada. <Link to="/empresas" className="underline">Volver</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <Link
        to="/empresas"
        className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink mb-4"
      >
        <ArrowLeft size={13} /> Empresas
      </Link>

      {/* HEADER */}
      <header className="mb-6">
        <div className="flex items-start gap-3 mb-3 flex-wrap">
          <InlineBadgeSelect
            value={empresa.prioridad_comercial}
            options={PRIORIDAD_COMERCIAL}
            onChange={(v) => updateEmpresa({ prioridad_comercial: v })}
            renderBadge={(v) => <PrioridadBadge value={v} size="md" />}
            title="Cambiar prioridad"
          />
          <InlineBadgeSelect
            value={empresa.clasificacion}
            options={CLASIFICACION_EMPRESA}
            onChange={(v) => updateEmpresa({ clasificacion: v })}
            renderBadge={(v) => <ClasifBadge value={v} />}
            title="Cambiar clasificación"
          />
          <InlineBadgeSelect
            value={empresa.estado_relacion}
            options={ESTADO_RELACION}
            onChange={(v) => updateEmpresa({ estado_relacion: v })}
            renderBadge={(v) => <EstadoRelacionBadge value={v} />}
            title="Cambiar estado de relación"
          />
          <SectorChip sector={empresa.sector} />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          {empresa.razon_social}
        </h1>
        {empresa.nombre_comercial && empresa.nombre_comercial !== empresa.razon_social && (
          <div className="text-sm text-ink/60 mt-1">{empresa.nombre_comercial}</div>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-ink/60">
          {empresa.subsector && (
            <span className="inline-flex items-center gap-1">
              <Building2 size={12} /> {empresa.subsector}
            </span>
          )}
          {(empresa.ciudad || empresa.provincia) && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {[empresa.ciudad, empresa.provincia].filter(Boolean).join(', ')}
            </span>
          )}
          {empresa.sitio_web && (
            <a
              href={empresa.sitio_web}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink"
            >
              <Globe size={12} /> Web
            </a>
          )}
          {empresa.linkedin_url && (
            <a
              href={empresa.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink"
            >
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
        </div>

        {/* KPIs mini */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <MiniKpi label="FOB 12m" value={empresa.fob_usd_12m ? fmtUSD(empresa.fob_usd_12m) : '—'} />
          <MiniKpi label="Operaciones" value={empresa.operaciones_12m ?? '—'} />
          <MiniKpi label="Contactos" value={contactos.length} />
          <MiniKpi label="Interacciones" value={interacciones.length} />
        </div>

        {empresa.nota_prioridad && (
          <div className="mt-4 p-3 rounded border-l-2 border-rust-500 bg-rust-50/50 text-sm text-ink/80">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rust-600 block mb-0.5">
              Nota de prioridad
            </span>
            {empresa.nota_prioridad}
          </div>
        )}
      </header>

      {/* TABS */}
      <div className="border-b border-ink/10 mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-1 min-w-max">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-[1px]',
                tab === key
                  ? 'border-rust-500 text-ink font-medium'
                  : 'border-transparent text-ink/50 hover:text-ink',
              )}
            >
              <Icon size={14} />
              {label}
              {key === 'contactos' && contactos.length > 0 && (
                <span className="text-[10px] font-mono text-ink/40 ml-1">
                  {contactos.length}
                </span>
              )}
              {key === 'interacciones' && interacciones.length > 0 && (
                <span className="text-[10px] font-mono text-ink/40 ml-1">
                  {interacciones.length}
                </span>
              )}
              {key === 'importaciones' && imports.length > 0 && (
                <span className="text-[10px] font-mono text-ink/40 ml-1">
                  {imports.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {tab === 'dossier' && <DossierTab empresa={empresa} />}
      {tab === 'importaciones' && <ImportacionesTab imports={imports} />}
      {tab === 'contactos' && (
        <ContactosTab
          contactos={contactos}
          onNew={() => setShowNewContact(true)}
        />
      )}
      {tab === 'interacciones' && (
        <InteraccionesTab
          interacciones={interacciones}
          contactos={contactos}
          showForm={showInter}
          setShowForm={setShowInter}
          companyId={empresa.id}
          onSaved={() => {
            setShowInter(false)
            load()
          }}
        />
      )}
      {tab === 'tareas' && <TareasTab tareas={tareas} onToggle={load} />}

      {showNewContact && (
        <NewContactModal
          companyId={empresa.id}
          onClose={() => setShowNewContact(false)}
          onCreated={() => {
            setShowNewContact(false)
            reloadContactos()
          }}
        />
      )}
    </div>
  )
}

function MiniKpi({ label, value }) {
  return (
    <div className="card p-3">
      <div className="text-[9px] font-mono uppercase tracking-widest text-ink/40">
        {label}
      </div>
      <div className="font-serif text-xl tabular-nums text-ink mt-1">{value}</div>
    </div>
  )
}

// ===== TABS =====

function DossierTab({ empresa }) {
  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="card p-6">
        <h2 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
          <ScrollText size={16} /> Dossier estratégico
        </h2>
        {empresa.dossier_estrategico ? (
          <div className="prose-dossier">
            <ReactMarkdown>{empresa.dossier_estrategico}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-ink/40 italic">
            Sin dossier cargado todavía. Podés editarlo desde Supabase Studio.
          </p>
        )}
      </div>

      <aside className="space-y-4">
        {empresa.gap_producto && (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">
              Gap de producto
            </div>
            <div className="text-sm text-ink/90">{empresa.gap_producto}</div>
          </div>
        )}
        {empresa.principales_marcas_importadas?.length > 0 && (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-2">
              Marcas importadas
            </div>
            <div className="flex flex-wrap gap-1">
              {empresa.principales_marcas_importadas.map((m, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-ink/5 rounded text-ink/80"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
        {empresa.principales_origenes?.length > 0 && (
          <div className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-2">
              Orígenes
            </div>
            <div className="flex flex-wrap gap-1">
              {empresa.principales_origenes.map((m, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-ink/5 rounded text-ink/80"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

function ImportacionesTab({ imports }) {
  if (imports.length === 0) {
    return (
      <div className="card p-10 text-center">
        <PackageOpen size={36} className="mx-auto text-zinc-400 mb-3" />
        <p className="text-sm text-zinc-400">
          Sin registros de importación cargados
        </p>
      </div>
    )
  }

  const totalOps = imports.length
  const totalCantidad = imports.reduce(
    (s, i) => s + (Number(i.cantidad) || 0),
    0,
  )
  const totalFob = imports.reduce(
    (s, i) => s + (Number(i.fob_usd) || 0),
    0,
  )
  const marcaTop = modeOf(imports.map((i) => i.marca_importada))
  const origenTop = modeOf(imports.map((i) => i.origen))

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <SummaryKpi label="Operaciones" value={totalOps.toLocaleString('es-AR')} />
          <SummaryKpi
            label="Cantidad total"
            value={totalCantidad.toLocaleString('es-AR')}
          />
          <SummaryKpi label="FOB total" value={fmtUSD(totalFob)} />
          <SummaryKpi label="Marca top" value={marcaTop ?? '—'} mono />
          <SummaryKpi label="Origen top" value={origenTop ?? '—'} mono />
        </div>
      </div>

      {/* Tabla (desktop) */}
      <div className="card overflow-hidden hidden sm:block">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.02] border-b border-ink/10">
            <tr className="text-left">
              <Th>Fecha</Th>
              <Th>Modelo</Th>
              <Th>Marca</Th>
              <Th>Origen</Th>
              <Th right>Cantidad</Th>
              <Th right>U.P. USD</Th>
              <Th right>FOB USD</Th>
            </tr>
          </thead>
          <tbody>
            {imports.map((i) => {
              const cantidad = Number(i.cantidad) || 0
              const up = cantidad > 0 ? Number(i.fob_usd) / cantidad : null
              return (
                <tr
                  key={i.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-4 py-2 text-xs text-ink/80 whitespace-nowrap">
                    {fmtDate(parseDateOnly(i.fecha_operacion), 'd MMM yyyy')}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <NullableText value={i.modelo_importado} />
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <NullableText value={i.marca_importada} />
                  </td>
                  <td className="px-4 py-2 text-xs text-ink/80">{i.origen ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-xs">
                    {cantidad > 0 ? cantidad.toLocaleString('es-AR') : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-xs">
                    {up != null
                      ? up.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {fmtUSD(i.fob_usd)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="card divide-y divide-zinc-200 sm:hidden">
        {imports.map((i) => {
          const cantidad = Number(i.cantidad) || 0
          const up = cantidad > 0 ? Number(i.fob_usd) / cantidad : null
          return (
            <div key={i.id} className="p-3 space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
                <span>{fmtDate(parseDateOnly(i.fecha_operacion), 'd MMM yyyy')}</span>
                <span className="font-mono tabular-nums">
                  {cantidad > 0
                    ? `${cantidad.toLocaleString('es-AR')} u.`
                    : '—'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-ink/60 uppercase tracking-wide">
                <NullableText value={i.modelo_importado} /> —{' '}
                <NullableText value={i.marca_importada} /> —{' '}
                {i.origen ?? '—'}
              </div>
              <div className="flex items-baseline justify-end gap-3 text-xs font-mono tabular-nums text-ink/80">
                <span>
                  U.P.{' '}
                  {up != null
                    ? up.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '—'}
                </span>
                <span className="text-ink font-medium">{fmtUSD(i.fob_usd)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryKpi({ label, value, mono = false }) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-ink/40">
        {label}
      </div>
      <div
        className={cn(
          'text-ink mt-1 truncate',
          mono
            ? 'font-mono text-sm uppercase tracking-wide'
            : 'font-serif text-xl tabular-nums',
        )}
        title={String(value)}
      >
        {value}
      </div>
    </div>
  )
}

function Th({ children, right = false }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink/50',
        right && 'text-right',
      )}
    >
      {children}
    </th>
  )
}

function NullableText({ value }) {
  if (value == null || value === '') {
    return <span className="text-zinc-400">—</span>
  }
  return <span className="text-ink/90">{value}</span>
}

function modeOf(arr) {
  const freq = new Map()
  for (const v of arr) {
    if (v == null || v === '') continue
    freq.set(v, (freq.get(v) ?? 0) + 1)
  }
  let top = null
  let topCount = 0
  for (const [k, c] of freq) {
    if (c > topCount) {
      top = k
      topCount = c
    }
  }
  return top
}

function ContactosTab({ contactos, onNew }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
          {contactos.length} contacto{contactos.length === 1 ? '' : 's'}
        </div>
        <button type="button" onClick={onNew} className="btn-rust !text-xs !py-1.5">
          <Plus size={13} /> Nuevo contacto
        </button>
      </div>

      {contactos.length === 0 ? (
        <div className="card p-8 text-center">
          <Users size={32} className="mx-auto text-ink/20 mb-3" />
          <p className="text-sm text-ink/60">Sin contactos cargados.</p>
          <button
            type="button"
            onClick={onNew}
            className="btn-secondary mt-4 !text-xs"
          >
            <Plus size={13} /> Agregar el primero
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {contactos.map((c) => (
        <Link
          key={c.id}
          to={`/contactos/${c.id}`}
          className="card p-4 hover:border-rust-300 transition-colors animate-slide-up"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-ink">{c.nombre_completo}</div>
              <div className="text-xs text-ink/60 mt-0.5">{c.cargo}</div>
            </div>
            {c.es_decisor && <DecisorPill />}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {c.area && <SectorChip sector={c.area} />}
            <SeniorityChip value={c.seniority} />
            <PrioContactoBadge value={c.prioridad} />
            <EstadoContactoBadge value={c.estado} />
          </div>
          {c.ubicacion && (
            <div className="text-[11px] text-ink/40 mt-2">
              <MapPin size={10} className="inline mr-1" />
              {c.ubicacion}
            </div>
          )}
        </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function InteraccionesTab({ interacciones, contactos, showForm, setShowForm, companyId, onSaved }) {
  const getContactName = (cid) => {
    if (!cid) return null
    return contactos.find((c) => c.id === cid)?.nombre_completo
  }
  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-rust">
          <Plus size={14} />
          Registrar interacción
        </button>
      )}
      {showForm && (
        <InteraccionForm
          companyId={companyId}
          onSaved={onSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {interacciones.length === 0 && !showForm ? (
        <div className="card p-8 text-center">
          <MessageSquare size={32} className="mx-auto text-ink/20 mb-3" />
          <p className="text-sm text-ink/60">Sin interacciones registradas todavía.</p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-ink/10 ml-2 space-y-4 pt-2">
          {interacciones.map((i) => (
            <li key={i.id} className="pl-5 relative">
              <div
                className={cn(
                  'absolute -left-[5px] top-2 w-2 h-2 rounded-full',
                  i.sentiment === 'positivo'
                    ? 'bg-emerald-500'
                    : i.sentiment === 'negativo'
                    ? 'bg-red-500'
                    : 'bg-rust-400',
                )}
              />
              <div className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="text-xs text-ink/60">
                    <span className="font-mono uppercase tracking-widest text-[10px] text-rust-600">
                      {labelOf(TIPO_INTERACCION, i.tipo)}
                    </span>
                    {' · '}
                    <span>{i.direccion === 'saliente' ? '→ Saliente' : '← Entrante'}</span>
                    {getContactName(i.contact_id) && (
                      <>
                        {' · '}
                        <span>con {getContactName(i.contact_id)}</span>
                      </>
                    )}
                  </div>
                  <time className="text-[11px] text-ink/40 font-mono tabular-nums">
                    {fmtDateTime(i.fecha)}
                  </time>
                </div>
                <p className="text-sm text-ink/90 whitespace-pre-wrap">{i.resumen}</p>
                {i.proximo_paso && (
                  <div className="mt-2 text-xs text-ink/70 border-t border-ink/5 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                      Próximo paso
                    </span>
                    <div className="mt-0.5">{i.proximo_paso}</div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function TareasTab({ tareas, onToggle }) {
  const toggleTask = async (t) => {
    await supabase
      .from('tasks')
      .update({
        completada: !t.completada,
        completada_at: !t.completada ? new Date().toISOString() : null,
      })
      .eq('id', t.id)
    onToggle()
  }

  if (tareas.length === 0) {
    return (
      <div className="card p-8 text-center">
        <CheckSquare size={32} className="mx-auto text-ink/20 mb-3" />
        <p className="text-sm text-ink/60">Sin tareas cargadas.</p>
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {tareas.map((t) => (
        <li key={t.id} className="card p-3 flex items-start gap-3">
          <button
            onClick={() => toggleTask(t)}
            className={cn(
              'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
              t.completada
                ? 'bg-rust-500 border-rust-500'
                : 'border-ink/30 hover:border-ink',
            )}
          >
            {t.completada && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className={cn('text-sm', t.completada && 'line-through text-ink/40')}>
              {t.titulo}
            </div>
            {t.descripcion && (
              <div className="text-xs text-ink/60 mt-0.5">{t.descripcion}</div>
            )}
            {t.due_date && (
              <div className="text-[11px] text-ink/40 mt-1 inline-flex items-center gap-1">
                <Calendar size={10} /> {fmtDate(t.due_date)}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
