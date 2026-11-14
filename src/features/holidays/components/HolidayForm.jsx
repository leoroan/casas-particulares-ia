import { useState } from 'react';

export default function HolidayForm({ holiday, onSave, onCancel }) {
  const [form, setForm] = useState({
    fecha: holiday ? holiday.fecha : '',
    descripcion: holiday ? holiday.descripcion : ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, ...(holiday ? { id: holiday.id } : {}) });
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header"><h5 className="mb-0">{holiday ? 'Editar feriado' : 'Nuevo feriado'}</h5></div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Descripción</label>
            <input type="text" className="form-control" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{holiday ? 'Guardar' : 'Agregar feriado'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}