# Phase 4 — Launch

Android ships first (richer features, no entitlement wait, fastest store path).
iOS follows once Apple's Family Controls entitlement clears.

---

## 1. Google Play listing

**App name:** Wi-Fi vs The Word
**Short description (≤80):** Reclaim your attention. Scripture, prayer, and gentle screen-time recovery.
**Category:** Health & Fitness (primary) · Lifestyle (secondary)
**Content rating:** Everyone
**Contains ads:** No · **In-app purchases:** No (donations are external via PayFast)

**Full description:**
> Wi-Fi vs The Word helps your whole family put the phone down and pick the Word up — with grace, not guilt.
>
> The feed is designed to hold your attention. This app is designed to give it back.
>
> • **The whole Bible, offline** — KJV and World English Bible, installed on your device. No signal needed, no links, no rabbit holes. Just the Word.
> • **A Digital Sabbath** — a sunset-to-sunset rhythm of rest, calculated for your location, with a countdown to the coming peace.
> • **Gentle screen-time recovery** — see where your attention goes, set a goal, and when you reach for a distracting app past your limit, meet a verse and a breath instead of the scroll — with something better to do.
> • **A quiet place to pray** — guided stillness built on Psalm 139, breath prayer, and dwelling in the Word. We don't empty the mind; we fill it.
> • **The Journey** — twelve gentle steps out of digital habits, rooted in Scripture and the renewing of the mind.
> • **Grace when you stumble** — confess, and truly know you are forgiven.
> • **Walk with someone** — a private accountability partner and a family covenant.
> • **A gentle companion** — an optional guide to talk and pray with when the pull is strong.
>
> Free. No ads. No tracking. Your prayers and your data stay on your device.
>
> "Be not conformed to this world: but be ye transformed by the renewing of your mind." — Romans 12:2

**ASO keywords (Play indexes the description):** Christian, Bible offline, KJV, screen time, digital detox, addiction recovery, prayer, meditation, devotional, Sabbath, family, focus.

---

## 2. App Store listing (iOS)

**Name:** Wi-Fi vs The Word
**Subtitle (≤30):** Scripture over the scroll
**Category:** Health & Fitness · Lifestyle
**Promotional text:** Reclaim your attention — the whole Bible offline, a digital Sabbath, gentle screen-time recovery, and a quiet place to pray.
**Keywords (≤100, comma-sep):** bible,offline bible,kjv,screen time,digital detox,prayer,meditation,christian,sabbath,addiction,focus,family
**Description:** (reuse the Play full description above)

---

## 3. Play Data safety form (declare truthfully)

- **Data collected / shared:** None that identifies the user.
- **Location** (approximate): used **on-device only** for sunset; not collected, not sent → declare "not collected".
- **App activity / usage:** read on-device via Usage Access; not collected, not sent → "not collected".
- **Messages (AI Shepherd):** *Other user-generated content.* If a user chats with the Shepherd, message text is **sent to a third party (AI provider) for processing**, **not stored**, **not for ads**. Declare as: collected = no (ephemeral), **shared for app functionality = yes** (processing), processing is optional & user-initiated. Provide the privacy-policy URL.
- **Financial info:** handled entirely by **PayFast** off-app → not collected by the app.
- **Data encrypted in transit:** Yes. **User can request deletion:** Yes (on-device / uninstall).

**Apple Privacy "Nutrition" labels:**
- Most categories → **Data Not Collected.**
- If Shepherd used → **User Content → App Functionality**, *not linked to identity*, *not used for tracking*.

---

## 4. Asset checklist (candlelight identity: navy #0b1322, gold #e3b465)

