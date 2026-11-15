import { useState } from 'react';
import { useHouses } from '../hooks.js';
import HouseForm from '../components/HouseForm.jsx';
import HouseList from '../components/HouseList.jsx';

export default function HousesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: houses, loading, error, save, remove } = useHouses();

  if (loading) return <div className="text-center py-5">Cargando casas...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Casas</h2>
        <button className="btn btn-cp" onClick={() => setShowForm(true)}>+ Nueva casa</button>
      </div>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <HouseForm
              house={null}
              onSave={async (p) => {
                await save(p);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      <HouseList houses={houses} onSave={save} onRemove={remove} />
    </>
  );
}
