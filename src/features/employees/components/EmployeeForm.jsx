import { useState } from 'react';
import { CATEGORIAS, DIAS_SEMANA } from '../api.js';

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [form, setForm] = useState({
    nombre: employee ? employee.nombre : '',
    cuil: employee ? employee.cuil : '',
    fecha_ingreso: employee ? employee.fecha_ingreso : '',
    categoria: employee ? employee.categoria : CATEGORIAS[0],
    con_retiro: employee ? employee.con_retiro : true,
    horas_dia: employee ? String(employee.horas_dia || 4) : '4',
    valor_hora_override: employee ? String(employee.valor_hora_override || '') : '',
    valor_mensual_override: employee ? String(employee.valor_mensual_override || '') : '',
    zona_desfavorable: employee ? employee.zona_desfavorable : false,
    activo: employee ? employee.activo : true,
    notas: employee ? employee.notas : ''
  });
  const [dias, setDias] = useState(employee ? (employee.dias_semana || []) : []);

  function toggleDia(v) {
    setDias((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      horas_dia: Number(form.horas_dia || 0),
      valor_hora_override: form.valor_hora_override === '' ? null : Number(form.valor_hora_override),
      valor_mensual_override: form.valor_mensual_override === '' ? null : Number(form.valor_mensual_override),
      dias_semana: dias
    };
    if (employee) payload.id = employee.id;
    onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{employee ? 'Editar empleada' : 'Nueva empleada'}</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nombre</label>
            <input type="text" className="form-control" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">CUIL</label>
            <input type="text" className="form-control" value={form.cuil} onChange={(e) => setForm({ ...form, cuil: e.target.value })} placeholder="20-12345678-9" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Fecha de ingreso</label>
            <input type="date" className="form-control" value={form.fecha_ingreso} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Categoría</label>
            <select className="form-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Horas por d&iacute;a</label>
            <input type="number" className="form-control" value={form.horas_dia} onChange={(e) => setForm({ ...form, horas_dia: e.target.value })} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="d-flex align-items-center mb-2">
              <input className="form-check-input me-2" type="checkbox" checked={form.con_retiro} onChange={(e) => setForm({ ...form, con_retiro: e.target.checked })} />
              <label className="form-label mb-0">Con retiro</label>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="d-flex align-items-center mb-2">
              <input className="form-check-input me-2" type="checkbox" checked={form.zona_desfavorable} onChange={(e) => setForm({ ...form, zona_desfavorable: e.target.checked })} />
              <label className="form-label mb-0">Zona desfavorable</label>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="d-flex align-items-center mb-2">
              <input className="form-check-input me-2" type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              <label className="form-label mb-0">Activa</label>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">D&iacute;as de la semana</label>
          <div className="d-flex flex-wrap gap-2">
            {DIAS_SEMANA.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`btn btn-sm ${dias.includes(d.value) ? 'btn-cp' : 'btn-outline-secondary'}`}
                onClick={() => toggleDia(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="form-text">Seleccioná los días laborales habituales.</div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Valor hora (override opcional)</label>
            <input type="number" className="form-control" value={form.valor_hora_override || ''} onChange={(e) => setForm({ ...form, valor_hora_override: e.target.value })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Valor mensual (override opcional)</label>
            <input type="number" className="form-control" value={form.valor_mensual_override || ''} onChange={(e) => setForm({ ...form, valor_mensual_override: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Notas</label>
          <textarea className="form-control" rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{employee ? 'Guardar cambios' : 'Crear empleada'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
