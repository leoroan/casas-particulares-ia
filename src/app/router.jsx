import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers.jsx';
import AppLayout from './AppLayout.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import EmployeesPage from '../features/employees/pages/EmployeesPage';
import EmployeeDetailPage from '../features/employees/pages/EmployeeDetailPage';
import HousesPage from '../features/houses/pages/HousesPage';
import SettlementsWizardPage from '../features/settlements/pages/SettlementsWizardPage';
import SettlementDetailPage from '../features/settlements/pages/SettlementDetailPage';
import HistoryPage from '../features/history/pages/HistoryPage';
import ScalesPage from '../features/scales/pages/ScalesPage';
import ContributionsPage from '../features/contributions/pages/ContributionsPage';
import HolidaysPage from '../features/holidays/pages/HolidaysPage';
import LeavesPage from '../features/leaves/pages/LeavesPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
      { path: 'empleados', element: <EmployeesPage /> },
      { path: 'empleados/:id', element: <EmployeeDetailPage /> },
      { path: 'casas', element: <HousesPage /> },
      { path: 'liquidar', element: <SettlementsWizardPage /> },
      { path: 'liquidaciones/:id', element: <SettlementDetailPage /> },
      { path: 'historial', element: <HistoryPage /> },
      { path: 'escalas', element: <ScalesPage /> },
      { path: 'cuotas', element: <ContributionsPage /> },
      { path: 'feriados', element: <HolidaysPage /> },
      { path: 'licencias', element: <LeavesPage /> },
      { path: 'ajustes', element: <SettingsPage /> }
    ]
  }
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}