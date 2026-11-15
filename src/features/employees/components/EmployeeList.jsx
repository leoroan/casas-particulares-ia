import { useState } from 'react';
import { CATEGORIAS } from '../api.js';
import Toast from '../../../components/ui/Toast.jsx';

export default function EmployeeList({ employees, onSave, onEdit, onView }) {
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [sort, setSort] = useState('nombre');
  const [updatingId, setUpdatingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const filtered = employees
    .filter((e) => {
      const matchQ = e.nombre.toLowerCase().includes(q.toLowerCase()) || (e.cuil || '').includes(q);
      const matchCat = !catFilter || e.categoria === catFilter;
      const matchActivo = !activoFilter || (activoFilter === 'true') === e.activo;
      return matchQ && matchCat && matchActivo;
    })
    .sort((a, b) => {
      if (sort === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });

  async function handleToggleActive(employee) {
    const nextActive = !employee.activo;
    if (!nextActive && !window.confirm(`¿Desactivar a ${employee.nombre}? Se conservará su historial y no aparecerá en futuras liquidaciones.`)) {
      return;
    }

    setUpdatingId(employee.id);
    const { error } = await onSave({ ...employee, activo: nextActive });
    if (!error) {
      addToast(nextActive ? 'Empleada reactivada' : 'Empleada desactivada');
    } else {
      addToast(error.message || 'Error al actualizar el estado', 'error');
    }
    setUpdatingId(null);
  }

  return (
    <>
      <div className="row mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Buscar por nombre o CUIL" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">Todas categorías</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={activoFilter} onChange={(e) => setActivoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>
        <div className="col-md-2 d-flex">
          <button className="btn btn-outline-secondary w-100" onClick={() => setSort(sort === 'nombre' ? 'ingreso' : 'nombre')}>
            Ordenar {sort}
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Nombre</th><th>Categoría</th><th>Hs/día</th><th>Días sem.</th><th>Estado</th><th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted">No se encontraron empleadas.</td></tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td><span className="badge bg-secondary text-wrap" style={{ maxWidth: '160px' }}>{e.categoria || '-'}</span></td>
                  <td>{e.horas_dia ?? '-'}</td>
                  <td>{(e.dias_semana || []).length}</td>
                  <td><span className={`badge ${e.activo ? 'bg-success' : 'bg-secondary'}`}>{e.activo ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="text-end">
                    {updatingId === e.id ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-label="Actualizando estado" />
                    ) : (
                      <div className="d-inline-flex flex-wrap justify-content-end gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onView(e.id)}>Ver detalle</button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(e)}>Editar</button>
                        <button
                          className={`btn btn-sm ${e.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleActive(e)}
                        >
                          {e.activo ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}