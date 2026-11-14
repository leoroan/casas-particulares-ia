import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks.js';

export default function LoginForm({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, loading, error } = useLogin();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await run({ email, password });
    if (ok) navigate('/');
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="card-title mb-3 text-center">Iniciar sesi&oacute;n</h2>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">{error}</div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-control" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@casasparticulares.local"
            />
            {typeof window !== 'undefined' && !localStorage.getItem('VITE_SUPABASE_URL') && (
              <div className="form-text text-info">
                Modo demo: us&aacute; cualquier email y contraseña (demo/demo).
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password" className="form-control" required
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-cp w-100 mb-3" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center text-muted small">
          &iacute;No ten&eacute;s cuenta?{' '}
          <button type="button" className="btn btn-link text-primary p-0" onClick={onRegister}>
            Registrarte
          </button>
        </div>
      </div>
    </div>
  );
}