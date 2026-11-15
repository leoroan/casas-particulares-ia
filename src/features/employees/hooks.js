import { useState, useEffect, useCallback } from 'react';
import { employeesApi } from './api.js';
import { calculateSettlement } from '../../domain/payroll.js';

export function useEmployees() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: res, error: err } = await employeesApi.list();
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

  const save = useCallback(async (employee) => {
    const { data: res, error: err } = await employeesApi.save(employee);
    if (!err) setData((prev) => {
      const existing = prev.findIndex((x) => x.id === res.id);
      const next = [...prev];
      if (existing >= 0) next[existing] = res; else next.push(res);
      return next;
    });
    return { data: res, error: err };
  }, []);

  return { data, loading, error, save };
}

export function useEmployeeContext(employeeId) {
  const [assignments, setAssignments] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, s, l] = await Promise.all([
          employeesApi.getAssignments(),
          employeesApi.getSettlements(),
          employeesApi.getLeaves()
        ]);
        if (mounted) {
          setAssignments((a.data || []).filter((x) => x.employee_id === employeeId));
          setSettlements((s.data || []).filter((x) => x.employee_id === employeeId).sort((x, y) => (y.periodo || '').localeCompare(x.periodo || '')));
          setLeaves(l.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [employeeId]);

  return { assignments, settlements, leaves, loading };
}