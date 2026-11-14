import { adapter } from '../../lib/storageAdapter.js';
import { realSeniorityYears } from '../../domain/seniority.js';
import { vacationDaysBySeniority } from '../../domain/vacations.js';

export const leavesApi = {
  list: () => adapter.getLeaves(),
  save: (leave) => adapter.saveLeave(leave),
  remove: (id) => adapter.deleteLeave(id),
  vacationBalance: (employee, allLeaves) => {
    const anos = realSeniorityYears(employee.fecha_ingreso, new Date().toISOString().slice(0, 10));
    const total = vacationDaysBySeniority(anos);
    const tomadas = (allLeaves || [])
      .filter((l) => l.employee_id === employee.id && l.tipo === 'vacaciones' && l.pagada)
      .reduce((acc, l) => acc + (l.dias || 0), 0);
    return { anos, total, tomadas, disponibles: Math.max(0, total - tomadas) };
  }
};