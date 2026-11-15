import { useState } from 'react';
import { useEmployees } from '../hooks.js';
import EmployeeForm from '../components/EmployeeForm.jsx';
import EmployeeList from '../components/EmployeeList.jsx';
import EmployeeDrawer from '../components/EmployeeDrawer.jsx';

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [newEmp, setNewEmp] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);
  const { data: employees, loading, error, save, remove } = useEmployees();

  if (loading) return <div className="text-center py-5">Cargando empleadas...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  const emp = viewEmp || employees.find((e) => e.id === viewId);

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Empleadas</h2>
        <button className="btn btn-cp" onClick={() => { setNewEmp(null); setShowForm(true); }}>+ Nueva empleada</button>
      </div>
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <EmployeeForm employee={null} onSave={async (p) => { await save(p); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <EmployeeList employees={employees} onSave={save} onRemove={remove} onView={(id) => { setViewId(id); setViewEmp(employees.find((e) => e.id === id)); }} />
      {emp && <EmployeeDrawer employee={emp} onClose={() => { setViewId(null); setViewEmp(null); }} />}
    </>
  );
}