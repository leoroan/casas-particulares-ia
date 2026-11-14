import { useState } from 'react';
import { useHolidays } from '../hooks.js';
import HolidayForm from '../components/HolidayForm.jsx';
import HolidayList from '../components/HolidayList.jsx';

export default function HolidaysPage() {
  const [showForm, setShowForm] = useState(false);
  const [newHol, setNewHol] = useState(null);
  const { data: holidays, loading, error, save, remove } = useHolidays();

  if (loading) return <div className="text-center py-5">Cargando feriados...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Feriados</h2>
        <button className="btn btn-cp" onClick={() => { setNewHol(null); setShowForm(true); }}>+ Nuevo feriado</button>
      </div>
      <p className="text-muted small">Viene precargado con feriados de Argentina 2025-2027. Editable para añadir regionales o no laborables.</p>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <HolidayForm holiday={null} onSave={async (p) => { await save(p); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <HolidayList holidays={holidays} onSave={handleSave} onRemove={remove} />
    </div>
  );

  function handleSave(h) {
    save(h);
  }
}