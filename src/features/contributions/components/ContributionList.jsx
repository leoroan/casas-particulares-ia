import { useState } from 'react';
import { TRAMOS } from '../api.js';
import { dateES } from '../../../lib/format.js';

export default function ContributionList({ rates, onSave, onRemove }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toasts, setToasts] = useState([]);
  const tramoLabel = Object.fromEntries(TRAMOS.map((t) => [t.value, t.label]));

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  async function handleSave(rate) {
    const { data, error } = await onSave(rate);
    setEditing(null);
    if (!error) addToast('Cuota guardada');
    else addToast(error.message || 'Error al guardar', 'error');
  }

  async function handleRemove(id) {
    setDeleting(id);
    const { error } = await onRemove(id);
    setDeleting(null);
    if (!error) addToast('Cuota eliminada');
    else addToast(error.message || 'Error al eliminar', 'error');
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr><th>Vigencia</th><th>Tramo</th><th>Aportes</th><th>Contribuciones</th><th>ART</th><th>Fuente</th><th className="text-end">Acciones</th></tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr><td colSpan="7" className="text-center text-muted">No hay cuotas cargadas.</td></tr>
          ) : (
            [...rates].sort((a, b) => (b.vigencia_desde || '').localeCompare(a.vigencia_desde || '')).map((r) => (
              <tr key={r.id}>
                {editing && editing.id === r.id ? (
                  <td colSpan="7"><ContributionForm rate={r} onSave={handleSave} onCancel={() => setEditing(null)} /></td>
                ) : (
                  <>
                    <td>{dateES(r.vigencia_desde)}</td>
                    <td>{tramoLabel[r.tramo]}</td>
                    <td>{r.aportes}</td>
                    <td>{r.contribuciones}</td>
                    <td>{r.art}</td>
                    <td className="text-muted small">{r.fuente || '-'}</td>
                    <td className="text-end">
                      {deleting === r.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(r)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(r.id)}>Borrar</button>
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