# Phase 0 — Foundations & Setup

The goal of Phase 0 is a running native shell that the Phase 1 prototype drops into, plus the long-lead items (Apple entitlement) requested on day one.

---

## 1. Create the project

```bash
# Vite + React + TS (your house stack)
npm create vite@latest wifi-vs-the-word -- --template react-ts
cd wifi-vs-the-word
npm install

# Capacitor core + native platforms
npm install @capacitor/core @capacitor/cli
npx cap init "Wi-Fi vs The Word" org.wifivstheword.app --web-dir=dist
npm install @capacitor/android @capacitor/ios

# Phase 1 native plugins
npm install @capacitor/local-notifications @capacitor/preferences \
            @capacitor/geolocation @capacitor/app @capacitor/share \
            @capacitor-community/sqlite

# Build the web app, then add platforms
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Open the prototype's `WiFiVsTheWord` component as your root (`src/App.tsx`). The browser-only fallbacks in the prototype (`window.storage`, `navigator.geolocation`, in-memory state) get swapped for the Capacitor plugins below.

---

## 2. `capacitor.config.ts`

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.wifivstheword.app',
  appName: 'Wi-Fi vs The Word',
  webDir: 'dist',
  backgroundColor: '#0b1322',           // matches site theme-color
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_flame',
      iconColor: '#e3b465',
    },
  },
};
export default config;
```

---

## 3. Folder structure

```
src/
  App.tsx                 # root (the prototype component)
  design/tokens.ts        # the palette/type below
  features/
    bible/                # reader + offline SQLite Bible (KJV, WEB)
    sabbath/              # sun-times engine + widget data provider
    pray/                 # journal + reminder scheduling
    goals/                # streak, fasting timer, challenges
    home/                 # daily bread dashboard
  lib/
    storage.ts            # Preferences wrapper (replaces window.storage)
    notifications.ts      # LocalNotifications scheduling
    suntimes.ts           # calcSunUT / getSunset / computeSabbath
  data/
    bible-kjv.sqlite      # bundled offline (build-time)
    bible-web.sqlite
android/                  # native — UsageStatsManager plugin lands in Phase 2
ios/                      # native — FamilyControls plugin lands in Phase 2
```

---

## 4. Design tokens (from the live site)

```ts
export const tokens = {
  color: {
    ink:      '#0b1322',  // midnight navy — site theme-color
    ink2:     '#0f1a2e',
    panel:    '#13203a',
    gold:     '#e3b465',  // candle gold accent
    gold2:    '#f2d49a',
    mist:     '#9fb0c8',  // muted body text on dark
    cream:    '#f4ecd8',  // parchment reading surface
    creamInk: '#241d12',  // text on parchment
  },
  font: {
    display: "'Fraunces', Georgia, serif",   // headings
    body:    "'Newsreader', Georgia, serif",  // body + Bible reading
  },
  radius: { card: 20, pill: 999 },
};
```

Voice rules (carry from site): grace-not-guilt, calm, never shaming. The UI itself is anti-dopamine — no red badges, no infinite scroll, no streak that punishes a miss.

---

## 5. Native swaps for Phase 1

| Prototype fallback | Native replacement |
|---|---|
| `window.storage` | `@capacitor/preferences` (`Preferences.get/set`) |
| in-memory Bible seed | `@capacitor-community/sqlite` loading bundled `bible-*.sqlite` |
| reminder list (display only) | `LocalNotifications.schedule()` with daily repeat at each reminder time |
| `navigator.geolocation` | `@capacitor/geolocation` `getCurrentPosition()` |
| Share buttons | `@capacitor/share` `Share.share()` |

Bible data: convert KJV + WEB (both public domain) into SQLite once and bundle. Good free sources: the eBible / Berean WEB releases and any public-domain KJV JSON. Decide divine-name rendering for WEB (default uses "Yahweh"; a "LORD" edition exists) — **open question for the ministry.**

---

## 6. Permissions & the long-lead item

**Android** (`AndroidManifest.xml`) — Phase 1 needs only:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```
(`PACKAGE_USAGE_STATS` + its justification copy come in Phase 2.)

**iOS** — Phase 1 needs notification + location usage strings in `Info.plist`.

> ⚠️ **Do this in Phase 0:** submit the request for Apple's **Family Controls entitlement** (`com.apple.developer.family-controls`). It gates the entire iOS screen-time/shielding layer in Phase 2, approval is manual, and it can take time. Also: enrol in the Apple Developer Program ($99/yr) and create the Google Play account ($25 once).

---

## 7. Phase 0 "done" checklist

- [ ] Capacitor app builds and runs on an Android device/emulator and iOS simulator
- [ ] Prototype renders inside the shell with the design tokens applied
- [ ] `Preferences` persistence working (streak/journal survive restart)
- [ ] Local notification fires on a scheduled reminder
- [ ] Sunset engine returns correct times for a known SA location
- [ ] Apple Family Controls entitlement **requested**
- [ ] Developer accounts created (Apple + Google)

Once these are green, Phase 1 is just feature polish on top — and Phase 2 (the native screen-time plugins) can begin in parallel on Android.
