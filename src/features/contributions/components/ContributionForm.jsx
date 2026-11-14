import { useState } from 'react';
import { TRAMOS } from '../api.js';

export default function ContributionForm({ rate, onSave, onCancel }) {
  const [form, setForm] = useState({
    vigenciaDesde: rate ? rate.vigenciaDesde : '',
    tramo: rate ? rate.tramo : 'hasta12',
    aportes: rate ? String(rate.aportes || '') : '',
    contribuciones: rate ? String(rate.contribuciones || '') : '',
    art: rate ? String(rate.art || '') : '',
    fuente: rate ? rate.fuente : ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      aportes: Number(form.aportes || 0),
      contribuciones: Number(form.contribuciones || 0),
      art: Number(form.art || 0),
      ...(rate ? { id: rate.id } : {})
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header"><h5 className="mb-0">{rate ? 'Editar cuota' : 'Nueva cuota de referencia'}</h5></div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3 mb-3">
            <label className="form-label">Vigencia desde</label>
            <input type="month" className="form-control" value={form.vigenciaDesde} onChange={(e) => setForm({ ...form, vigenciaDesde: e.target.value ? e.target.value + '-01' : '' })} required />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Tramo de hs/semana</label>
            <select className="form-select" value={form.tramo} onChange={(e) => setForm({ ...form, tramo: e.target.value })}>
              {TRAMOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Aportes</label>
            <input type="number" className="form-control" value={form.aportes} onChange={(e) => setForm({ ...form, aportes: e.target.value })} />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Contribuciones</label>
            <input type="number" className="form-control" value={form.contribuciones} onChange={(e) => setForm({ ...form, contribuciones: e.target.value })} />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">ART</label>
            <input type="number" className="form-control" value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Fuente</label>
          <input type="text" className="form-control" value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value })} />
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-cp">{rate ? 'Guardar' : 'Agregar cuota'}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}