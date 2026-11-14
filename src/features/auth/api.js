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
  const msg = String(error && error.message ? error.message : error || '');
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  if (msg.includes('email')) return 'El email ya está registrado.';
  if (msg.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('network')) return 'No hay conexión a internet.';
  return msg || 'Error inesperado.';
}