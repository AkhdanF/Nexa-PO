// Hook: useSettings
import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config/app.js';
import {
  testAppsScriptConnection,
  getOfflineQueue,
  syncOfflineQueue,
  clearOfflineQueue,
} from '../services/googleSheets.js';

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKeys.SETTINGS);
      if (saved) {
        return { ...APP_CONFIG.defaultSettings, ...JSON.parse(saved) };
      }
      return APP_CONFIG.defaultSettings;
    } catch {
      return APP_CONFIG.defaultSettings;
    }
  });

  const [offlineQueueCount, setOfflineQueueCount] = useState(() => getOfflineQueue().length);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(() => {
    const url = settings.googleAppsScriptUrl;
    if (!url) return 'unconfigured'; // 'unconfigured' | 'connected' | 'error'
    return 'configured';
  });

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Refresh offline queue count periodically
  const refreshQueueCount = useCallback(() => {
    setOfflineQueueCount(getOfflineQueue().length);
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshQueueCount, 3000);
    return () => clearInterval(interval);
  }, [refreshQueueCount]);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const testConnection = useCallback(async (urlOverride = null) => {
    const urlToTest = urlOverride !== null ? urlOverride : settings.googleAppsScriptUrl;
    setTestingConnection(true);
    const result = await testAppsScriptConnection(urlToTest);
    setTestingConnection(false);
    if (result.ok) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('error');
    }
    return result;
  }, [settings.googleAppsScriptUrl]);

  const triggerSync = useCallback(async () => {
    const res = await syncOfflineQueue();
    refreshQueueCount();
    return res;
  }, [refreshQueueCount]);

  const clearQueue = useCallback(() => {
    clearOfflineQueue();
    refreshQueueCount();
  }, [refreshQueueCount]);

  return {
    settings,
    updateSettings,
    connectionStatus,
    testingConnection,
    testConnection,
    offlineQueueCount,
    refreshQueueCount,
    triggerSync,
    clearQueue,
  };
}
