import { useEmployeeContext } from "../hooks.js";
import { dateES, money } from "../../../lib/format.js";
import { realSeniorityYears } from "../../../domain/seniority.js";
import { vacationDaysBySeniority } from "../../../domain/vacations.js";

export default function EmployeeDrawer({ employee, onClose }) {
  const { assignments, settlements, leaves, loading } = useEmployeeContext(
    employee?.id,
  );

  if (!employee) return null;

  const anos = realSeniorityYears(
    employee.fecha_ingreso,
    new Date().toISOString().slice(0, 10),
  );
  const vac = vacationDaysBySeniority(anos);

  return (
    <>
      <div
        className="employee-drawer-backdrop position-fixed top-0 start-0 end-0 bottom-0 bg-dark"
        style={{ zIndex: 1040 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="employee-drawer offcanvas offcanvas-end show"
        style={{ width: "min(440px, 100vw)", zIndex: 1045 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${employee.nombre}`}
      >
        <div className="offcanvas-header align-items-start">
          <div className="employee-drawer-identity">
            <div className="text-muted small mb-1">Ficha de empleada</div>
            <h5 className="offcanvas-title mb-2">{employee.nombre}</h5>
            <span
              className={`badge ${employee.activo ? "bg-success" : "bg-secondary"}`}
            >
              {employee.activo ? "Activa" : "Inactiva"}
            </span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="offcanvas-body">
          {loading ? (
            <div className="text-center py-4">Cargando historial...</div>
          ) : (
            <>
              <div className="row g-2">
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">CUIL</div>
                    <div>{employee.cuil || "-"}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">Fecha de ingreso</div>
                    <div>{dateES(employee.fecha_ingreso)}</div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mt-0">
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">Categoría</div>
                    <div>{employee.categoria || "-"}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">Con retiro</div>
                    <div>{employee.con_retiro ? "Sí" : "No"}</div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mt-0">
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">Antigüedad</div>
                    <div className="fw-bold">{anos} años</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="employee-detail-card">
                    <div className="label">Vacaciones</div>
                    <div className="fw-bold">{vac} días/año</div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mt-0">
                <div className="employee-detail-card mt-2">
                  <div className="label">Zona desfavorable</div>
                  <span
                    className={`badge ${employee.zona_desfavorable ? "bg-warning text-dark" : "bg-secondary"}`}
                  >
                    {employee.zona_desfavorable ? "Sí" : "No"}
                  </span>
                </div>
              </div>

              <section className="employee-drawer-section">
                <h6 className="employee-drawer-section-title">Asignaciones</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Casa</th>
                        <th>Días</th>
                        <th>Hs/día</th>
                        <th>Cat.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Sin asignaciones.
                          </td>
                        </tr>
                      ) : (
                        assignments.map((a) => (
                          <tr key={a.id}>
                            <td>{a.house_id}</td>
                            <td>{(a.dias_semana || []).length}</td>
                            <td>{a.horas_dia}</td>
                            <td>{a.categoria}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="employee-drawer-section">
                <h6 className="employee-drawer-section-title">Liquidaciones</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th>Estado</th>
                        <th>Bruto</th>
                        <th>Neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Sin liquidaciones.
                          </td>
                        </tr>
                      ) : (
                        settlements.map((s) => (
                          <tr key={s.id}>
                            <td>{s.periodo.slice(0, 7)}</td>
                            <td>
                              <span
                                className={`badge ${s.estado === "cerrada" ? "bg-success" : "bg-warning text-dark"}`}
                              >
                                {s.estado}
                              </span>
                            </td>
                            <td>{money(s.total)}</td>
                            <td>{money(s.neto)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="employee-drawer-section">
                <h6 className="employee-drawer-section-title">Notas</h6>
                <div className="employee-detail-card text-muted small">
                  {employee.notas || "Sin notas registradas."}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
