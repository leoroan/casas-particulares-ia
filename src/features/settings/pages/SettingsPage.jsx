import { useState } from 'react';
import { useSettings } from '../hooks.js';

export default function SettingsPage() {
  const {
    settings, profile, loading, error,
    saveSettings, saveProfile, exportData, importData
  } = useSettings();
  const [imp, setImp] = useState('');
  const [impMsg, setImpMsg] = useState('');

  if (loading) return <div className="text-center py-5">Cargando ajustes...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="mb-4">
      <h2>Ajustes</h2>

      <div className="card mb-4">
        <div className="card-header"><h6 className="mb-0">Datos del empleador</h6></div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); saveProfile(profile); }} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre / Razón social</label>
              <input type="text" className="form-control" value={profile.nombre || ''} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">CUIT</label>
              <input type="text" className="form-control" value={profile.cuit || ''} onChange={(e) => setProfile({ ...profile, cuit: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Domicilio</label>
              <input type="text" className="form-control" value={profile.domicilio || ''} onChange={(e) => setProfile({ ...profile, domicilio: e.target.value })} />
            </div>
            <div className="col-12">
              <button className="btn btn-cp" type="submit">Guardar datos del empleador</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><h6 className="mb-0">Parámetros del régimen (Ley 26.844)</h6></div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); saveSettings(settings); }} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Divisor proporcional</label>
              <input type="number" className="form-control" value={settings.divisorProporcional} onChange={(e) => setSettings({ ...settings, divisorProporcional: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">% Antigüedad</label>
              <input type="number" className="form-control" value={settings.porcentajeAntiguedad} onChange={(e) => setSettings({ ...settings, porcentajeAntiguedad: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">% Zona desfavorable</label>
              <input type="number" className="form-control" value={settings.porcentajeZona} onChange={(e) => setSettings({ ...settings, porcentajeZona: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Meses alerta escala</label>
              <input type="number" className="form-control" value={settings.mesAlertaEscala} onChange={(e) => setSettings({ ...settings, mesAlertaEscala: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Día vencimiento cuotas</label>
              <input type="number" className="form-control" value={settings.diaVencimientoCuotas} onChange={(e) => setSettings({ ...settings, diaVencimientoCuotas: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Recargo extra 50%</label>
              <input type="number" className="form-control" value={settings.recargoExtra50} onChange={(e) => setSettings({ ...settings, recargoExtra50: Number(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Recargo extra 100%</label>
              <input type="number" className="form-control" value={settings.recargoExtra100} onChange={(e) => setSettings({ ...settings, recargoExtra100: Number(e.target.value) })} />
            </div>
            <div className="col-12">
              <button className="btn btn-cp" type="submit">Guardar parámetros</button>
            </div>
          </form>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header"><h6 className="mb-0">Exportar / Importar datos (JSON)</h6></div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6 d-grid">
              <button className="btn btn-outline-primary" onClick={handleExport}>Exportar todo a JSON</button>
            </div>
            <div className="col-md-6">
              <input type="file" className="form-control" onChange={(e) => { setImp(e.target.files?.[0] || ''); }} accept=".json" />
            </div>
            <div className="col-md-6 d-grid">
              <button className="btn btn-outline-secondary" onClick={handleImport} disabled={!imp}>Importar JSON</button>
            </div>
            <div className="col-md-6">{impMsg && <div className={`alert alert-${impMsg.startsWith('Error') ? 'danger' : 'success'}`}>{impMsg}</div>}</div>
          </div>
          <div className="form-text">Importar reemplaza los datos actuales con los del archivo JSON.</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body border-top">
          <p className="small text-muted mb-0">
            <strong>Aviso legal:</strong> Valores de referencia. Verificar escalas y cuotas vigentes en ARCA y la
            Comisi&oacute;n Nacional de Trabajo en Casas Particulares.
          </p>
        </div>
      </div>
    </div>
  );

  async function handleExport() {
    const { data, error } = await exportData();
    if (error) { setImpMsg('Error al exportar: ' + error.message); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casas-particulares-respaldo.json';
    a.click();
  }

  async function handleImport() {
    if (!imp) return;
    const text = await imp.text();
    const { data, error } = await importData(text);
    if (error) { setImpMsg('Error al importar: ' + error.message); return; }
    setImpMsg('Datos importados correctamente.');
    setImp('');
    setTimeout(() => window.location.reload(), 800);
  }
}