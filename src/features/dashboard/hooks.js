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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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

  const estadoEscalas = useMemo(() => {
    const mesesAlerta = 2;
    if (!scales || scales.length === 0) return { sinEscalas: true, escalaVieja: false };
    const latest = latestScaleDate(scales);
    if (!latest) return { sinEscalas: true, escalaVieja: false };
    const latestDate = new Date(latest + 'T00:00:00');
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - mesesAlerta);
    return { sinEscalas: false, escalaVieja: latestDate < cutoff };
  }, [scales]);

  const sacMes = useMemo(() => {
    const m = Number(currentMonth.slice(5, 7));
    return m === 6 || m === 12;
  }, [currentMonth]);

  return { settlements, employees, activeEmployees, scales, profile, loading, currentMonth, setCurrentMonth, totalNetoMes, totalBrutoMes, currentMonthSettlements, ...estadoEscalas, sacMes, money };
}