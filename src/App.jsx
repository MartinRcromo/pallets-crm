import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import EmpresaDetalle from './pages/EmpresaDetalle'
import ContactoDetalle from './pages/ContactoDetalle'
import Tareas from './pages/Tareas'
import LeadsFrios from './pages/LeadsFrios'
import Pipeline from './pages/Pipeline'
import Templates from './pages/Templates'
import Reporting from './pages/Reporting'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/empresas/:id" element={<EmpresaDetalle />} />
          <Route path="/contactos/:id" element={<ContactoDetalle />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/leads-frios" element={<LeadsFrios />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/reporting" element={<Reporting />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
