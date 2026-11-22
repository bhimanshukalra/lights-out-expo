import { useCallback, useEffect, useState } from "react";

import { setHapticsEnabled } from "@/lib/haptics";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from "@/storage/settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((stored) => {
      if (cancelled) return;
      setSettings(stored);
      setHapticsEnabled(stored.haptics);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleHaptics = useCallback(() => {
    const next = { ...settings, haptics: !settings.haptics };
    setSettings(next);
    setHapticsEnabled(next.haptics);
    void saveSettings(next);
  }, [settings]);

  const setSize = useCallback(
    (size: number) => {
      const next = { ...settings, size };
      setSettings(next);
      void saveSettings(next);
    },
    [settings],
  );

  return { settings, loaded, toggleHaptics, setSize };
}
