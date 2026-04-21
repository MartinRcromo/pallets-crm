import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  TIPO_INTERACCION,
  DIRECCION_INTERACCION,
  SENTIMENT,
} from '../lib/constants'
import { X, Save } from 'lucide-react'

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

  const submit = async (e) => {
    e.preventDefault()
    if (!resumen.trim()) {
      setErr('El resumen es obligatorio.')
      return
    }
    setSaving(true)
    setErr(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('interactions').insert({
      company_id: companyId,
      contact_id: contactId ?? null,
      tipo,
      direccion,
      resumen: resumen.trim(),
      sentiment,
      proximo_paso: proximoPaso.trim() || null,
      fecha: new Date(fecha).toISOString(),
      realizada_por: user?.id ?? null,
    })

    setSaving(false)
    if (error) return setErr(error.message)
    onSaved?.()
  }

  return (
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
