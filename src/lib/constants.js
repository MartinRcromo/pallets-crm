// Espejo de los ENUMs de Postgres + labels en español para UI

export const PRIORIDAD_COMERCIAL = [
  { value: 'critica', label: 'Crítica', order: 4 },
  { value: 'alta', label: 'Alta', order: 3 },
  { value: 'media', label: 'Media', order: 2 },
  { value: 'baja', label: 'Baja', order: 1 },
]

export const CLASIFICACION_EMPRESA = [
  { value: 'usuario_final', label: 'Usuario final' },
  { value: 'revendedor', label: 'Revendedor' },
  { value: 'competidor', label: 'Competidor' },
  { value: 'excluido', label: 'Excluido' },
  { value: 'por_clasificar', label: 'Por clasificar' },
]

export const ESTADO_RELACION = [
  { value: 'sin_contacto', label: 'Sin contacto' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'conversando', label: 'Conversando' },
  { value: 'propuesta_enviada', label: 'Propuesta enviada' },
  { value: 'negociando', label: 'Negociando' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'en_pausa', label: 'En pausa' },
]

export const PRIORIDAD_CONTACTO = [
  { value: 'alta', label: 'Alta' },
  { value: 'media_alta', label: 'Media-alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

export const ESTADO_CONTACTO = [
  { value: 'por_contactar', label: 'Por contactar' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'respondio', label: 'Respondió' },
  { value: 'reunion_agendada', label: 'Reunión agendada' },
  { value: 'no_responde', label: 'No responde' },
  { value: 'descartado', label: 'Descartado' },
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

export const SENTIMENT = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negativo', label: 'Negativo' },
  { value: 'no_aplica', label: 'N/A' },
]

export const PRIORIDAD_TASK = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

// Helpers de lookup
export const labelOf = (list, value) =>
  list.find((x) => x.value === value)?.label ?? value
