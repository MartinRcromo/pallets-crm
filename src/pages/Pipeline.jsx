import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, CheckSquare, AlertCircle } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import { cn, fmtUSD } from '../lib/utils'
import {
  PrioridadBadge,
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
  })
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

export default function Pipeline() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [prioFilter, setPrioFilter] = useState('todas')
  const [q, setQ] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const isMobile = useIsMobile()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  useEffect(() => {
    load()
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase
      .from('companies_with_stats')
      .select(
        'id, razon_social, prioridad_comercial, clasificacion, estado_relacion, sector, fob_usd_12m, ultima_interaccion, contactos_total, tasks_pendientes',
      )
      .eq('clasificacion', 'usuario_final')
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

  const activeEmpresa = activeId
    ? empresas.find((e) => e.id === activeId)
    : null

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const empresa = empresas.find((e) => e.id === active.id)
    if (!empresa) return
    const nuevoEstado = over.id
    if (!PIPELINE_ORDER.includes(nuevoEstado)) return
    if (nuevoEstado === empresa.estado_relacion) return

    // Optimistic update
    const prevEmpresas = empresas
    setEmpresas((list) =>
      list.map((e) =>
        e.id === empresa.id ? { ...e, estado_relacion: nuevoEstado } : e,
      ),
    )

    const { error } = await supabase
      .from('companies')
      .update({ estado_relacion: nuevoEstado })
      .eq('id', empresa.id)

    if (error) {
      setEmpresas(prevEmpresas)
      showToast('No se pudo cambiar estado: ' + error.message)
    }
  }

  const header = (
    <>
      <header className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
          Pipeline
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          Estado del pipeline
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-widest text-ink/50 mt-2">
          {isMobile
            ? 'Tocá una empresa para cambiar su estado desde el detalle'
            : 'Arrastrá una empresa para cambiar su estado · también editable desde el detalle'}
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
    </>
  )

  const columnsScroll = (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
      <div className="flex gap-3 items-start min-w-max">
        {PIPELINE_ORDER.map((key) => (
          <Column
            key={key}
            estado={key}
            empresas={grouped[key] ?? []}
            draggable={!isMobile}
            activeId={activeId}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {header}

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-2 shadow-lg flex items-center gap-2">
            <AlertCircle size={14} />
            {toast}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
          cargando…
        </div>
      ) : isMobile ? (
        columnsScroll
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {columnsScroll}
          <DragOverlay>
            {activeEmpresa ? (
              <PipelineCard empresa={activeEmpresa} overlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

function Column({ estado, empresas, draggable, activeId }) {
  const { isOver, setNodeRef } = useDroppable({
    id: estado,
    disabled: !draggable,
  })

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
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-2 overflow-y-auto max-h-[70vh] pr-1 rounded transition-colors',
          isOver && 'bg-zinc-50 ring-1 ring-rust-300',
        )}
      >
        {empresas.length === 0 ? (
          <div className="text-center text-zinc-400 text-sm py-6">—</div>
        ) : (
          empresas.map((e) =>
            draggable ? (
              <DraggableCardWrapper
                key={e.id}
                empresa={e}
                hidden={activeId === e.id}
              />
            ) : (
              <PipelineCard key={e.id} empresa={e} />
            ),
          )
        )}
      </div>
    </div>
  )
}

function DraggableCardWrapper({ empresa, hidden }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: empresa.id,
  })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        (isDragging || hidden) && 'opacity-30',
      )}
      style={{ cursor: 'grab' }}
    >
      <PipelineCard empresa={empresa} />
    </div>
  )
}

function PipelineCard({ empresa, overlay = false }) {
  const body = (
    <div
      className={cn(
        'card p-3 animate-slide-up',
        overlay
          ? 'shadow-xl ring-2 ring-rust-400 rotate-1 cursor-grabbing w-[280px]'
          : 'hover:border-rust-300 transition-colors',
      )}
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
          <span className="inline-flex items-center gap-1 rounded bg-rust-50 text-rust-700 px-1.5 py-0.5 font-mono tabular-nums">
            <CheckSquare size={10} />
            {empresa.tasks_pendientes}
          </span>
        )}
      </div>
    </div>
  )

  if (overlay) return body

  return (
    <Link to={`/empresas/${empresa.id}`} className="block">
      {body}
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
