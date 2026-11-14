import { useState, useEffect, useCallback } from 'react';
import { holidaysApi } from './api.js';

export function useHolidays() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: res, error: err } = await holidaysApi.list();
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

  const save = useCallback(async (holiday) => {
    const { data: res, error: err } = await holidaysApi.save(holiday);
    if (!err) setData((prev) => [...prev, res]);
    return { data: res, error: err };
  }, []);

  const remove = useCallback(async (id) => {
    const { error: err } = await holidaysApi.remove(id);
    if (!err) setData((prev) => prev.filter((x) => x.id !== id));
    return { error: err };
  }, []);

  return { data, loading, error, save, remove };
}