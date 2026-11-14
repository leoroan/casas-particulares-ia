import { adapter } from '../../lib/storageAdapter.js';

export const scalesApi = {
  list: () => adapter.getSalaryScales(),
  save: (scale) => adapter.saveSalaryScale(scale),
  remove: (id) => adapter.deleteSalaryScale(id)
};