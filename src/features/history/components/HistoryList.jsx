import { money } from '../../../lib/format.js';

export default function HistoryList({ settlements, employees, houses, filters, onExportCSV }) {
  const empMap = Object.fromEntries((employees || []).map((e) => [e.id, e.nombre]));
  const houseMap = Object.fromEntries((houses || []).map((h) => [h.id, h.alias]));

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Buscar empleada" value={filters.q} onChange={(e) => filters.setQ(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filters.empFilter} onChange={(e) => filters.setEmpFilter(e.target.value)}>
            <option value="">Todas empleadas</option>
            {(employees || []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <input type="month" className="form-control" value={filters.periodFrom} onChange={(e) => filters.setPeriodFrom(e.target.value ? e.target.value + '-01' : '')} />
        </div>
        <div className="col-md-2">
          <input type="month" className="form-control" value={filters.periodTo} onChange={(e) => filters.setPeriodTo(e.target.value ? e.target.value + '-01' : '')} />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-cp" onClick={onExportCSV}>Exportar libro CSV</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead><tr><th>Período</th><th>Empleada</th><th>Casa</th><th>Estado</th><th className="text-end">Bruto</th><th className="text-end">Neto</th><th className="text-end">Acciones</th></tr></thead>
          <tbody>
            {settlements.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted">No hay liquidaciones.</td></tr>
            ) : (
              settlements.map((s) => {
                const lineHouse = s.breakdown?.lines?.[0]?.houseId;
                return (
                  <tr key={s.id}>
                    <td>{s.periodo.slice(0, 7)}</td>
                    <td>{empMap[s.employee_id] || ''}</td>
                    <td>{lineHouse ? houseMap[lineHouse] : '-'}</td>
                    <td><span className={`badge ${s.estado === 'cerrada' ? 'bg-success' : 'bg-warning text-dark'}`}>{s.estado}</span></td>
                    <td className="text-end">{money(s.total || 0)}</td>
                    <td className="text-end">{money(s.neto || 0)}</td>
                    <td className="text-end">
                      <a href={`/liquidaciones/${s.id}`} className="btn btn-sm btn-outline-primary">Ver</a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}