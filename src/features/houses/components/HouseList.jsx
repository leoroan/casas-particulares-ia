import { useState } from 'react';

export default function HouseList({ houses, onSave, onRemove }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [undo, setUndo] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  async function handleSave(house) {
    const { data, error } = await onSave(house);
    setEditing(null);
    if (!error) addToast('Casa guardada');
    else addToast(error.message || 'Error al guardar', 'error');
    return data;
  }

  async function handleRemove(id) {
    setDeleting(id);
    const snapshot = houses.find((h) => h.id === id);
    const { error } = await onRemove(id);
    if (!error) {
      addToast('Casa eliminada', 'success');
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
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Alias</th><th>Direcci&oacute;n</th><th>Notas</th><th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((h) => (
              <tr key={h.id}>
                {editing && editing.id === h.id ? (
                  <>
                    <td colSpan="4">
                      <HouseForm house={h} onSave={handleSave} onCancel={() => setEditing(null)} />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{h.alias}</td>
                    <td>{h.direccion || '-'}</td>
                    <td className="text-muted small">{h.notas || '-'}</td>
                    <td className="text-end">
                      {deleting === h.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(h)}>Editar</button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemove(h.id)}
                          >Borrar</button>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {houses.length === 0 && (
        <div className="text-center text-muted py-4">No hay casas cargadas.</div>
      )}
      {undo && (
        <div className="alert alert-info d-flex align-items-center mb-3">
          Casa eliminada. <button className="btn btn-sm btn-outline-primary ms-2" onClick={restore}>Deshacer</button>
        </div>
      )}
    </>
  );
}