import { useState } from 'react';
import { authApi } from './api.js';
import { useAuth } from '../../app/providers.jsx';
import { translateError } from './api.js';

export function useLogin() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  async function run({ email, password }) {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await signIn({ email, password });
      if (err) {
        setError(translateError(err));
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }
  return { run, loading, error };
}

export function useRegister() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const { signUp } = useAuth();
  async function run({ email, password }) {
    setLoading(true);
    setError(null);
    setNeedsConfirmation(false);
    try {
      const { error: err, needsConfirmation: pending } = await signUp({ email, password });
      if (err) {
        setError(translateError(err));
        return false;
      }
      if (pending) {
        setNeedsConfirmation(true);
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }
  return { run, loading, error, needsConfirmation };
}