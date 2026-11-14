import { useState } from 'react';
import { useLeaves } from '../hooks.js';
import LeaveForm from '../components/LeaveForm.jsx';
import LeaveList from '../components/LeaveList.jsx';

export default function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState(null);
  const { data: leaves, employees, loading, error, save, remove } = useLeaves();

  if (loading) return <div className="text-center py-5">Cargando licencias...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Licencias</h2>
        <button className="btn btn-cp" onClick={() => { setNewLeave(null); setShowForm(true); }}>+ Nueva licencia</button>
      </div>
      <p className="text-muted small">Registrá vacaciones, enfermedad, maternidad y especiales. El saldo de vacaciones se calcula con la antigüedad real.</p>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <LeaveForm leave={null} employees={employees} onSave={async (p) => { await save(p); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <LeaveList leaves={leaves} employees={employees} onSave={handleSave} onRemove={remove} />
    </div>
  );

  function handleSave(l) {
    save(l);
  }
}