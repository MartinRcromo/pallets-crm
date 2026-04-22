import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  TIPO_INTERACCION,
  DIRECCION_INTERACCION,
  SENTIMENT,
} from '../lib/constants'
import { X, Save, Calendar, ClipboardList, Check } from 'lucide-react'
import TemplatePickerModal from './TemplatePickerModal'

const todayPlus = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function InteraccionForm({
  companyId,
  contactId,
  onSaved,
  onCancel,
}) {
  const [tipo, setTipo] = useState('email')
  const [direccion, setDireccion] = useState('saliente')
  const [resumen, setResumen] = useState('')
  const [sentiment, setSentiment] = useState('neutral')
  const [proximoPaso, setProximoPaso] = useState('')
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 16),
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  // Task creation
  const [crearTarea, setCrearTarea] = useState(false)
  const [taskDueDate, setTaskDueDate] = useState(() => todayPlus(7))
  const [taskContactId, setTaskContactId] = useState(contactId ?? '')
  const [contactosEmpresa, setContactosEmpresa] = useState(null)
  const [loadingContactos, setLoadingContactos] = useState(false)

  // Template picker
  const [showPicker, setShowPicker] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const handleTemplatePicked = async (template) => {
    const payload = template.asunto
      ? `Asunto: ${template.asunto}\n\n${template.cuerpo}`
      : template.cuerpo
    try {
      await navigator.clipboard.writeText(payload)
      showToast(
        'Plantilla copiada. Reemplazá las variables y pegá en LinkedIn/email.',
      )
    } catch {
      showToast(
        'No se pudo copiar automáticamente. Copialo a mano desde la biblioteca.',
      )
    }
    setShowPicker(false)
  }

  const puedeCrearTarea = proximoPaso.trim().length > 0

  // Lazy-load contactos para el select (solo cuando aparece el bloque y no vino contactId fijo)
  useEffect(() => {
    if (!puedeCrearTarea) return
    if (contactId) return
    if (contactosEmpresa !== null) return
    if (!companyId) return
    setLoadingContactos(true)
    supabase
      .from('contacts')
      .select('id, nombre_completo')
      .eq('company_id', companyId)
      .order('es_decisor', { ascending: false })
      .order('prioridad')
      .then(({ data }) => {
        setContactosEmpresa(data ?? [])
        setLoadingContactos(false)
      })
  }, [puedeCrearTarea, contactId, companyId, contactosEmpresa])

  const submit = async (e) => {
    e.preventDefault()
    if (!resumen.trim()) {
      setErr('El resumen es obligatorio.')
      return
    }
    setSaving(true)
    setErr(null)

    const { data: { user } } = await supabase.auth.getUser()
    const resumenLimpio = resumen.trim()
    const proximoPasoLimpio = proximoPaso.trim() || null

    const { error: interErr } = await supabase.from('interactions').insert({
      company_id: companyId,
      contact_id: contactId ?? null,
      tipo,
      direccion,
      resumen: resumenLimpio,
      sentiment,
      proximo_paso: proximoPasoLimpio,
      fecha: new Date(fecha).toISOString(),
      realizada_por: user?.id ?? null,
    })

    if (interErr) {
      setSaving(false)
      setErr(interErr.message)
      return
    }

    // Crear tarea opcional
    if (crearTarea && proximoPasoLimpio) {
      // Mediodía local para evitar que timestamptz cruce el día en AR/BR/CL
      const dueDateISO = new Date(taskDueDate + 'T12:00:00').toISOString()
      const taskContact = taskContactId || contactId || null

      const { error: taskErr } = await supabase.from('tasks').insert({
        company_id: companyId,
        contact_id: taskContact,
        titulo: proximoPasoLimpio,
        descripcion: resumenLimpio.slice(0, 200),
        due_date: dueDateISO,
        asignada_a: user?.id ?? null,
        created_by: user?.id ?? null,
      })

      setSaving(false)
      if (taskErr) {
        setErr(
          `Interacción guardada, pero no se pudo crear la tarea: ${taskErr.message}`,
        )
        return
      }
      onSaved?.()
      return
    }

    setSaving(false)
    onSaved?.()
  }

  return (
    <>
    <form
      onSubmit={submit}
      className="card p-5 space-y-4 animate-slide-up border-rust-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-ink">Nueva interacción</h3>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost !p-1.5"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Tipo">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
            {TIPO_INTERACCION.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Dirección">
          <select value={direccion} onChange={(e) => setDireccion(e.target.value)} className="input">
            {DIRECCION_INTERACCION.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Fecha y hora">
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input"
        />
      </Field>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="btn-secondary !text-xs !py-1.5"
        >
          <ClipboardList size={13} />
          Usar plantilla
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
          copia mensaje al portapapeles
        </span>
      </div>

      <Field label="Resumen *">
        <textarea
          rows={3}
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          className="input resize-none"
          placeholder="¿De qué hablaron? Claves, objeciones, preguntas…"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Sentiment">
          <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="input">
            {SENTIMENT.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Próximo paso">
          <input
            type="text"
            value={proximoPaso}
            onChange={(e) => setProximoPaso(e.target.value)}
            className="input"
            placeholder="Ej. enviar cotización PP"
          />
        </Field>
      </div>

      {puedeCrearTarea && (
        <div className="rounded border border-rust-200 bg-rust-50/40 p-3 space-y-3 animate-fade-in">
          <label className="flex items-center gap-2 text-sm text-ink/90 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={crearTarea}
              onChange={(e) => setCrearTarea(e.target.checked)}
              className="accent-rust-500"
            />
            <Calendar size={14} className="text-rust-600" />
            Crear tarea para este próximo paso
          </label>

          {crearTarea && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Fecha límite">
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="input"
                  min={todayPlus(0)}
                />
              </Field>
              {!contactId && (
                <Field label="Contacto (opcional)">
                  <select
                    value={taskContactId}
                    onChange={(e) => setTaskContactId(e.target.value)}
                    className="input"
                    disabled={loadingContactos}
                  >
                    <option value="">— Sin contacto —</option>
                    {(contactosEmpresa ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre_completo}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}
        </div>
      )}

      {err && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
          {err}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn-rust">
          <Save size={14} />
          {saving ? 'Guardando…' : 'Guardar interacción'}
        </button>
      </div>
    </form>

    {showPicker && (
      <TemplatePickerModal
        tipo={tipo}
        onPicked={handleTemplatePicked}
        onClose={() => setShowPicker(false)}
      />
    )}

    {toast && (
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm px-4 py-2 shadow-lg flex items-center gap-2 max-w-md">
          <Check size={14} />
          {toast}
        </div>
      </div>
    )}
    </>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/70 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
