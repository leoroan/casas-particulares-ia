import { useState } from 'react';

export default function HouseForm({ house, onSave, onCancel }) {
  const [alias, setAlias] = useState(house ? house.alias : '');
  const [direccion, setDireccion] = useState(house ? house.direccion : '');
  const [notas, setNotas] = useState(house ? house.notas : '');

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { alias, direccion, notas };
    if (house) payload.id = house.id;
    onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{house ? 'Editar casa' : 'Nueva casa'}</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Alias</label>
            <input
              type="text" className="form-control" required
              value={alias} onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej. Casa de la abuela"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Dirección</label>
            <input
              type="text" className="form-control"
              value={direccion} onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea
            className="form-control" rows={2}
            value={notas} onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{house ? 'Guardar cambios' : 'Crear casa'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}