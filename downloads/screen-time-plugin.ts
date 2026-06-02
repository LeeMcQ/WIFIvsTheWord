/**
 * ScreenTime — Capacitor plugin bridge for Wi-Fi vs The Word (Phase 2)
 *
 * Android  → real per-app usage via UsageStatsManager + an overlay "Scripture Shield".
 * iOS      → Family Controls / DeviceActivity / ManagedSettings. Apple keeps raw
 *            minutes private, so getUsageToday() returns empty on iOS; the value is
 *            the shield + threshold events, not a minute-by-minute dashboard.
 * Web      → demo data so the whole UX is testable in the browser / Vite dev server.
 *
 * Place this file at: src/lib/screen-time-plugin.ts
 * Import it where the app needs device data (the prototype's `screenTime` bridge can
 * simply call these methods instead of poking window.Capacitor.Plugins.ScreenTime).
 */
import { registerPlugin, WebPlugin } from '@capacitor/core';

export type ScreenTimeMode = 'usage' | 'shield' | 'demo';

export interface SupportInfo {
  supported: boolean;
  platform: 'android' | 'ios' | 'web';
  mode: ScreenTimeMode;
}
export interface AuthResult { granted: boolean }
export interface AppUsage {
  appName: string;
  packageId?: string;
  minutes: number;
  color?: string;
}
export interface UsageToday {
  totalMinutes: number;
  apps: AppUsage[];
  date: string;
}
export interface ForegroundApp { packageId: string; appName: string }
export interface PickedApps { count: number; tokens: string[] }
export interface LimitOptions { minutes: number; apps?: string[] }
export interface ShieldOptions { reference: string; text: string }
export interface LimitReached { token?: string; appName?: string }

export interface ScreenTimePlugin {
  /** Capability probe. Drives which UI the app shows. */
  isSupported(): Promise<SupportInfo>;
  /** Has the user already granted usage / Screen Time access? */
  checkAuthorization(): Promise<AuthResult>;
  /** Open the system grant flow (Android: Usage Access settings; iOS: Family Controls prompt). */
  requestAuthorization(): Promise<AuthResult>;
  /** Real per-app minutes since local midnight. Android only — empty on iOS by design. */
  getUsageToday(): Promise<UsageToday>;
  /** The app currently in the foreground (Android — used by the shield watcher). */
  getForegroundApp(): Promise<ForegroundApp>;
  /** Present the system app picker so the user chooses which apps to watch. */
  pickApps(): Promise<PickedApps>;
  /** Set the daily limit (minutes) for the picked apps; arms the monitor. */
  setDailyLimit(options: LimitOptions): Promise<AuthResult>;
  /** Apply the Scripture Shield to the watched apps right now. */
  shieldNow(options: ShieldOptions): Promise<void>;
  /** Lift the shield. */
  clearShield(): Promise<void>;
  /** Fires when a watched app crosses its threshold (iOS DeviceActivity / Android watcher). */
  addListener(
    eventName: 'limitReached',
    listenerFunc: (data: LimitReached) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

/* ----------------------------------------------------------------------------
   Web implementation — demo data, mirrors the in-app prototype so the browser
   build behaves the same as the device until the native layer is present.
---------------------------------------------------------------------------- */
const DEMO: AppUsage[] = [
  { appName: 'Social Feed', minutes: 74, color: '#e3825f' },
  { appName: 'Short Video', minutes: 41, color: '#e3b465' },
  { appName: 'Messaging', minutes: 23, color: '#9fb0c8' },
  { appName: 'Games', minutes: 14, color: '#6f819d' },
  { appName: 'Browser', minutes: 9, color: '#7c8aa3' },
];

class ScreenTimeWeb extends WebPlugin implements ScreenTimePlugin {
  private granted = false;

  async isSupported(): Promise<SupportInfo> {
    return { supported: false, platform: 'web', mode: 'demo' };
  }
  async checkAuthorization(): Promise<AuthResult> {
    return { granted: this.granted };
  }
  async requestAuthorization(): Promise<AuthResult> {
    this.granted = true;
    return { granted: true };
  }
  async getUsageToday(): Promise<UsageToday> {
    return {
      totalMinutes: DEMO.reduce((a, b) => a + b.minutes, 0),
      apps: DEMO,
      date: 'demo',
    };
  }
  async getForegroundApp(): Promise<ForegroundApp> {
    return { packageId: 'web', appName: 'Browser' };
  }
  async pickApps(): Promise<PickedApps> {
    return { count: 3, tokens: [] };
  }
  async setDailyLimit(): Promise<AuthResult> {
    return { granted: true };
  }
  async shieldNow(): Promise<void> {
    /* no-op on web */
  }
  async clearShield(): Promise<void> {
    /* no-op on web */
  }
}

const ScreenTime = registerPlugin<ScreenTimePlugin>('ScreenTime', {
  web: () => new ScreenTimeWeb(),
});

export default ScreenTime;
export { ScreenTime };
