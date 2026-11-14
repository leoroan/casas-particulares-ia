import { useState } from 'react';
import { money } from '../../../lib/format.js';

export default function Step3Review({ employees, calcs, onClose, onBack }) {
  const [mode, setMode] = useState('cerrada'); // borrador | cerrada
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const totalBruto = calcs.reduce((s, c) => s + c.bruto, 0);
  const totalNeto = calcs.reduce((s, c) => s + c.neto, 0);
  const totalAportes = calcs.reduce((s, c) => s + c.aportes, 0);

  async function handleClose() {
    setSaving(true);
    try {
      await onClose(mode);
      setMessage(`Liquidación ${mode === 'cerrada' ? 'cerrada' : 'guardada como borrador'} correctamente.`);
    } catch (e) {
      setMessage('Error al guardar: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Paso 3 de 3 — Revisar totales y cerrar</h5>
        <div className="table-responsive mb-3">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Empleada</th><th>Modalidad</th><th>Hs</th><th>Bruto</th><th>Aportes</th><th>Neto</th></tr>
            </thead>
            <tbody>
              {calcs.map((c) => (
                <tr key={c.employeeId}>
                  <td>{c.employeeNombre}</td>
                  <td><span className={`badge ${c.modality === 'mensual' ? 'bg-primary' : 'bg-secondary'}`}>{c.modality}</span></td>
                  <td>{c.totalHours}</td>
                  <td>{money(c.bruto)}</td>
                  <td>{money(c.aportes)}</td>
                  <td className="fw-bold">{money(c.neto)}</td>
                </tr>
              ))}
              <tr className="fw-bold border-top"><td colSpan="3" className="text-end">Total</td><td>{money(totalBruto)}</td><td>{money(totalAportes)}</td><td>{money(totalNeto)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-2">
              <input className="form-check-input me-2" type="radio" name="mode" value="borrador" checked={mode === 'borrador'} onChange={() => setMode('borrador')} />
              <label className="form-label mb-0">Guardar como borrador</label>
            </div>
            <div className="d-flex align-items-center">
              <input className="form-check-input me-2" type="radio" name="mode" value="cerrada" checked={mode === 'cerrada'} onChange={() => setMode('cerrada')} />
              <label className="form-label mb-0">Cerrar liquidación (inmutable)</label>
            </div>
            <div className="form-text small">Una vez cerrada, no se recalcula si cambian escalas o cuotas.</div>
          </div>
          <div className="col-md-6 d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-outline-secondary" onClick={onBack}>← Volver a tarjetas</button>
            <button className="btn btn-cp" disabled={saving} onClick={handleClose}>
              {saving ? 'Guardando...' : mode === 'cerrada' ? 'Cerrar liquidación' : 'Guardar borrador'}
            </button>
          </div>
        </div>
        {message && <div className={`alert alert-${message.includes('Error') ? 'danger' : 'success'}`}>{message}</div>}
      </div>
    </div>
  );
}