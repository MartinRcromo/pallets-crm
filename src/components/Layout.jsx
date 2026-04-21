import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, ListTodo, LogOut, User2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/empresas', label: 'Empresas', icon: Building2 },
  { to: '/tareas', label: 'Tareas', icon: ListTodo },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* ----- TOP BAR ----- */}
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded bg-ink flex items-center justify-center">
              <span className="font-serif text-rust-300 text-base leading-none font-bold">P</span>
            </div>
            <div className="leading-none">
              <div className="font-serif text-ink text-base tracking-tight">
                Pallets<span className="text-rust-500">·</span>CRM
              </div>
              <div className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.2em] text-ink/40 mt-0.5">
                Comercial · TYC Argentina
              </div>
            </div>
          </NavLink>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors',
                    isActive
                      ? 'bg-ink text-paper'
                      : 'text-ink/70 hover:text-ink hover:bg-ink/5',
                  )
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink/60">
              <User2 size={13} />
              <span className="truncate max-w-[140px]">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost !p-2"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ----- CONTENT ----- */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* ----- BOTTOM NAV (mobile) ----- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 h-14">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-rust-500' : 'text-ink/50',
                )
              }
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
