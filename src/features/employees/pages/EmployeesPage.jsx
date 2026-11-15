import { useState } from 'react';
import { useEmployees } from '../hooks.js';
import EmployeeForm from '../components/EmployeeForm.jsx';
import EmployeeList from '../components/EmployeeList.jsx';
import EmployeeDrawer from '../components/EmployeeDrawer.jsx';

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const { data: employees, loading, error, save } = useEmployees();

  if (loading) return <div className="text-center py-5">Cargando empleadas...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  async function handleSave(employee) {
    const result = await save(employee);
    if (!result.error) {
      setShowForm(false);
      setEditingEmployee(null);
    }
    return result;
  }

  function openNewEmployeeForm() {
    setViewingEmployee(null);
    setEditingEmployee(null);
    setShowForm(true);
  }

  function openEditEmployeeForm(employee) {
    setViewingEmployee(null);
    setShowForm(false);
    setEditingEmployee(employee);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEmployee(null);
  }

  function openEmployeeDetail(id) {
    setShowForm(false);
    setEditingEmployee(null);
    setViewingEmployee(employees.find((employee) => employee.id === id) || null);
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Empleadas</h2>
        <button className="btn btn-cp" onClick={openNewEmployeeForm}>+ Nueva empleada</button>
      </div>
      {(showForm || editingEmployee) && (
        <div className="card mb-3">
          <div className="card-body">
            <EmployeeForm employee={editingEmployee} onSave={handleSave} onCancel={closeForm} />
          </div>
        </div>
      )}
      <EmployeeList
        employees={employees}
        onSave={save}
        onEdit={openEditEmployeeForm}
        onView={openEmployeeDetail}
      />
      {viewingEmployee && <EmployeeDrawer employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />}
    </>
  );
}