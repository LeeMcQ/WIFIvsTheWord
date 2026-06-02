# Phase 2 — Native Screen-Time Implementation

This wires the three plugin files into the Capacitor project so the prototype's
screen-time UX runs on real devices.

```
src/lib/screen-time-plugin.ts                         → TypeScript bridge (done)
android/.../org/wifivstheword/app/ScreenTimePlugin.kt → Android plugin (done)
ios/App/App/ScreenTimePlugin.swift                    → iOS plugin (done)
```

The honest split, up front:

| | **Android** | **iOS** |
|---|---|---|
| Real per-app minutes | ✅ `UsageStatsManager` | ❌ Apple keeps them private |
| Usage dashboard | ✅ full | ⚠️ shows limits/events, not minutes |
| Interrupt with a verse (Shield) | ✅ overlay we draw | ✅ system shield (Family Controls) |
| Permission | Usage Access (settings toggle) | Family Controls entitlement + prompt |

The "interrupt the scroll with Scripture" feature — the heart of the app — works on **both**. Only the analytics dashboard is Android-rich.

---

## A. JavaScript wiring

Replace the prototype's ad-hoc `window.Capacitor.Plugins.ScreenTime` calls with the typed import:

```ts
import ScreenTime from './lib/screen-time-plugin';

const sup    = await ScreenTime.isSupported();        // { mode: 'usage' | 'shield' | 'demo' }
const auth   = await ScreenTime.requestAuthorization();
const usage  = await ScreenTime.getUsageToday();      // real on Android, empty on iOS
await ScreenTime.pickApps();                          // user chooses watched apps
await ScreenTime.setDailyLimit({ minutes: goal });    // arms the monitor
await ScreenTime.shieldNow({ reference: 'Psalm 46:10', text: 'Be still, and know that I am God.' });

ScreenTime.addListener('limitReached', ({ appName }) => {
  // surface the in-app Scripture Shield / log a "redirected" event
});
```

---

## B. Android

### B1. Register the plugin — `MainActivity.kt`
```kotlin
package org.wifivstheword.app
import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(ScreenTimePlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
```

### B2. Permissions — `AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
    tools:ignore="ProtectedPermissions"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```
Add `xmlns:tools="http://schemas.android.com/tools"` to the `<manifest>` tag, and register the service + shield activity inside `<application>`:
```xml
<service android:name=".ScreenGuardService"
    android:foregroundServiceType="specialUse" android:exported="false">
  <property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
      android:value="Replaces distracting apps with a Scripture prompt at the user's request"/>
</service>
<activity android:name=".ShieldActivity" android:exported="false"
    android:theme="@style/Theme.AppCompat.Translucent.NoActionBar"
    android:excludeFromRecents="true" android:launchMode="singleTask"/>
```

### B3. The shield watcher — `ScreenGuardService.kt`
A foreground service that polls the foreground app and, once a watched app passes its limit today, launches `ShieldActivity` over it.
```kotlin
package org.wifivstheword.app

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.*
import org.json.JSONArray

class ScreenGuardService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var prefs: android.content.SharedPreferences
    private val poll = object : Runnable { override fun run() { check(); handler.postDelayed(this, 3000) } }

    override fun onBind(i: Intent?) = null
    override fun onStartCommand(i: Intent?, f: Int, id: Int): Int {
        prefs = getSharedPreferences("screenguard", Context.MODE_PRIVATE)
        startForeground(42, notif())
        handler.post(poll)
        return START_STICKY
    }
    override fun onDestroy() { handler.removeCallbacks(poll) }

    private fun watched(): Set<String> {
        val arr = JSONArray(prefs.getString("watched", "[]"))
        return (0 until arr.length()).map { arr.getString(it) }.toSet()
    }

    private fun check() {
        val limit = prefs.getInt("limitMinutes", 120)
        val fg = ScreenGuard.foregroundPackage(this) ?: return
        if (fg !in watched()) return
        if (ScreenGuard.minutesToday(this, fg) < limit) return
        // shown once per foreground entry — track last shielded pkg to avoid loops
        if (prefs.getString("lastShield", "") == fg) return
        prefs.edit().putString("lastShield", fg).apply()
        startActivity(Intent(this, ShieldActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra("reference", "Psalm 46:10")
            .putExtra("text", "Be still, and know that I am God."))
    }

    private fun notif(): Notification {
        val ch = "guard"
        if (Build.VERSION.SDK_INT >= 26)
            (getSystemService(NotificationManager::class.java))
                .createNotificationChannel(NotificationChannel(ch, "Screen guard", NotificationManager.IMPORTANCE_MIN))
        return Notification.Builder(this, ch)
            .setContentTitle("Wi-Fi vs The Word").setContentText("Guarding your attention")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock).build()
    }
}
```
Put the two helpers (`foregroundPackage`, `minutesToday`) in a small `ScreenGuard` object that reuses the same `UsageStatsManager` queries as the plugin. (When `lastShield` should reset: clear it when the foreground package changes.)

### B4. The overlay — `ShieldActivity.kt`
A translucent, full-screen activity painted in the candlelight theme: the verse, a slow breathing circle, and two choices — **"Step away"** (finishes, returns home) and **"Open anyway"** (finishes back to the app, logs a redirect). Mirror the prototype's `ScriptureShield` look (navy `#0b1322`, gold `#e3b465`, Fraunces/serif). Build it in Compose or a simple XML layout; it has no business logic beyond the two buttons.

