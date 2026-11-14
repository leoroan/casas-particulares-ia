import { adapter } from '../../lib/storageAdapter.js';

export const holidaysApi = {
  list: () => adapter.getHolidays(),
  save: (holiday) => adapter.saveHoliday(holiday),
  remove: (id) => adapter.deleteHoliday(id)
};