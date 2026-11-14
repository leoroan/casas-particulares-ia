import { useState, useEffect, useCallback } from 'react';
import { housesApi } from './api.js';

export function useHouses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: res, error: err } = await housesApi.list();
        if (mounted) {
          setData(res || []);
          setError(err ? err.message : null);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = useCallback(async (house) => {
    const { data: res, error: err } = await housesApi.save(house);
    if (!err) setData((prev) => {
      const existing = prev.findIndex((x) => x.id === res.id);
      const next = [...prev];
      if (existing >= 0) next[existing] = res; else next.push(res);
      return next;
    });
    return { data: res, error: err };
  }, []);

  const remove = useCallback(async (id) => {
    const { error: err } = await housesApi.remove(id);
    if (!err) setData((prev) => prev.filter((x) => x.id !== id));
    return { error: err };
  }, []);

  return { data, loading, error, save, remove };
}