import { useState } from 'react';
import { dateES } from '../../../lib/format.js';

export default function HolidayList({ holidays, onSave, onRemove }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function handleSave(h) {
    const { error } = await onSave(h);
    setEditing(null);
    if (!error) alert('Feriado guardado');
    else alert(error.message || 'Error');
  }

  async function handleRemove(id) {
    setDeleting(id);
    const { error } = await onRemove(id);
    setDeleting(null);
    if (!error) alert('Feriado eliminado');
    else alert(error.message || 'Error');
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead><tr><th>Fecha</th><th>Descripción</th><th className="text-end">Acciones</th></tr></thead>
        <tbody>
          {(holidays || []).length === 0 ? (
            <tr><td colSpan="3" className="text-center text-muted">No hay feriados cargados.</td></tr>
          ) : (
            [...(holidays || [])].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')).map((h) => (
              <tr key={h.id}>
                {editing && editing.id === h.id ? (
                  <td colSpan="3"><HolidayForm holiday={h} onSave={handleSave} onCancel={() => setEditing(null)} /></td>
                ) : (
                  <>
                    <td>{dateES(h.fecha)}</td>
                    <td>{h.descripcion}</td>
                    <td className="text-end">
                      {deleting === h.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(h)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(h.id)}>Borrar</button>
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