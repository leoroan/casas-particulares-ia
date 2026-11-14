import { useHistory } from '../hooks.js';
import HistoryList from '../components/HistoryList.jsx';

export default function HistoryPage() {
  const { settlements, employees, houses, loading, filters, setFilters, exportCSV } = useHistory();
  if (loading) return <div className="text-center py-5">Cargando historial...</div>;
  return (
    <div className="mb-4">
      <h2>Historial de liquidaciones</h2>
      <p className="text-muted">Filtros por empleada, casa y rango de meses. Exportá el libro de sueldos a CSV.</p>
      <HistoryList settlements={settlements} employees={employees} houses={houses} filters={{ ...filters, setQ: setFilters ? (f) => setFilters(f) : null }} onExportCSV={exportCSV} />
    </div>
  );
}