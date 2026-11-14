import { useState, useEffect, useMemo, useCallback } from 'react';
import { dashboardApi } from './api.js';
import { latestScaleDate } from '../../domain/scales.js';
import { money } from '../../lib/format.js';

export function useDashboard() {
  const [settlements, setSettlements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [scales, setScales] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, e, sc, p] = await Promise.all([
          dashboardApi.listSettlements(),
          dashboardApi.listEmployees(),
          dashboardApi.getSalaryScales(),
          dashboardApi.getProfile()
        ]);
        if (mounted) {
          setSettlements(s.data || []);
          setEmployees(e.data || []);
          setScales(sc.data || []);
          setProfile(p.data || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeEmployees = useMemo(() => (employees || []).filter((e) => e.activo), [employees]);

  const currentMonthSettlements = useMemo(() => {
    const prefix = currentMonth;
    return (settlements || []).filter((s) => s.periodo && s.periodo.startsWith(prefix));
  }, [settlements, currentMonth]);

  const totalNetoMes = useMemo(() => currentMonthSettlements.reduce((s, x) => s + (x.neto || 0), 0), [currentMonthSettlements]);
  const totalBrutoMes = useMemo(() => currentMonthSettlements.reduce((s, x) => s + (x.total || 0), 0), [currentMonthSettlements]);

  const escalaVieja = useMemo(() => {
    const mesesAlerta = 2;
    if (!scales || scales.length === 0) return true;
    const latest = latestScaleDate(scales);
    if (!latest) return true;
    const latestDate = new Date(latest + 'T00:00:00');
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - mesesAlerta);
    return latestDate < cutoff;
  }, [scales]);

  const sacMes = useMemo(() => {
    const m = Number(currentMonth.slice(5, 7));
    return m === 6 || m === 12;
  }, [currentMonth]);

  return { settlements, employees, activeEmployees, scales, profile, loading, currentMonth, setCurrentMonth, totalNetoMes, totalBrutoMes, currentMonthSettlements, escalaVieja, sacMes, money };
}