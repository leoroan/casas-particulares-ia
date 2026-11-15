import { adapter } from '../../lib/storageAdapter.js';

export const authApi = {
  signIn: (credentials) => adapter.signIn(credentials),
  signUp: (credentials) => adapter.signUp(credentials),
  signOut: () => adapter.signOut(),
  getSession: () => adapter.getSession(),
  getProfile: () => adapter.getProfile(),
  saveProfile: (profile) => adapter.saveProfile(profile)
};

export function translateError(error) {
  const status = error && error.status;
  const code = error && error.code;
  const msg = String(error && error.message ? error.message : error || '').toLowerCase();

  // Rate limit de envío de emails de Supabase (p. ej. signup con confirmación activa).
  if (status === 429 || code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
    return 'Se superó el límite de envío de emails de Supabase. Esperá unos minutos y reintentalo, o desactivá la confirmación por email en Authentication > Settings del panel de Supabase.';
  }
  // Cuenta creada pero el email aún no fue confirmado.
  if (msg.includes('not confirmed') || msg.includes('confirm your email') || msg.includes('email_not_confirmed')) {
    return 'Tu email aún no está confirmado. Revisá tu casilla (y la carpeta de spam) y hacé clic en el enlace de confirmación.';
  }
  if (msg.includes('invalid login') || msg.includes('invalid_credentials') || msg.includes('invalid credentials')) {
    return 'Email o contraseña incorrectos.';
  }
  if (msg.includes('email_address_invalid') || msg.includes('invalid email')) {
    return 'El formato del email no es válido.';
  }
  if (msg.includes('already') || msg.includes('already registered')) {
    return 'El email ya está registrado. Iniciá sesión en vez de registrarte.';
  }
  if (msg.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('network') || msg.includes('fetch')) return 'No hay conexión a internet.';
  return (error && error.message) || 'Error inesperado.';
}