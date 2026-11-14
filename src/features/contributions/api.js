import { adapter } from '../../lib/storageAdapter.js';

export const TRAMOS = [
  { value: 'hasta12', label: 'Hasta 12 hs/semana' },
  { value: '12a16', label: 'De 12 a 16 hs/semana' },
  { value: 'mas16', label: 'Más de 16 hs/semana' }
];

export const contributionsApi = {
  list: () => adapter.getContributionRates(),
  save: (rate) => adapter.saveContributionRate(rate),
  remove: (id) => adapter.deleteContributionRate(id)
};