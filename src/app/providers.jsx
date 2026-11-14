import { createContext, useContext, useEffect, useState } from 'react';
import { adapter, isDemoMode } from '../lib/storageAdapter.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await adapter.getSession();
        if (mounted) {
          setSession(data && data.session ? data.session : null);
          setUser(data && data.session ? data.session.user : null);
        }
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const sub = adapter.onAuthStateChange((event, sess) => {
      setSession(sess || null);
      setUser(sess ? sess.user : null);
    });
    return () => sub && sub.subscription && sub.subscription.unsubscribe();
  }, []);

  async function signIn({ email, password }) {
    setLoading(true);
    try {
      const { data, error } = await adapter.signIn({ email, password });
      if (error) throw error;
      setSession(data.session);
      setUser(data.session.user);
      return { error: null };
    } catch (e) {
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ email, password }) {
    setLoading(true);
    try {
      const { data, error } = await adapter.signUp({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (e) {
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await adapter.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = { session, user, loading, isDemoMode, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}