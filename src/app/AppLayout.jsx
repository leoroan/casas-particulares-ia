import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './providers.jsx';
import { isDemoMode } from '../lib/storageAdapter.js';
import { dateES } from '../lib/format.js';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/empleados', label: 'Empleadas' },
  { to: '/casas', label: 'Casas' },
  { to: '/liquidar', label: 'Liquidar mes' },
  { to: '/historial', label: 'Historial' },
  { to: '/escalas', label: 'Escalas' },
  { to: '/cuotas', label: 'Cuotas' },
  { to: '/feriados', label: 'Feriados' },
  { to: '/licencias', label: 'Licencias' },
  { to: '/ajustes', label: 'Ajustes' }
];

export default function AppLayout() {
  const { user, signOut, isDemoMode: demo } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            {APP_NAME}
          </Link>
          <button className="navbar-toggler" onClick={() => setOpen(!open)} aria-label="Menu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {NAV.map((n) => (
                <li key={n.to} className="nav-item">
                  <Link to={n.to} className="nav-link" onClick={() => setOpen(false)}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center">
              {demo && (
                <span className="badge bg-info text-dark me-2 small">Modo demo - localStorage</span>
              )}
              {user ? (
                <>
                  <span className="nav-link text-muted me-2">{user.nombre || user.email}</span>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => signOut().then(() => navigate('/login'))}>
                    Cerrar sesión
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {demo && (
        <div className="alert alert-warning border-warning text-warning-emphasis bg-warning-light container-sm">
          <strong>Modo demo activo:</strong> no hay VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY configuradas.
          Los datos se guardan en localStorage del navegador. Incluye datos de ejemplo de Tatiana, Jesica y Graciela.
          Para usar Supabase, creá un proyecto, pegá las variables en <code>.env</code> y subilos como Secrets de GitHub.
        </div>
      )}

      <main className="container py-3 flex-grow-1">
        <Outlet />
      </main>

      <footer className="border-top mt-auto py-4">
        <div className="container small muted">
          {APP_NAME} - Liquidación de personal de casas particulares (Ley 26.844, Argentina).{' '}
          <strong className="text-danger">Aviso legal:</strong> Valores de referencia. Verificar escalas y cuotas vigentes en ARCA
          y la Comisión Nacional de Trabajo en Casas Particulares.
        </div>
      </footer>
    </div>
  );
}

const APP_NAME = 'Casas Particulares IA';