# Wi-Fi vs The Word — Project Status

A free, cross-platform (Capacitor) app that helps families trade digital
distraction for Scripture, prayer, and presence — with grace, not guilt.
This is the master index. **Status: all four phases + every extra request
implemented and compile-clean.**

---

## Build health (debug pass)
- `WiFiVsTheWord-App.jsx` — compiles via esbuild, no syntax errors, no stale
  references, all 27 components/helpers resolve, all 5 tabs route. ✅
- `bibleStore.ts`, `screen-time-plugin.ts`, `shepherd-proxy.js`,
  `prepare-bible.mjs` — all parse/transpile clean. ✅

---

## Phases

| Phase | What | Status | Files |
|---|---|---|---|
| 0 | Foundations / Capacitor scaffold, design tokens, entitlement plan | ✅ | `Phase-0-Setup.md`, `WiFi-vs-The-Word-App-Brief.md` |
| 1 | MVP: offline Bible, Verse of the Day, devotional, Sabbath engine, reminders, prayer journal, streak | ✅ | `WiFiVsTheWord-App.jsx` |
| 2 | Native screen-time: usage, adaptive Shield, on both platforms | ✅ | `native/screen-time-plugin.ts`, `native/ScreenTimePlugin.kt`, `native/ScreenGuardService.kt`, `native/ShieldActivity.kt`, `native/ScreenTimePlugin.swift`, `Phase-2-Setup.md` |
| 3 | Recovery system + family + donate + AI Shepherd | ✅ | `WiFiVsTheWord-App.jsx`, `backend/shepherd-proxy.js` |
| 4 | Launch: store listings, POPIA policy, data-safety, assets, QA, runbook | ✅ | `Phase-4-Launch.md`, `PRIVACY-POLICY.md` |

---

## Extra requests along the way (all implemented)

- **AA recovery, reframed for screens (hybrid)** — the optional 12-step *Journey*,
  softened to the grace-not-guilt voice with Christ as the source of freedom; plus
  daily tools (inventory, HALT pause, serenity prayer, milestones). → `RenewTab`, `StepJourney`.
- **The "super-app" feature set** (from your strategy doc):
  - Four **Health Scores** (Attention, Dopamine balance, Family, Spiritual). → `computeScores`, `ScoreRing`.
  - **Adaptive friction** (5s low-risk / 60s high-risk + mood + alternatives). → `ScriptureShield`.
  - **Replacement behaviours** offered at every friction moment. → `REPLACEMENTS`.
  - **Private trigger patterns** (time + mood, on-device only). → `triggerSummary`, `logMood`.
  - **AI Digital Shepherd** (coach reachable anywhere; Cloudflare proxy + demo). → `Shepherd`, `backend/shepherd-proxy.js`.
  - Accountability **coach-not-cop** (WhatsApp/email, no server). → `RenewTab`.
- **Offline Bible truly installed** — packed into the app, read with no network. → `backend/prepare-bible.mjs`, `backend/bibleStore.ts`, Bible tab "installed · offline" state.
- **Prayer meditation engine** (Calm/Headspace style, but filling the mind with the
  Word, not emptying it): Psalm 139 **examen**, **breath prayer**, **lectio**. → `Meditation`.
- **Confession → assurance → faith** — never shames at the slip; offers grace when
  calm; declares forgiveness (1 John 1:9, Ps 103:12, Rom 8:1) and new identity
  (2 Cor 5:17). → `Confession`, post-override `needsGrace` flow.

---

## What you must wire before shipping (from your side)
1. **Shepherd:** deploy `backend/shepherd-proxy.js` (`wrangler secret put AI_API_KEY`,
   set `AI_BASE_URL`/`MODEL` for DeepSeek or Groq), then set `PROXY_URL` in the app.
2. **Bible:** run `node scripts/prepare-bible.mjs` and eyeball the source text.
3. **PayFast:** set `PAYFAST.sandbox = false` and your real `merchant_id`/`merchant_key`.
4. **iOS:** request the **Family Controls entitlement** now (long Apple lead time).
5. **Content:** a ministry theology-review pass on Steps, devotionals, meditation,
   and confession copy.
6. **Privacy:** host `PRIVACY-POLICY.md` at `wifivstheword.org/privacy`; fill the
   `[bracketed]` entity/officer details.

## Deliberately deferred (your "thin proxy only" call)
Community / prayer circles, church dashboard, cross-device accountability sync —
these need a fuller Workers + D1 backend. Nothing built here blocks them.

## The north star
Success is **not** app engagement. It is less screen time, more prayer, more
Scripture, more real presence. The best version of this app is the one a family
eventually needs less.
