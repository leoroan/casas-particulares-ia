import { useState } from 'react';
import { useCalcSettlement } from '../hooks.js';
import { expectedDays } from '../../../domain/calendar.js';
import { money, hs, dateES } from '../../../lib/format.js';

export default function Step2EmployeeCards({
  employees,
  assignments,
  period,
  settings,
  scales,
  rates,
  holidays,
  inputs,
  onInputsChange
}) {
  const monthHolidays = (holidays || []).filter((h) => h.fecha.startsWith(period.slice(0, 7)));

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
      {employees.map((emp) => {
        const ass = (assignments || []).filter((a) => a.employee_id === emp.id);
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
        const calc = useCalcSettlement({
          employee: emp,
          assignments: ass,
          period,
          settings,
          scales,
          rates,
          holidays: monthHolidays,
          inputs: defaultInputs
        });

        const hoursWeek = ass.reduce((sum, a) => sum + (a.horas_dia || 0) * (a.dias_semana || []).length, 0);
        const suggested = hoursWeek >= 24 ? 'mensual' : 'por_hora';
        const isOverride = ass.some((a) => a.modalidad_override);

        if (!calc) return null;

        return (
          <div key={emp.id} className="col card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold">{emp.nombre}</div>
                <div className="small text-muted">{emp.categoria}</div>
              </div>
              <span className={`badge ${calc.modality === 'mensual' ? 'bg-primary' : 'bg-secondary'}`}>
                {calc.modality === 'mensual' ? 'Mensualizada' : 'Por hora'}
              </span>
              {isOverride && (
                <span className="badge bg-warning text-dark ms-1" title="Modalidad override manual">Override</span>
              )}
            </div>
            <div className="card-body p-3">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small">Días trabajados</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={defaultInputs.diasTrabajados}
                    onChange={(e) => onInputsChange(emp.id, { diasTrabajados: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Valor hora</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={calc.valorHora}
                    onChange={(e) => onInputsChange(emp.id, { valorHora: Number(e.target.value || 0) })}
                  />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small">Viático total</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={defaultInputs.viaticoTotal === '' ? '' : defaultInputs.viaticoTotal}
                    onChange={(e) => onInputsChange(emp.id, { viaticoTotal: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Extras 50% (hs)</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={defaultInputs.extras50}
                    onChange={(e) => onInputsChange(emp.id, { extras50: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Extras 100% (hs)</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={defaultInputs.extras100}
                    onChange={(e) => onInputsChange(emp.id, { extras100: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Ajuste básico</label>
                  <input
                    type="number" className="form-control form-control-sm"
                    value={defaultInputs.ajusteBasico}
                    onChange={(e) => onInputsChange(emp.id, { ajusteBasico: Number(e.target.value || 0) })}
                  />
                </div>
              </div>
              {monthHolidays.length > 0 && (
                <div className="mb-3">
                  <label className="form-label small">Feriados trabajados (+100% del día)</label>
                  <div className="d-flex flex-wrap gap-2">
                    {monthHolidays.map((h) => {
                      const worked = defaultInputs.feriadoTrabajado[h.fecha] || defaultInputs.feriadoTrabajado[h.id];
                      return (
                        <label key={h.id} className="btn btn-outline-secondary py-2 px-3">
                          <input
                            type="checkbox" checked={!!worked}
                            onChange={() => onInputsChange(emp.id, { feriadoTrabajado: { ...defaultInputs.feriadoTrabajado, [h.fecha]: !worked } })}
                          />{' '}
                          {h.descripcion} ({dateES(h.fecha)})
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="table-responsive">
                <table className="table table-sm border-0">
                  <tbody>
                    <tr><td className="text-muted">Total horas</td><td className="text-end fw-bold">{hs(calc.totalHours)}</td></tr>
                    <tr><td className="text-muted">Básico</td><td className="text-end">{money(calc.basico)}</td></tr>
                    {calc.viaticos > 0 && <tr><td className="text-muted">Viáticos</td><td className="text-end">{money(calc.viaticos)}</td></tr>}
                    {calc.feriado > 0 && <tr><td className="text-muted">Feriado trabajado</td><td className="text-end">{money(calc.feriado)}</td></tr>}
                    {calc.extras > 0 && <tr><td className="text-muted">Horas extras</td><td className="text-end">{money(calc.extras)}</td></tr>}
                    {calc.antiguedad.monto > 0 && <tr><td className="text-muted">Antigüedad ({calc.antiguedad.anios} años)</td><td className="text-end">{money(calc.antiguedad.monto)}</td></tr>}
                    {calc.zona > 0 && <tr><td className="text-muted">Zona desfavorable</td><td className="text-end">{money(calc.zona)}</td></tr>}
                    <tr className="fw-bold"><td>Bruto</td><td className="text-end">{money(calc.bruto)}</td></tr>
                    <tr><td className="text-muted">Aportes (desc.)</td><td className="text-end">- {money(calc.aportes)}</td></tr>
                    <tr className="fw-bold text-success"><td>Neto a pagar</td><td className="text-end">{money(calc.neto)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
