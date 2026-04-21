import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cn, fmtDate } from '../lib/utils'
import { Calendar, Plus, X } from 'lucide-react'

export default function Tareas() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendientes')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, companies(id, razon_social)')
      .order('completada')
      .order('due_date', { ascending: true, nullsFirst: false })
    setTareas(data ?? [])
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

  const filtradas = tareas.filter((t) => {
    if (filtro === 'pendientes') return !t.completada
    if (filtro === 'completadas') return t.completada
    return true
  })

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
          onSaved={() => {
            setShowForm(false)
            load()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="flex gap-1 mb-6 text-sm">
        {['pendientes', 'completadas', 'todas'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              'px-3 py-1.5 rounded text-xs capitalize transition-colors',
              filtro === f
                ? 'bg-ink text-paper'
                : 'text-ink/60 hover:bg-ink/5',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-ink/40">Cargando…</div>}

      {!loading && filtradas.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-ink/40 text-sm">
            {filtro === 'pendientes'
              ? 'No hay tareas pendientes. Podés crear una.'
              : 'Sin tareas aquí.'}
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
                    <Calendar size={10} /> {fmtDate(t.due_date)}
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

function NuevaTareaForm({ onSaved, onCancel }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [empresas, setEmpresas] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, razon_social')
      .order('razon_social')
      .then(({ data }) => setEmpresas(data ?? []))
  }, [])

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
