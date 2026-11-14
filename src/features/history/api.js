import { settlementsApi } from '../settlements/api.js';
import { employeesApi } from '../employees/api.js';
import { housesApi } from '../houses/api.js';

export const historyApi = {
  listSettlements: settlementsApi.list,
  listEmployees: employeesApi.list,
  listHouses: housesApi.list
};