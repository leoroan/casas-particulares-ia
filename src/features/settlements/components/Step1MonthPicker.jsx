import { useState } from 'react';
import { expectedDays } from '../../../domain/calendar.js';
import { dateES } from '../../../lib/format.js';

export default function Step1MonthPicker({ period, onPeriodChange, holidays }) {
  const [viewMonth, setViewMonth] = useState((period || new Date().toISOString().slice(0, 7)).slice(0, 7));
  const [y, m] = viewMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDay = new Date(Date.UTC(y, m - 1, 1));
  const holSet = new Set((holidays || []).map((h) => h.fecha));
  // Dias laborables (Lunes a Viernes) del mes, excluyendo feriados
  const exp = period ? expectedDays(period, [1, 2, 3, 4, 5], holidays) : 0;

  function isHoliday(d) {
    const iso = new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
    return holSet.has(iso);
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Paso 1 de 3 — Elegí el mes a liquidar</h5>
        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label">Período</label>
            <input
              type="month" className="form-control"
              value={viewMonth} onChange={(e) => { setViewMonth(e.target.value); onPeriodChange(e.target.value + '-01'); }}
            />
            <div className="form-text">{period ? dateES(period) : ''}</div>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <span className="text-muted me-2">Días laborables del mes (L-V, sin feriados):</span>
            <span className="badge bg-info text-dark">{exp}</span>
          </div>
        </div>
        <div className="calendar mb-3">
          <div className="weekdays">
            {['L','M','X','J','V','S','D'].map((d, i) => <div key={i} className="wd">{d}</div>)}
          </div>
          <div className="days">
            {/* dias vacantes antes del 1 */}
            {Array.from({ length: (firstDay.getUTCDay() + 6) % 7 }).map((_, i) => <div key={'p'+i} className="day empty"></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const h = isHoliday(d);
              const today = new Date();
              const isToday = d === today.getDate() && m === today.getMonth() + 1 && y === today.getFullYear();
              return (
                <div key={d} className={`day ${h ? 'holiday' : ''} ${isToday ? 'today' : ''}`}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
        <div className="d-flex justify-content-between mt-3">
          <span className="text-muted small">Los feriados aparecen resaltados. En el paso 2 podrás indicar cuáles se trabajaron.</span>
          <button className="btn btn-cp" disabled={!period} onClick={() => period && onPeriodChange(period)}>Siguiente: tarjetas de empleadas →</button>
        </div>
      </div>
    </div>
  );
}