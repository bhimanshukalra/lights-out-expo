import * as Haptics from "expo-haptics";

let enabled = true;

export const setHapticsEnabled = (value: boolean) => {
  enabled = value;
};

// Haptics can be unavailable (simulators, some devices); never let that crash a tap.
export function tapHaptic() {
  if (!enabled) return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {}
}

export function winHaptic() {
  if (!enabled) return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  } catch {}
}
