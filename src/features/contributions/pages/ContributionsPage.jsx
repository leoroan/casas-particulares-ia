import { useState } from 'react';
import { useContributions } from '../hooks.js';
import ContributionForm from '../components/ContributionForm.jsx';
import ContributionList from '../components/ContributionList.jsx';

export default function ContributionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [newRate, setNewRate] = useState(null);
  const { data: rates, loading, error, save, remove } = useContributions();

  if (loading) return <div className="text-center py-5">Cargando cuotas...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Cuotas del régimen simplificado</h2>
        <button className="btn btn-cp" onClick={() => { setNewRate(null); setShowForm(true); }}>+ Nueva cuota</button>
      </div>
      <p className="text-muted small">Aportes (descuento al empleado), contribuciones y ART (costo empleador informativo). Por tramo de horas semanales.</p>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <ContributionForm rate={null} onSave={async (p) => { await save(p); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <ContributionList rates={rates} onSave={handleSave} onRemove={remove} />
    </div>
  );

  function handleSave(rate) {
    save(rate);
  }
}