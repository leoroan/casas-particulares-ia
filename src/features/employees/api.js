import { adapter } from '../../lib/storageAdapter.js';

export const CATEGORIAS = [
  'Personal para tareas generales',
  'Asistencia y cuidado de personas',
  'Caseros/as',
  'Supervisor/a',
  'Personal para tareas específicas'
];

export const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
];

export const employeesApi = {
  list: () => adapter.getEmployees(),
  save: (employee) => adapter.saveEmployee(employee),
  getAssignments: () => adapter.getAssignments(),
  getSettlements: () => adapter.getSettlements(),
  getLeaves: () => adapter.getLeaves()
};