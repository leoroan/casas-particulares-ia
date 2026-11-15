import { useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from '../hooks.js';
import EmployeeDrawer from '../components/EmployeeDrawer.jsx';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employees, loading, error } = useEmployees();

  if (loading) return <div className="text-center py-5">Cargando...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;
  const emp = employees.find((e) => e.id === id);
  if (!emp) return <div className="text-center text-danger py-5">Empleada no encontrada.</div>;

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Detalle: {emp.nombre}</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/empleados')}>Volver</button>
      </div>
      <EmployeeDrawer employee={emp} onClose={() => navigate('/empleados')} />
    </div>
  );
}