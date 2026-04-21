import { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  SENIORITY,
  PRIORIDAD_CONTACTO,
  ESTADO_CONTACTO,
} from '../lib/constants'

const INITIAL = {
  nombre: '',
  apellido: '',
  cargo: '',
  area: '',
  seniority: '',
  es_decisor: false,
  prioridad: 'media',
  estado: 'por_contactar',
  linkedin_url: '',
  email: '',
  telefono: '',
  whatsapp: '',
  ubicacion: '',
  notas: '',
}

export default function NewContactModal({ companyId, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, saving])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setErr('El nombre es obligatorio.')
      return
    }
    setSaving(true)
    setErr(null)

    const payload = {
      company_id: companyId,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      cargo: form.cargo.trim() || null,
      area: form.area.trim() || null,
      seniority: form.seniority || null,
      es_decisor: !!form.es_decisor,
      prioridad: form.prioridad,
      estado: form.estado,
      linkedin_url: form.linkedin_url.trim() || null,
      email: form.email.trim() || null,
      telefono: form.telefono.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      ubicacion: form.ubicacion.trim() || null,
      notas: form.notas.trim() || null,
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert(payload)
      .select()
      .single()

    setSaving(false)
    if (error) {
      setErr(error.message)
      return
    }
    onCreated?.(data)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-ink/50 sm:p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose()
      }}
    >
      <div className="bg-paper w-full sm:max-w-lg sm:rounded-lg shadow-xl flex flex-col max-h-screen sm:max-h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 shrink-0">
          <h2 className="font-serif text-xl text-ink">Nuevo contacto</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-ghost !p-1.5"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre *">
              <input
                autoFocus
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                className="input"
                required
              />
            </Field>
            <Field label="Apellido">
              <input
                value={form.apellido}
                onChange={(e) => set('apellido', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Cargo">
            <input
              value={form.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              className="input"
              placeholder="Ej. Gerente de Logística"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Área">
              <input
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                className="input"
                placeholder="Ej. Compras, Operaciones…"
              />
            </Field>
            <Field label="Seniority">
              <select
                value={form.seniority}
                onChange={(e) => set('seniority', e.target.value)}
                className="input"
              >
                <option value="">—</option>
                {SENIORITY.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/80 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={form.es_decisor}
              onChange={(e) => set('es_decisor', e.target.checked)}
              className="accent-rust-500"
            />
            Es decisor clave
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Prioridad">
              <select
                value={form.prioridad}
                onChange={(e) => set('prioridad', e.target.value)}
                className="input"
              >
                {PRIORIDAD_CONTACTO.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select
                value={form.estado}
                onChange={(e) => set('estado', e.target.value)}
                className="input"
              >
                {ESTADO_CONTACTO.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="LinkedIn">
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) => set('linkedin_url', e.target.value)}
              className="input"
              placeholder="https://linkedin.com/in/…"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => set('telefono', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="WhatsApp">
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Ubicación">
              <input
                value={form.ubicacion}
                onChange={(e) => set('ubicacion', e.target.value)}
                className="input"
                placeholder="Ciudad, provincia"
              />
            </Field>
          </div>

          <Field label="Notas">
            <textarea
              rows={3}
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
              className="input resize-none"
            />
          </Field>

          {err && (
            <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
              {err}
            </div>
          )}
        </form>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-ink/10 shrink-0 bg-paper">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="btn-rust"
          >
            <Save size={14} />
            {saving ? 'Guardando…' : 'Crear contacto'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/70 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  )
}
