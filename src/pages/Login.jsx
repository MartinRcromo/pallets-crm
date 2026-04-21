import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) return setErr(error.message)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-2">
      {/* Panel decorativo */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage:
                 'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)',
             }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-rust-500 flex items-center justify-center">
              <span className="font-serif text-paper text-lg font-bold">P</span>
            </div>
            <div>
              <div className="font-serif text-xl">Pallets·CRM</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-paper/50 mt-0.5">
                Comercial TYC Argentina
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight">
            Inteligencia comercial<br />
            para la <em className="text-rust-300 not-italic">línea<br />de pallets</em>
          </h1>
          <p className="text-paper/60 max-w-md text-sm leading-relaxed">
            255 contactos, 48 empresas relevadas, dossiers estratégicos.
            Desde un lugar limpio, para operar rápido.
          </p>
          <div className="flex items-center gap-6 pt-4 border-t border-paper/10 text-[10px] font-mono uppercase tracking-widest text-paper/40">
            <span>v0.1</span>
            <span>·</span>
            <span>Supabase</span>
            <span>·</span>
            <span>React</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink/40 mb-2">
              Acceso
            </div>
            <h2 className="font-serif text-3xl text-ink tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-sm text-ink/60 mt-1.5">
              Ingresá con tu email y contraseña.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-ink/70 mb-1 inline-flex items-center gap-1">
                <Mail size={12} /> Email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="martin@cromosol.com.ar"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink/70 mb-1 inline-flex items-center gap-1">
                <Lock size={12} /> Contraseña
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </label>
          </div>

          {err && (
            <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full group"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
            {!loading && (
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            )}
          </button>

          <p className="text-xs text-ink/40 leading-relaxed">
            ¿Primera vez? Creá el usuario desde Supabase Studio →{' '}
            <span className="font-mono">Authentication → Users → Add user</span>
            {' '}con tu email y password.
          </p>
        </form>
      </div>
    </div>
  )
}
