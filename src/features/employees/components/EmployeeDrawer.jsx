import { useState } from 'react';
import { useEmployeeContext } from '../hooks.js';
import { dateES, money } from '../../../lib/format.js';
import { realSeniorityYears } from '../../../domain/seniority.js';
import { vacationDaysBySeniority } from '../../../domain/vacations.js';

export default function EmployeeDrawer({ employee, onClose }) {
  const [open, setOpen] = useState(true);
  const { assignments, settlements, leaves, loading } = useEmployeeContext(employee?.id);

  if (!open || !employee) return null;

  const anos = realSeniorityYears(employee.fecha_ingreso, new Date().toISOString().slice(0, 10));
  const vac = vacationDaysBySeniority(anos);

  return (
    <div className="position-fixed top-0 end-0 bottom-0" style={{ width: '420px', zIndex: 1050 }}>
      <div className="offcanvas offcanvas-end" style={{ width: '420px' }} aria-hidden={!open}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">{employee.nombre}</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="offcanvas-body">
          {loading ? (
            <div className="text-center py-4">Cargando historial...</div>
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-6"><div className="text-muted small">CUIL</div><div>{employee.cuil || '-'}</div></div>
                <div className="col-6"><div className="text-muted small">Fecha ingreso</div><div>{dateES(employee.fecha_ingreso)}</div></div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><div className="text-muted small">Categoría</div><div>{employee.categoria}</div></div>
                <div className="col-6"><div className="text-muted small">Con retiro</div><div>{employee.con_retiro ? 'Sí' : 'No'}</div></div>
              </div>
              <div className="row mb-3">
                <div className="col-6"><div className="text-muted small">Antigüedad (años)</div><div className="fw-bold">{anos}</div></div>
                <div className="col-6"><div className="text-muted small">Vacaciones (días/año)</div><div className="fw-bold">{vac}</div></div>
              </div>
              <div className="mb-3">
                <div className="text-muted small">Zona desfavorable</div>
                <span className={`badge ${employee.zona_desfavorable ? 'bg-warning text-dark' : 'bg-secondary'}`}>{employee.zona_desfavorable ? 'Sí' : 'No'}</span>
              </div>

              <h6 className="mt-4 mb-2">Asignaciones</h6>
              <div className="table-responsive mb-3">
                <table className="table table-sm">
                  <thead><tr><th>Casa</th><th>Días</th><th>Hs/día</th><th>Cat.</th></tr></thead>
                  <tbody>
                    {assignments.length === 0 ? <tr><td colSpan="4" className="text-center text-muted">Sin asignaciones.</td></tr> : assignments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.house_id}</td><td>{(a.dias_semana || []).length}</td><td>{a.horas_dia}</td><td>{a.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h6 className="mt-4 mb-2">Liquidaciones</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead><tr><th>Período</th><th>Estado</th><th>Bruto</th><th>Neto</th></tr></thead>
                  <tbody>
                    {settlements.length === 0 ? <tr><td colSpan="4" className="text-center text-muted">Sin liquidaciones.</td></tr> : settlements.map((s) => (
                      <tr key={s.id}>
                        <td>{s.periodo.slice(0, 7)}</td>
                        <td><span className={`badge ${s.estado === 'cerrada' ? 'bg-success' : 'bg-warning text-dark'}`}>{s.estado}</span></td>
                        <td>{money(s.total)}</td><td>{money(s.neto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h6 className="mt-4 mb-2">Notas</h6>
              <div className="text-muted small">{employee.notas || '-'}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}