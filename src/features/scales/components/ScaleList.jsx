import { useState } from 'react';
import { CATEGORIAS } from '../../employees/api.js';
import { dateES } from '../../../lib/format.js';

export default function ScaleList({ scales, onSave, onRemove }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  async function handleSave(scale) {
    const { data, error } = await onSave(scale);
    setEditing(null);
    if (!error) addToast('Escala guardada');
    else addToast(error.message || 'Error al guardar', 'error');
  }

  async function handleRemove(id) {
    setDeleting(id);
    const { error } = await onRemove(id);
    setDeleting(null);
    if (!error) addToast('Escala eliminada');
    else addToast(error.message || 'Error al eliminar', 'error');
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr><th>Vigencia</th><th>Categoría</th><th>Retiro</th><th>Valor hora</th><th>Valor mensual</th><th>Fuente</th><th className="text-end">Acciones</th></tr>
        </thead>
        <tbody>
          {scales.length === 0 ? (
            <tr><td colSpan="7" className="text-center text-muted">No hay escalas cargadas.</td></tr>
          ) : (
            [...scales].sort((a, b) => (b.vigencia_desde || '').localeCompare(a.vigencia_desde || '')).map((s) => (
              <tr key={s.id}>
                {editing && editing.id === s.id ? (
                  <td colSpan="7"><ScaleForm scale={s} onSave={handleSave} onCancel={() => setEditing(null)} /></td>
                ) : (
                  <>
                    <td>{dateES(s.vigencia_desde)}</td>
                    <td>{s.categoria}</td>
                    <td>{s.con_retiro ? 'Sí' : 'No'}</td>
                    <td>{s.valor_hora}</td>
                    <td>{s.valor_mensual}</td>
                    <td className="text-muted small">{s.fuente || '-'}</td>
                    <td className="text-end">
                      {deleting === s.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(s)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(s.id)}>Borrar</button>
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