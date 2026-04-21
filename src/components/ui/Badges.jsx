import { cn } from '../../lib/utils'
import { labelOf, PRIORIDAD_COMERCIAL, CLASIFICACION_EMPRESA, ESTADO_RELACION, PRIORIDAD_CONTACTO, ESTADO_CONTACTO, SENIORITY } from '../../lib/constants'

// Prioridad comercial (empresa)
const prioEmpresaStyle = {
  critica: 'bg-rust-500 text-white',
  alta: 'bg-rust-100 text-rust-700 border border-rust-200',
  media: 'bg-amber-50 text-amber-800 border border-amber-200',
  baja: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
}

export function PrioridadBadge({ value, size = 'sm' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        prioEmpresaStyle[value] ?? 'bg-zinc-100 text-zinc-500',
      )}
    >
      {labelOf(PRIORIDAD_COMERCIAL, value)}
    </span>
  )
}

// Clasificación
const clasifStyle = {
  usuario_final: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  revendedor: 'bg-sky-50 text-sky-800 border border-sky-200',
  competidor: 'bg-red-50 text-red-800 border border-red-200',
  excluido: 'bg-zinc-100 text-zinc-500 border border-zinc-200 line-through',
  por_clasificar: 'bg-white border border-dashed border-zinc-300 text-zinc-500',
}

export function ClasifBadge({ value }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wide',
        clasifStyle[value] ?? 'bg-zinc-100 text-zinc-500',
      )}
    >
      {labelOf(CLASIFICACION_EMPRESA, value)}
    </span>
  )
}

// Estado relación empresa
const estadoStyle = {
  sin_contacto: 'bg-white border border-zinc-300 text-zinc-600',
  contactado: 'bg-blue-50 text-blue-800 border border-blue-200',
  conversando: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  propuesta_enviada: 'bg-violet-50 text-violet-800 border border-violet-200',
  negociando: 'bg-amber-50 text-amber-800 border border-amber-200',
  cliente: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
  perdido: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
  en_pausa: 'bg-zinc-50 text-zinc-600 border border-dashed border-zinc-300',
}

export function EstadoRelacionBadge({ value }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wide whitespace-nowrap',
        estadoStyle[value] ?? 'bg-zinc-100 text-zinc-500',
      )}
    >
      {labelOf(ESTADO_RELACION, value)}
    </span>
  )
}

// Estado contacto
const estadoContactoStyle = {
  por_contactar: 'bg-white border border-zinc-300 text-zinc-600',
  contactado: 'bg-blue-50 text-blue-800 border border-blue-200',
  respondio: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  reunion_agendada: 'bg-violet-50 text-violet-800 border border-violet-200',
  no_responde: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
  descartado: 'bg-red-50 text-red-700 border border-red-200',
}

export function EstadoContactoBadge({ value }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wide whitespace-nowrap',
        estadoContactoStyle[value] ?? 'bg-zinc-100 text-zinc-500',
      )}
    >
      {labelOf(ESTADO_CONTACTO, value)}
    </span>
  )
}

// Prioridad contacto
const prioContactoStyle = {
  alta: 'bg-ink text-paper',
  media_alta: 'bg-rust-100 text-rust-700 border border-rust-200',
  media: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
  baja: 'bg-white border border-zinc-200 text-zinc-500',
}

export function PrioContactoBadge({ value }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5',
        prioContactoStyle[value] ?? 'bg-zinc-100',
      )}
    >
      {labelOf(PRIORIDAD_CONTACTO, value)}
    </span>
  )
}

// Sector simple
export function SectorChip({ sector }) {
  if (!sector) return null
  return (
    <span className="inline-flex items-center rounded-full bg-ink/5 text-ink/75 text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider">
      {sector}
    </span>
  )
}

// Seniority
export function SeniorityChip({ value }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center rounded text-[10px] text-zinc-600 font-mono uppercase">
      {labelOf(SENIORITY, value)}
    </span>
  )
}

// Decisor star
export function DecisorPill() {
  return (
    <span
      title="Decisor clave"
      className="inline-flex items-center gap-1 rounded bg-rust-500/10 text-rust-700 text-[10px] font-semibold px-1.5 py-0.5 uppercase tracking-wide"
    >
      ★ Decisor
    </span>
  )
}
