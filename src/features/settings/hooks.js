import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from './api.js';
import { CONFIG } from '../../config.js';

const DEFAULTS = {
  divisorProporcional: CONFIG.divisorProporcional,
  porcentajeAntiguedad: CONFIG.porcentajeAntiguedad,
  porcentajeZona: CONFIG.porcentajeZona,
  recargoExtra50: CONFIG.recargoExtra50,
  recargoExtra100: CONFIG.recargoExtra100,
  mesAlertaEscala: CONFIG.mesAlertaEscala,
  diaVencimientoCuotas: CONFIG.diaVencimientoCuotas
};

export function useSettings() {
  const [settings, setSettings] = useState({ ...DEFAULTS });
  const [profile, setProfile] = useState({ nombre: '', cuit: '', domicilio: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [st, pr] = await Promise.all([settingsApi.getSettings(), settingsApi.getProfile()]);
        if (mounted) {
          // Los adaptadores devuelven { data, error }; hay que desenvolver .data antes de usar
          setSettings({ ...DEFAULTS, ...(st?.data?.datos || {}) });
          setProfile(pr?.data || { nombre: '', cuit: '', domicilio: '' });
          setError(st?.error?.message || pr?.error?.message || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const saveSettings = useCallback(async (datos) => {
    const { data, error: err } = await settingsApi.saveSettings(datos);
    if (!err) setSettings({ ...DEFAULTS, ...datos });
    return { data, error: err };
  }, []);

  const saveProfile = useCallback(async (p) => {
    const { data, error: err } = await settingsApi.saveProfile(p);
    if (!err) setProfile(p);
    return { data, error: err };
  }, []);

  const exportData = useCallback(async () => {
    return await settingsApi.exportData();
  }, []);

  const importData = useCallback(async (json) => {
    return await settingsApi.importData(json);
  }, []);

  return { settings, profile, loading, error, saveSettings, saveProfile, exportData, importData };
}