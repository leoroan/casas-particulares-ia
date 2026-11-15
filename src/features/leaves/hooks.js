import { useState, useEffect, useCallback } from 'react';
import { leavesApi } from './api.js';
import { employeesApi } from '../employees/api.js';

export function useLeaves() {
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [l, e] = await Promise.all([leavesApi.list(), employeesApi.list()]);
        if (mounted) {
          setData(l.data || []);
          setEmployees(e.data || []);
          setError(l.error ? l.error.message : null);
        }
      } catch (ex) {
        if (mounted) setError(ex.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = useCallback(async (leave) => {
    const { data: res, error: err } = await leavesApi.save(leave);
    if (!err) setData((prev) => [...prev, res]);
    return { data: res, error: err };
  }, []);

  const remove = useCallback(async (id) => {
    const { error: err } = await leavesApi.remove(id);
    if (!err) setData((prev) => prev.filter((x) => x.id !== id));
    return { error: err };
  }, []);

  return { data, employees, loading, error, save, remove };
}
function err(res) { return res.error; }