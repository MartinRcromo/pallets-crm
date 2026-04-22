import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cn, fmtDate, parseDateOnly } from '../lib/utils'
import { labelOf, PRIORIDAD_TASK } from '../lib/constants'
import { Calendar, Plus, X, ChevronDown, Search } from 'lucide-react'

const VENCIMIENTO_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'vencidas', label: 'Vencidas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'esta-semana', label: 'Esta semana' },
  { value: 'proximo-mes', label: 'Próximo mes' },
]

const PRIORIDAD_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  ...PRIORIDAD_TASK,
]

export default function Tareas() {
  const [params, setParams] = useSearchParams()
  const [tareas, setTareas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const vencimiento = params.get('vencimiento') || 'todas'
  const prioridad = params.get('prioridad') || 'todas'
  const empresa = params.get('empresa') || null
  const completadas = params.get('completadas') === 'true'

  const patchParams = (patch) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '' || v === 'todas' || v === false) {
        next.delete(k)
      } else {
        next.set(k, String(v))
      }
    }
    setParams(next, { replace: true })
  }

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const [tk, emp] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, companies(id, razon_social)')
        .order('completada')
        .order('due_date', { ascending: true, nullsFirst: false }),
      supabase
        .from('companies')
        .select('id, razon_social')
        .order('razon_social'),
    ])
    setTareas(tk.data ?? [])
    setEmpresas(emp.data ?? [])
    setLoading(false)
  }

  const toggle = async (t) => {
    await supabase
      .from('tasks')
      .update({
        completada: !t.completada,
        completada_at: !t.completada ? new Date().toISOString() : null,
      })
      .eq('id', t.id)
    load()
  }

  const empresaSeleccionada = useMemo(
    () => empresas.find((e) => e.id === empresa) ?? null,
    [empresas, empresa],
  )

  const filtradas = useMemo(
    () =>
      tareas.filter((t) => applyFilters(t, {
        vencimiento,
        prioridad,
        empresa,
        completadas,
      })),
    [tareas, vencimiento, prioridad, empresa, completadas],
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-1">
            Pipeline de acción
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
            Tareas
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-rust">
          <Plus size={14} /> Nueva tarea
        </button>
      </div>

      {showForm && (
        <NuevaTareaForm
          empresas={empresas}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filtros */}
      <div className="space-y-3 mb-6">
        <FilterRow label="Vencimiento">
          {VENCIMIENTO_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              active={vencimiento === opt.value}
              onClick={() => patchParams({ vencimiento: opt.value })}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="Prioridad">
          {PRIORIDAD_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              active={prioridad === opt.value}
              onClick={() => patchParams({ prioridad: opt.value })}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="Empresa">
          <EmpresaCombobox
            empresas={empresas}
            selected={empresaSeleccionada}
            onChange={(id) => patchParams({ empresa: id })}
          />
          <label className="inline-flex items-center gap-2 ml-2 text-sm text-ink/80 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={completadas}
              onChange={(e) => patchParams({ completadas: e.target.checked })}
              className="accent-rust-500"
            />
            Incluir completadas
          </label>
        </FilterRow>
      </div>

      {loading && (
        <div className="text-center py-10 text-ink/40 font-mono text-xs uppercase tracking-widest">
          cargando…
        </div>
      )}

      {!loading && filtradas.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-ink/40 text-sm">
            {tareas.length === 0
              ? 'No hay tareas cargadas todavía.'
              : 'Sin tareas con estos filtros.'}
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {filtradas.map((t) => (
          <li key={t.id} className="card p-3 flex items-start gap-3 animate-slide-up">
            <button
              onClick={() => toggle(t)}
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
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-ink/50">
                {t.due_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={10} />{' '}
                    {fmtDate(parseDateOnly(t.due_date))}
                  </span>
                )}
                {t.prioridad && (
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink/60">
                    {labelOf(PRIORIDAD_TASK, t.prioridad)}
                  </span>
                )}
                {t.companies && (
                  <Link
                    to={`/empresas/${t.companies.id}`}
                    className="hover:text-rust-600"
                  >
                    → {t.companies.razon_social}
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function applyFilters(t, { vencimiento, prioridad, empresa, completadas }) {
  // Completadas toggle: si OFF, excluye completadas (salvo que vencimiento aplique)
  if (!completadas && t.completada) return false

  // Prioridad
  if (prioridad !== 'todas' && t.prioridad !== prioridad) return false

  // Empresa
  if (empresa && t.company_id !== empresa) return false

  // Vencimiento
  if (vencimiento === 'todas') return true
  const due = parseDateOnly(t.due_date)
  if (!due) return false
  const today = startOfToday()
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))

  if (vencimiento === 'vencidas') {
    return !t.completada && diffDays < 0
  }
  if (vencimiento === 'hoy') return diffDays === 0
  if (vencimiento === 'esta-semana') return diffDays >= 0 && diffDays <= 7
  if (vencimiento === 'proximo-mes') return diffDays >= 0 && diffDays <= 30
  return true
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40 w-24 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1 flex-1">{children}</div>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded text-[11px] font-medium border transition-colors',
        active
          ? 'bg-rust-50 text-rust-700 border-rust-200'
          : 'bg-zinc-50 text-zinc-700 border-transparent hover:bg-zinc-100',
      )}
    >
      {children}
    </button>
  )
}

function EmpresaCombobox({ empresas, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filtered = useMemo(() => {
    const qLow = q.trim().toLowerCase()
    if (!qLow) return empresas
    return empresas.filter((e) =>
      e.razon_social.toLowerCase().includes(qLow),
    )
  }, [empresas, q])

  if (selected) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border',
          'bg-rust-50 text-rust-700 border-rust-200',
        )}
      >
        <span className="truncate max-w-[200px]">{selected.razon_social}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="hover:text-rust-900"
          aria-label="Quitar filtro de empresa"
        >
          <X size={12} />
        </button>
      </span>
    )
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors',
          'bg-zinc-50 text-zinc-700 border-transparent hover:bg-zinc-100',
        )}
      >
        Empresa
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-64 card p-1 shadow-lg animate-fade-in">
          <div className="relative mb-1">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar empresa…"
              autoFocus
              className="input !py-1.5 !pl-7 !text-xs"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="text-center py-3 text-xs text-ink/40">
                Sin resultados
              </li>
            ) : (
              filtered.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(e.id)
                      setOpen(false)
                      setQ('')
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-ink/5 truncate"
                  >
                    {e.razon_social}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function NuevaTareaForm({ empresas, onSaved, onCancel }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tasks').insert({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      due_date: dueDate || null,
      company_id: companyId || null,
      asignada_a: user?.id ?? null,
      created_by: user?.id ?? null,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3 mb-6 animate-slide-up border-rust-200">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg">Nueva tarea</h3>
        <button type="button" onClick={onCancel} className="btn-ghost !p-1.5">
          <X size={14} />
        </button>
      </div>
      <input
        required
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="input"
        placeholder="Título de la tarea"
      />
      <textarea
        rows={2}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="input resize-none"
        placeholder="Descripción opcional"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input"
        />
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="input"
        >
          <option value="">— Empresa (opcional) —</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.razon_social}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button disabled={saving} type="submit" className="btn-rust">
          {saving ? 'Guardando…' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
