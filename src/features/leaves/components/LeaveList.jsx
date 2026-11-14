import { useState } from 'react';
import { dateES } from '../../../lib/format.js';

export default function LeaveList({ leaves, employees, onSave, onRemove }) {
  const empMap = Object.fromEntries((employees || []).map((e) => [e.id, e.nombre]));
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function handleSave(l) {
    const { error } = await onSave(l);
    setEditing(null);
    if (!error) alert('Licencia guardada');
    else alert(error.message || 'Error');
  }

  async function handleRemove(id) {
    setDeleting(id);
    const { error } = await onRemove(id);
    setDeleting(null);
    if (!error) alert('Licencia eliminada');
    else alert(error.message || 'Error');
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead><tr><th>Empleada</th><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Pagada</th><th className="text-end">Acciones</th></tr></thead>
        <tbody>
          {(leaves || []).length === 0 ? (
            <tr><td colSpan="7" className="text-center text-muted">No hay licencias registradas.</td></tr>
          ) : (
            [...(leaves || [])].sort((a, b) => (a.desde || '').localeCompare(b.desde || '')).map((l) => (
              <tr key={l.id}>
                {editing && editing.id === l.id ? (
                  <td colSpan="7"><LeaveForm leave={l} employees={employees} onSave={handleSave} onCancel={() => setEditing(null)} /></td>
                ) : (
                  <>
                    <td>{empMap[l.employee_id] || ''}</td>
                    <td>{l.tipo}</td>
                    <td>{dateES(l.desde)}</td>
                    <td>{dateES(l.hasta)}</td>
                    <td>{l.dias}</td>
                    <td>{l.pagada ? 'Sí' : 'No'}</td>
                    <td className="text-end">
                      {deleting === l.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(l)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(l.id)}>Borrar</button>
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
  );
}