### B5. Google Play policy — important
`PACKAGE_USAGE_STATS` is a sensitive/special permission. In the Play Console **Data safety + Permissions declaration** you must justify it. Truthful framing that fits Play's "Digital Wellbeing" allowance:
> The app helps users reduce their own screen time. With the user's explicit grant of Usage Access, it shows how long they've spent in chosen apps and, past a self-set limit, replaces those apps with a Scripture prompt. Usage data never leaves the device and is never transmitted.

Drawing an overlay over other apps must be clearly user-initiated and dismissible — which the Shield is.

---

## C. iOS

### C1. Request the entitlement (long lead — do first)
`com.apple.developer.family-controls` requires a manual request to Apple and approval before it works outside the simulator. Add it to `App.entitlements`:
```xml
<key>com.apple.developer.family-controls</key><true/>
```

### C2. Register the plugin — `ScreenTimePlugin.m`
```objc
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ScreenTimePlugin, "ScreenTime",
  CAP_PLUGIN_METHOD(isSupported, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(checkAuthorization, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(requestAuthorization, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getUsageToday, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getForegroundApp, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(pickApps, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(setDailyLimit, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(shieldNow, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(clearShield, CAPPluginReturnPromise);
)
```

### C3. App Group (shared between app + extensions)
Create group **`group.org.wifivstheword.app`** and enable it on the app target and both extension targets (below). `SelectionStore` in the Swift plugin reads/writes the picked apps here.

### C4. Two app-extension targets

**DeviceActivityMonitor extension** — runs when a threshold is crossed and applies the shield:
```swift
import DeviceActivity
import ManagedSettings
import FamilyControls

class ActivityMonitor: DeviceActivityMonitor {
    let store = ManagedSettingsStore(named: .init("wvw.shield"))
    let suite = UserDefaults(suiteName: "group.org.wifivstheword.app")

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name,
                                         activity: DeviceActivityName) {
        guard let data = suite?.data(forKey: "familySelection"),
              let sel = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else { return }
        store.shield.applications = sel.applicationTokens.isEmpty ? nil : sel.applicationTokens
        store.shield.applicationCategories =
            sel.categoryTokens.isEmpty ? nil : .specific(sel.categoryTokens)
    }
    override func intervalDidEnd(for activity: DeviceActivityName) {
        store.shield.applications = nil           // new day → lift the shield
        store.shield.applicationCategories = nil
    }
}
```

**ShieldConfiguration extension** — styles the shield screen in the candlelight theme (this is the iOS equivalent of the prototype's `ScriptureShield`):
```swift
import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfig: ShieldConfigurationDataSource {
    private func config() -> ShieldConfiguration {
        ShieldConfiguration(
            backgroundBlurStyle: .dark,
            backgroundColor: UIColor(red: 0.04, green: 0.07, blue: 0.13, alpha: 1), // #0b1322
            icon: UIImage(named: "flame"),
            title: .init(text: "One thing is needful.", color: UIColor(red: 0.95, green: 0.92, blue: 0.85, alpha: 1)),
            subtitle: .init(text: "“Be still, and know that I am God.” — Psalm 46:10",
                            color: UIColor(red: 0.62, green: 0.69, blue: 0.78, alpha: 1)),
            primaryButtonLabel: .init(text: "Step away",
                            color: UIColor(red: 0.16, green: 0.11, blue: 0.02, alpha: 1)),
            primaryButtonBackgroundColor: UIColor(red: 0.89, green: 0.71, blue: 0.40, alpha: 1), // gold
            secondaryButtonLabel: .init(text: "Open anyway",
                            color: UIColor(red: 0.62, green: 0.69, blue: 0.78, alpha: 1))
        )
    }
    override func configuration(shielding app: Application) -> ShieldConfiguration { config() }
    override func configuration(shielding app: Application,
                                in category: ActivityCategory) -> ShieldConfiguration { config() }
}
```
("Open anyway" is the secondary action; Apple handles dismissal. Rotate the verse by writing today's verse into the App Group and reading it here.)

### C5. Info.plist
```xml
<key>NSUserTrackingUsageDescription</key>
<string>We never track you. Screen Time stays on your device.</string>
```
(Family Controls itself shows Apple's own consent UI — no usage string needed for it.)

---

## D. Phase 2 "done" checklist
- [ ] `ScreenTime.isSupported()` returns `usage` on Android, `shield` on iOS, `demo` on web
- [ ] Android: granting Usage Access populates the real dashboard
- [ ] Android: passing a watched app's limit overlays the Scripture Shield
- [ ] iOS: Family Controls prompt approves; `pickApps` shows the system picker
- [ ] iOS: crossing the threshold shields the app with the candlelight verse screen
- [ ] Play Console usage-access justification written; iOS entitlement approved
- [ ] `limitReached` events increment the in-app "redirected" counter

Build order suggestion: finish **Android** end-to-end first (no entitlement wait, real data, fastest store path), ship it, then complete the iOS shield while Family Controls approval clears.
