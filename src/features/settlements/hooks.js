import { useState, useEffect, useCallback, useMemo } from 'react';
import { settlementsApi } from './api.js';
import { adapter } from '../../lib/storageAdapter.js';
import { calculateSettlement } from '../../domain/payroll.js';

export function useSettlements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: res, error: err } = await settlementsApi.list();
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

  const save = useCallback(async (settlement) => {
    const { data: res, error: err } = await settlementsApi.save(settlement);
    if (!err) setData((prev) => {
      const existing = prev.findIndex((x) => x.employee_id === settlement.employee_id && x.periodo === settlement.periodo);
      const next = [...prev];
      if (existing >= 0) next[existing] = res; else next.push(res);
      return next;
    });
    return { data: res, error: err };
  }, []);

  const remove = useCallback(async (id) => {
    const { error: err } = await settlementsApi.remove(id);
    if (!err) setData((prev) => prev.filter((x) => x.id !== id));
    return { error: err };
  }, []);

  return { data, loading, error, save, remove };
}

export function useCalcSettlement({ employee, assignments, period, settings, scales, rates, holidays, inputs }) {
  return useMemo(() => {
    if (!employee || !period) return null;
    return calculateSettlement({ employee, assignments, period, settings, scales, rates, holidays, inputs });
  }, [employee, assignments, period, settings, scales, rates, holidays, inputs]);
}

export function useReferenceData() {
  const [scales, setScales] = useState([]);
  const [rates, setRates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, r, h, st] = await Promise.all([
          adapter.getSalaryScales(),
          adapter.getContributionRates(),
          adapter.getHolidays(),
          adapter.getSettings()
        ]);
        if (mounted) {
          setScales(s.data || []);
          setRates(r.data || []);
          setHolidays(h.data || []);
          setSettings(st.data?.datos || {});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { scales, rates, holidays, settings, loading };
}