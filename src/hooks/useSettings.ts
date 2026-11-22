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

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((loaded) => {
      if (cancelled) return;
      setSettings(loaded);
      setHapticsEnabled(loaded.haptics);
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

  return { settings, toggleHaptics };
}
