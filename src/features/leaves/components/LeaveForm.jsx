import { useState } from 'react';
import { dateES } from '../../../lib/format.js';

const TIPOS = [
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'maternidad', label: 'Maternidad' },
  { value: 'especial', label: 'Licencia especial' }
];

export default function LeaveForm({ leave, employees, onSave, onCancel }) {
  const [form, setForm] = useState({
    employee_id: leave ? leave.employee_id : (employees[0]?.id || ''),
    tipo: leave ? leave.tipo : 'vacaciones',
    desde: leave ? leave.desde : '',
    hasta: leave ? leave.hasta : '',
    dias: leave ? String(leave.dias || '') : '',
    pagada: leave !== false ? (leave ? leave.pagada : true) : true,
    notas: leave ? leave.notas : ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, dias: Number(form.dias || 0), ...(leave ? { id: leave.id } : {}) });
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header"><h5 className="mb-0">{leave ? 'Editar licencia' : 'Nueva licencia'}</h5></div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Empleada</label>
            <select className="form-select" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
              {(employees || []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" value={form.desde} onChange={(e) => setForm({ ...form, desde: e.target.value })} required />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-control" value={form.hasta} onChange={(e) => setForm({ ...form, hasta: e.target.value })} required />
          </div>
        </div>
        <div className="row">
          <div className="col-md-2 mb-3">
            <label className="form-label">Días</label>
            <input type="number" className="form-control" value={form.dias} onChange={(e) => setForm({ ...form, dias: e.target.value })} />
          </div>
          <div className="col-md-2 mb-3">
            <div className="d-flex align-items-center">
              <input className="form-check-input me-2" type="checkbox" checked={form.pagada} onChange={(e) => setForm({ ...form, pagada: e.target.checked })} />
              <label className="form-label mb-0">Pagada</label>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea className="form-control" rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{leave ? 'Guardar' : 'Registrar licencia'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}