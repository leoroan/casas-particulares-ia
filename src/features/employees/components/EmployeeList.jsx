import { useState } from 'react';
import { CATEGORIAS } from '../api.js';

export default function EmployeeList({ employees, onSave, onRemove, onView }) {
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [sort, setSort] = useState('nombre');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [undo, setUndo] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

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

  async function handleSave(emp) {
    const { data, error } = await onSave(emp);
    setEditing(null);
    if (!error) addToast('Empleada guardada');
    else addToast(error.message || 'Error al guardar', 'error');
    return data;
  }

  async function handleRemove(id) {
    setDeleting(id);
    const snapshot = employees.find((e) => e.id === id);
    const { error } = await onRemove(id);
    if (!error) {
      addToast('Empleada eliminada', 'success');
      setUndo({ id, snapshot });
      setTimeout(() => setUndo(null), 6000);
    } else {
      setDeleting(null);
      addToast(error.message || 'Error al eliminar', 'error');
    }
  }

  function restore() {
    if (!undo) return;
    onSave(undo.snapshot);
    setUndo(null);
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
                  {editing && editing.id === e.id ? (
                    <td colSpan="6"><EmployeeForm employee={e} onSave={handleSave} onCancel={() => setEditing(null)} /></td>
                  ) : (
                    <>
                      <td>{e.nombre}</td>
                      <td><span className="badge bg-secondary text-wrap" style={{ maxWidth: '160px' }}>{e.categoria}</span></td>
                      <td>{e.horas_dia}</td>
                      <td>{(e.dias_semana || []).length}</td>
                      <td><span className={`badge ${e.activo ? 'bg-success' : 'bg-secondary'}`}>{e.activo ? 'Activa' : 'Inactiva'}</span></td>
                      <td className="text-end">
                        {deleting === e.id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditing(e); onView(e.id); }}>Ver detalle</button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(e)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(e.id)}>Borrar</button>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {undo && (
        <div className="alert alert-info d-flex align-items-center mb-3">
          Empleada eliminada. <button className="btn btn-sm btn-outline-primary ms-2" onClick={restore}>Deshacer</button>
        </div>
      )}
    </>
  );
}