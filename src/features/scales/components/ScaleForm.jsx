import { useState } from 'react';
import { CATEGORIAS } from '../../employees/api.js';

export default function ScaleForm({ scale, onSave, onCancel }) {
  const [form, setForm] = useState({
    vigencia_desde: scale ? (scale.vigencia_desde || '').slice(0, 7) : '',
    categoria: scale ? scale.categoria : CATEGORIAS[0],
    conRetiro: scale ? scale.con_retiro : true,
    valorHora: scale ? String(scale.valor_hora || '') : '',
    valorMensual: scale ? String(scale.valor_mensual || '') : '',
    fuente: scale ? scale.fuente : ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      vigencia_desde: form.vigencia_desde ? `${form.vigencia_desde}-01` : '',
      categoria: form.categoria,
      valor_hora: Number(form.valorHora || 0),
      valor_mensual: Number(form.valorMensual || 0),
      con_retiro: form.conRetiro,
      fuente: form.fuente,
      ...(scale ? { id: scale.id } : {})
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header"><h5 className="mb-0">{scale ? 'Editar escala' : 'Nueva escala de referencia'}</h5></div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3 mb-3">
            <label className="form-label">Vigencia desde</label>
            <input type="month" className="form-control" value={form.vigencia_desde} onChange={(e) => setForm({ ...form, vigencia_desde: e.target.value })} required />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Categoría</label>
            <select className="form-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <div className="d-flex align-items-center">
              <input className="form-check-input me-2" type="checkbox" checked={form.conRetiro} onChange={(e) => setForm({ ...form, conRetiro: e.target.checked })} />
              <label className="form-label mb-0">Con retiro</label>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-3">
            <label className="form-label">Valor hora</label>
            <input type="number" className="form-control" value={form.valorHora} onChange={(e) => setForm({ ...form, valorHora: e.target.value })} />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Valor mensual</label>
            <input type="number" className="form-control" value={form.valorMensual} onChange={(e) => setForm({ ...form, valorMensual: e.target.value })} />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Fuente</label>
            <input type="text" className="form-control" value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{scale ? 'Guardar' : 'Agregar escala'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}