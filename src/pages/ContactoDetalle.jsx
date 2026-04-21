import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  DecisorPill,
  PrioContactoBadge,
  EstadoContactoBadge,
  SectorChip,
  SeniorityChip,
} from '../components/ui/Badges'
import InlineBadgeSelect from '../components/ui/InlineBadgeSelect'
import InteraccionForm from '../components/InteraccionForm'
import { cn, fmtDateTime, normalizeLinkedIn, toWhatsappNumber } from '../lib/utils'
import {
  labelOf,
  TIPO_INTERACCION,
  PRIORIDAD_CONTACTO,
  ESTADO_CONTACTO,
} from '../lib/constants'
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Linkedin,
  Phone,
  Plus,
  MapPin,
} from 'lucide-react'

export default function ContactoDetalle() {
  const { id } = useParams()
  const [contacto, setContacto] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [interacciones, setInteracciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const load = async () => {
    setLoading(true)
    const { data: c } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()
    if (c?.company_id) {
      const [{ data: emp }, { data: inter }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', c.company_id).single(),
        supabase
          .from('interactions')
          .select('*')
          .eq('contact_id', id)
          .order('fecha', { ascending: false }),
      ])
      setEmpresa(emp)
      setInteracciones(inter ?? [])
    }
    setContacto(c)
    setLoading(false)
  }

  const updateContacto = async (patch) => {
    const { error } = await supabase
      .from('contacts')
      .update(patch)
      .eq('id', id)
    if (error) throw error
    setContacto((prev) => ({ ...prev, ...patch }))
  }

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-ink/40">
        Cargando…
      </div>
    )
  if (!contacto)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        Contacto no encontrado. <Link to="/empresas" className="underline">Volver</Link>
      </div>
    )

  const wa = toWhatsappNumber(contacto.whatsapp || contacto.telefono)
  const li = normalizeLinkedIn(contacto.linkedin_url)

  // Mensaje plantilla WhatsApp
  const waMsg = encodeURIComponent(
    `Hola ${contacto.nombre}, te escribo desde TYC Argentina. Estamos desarrollando una línea de pallets plásticos y me gustaría conocer las necesidades de ${
      empresa?.razon_social ?? 'tu empresa'
    }. ¿Tenés unos minutos?`,
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {empresa && (
        <Link
          to={`/empresas/${empresa.id}`}
          className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink mb-4"
        >
          <ArrowLeft size={13} /> {empresa.razon_social}
        </Link>
      )}

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {contacto.es_decisor && <DecisorPill />}
          <InlineBadgeSelect
            value={contacto.prioridad}
            options={PRIORIDAD_CONTACTO}
            onChange={(v) => updateContacto({ prioridad: v })}
            renderBadge={(v) => <PrioContactoBadge value={v} />}
            title="Cambiar prioridad"
          />
          <InlineBadgeSelect
            value={contacto.estado}
            options={ESTADO_CONTACTO}
            onChange={(v) => updateContacto({ estado: v })}
            renderBadge={(v) => <EstadoContactoBadge value={v} />}
            title="Cambiar estado"
          />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
          {contacto.nombre_completo}
        </h1>
        <div className="text-sm text-ink/70 mt-1">{contacto.cargo}</div>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink/50">
          {contacto.area && <SectorChip sector={contacto.area} />}
          <SeniorityChip value={contacto.seniority} />
          {contacto.ubicacion && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {contacto.ubicacion}
            </span>
          )}
        </div>
      </header>

      {/* ACCIONES RÁPIDAS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {wa ? (
          <a
            href={`https://wa.me/${wa}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            className="action-btn bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div className="action-btn bg-zinc-100 text-zinc-400 cursor-not-allowed">
            <MessageCircle size={16} />
            <span>WhatsApp</span>
            <span className="text-[10px] text-zinc-400 font-normal">sin nº</span>
          </div>
        )}

        {contacto.email ? (
          <a
            href={`mailto:${contacto.email}`}
            className="action-btn bg-ink text-paper hover:bg-ink/90"
          >
            <Mail size={16} />
            <span>Email</span>
          </a>
        ) : (
          <div className="action-btn bg-zinc-100 text-zinc-400 cursor-not-allowed">
            <Mail size={16} />
            <span>Email</span>
            <span className="text-[10px]">no cargado</span>
          </div>
        )}

        {li ? (
          <a
            href={li}
            target="_blank"
            rel="noreferrer"
            className="action-btn bg-[#0A66C2] text-white hover:bg-[#0958A6]"
          >
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </a>
        ) : (
          <div className="action-btn bg-zinc-100 text-zinc-400 cursor-not-allowed">
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </div>
        )}

        {contacto.telefono ? (
          <a href={`tel:${contacto.telefono}`} className="action-btn bg-white border border-ink/20 text-ink hover:bg-ink/5">
            <Phone size={16} />
            <span>Llamar</span>
          </a>
        ) : (
          <div className="action-btn bg-zinc-100 text-zinc-400 cursor-not-allowed">
            <Phone size={16} />
            <span>Llamar</span>
          </div>
        )}
      </section>

      {/* INFO DETALLE */}
      <section className="grid sm:grid-cols-2 gap-3 mb-8">
        <InfoRow label="Email" value={contacto.email} />
        <InfoRow label="Teléfono" value={contacto.telefono} />
        <InfoRow label="WhatsApp" value={contacto.whatsapp} />
        <InfoRow
          label="LinkedIn"
          value={li}
          link={li}
        />
      </section>

      {/* NOTAS */}
      {contacto.notas && (
        <section className="card p-4 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">
            Notas
          </div>
          <div className="text-sm text-ink/90 whitespace-pre-wrap">
            {contacto.notas}
          </div>
        </section>
      )}

      {/* INTERACCIONES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl text-ink">Interacciones con este contacto</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-rust !text-xs !py-1.5"
            >
              <Plus size={13} /> Nueva
            </button>
          )}
        </div>

        {showForm && empresa && (
          <div className="mb-4">
            <InteraccionForm
              companyId={empresa.id}
              contactId={contacto.id}
              onSaved={() => {
                setShowForm(false)
                load()
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {interacciones.length === 0 && !showForm ? (
          <div className="card p-6 text-center text-sm text-ink/50">
            Sin interacciones todavía. Registrá la primera ↑
          </div>
        ) : (
          <ol className="space-y-3">
            {interacciones.map((i) => (
              <li key={i.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rust-600">
                    {labelOf(TIPO_INTERACCION, i.tipo)}
                  </span>
                  <time className="text-[11px] text-ink/40 font-mono">
                    {fmtDateTime(i.fecha)}
                  </time>
                </div>
                <p className="text-sm text-ink/90 whitespace-pre-wrap">{i.resumen}</p>
                {i.proximo_paso && (
                  <div className="mt-2 text-xs text-ink/70 border-t border-ink/5 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40">
                      Próximo paso
                    </span>{' '}
                    {i.proximo_paso}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <style>{`
        .action-btn {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          gap: 0.25rem;
          transition: background-color 120ms;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}

function InfoRow({ label, value, link }) {
  return (
    <div className="card p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-0.5">
        {label}
      </div>
      {value ? (
        link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink hover:text-rust-600 break-all"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm text-ink break-all">{value}</div>
        )
      ) : (
        <div className="text-sm text-ink/30">—</div>
      )}
    </div>
  )
}