- [ ] **App icon** — 512×512 (Play), 1024×1024 (App Store). A single candle flame on midnight navy.
- [ ] **Android adaptive icon** — foreground (flame) + background (#0b1322), safe-zone tested.
- [ ] **Notification icon** — `ic_stat_flame` (monochrome, per capacitor.config).
- [ ] **Feature graphic** (Play) — 1024×500.
- [ ] **Screenshots** — 4–8 per platform: Daily Bread (Home + scores), distraction-free Reader, the Scripture Shield, Stillness/breath prayer, the Journey, Sabbath countdown. Phone + 7"/10" tablet (Play) and 6.7"/6.5"/5.5" + iPad (Apple).
- [ ] **Splash** — navy with flame; matches `backgroundColor`.
- [ ] **Promo / launch graphic** for the ministry site + socials.

---

## 5. Pre-launch QA matrix

Functional:
- [ ] Bible installs and reads with the device in **airplane mode** (true offline).
- [ ] KJV ↔ WEB toggle keeps your place; font scaling works.
- [ ] Sabbath sunset is correct for a known SA location; countdown ticks; crosses sundown correctly.
- [ ] Reminders fire as local notifications at the set time, daily.
- [ ] Streak increments once/day, resets after a gap, shows grace.
- [ ] **Android:** Usage Access grant → real per-app minutes; watched app past limit raises the Shield; "Step away" → home; "Open anyway" dismisses.
- [ ] **iOS:** Family Controls prompt approves; app picker works; threshold shields the app with the verse screen.
- [ ] Adaptive friction: 5s pause (low) vs 60s + mood + alternatives (high).
- [ ] Shepherd: with `PROXY_URL` set, returns live replies; with it empty, demo replies; never crashes offline.
- [ ] Meditation: examen steps advance; breath prayer paces 4s/6s for the chosen length; "Amen" closes.
- [ ] Confession: 4 stages flow; nothing typed is persisted; finishing clears the grace card.
- [ ] After an "Open anyway", the gentle grace card appears in Renew (never a shaming popup).
- [ ] Accountability: WhatsApp + email deep links compose correctly.
- [ ] Donation: opens PayFast with the right amount (sandbox → **switch to live**).
- [ ] Persistence: streak/journal/goal/partner/family/steps survive an app restart.

Non-functional:
- [ ] Dark, calm UI on small + large screens; safe-area insets respected (notch/home bar).
- [ ] No localStorage in the native build (uses Preferences/SQLite).
- [ ] No console errors; cold-start under ~2s.
- [ ] Accessibility: text scales, contrast passes, buttons ≥44px.

---

## 6. Release runbook

Pre-flight (do these before building the release):
- [ ] Set `PROXY_URL` in the app to your deployed Worker; `wrangler secret put AI_API_KEY` set; pick DeepSeek/Groq via `AI_BASE_URL`/`MODEL`.
- [ ] `PAYFAST.sandbox = false` and real `merchant_id`/`merchant_key` in.
- [ ] Run `node scripts/prepare-bible.mjs`; verify `src/assets/bible/*.json` present and source text checked.
- [ ] Ministry theology-review pass on Steps, devotionals, meditation, and confession copy.
- [ ] Privacy policy hosted at `wifivstheword.org/privacy`; linked in both stores.

Android:
- [ ] `versionName` / `versionCode` bumped; release keystore created and **backed up safely**.
- [ ] `npm run build && npx cap sync android`; build a signed AAB in Android Studio.
- [ ] Play Console: data-safety form, content rating questionnaire, `PACKAGE_USAGE_STATS` + overlay justification (see Phase-2-Setup).
- [ ] Internal test → closed test → **staged rollout** (e.g. 20%).

iOS (after Android):
- [ ] **Family Controls entitlement approved** by Apple; App Group + both extensions configured.
- [ ] Archive in Xcode → TestFlight → privacy labels → submit for review.

Post-launch:
- [ ] Watch crash/ANR; respond to reviews in the grace-not-guilt voice.
- [ ] Remember the real metric: not installs or engagement, but **less screen time and more presence**. The best version of this app is the one people eventually need less.

---

## 7. What's deliberately deferred (your "thin proxy" decision)
Community / prayer circles, the church dashboard, and true cross-device accountability sync — all require a fuller backend (Workers + D1). The architecture is ready for them when the ministry is; nothing built here blocks them.
