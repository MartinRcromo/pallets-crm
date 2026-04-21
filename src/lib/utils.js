import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

// Formateo de moneda USD
export const fmtUSD = (n) => {
  if (n == null) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export const fmtNumber = (n) => {
  if (n == null) return '—'
  return new Intl.NumberFormat('es-AR').format(n)
}

export const fmtDate = (d, fmtStr = "d 'de' MMM yyyy") => {
  if (!d) return '—'
  try {
    return format(new Date(d), fmtStr, { locale: es })
  } catch {
    return d
  }
}

// Parsea una fecha sin hora (columna Postgres `date`) en timezone LOCAL.
// Supabase devuelve 'YYYY-MM-DD'; `new Date(string)` lo lee como UTC,
// lo que genera drift de un día al renderizar en AR (UTC-3).
export function parseDateOnly(dateString) {
  if (!dateString) return null
  const [datePart] = String(dateString).split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  try {
    return format(new Date(d), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return d
  }
}

export const timeAgo = (d) => {
  if (!d) return null
  try {
    return formatDistanceToNow(new Date(d), { locale: es, addSuffix: true })
  } catch {
    return null
  }
}

// Normaliza teléfono para wa.me (solo dígitos, default +54)
export const toWhatsappNumber = (tel) => {
  if (!tel) return null
  let digits = String(tel).replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) digits = '54' + digits // AR sin prefijo
  if (digits.startsWith('0')) digits = '54' + digits.slice(1)
  return digits
}

// URL LinkedIn normalizada
export const normalizeLinkedIn = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  if (url.startsWith('linkedin.com')) return 'https://' + url
  if (url.startsWith('www.linkedin.com')) return 'https://' + url
  return url
}

// Clases utilitarias para combinar con condiciones
export const cn = (...xs) => xs.filter(Boolean).join(' ')
