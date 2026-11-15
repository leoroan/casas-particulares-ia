import { useState } from 'react';
import { useScales } from '../hooks.js';
import ScaleForm from '../components/ScaleForm.jsx';
import ScaleList from '../components/ScaleList.jsx';

export default function ScalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [newScale, setNewScale] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const { data: scales, loading, error, save, remove } = useScales();

  if (loading) return <div className="text-center py-5">Cargando escalas...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Escalas salariales</h2>
        <button className="btn btn-cp" onClick={() => { setNewScale(null); setSaveError(null); setShowForm(true); }}>+ Nueva escala</button>
      </div>
      <p className="text-muted small">Las escalas listadas corresponden a la sesión actual. Cada una guarda fecha de vigencia, categoría, con/sin retiro y fuente; nunca se sobrescriben valores históricos.</p>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            {saveError && <div className="alert alert-danger" role="alert">{saveError}</div>}
            <ScaleForm
              scale={newScale}
              onSave={async (payload) => {
                const { error: err } = await save(payload);
                if (err) {
                  setSaveError(err.message || 'No se pudo guardar la escala.');
                  return;
                }
                setSaveError(null);
                setShowForm(false);
              }}
              onCancel={() => { setSaveError(null); setShowForm(false); }}
            />
          </div>
        </div>
      )}
      <h5 className="mb-3">Escalas cargadas ({scales.length})</h5>
      <ScaleList scales={scales} onSave={handleSave} onRemove={remove} />
    </div>
  );

  function handleSave(scale) {
    return save(scale);
  }
}