import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks.js';
import { periodLabel } from '../../../lib/format.js';

export default function DashboardPage() {
  const {
    activeEmployees, settlements, scales, profile, loading,
    currentMonth, setCurrentMonth, totalNetoMes, totalBrutoMes,
    currentMonthSettlements, sinEscalas, escalaVieja, sacMes, money
  } = useDashboard();

  if (loading) return <div className="text-center py-5">Cargando dashboard...</div>;

  return (
    <div className="mb-4">
      <h2>Dashboard</h2>
      <p className="text-muted">Resumen del mes. Desde acá podés liquidar el mes actual.</p>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><div className="card"><div className="card-body">
          <div className="text-muted small">Empleadas activas</div><div className="fw-bold fs-4">{activeEmployees.length}</div>
        </div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">
          <div className="text-muted small">Total bruto {periodLabel(currentMonth + '-01')}</div><div className="fw-bold fs-4">{money(totalBrutoMes)}</div>
        </div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">
          <div className="text-muted small">Total neto a pagar</div><div className="fw-bold fs-4 text-success">{money(totalNetoMes)}</div>
        </div></div></div>
        <div className="col-md-3"><div className="card"><div className="card-body">
          <div className="text-muted small">Liquidaciones del mes</div><div className="fw-bold fs-4">{currentMonthSettlements.length}</div>
        </div></div></div>
      </div>

      {sinEscalas && (
        <div className="alert alert-warning mb-3">
          Atención: no hay escalas salariales cargadas para esta sesión. Cargá una en <Link to="/escalas" className="alert-link">Escalas</Link> antes de liquidar.
        </div>
      )}
      {escalaVieja && (
        <div className="alert alert-warning mb-3">
          Atención: la escala salarial más reciente tiene más de 2 meses de antigüedad. Actualizala en <Link to="/escalas" className="alert-link">Escalas</Link> antes de liquidar.
        </div>
      )}
      {sacMes && (
        <div className="alert alert-info mb-3">
          Este mes es de SAC (junio o diciembre). Generá el concepto aparte si corresponde.
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header"><h6 className="mb-0">Por empleada (mes {periodLabel(currentMonth + '-01')})</h6></div>
        <div className="card-body">
          {activeEmployees.length === 0 ? (
            <div className="text-muted">No hay empleadas activas. Cargá empleadas y casas primero.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm border-0">
                <thead><tr><th>Empleada</th><th>Última liquidación</th><th className="text-end">Neto</th><th className="text-end">Acción</th></tr></thead>
                <tbody>
                  {activeEmployees.map((emp) => {
                    const empSett = (currentMonthSettlements || []).find((s) => s.employee_id === emp.id);
                    const allEmp = (settlements || []).filter((s) => s.employee_id === emp.id).sort((a, b) => (b.periodo || '').localeCompare(a.periodo || ''));
                    const last = allEmp[0];
                    return (
                      <tr key={emp.id}>
                        <td>{emp.nombre}</td>
                        <td>{last ? periodLabel(last.periodo) : <span className="text-muted">—</span>}</td>
                        <td className="text-end">{empSett ? money(empSett.neto) : <span className="text-muted">—</span>}</td>
                        <td className="text-end">
                          {!empSett && (
                            <Link to="/liquidar" className="btn btn-sm btn-cp">Liquidar</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="d-grid">
        <Link to="/liquidar" className="btn btn-cp btn-lg">Liquidar mes ahora</Link>
      </div>
    </div>
  );
}