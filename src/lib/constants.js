// Espejo de los ENUMs de Postgres + labels en español para UI.
// ⚠️ Los VALUES deben matchear EXACTAMENTE los enums de Supabase.
// Si cambiás un value acá sin cambiarlo en Postgres (o viceversa), los UPDATE van a fallar.

export const PRIORIDAD_COMERCIAL = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

export const CLASIFICACION_EMPRESA = [
  { value: 'usuario_final', label: 'Usuario final' },
  { value: 'revendedor', label: 'Revendedor' },
  { value: 'competidor', label: 'Competidor' },
  { value: 'excluido', label: 'Excluido' },
  { value: 'por_clasificar', label: 'Por clasificar' },
]

// ⚠️ VALUES REALES del enum estado_relacion en Postgres
export const ESTADO_RELACION = [
  { value: 'sin_contactar', label: 'Sin contactar' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'negociando', label: 'Negociando' },
  { value: 'cotizacion_enviada', label: 'Cotización enviada' },
  { value: 'cerrado_ganado', label: 'Cliente' },
  { value: 'cerrado_perdido', label: 'Perdido' },
  { value: 'en_pausa', label: 'En pausa' },
]

export const PRIORIDAD_CONTACTO = [
  { value: 'alta', label: 'Alta' },
  { value: 'media_alta', label: 'Media-alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

// ⚠️ VALUES REALES del enum estado_contacto en Postgres
export const ESTADO_CONTACTO = [
  { value: 'por_contactar', label: 'Por contactar' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'respondio', label: 'Respondió' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'no_interesa', label: 'No interesa' },
  { value: 'bounce', label: 'Bounce (email rebotó)' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'sin_datos', label: 'Sin datos' },
]

export const SENIORITY = [
  { value: 'director', label: 'Director' },
  { value: 'head', label: 'Head' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'manager', label: 'Manager' },
  { value: 'jefe', label: 'Jefe' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'responsable', label: 'Responsable' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'senior', label: 'Senior' },
  { value: 'analista', label: 'Analista' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'otro', label: 'Otro' },
]

export const TIPO_INTERACCION = [
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'reunion_presencial', label: 'Reunión presencial' },
  { value: 'reunion_virtual', label: 'Reunión virtual' },
  { value: 'linkedin_mensaje', label: 'LinkedIn — mensaje' },
  { value: 'linkedin_conexion', label: 'LinkedIn — conexión' },
  { value: 'visita_planta', label: 'Visita a planta' },
  { value: 'otro', label: 'Otro' },
]

export const DIRECCION_INTERACCION = [
  { value: 'saliente', label: 'Saliente' },
  { value: 'entrante', label: 'Entrante' },
]

// ⚠️ VALUES REALES del enum sentiment_interaccion en Postgres
export const SENTIMENT = [
  { value: 'muy_positivo', label: 'Muy positivo' },
  { value: 'positivo', label: 'Positivo' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negativo', label: 'Negativo' },
  { value: 'no_respondio', label: 'No respondió' },
]

export const PRIORIDAD_TASK = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

// Helpers de lookup
export const labelOf = (list, value) =>
  list.find((x) => x.value === value)?.label ?? value
