import { useParams } from 'react-router-dom';
import { useEmployees } from '../hooks.js';
import EmployeeDrawer from '../components/EmployeeDrawer.jsx';
import { useState } from 'react';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [open, setOpen] = useState(true);
  const { data: employees, loading, error } = useEmployees();

  if (loading) return <div className="text-center py-5">Cargando...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;
  const emp = employees.find((e) => e.id === id);
  if (!emp) return <div className="text-center text-danger py-5">Empleada no encontrada.</div>;

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Detalle: {emp.nombre}</h2>
        <a href="/empleados" className="btn btn-outline-secondary">Volver</a>
      </div>
      <EmployeeDrawer employee={emp} onClose={() => setOpen(false)} />
    </div>
  );
}