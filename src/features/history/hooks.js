import { useState, useEffect, useMemo, useCallback } from 'react';
import { historyApi } from './api.js';
import { adapter } from '../../lib/storageAdapter.js';

export function useHistory() {
  const [settlements, setSettlements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, e, h] = await Promise.all([
          historyApi.listSettlements(),
          historyApi.listEmployees(),
          historyApi.listHouses()
        ]);
        if (mounted) {
          setSettlements(s.data || []);
          setEmployees(e.data || []);
          setHouses(h.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const houseMap = useMemo(() => Object.fromEntries((houses || []).map((h) => [h.id, h.alias])), [houses]);
  const empMap = useMemo(() => Object.fromEntries((employees || []).map((e) => [e.id, e.nombre])), [employees]);

  const filtered = useMemo(() => {
    return (settlements || []).filter((s) => {
      if (q && !s.employee_id.toString().includes(q) && !q) return true;
      const empName = (empMap[s.employee_id] || '').toLowerCase();
      const matchQ = !q || empName.includes(q.toLowerCase());
      const matchEmp = !empFilter || s.employee_id === empFilter;
      const matchHouse = !houseFilter || true; // house filter via lines not stored at settlement level simply
      const matchFrom = !periodFrom || s.periodo >= periodFrom;
      const matchTo = !periodTo || s.periodo <= periodTo;
      return matchQ && matchEmp && matchHouse && matchFrom && matchTo;
    }).sort((a, b) => (b.periodo || '').localeCompare(a.periodo || ''));
  }, [settlements, q, empFilter, houseFilter, periodFrom, periodTo, empMap]);

  const setFilters = useCallback((f) => {
    if (f.q !== undefined) setQ(f.q);
    if (f.empFilter !== undefined) setEmpFilter(f.empFilter);
    if (f.houseFilter !== undefined) setHouseFilter(f.houseFilter);
    if (f.periodFrom !== undefined) setPeriodFrom(f.periodFrom);
    if (f.periodTo !== undefined) setPeriodTo(f.periodTo);
  }, []);

  const exportCSV = useCallback(() => {
    const rows = [['Período', 'Empleada', 'Estado', 'Bruto', 'Neto']];
    for (const s of filtered) {
      rows.push([s.periodo.slice(0, 7), empMap[s.employee_id] || '', s.estado, s.total || 0, s.neto || 0]);
    }
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libro-sueldos.csv';
    a.click();
  }, [filtered, empMap]);

  return { settlements: filtered, employees, houses, loading, q, empFilter, houseFilter, periodFrom, periodTo, setQ, setEmpFilter, setHouseFilter, setPeriodFrom, setPeriodTo, setFilters, exportCSV, houseMap, empMap };
}