import { adapter } from '../../lib/storageAdapter.js';

export const settlementsApi = {
  list: () => adapter.getSettlements(),
  save: (settlement) => adapter.saveSettlement(settlement),
  remove: (id) => adapter.deleteSettlement(id),
  getLines: (settlementId) => adapter.getSettlementLines(settlementId),
  saveLine: (line) => adapter.saveSettlementLine(line),
  removeLine: (id) => adapter.deleteSettlementLine(id)
};