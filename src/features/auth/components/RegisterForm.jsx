import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks.js';

export default function RegisterForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, loading, error, needsConfirmation } = useRegister();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await run({ email, password });
    if (ok) navigate('/');
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h2 className="card-title mb-3 text-center">Crear cuenta</h2>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">{error}</div>
        )}
        {needsConfirmation && (
          <div className="alert alert-info mb-3" role="alert">
            ¡Cuenta creada! Te enviamos un email de confirmación a <strong>{email}</strong>.
            Hacé clic en el enlace (revisá también la carpeta de spam) y después iniciá sesión.
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-control" required
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña (mín. 6 caracteres)</label>
            <input
              type="password" className="form-control" required
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-cp w-100 mb-3" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="text-center text-muted small">
          Ya ten&eacute;s cuenta?{' '}
          <button type="button" className="btn btn-link text-primary p-0" onClick={() => navigate("/login")}>
            Iniciar sesi&oacute;n
          </button>
        </div>
      </div>
    </div>
  );
}