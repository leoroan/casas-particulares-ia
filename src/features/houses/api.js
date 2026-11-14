import { adapter } from '../../lib/storageAdapter.js';

export const housesApi = {
  list: () => adapter.getHouses(),
  save: (house) => adapter.saveHouse(house),
  remove: (id) => adapter.deleteHouse(id)
};