import { adapter } from '../../lib/storageAdapter.js';

export const dashboardApi = {
  listSettlements: () => adapter.getSettlements(),
  listEmployees: () => adapter.getEmployees(),
  getSalaryScales: () => adapter.getSalaryScales(),
  getProfile: () => adapter.getProfile()
};