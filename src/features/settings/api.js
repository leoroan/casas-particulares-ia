import { adapter } from '../../lib/storageAdapter.js';

export const settingsApi = {
  getSettings: () => adapter.getSettings(),
  saveSettings: (datos) => adapter.saveSettings({ datos }),
  getProfile: () => adapter.getProfile(),
  saveProfile: (profile) => adapter.saveProfile(profile),
  exportData: () => adapter.exportData(),
  importData: (json) => adapter.importData(json)
};