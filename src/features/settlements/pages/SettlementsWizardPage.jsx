import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSettlements, useReferenceData } from '../hooks.js';
import { useEmployees } from '../../employees/hooks.js';
import { adapter } from '../../../lib/storageAdapter.js';
import { calculateSettlement } from '../../../domain/payroll.js';
import { expectedDays } from '../../../domain/calendar.js';
import Step1MonthPicker from '../components/Step1MonthPicker.jsx';
import Step2EmployeeCards from '../components/Step2EmployeeCards.jsx';
import Step3Review from '../components/Step3Review.jsx';

export default function SettlementsWizardPage() {
  const { data: employees, loading: empLoading } = useEmployees();
  const { scales, rates, holidays, settings, loading: refLoading } = useReferenceData();
  const { save: saveSettlement } = useSettlements();

  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState('');
  const [inputs, setInputs] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [saving, setSaving] = useState(false);

  const activeEmployees = (employees || []).filter((e) => e.activo);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await adapter.getAssignments();
        if (mounted) setAssignments(data || []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const calcs = useMemo(() => {
    const out = {};
    for (const emp of activeEmployees) {
      const ass = assignments.filter((a) => a.employee_id === emp.id);
      const empInputs = inputs[emp.id] || {};
      const firstAss = ass[0];
      const expected = firstAss ? expectedDays(period, firstAss.dias_semana || [], holidays) : 0;
      const defaultInputs = {
        diasTrabajados: empInputs.diasTrabajados !== undefined ? empInputs.diasTrabajados : expected,
        feriadoTrabajado: empInputs.feriadoTrabajado || {},
        extras50: empInputs.extras50 || 0,
        extras100: empInputs.extras100 || 0,
        viaticoTotal: empInputs.viaticoTotal !== undefined ? empInputs.viaticoTotal : '',
        ajusteBasico: empInputs.ajusteBasico || 0
      };
      const monthHolidays = (holidays || []).filter((h) => h.fecha.startsWith(period.slice(0, 7)));
      out[emp.id] = calculateSettlement({
        employee: emp,
        assignments: ass,
        period,
        settings,
        scales,
        rates,
        holidays: monthHolidays,
        inputs: defaultInputs
      });
    }
    return out;
  }, [activeEmployees, assignments, inputs, period, settings, scales, rates, holidays]);

  const handleClose = useCallback(async (mode) => {
    setSaving(true);
    try {
      for (const emp of activeEmployees) {
        const calc = calcs[emp.id];
        if (!calc) continue;
        const empInputs = inputs[emp.id] || {};
        const settlement = {
          employee_id: emp.id,
          periodo: period,
          estado: mode,
          inputs: empInputs,
          breakdown: calc,
          total: calc.bruto,
          neto: calc.neto,
          cerrada_at: mode === 'cerrada' ? new Date().toISOString() : null
        };
        const { data: res, error } = await saveSettlement(settlement);
        if (error) throw error;
        for (const line of calc.lines) {
          await adapter.saveSettlementLine({
            settlement_id: res.id,
            house_id: line.houseId,
            breakdown: { horas: line.horas, basico: line.basico, viaticos: line.viaticos, feriado: line.feriado },
            subtotal: line.subtotal
          });
        }
      }
      setStep(3);
    } catch (e) {
      alert('Error al cerrar: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  }, [activeEmployees, assignments, inputs, period, saveSettlement, calcs]);

  if (empLoading || refLoading) return <div className="text-center py-5">Cargando datos...</div>;

  const calcsList = Object.values(calcs);

  return (
    <div className="mb-4">
      <h2>Liquidar mes</h2>
      <p className="text-muted">Flujo en 3 pasos: elegí el mes → revisá cada empleada → cerrá totales.</p>

      {step === 1 && (
        <Step1MonthPicker period={period} onPeriodChange={(p) => { setPeriod(p); setStep(2); }} holidays={holidays} />
      )}
      {step === 2 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>← Volver</button>
            <span className="text-muted">Período: {period.slice(0, 7)}</span>
          </div>
          <Step2EmployeeCards
            employees={activeEmployees}
            assignments={assignments}
            period={period}
            settings={settings}
            scales={scales}
            rates={rates}
            holidays={holidays}
            inputs={inputs}
            onInputsChange={(empId, patch) => {
              setInputs((prev) => ({ ...prev, [empId]: { ...(prev[empId] || {}), ...patch } }));
            }}
          />
          <div className="text-end mt-3">
            <button className="btn btn-cp" onClick={() => setStep(3)}>Revisar totales y cerrar →</button>
          </div>
        </>
      )}
      {step === 3 && (
        <Step3Review employees={activeEmployees} calcs={calcsList} onClose={handleClose} onBack={() => setStep(2)} />
      )}
    </div>
  );
}
