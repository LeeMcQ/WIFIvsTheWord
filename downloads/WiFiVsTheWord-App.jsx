import React, { useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, Sun, Feather, Shield, Quote, Share2, ChevronLeft,
  Check, Plus, Bell, MapPin, Minus, RefreshCw, Sparkles, X, Flame, Lock, Wind,
  Heart, Users, Send, Award, ArrowRight, ChevronRight, Anchor, Gift, Coffee, Moon,
  MessageCircle, Activity, Footprints
} from "lucide-react";

/* =========================================================================
   Wi-Fi vs The Word — recovery super-app (Phases 1–3 + recovery system)
   "When the feed calls, the Word answers."

   On-device by design. The ONLY network call is the AI Digital Shepherd, which
   talks to a thin Cloudflare Worker proxy (it holds the DeepSeek/Groq key) — see
   /backend/shepherd-proxy.js. Set PROXY_URL below; until then the Shepherd runs
   on a warm, context-aware demo reply so the whole app is testable in-browser.

   Six layers it addresses: technology design → dopamine loops → habit → identity
   → relationships → the spiritual life. Success = LESS screen time, more presence.
   Bible text is public domain (KJV + World English Bible).
   ========================================================================= */

/* ---------- persistence (memory fallback) ---------- */
const _mem = {};
const store = {
  async get(k, def) {
    try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : def; }
    catch { return k in _mem ? _mem[k] : def; }
  },
  async set(k, v) { _mem[k] = v; try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ---------- native ScreenTime bridge (browser demo) ---------- */
const USAGE_DEMO = [
  { appName: "Social Feed", minutes: 74, color: "#e3825f" },
  { appName: "Short Video", minutes: 41, color: "#e3b465" },
  { appName: "Messaging", minutes: 23, color: "#9fb0c8" },
  { appName: "Games", minutes: 14, color: "#6f819d" },
  { appName: "Browser", minutes: 9, color: "#7c8aa3" },
];
function stPlugin() { try { return window.Capacitor?.Plugins?.ScreenTime; } catch { return null; } }
const screenTime = {
  async isSupported() { const p = stPlugin(); if (p) { try { return await p.isSupported(); } catch {} } return { supported: false, platform: "web", mode: "demo" }; },
  async checkAuthorization() { const p = stPlugin(); if (p) { try { return await p.checkAuthorization(); } catch {} } return { granted: false }; },
  async requestAuthorization() { const p = stPlugin(); if (p) { try { return await p.requestAuthorization(); } catch {} } return { granted: true }; },
  async getUsageToday() {
    const p = stPlugin(); if (p) { try { return await p.getUsageToday(); } catch {} }
    return { totalMinutes: USAGE_DEMO.reduce((a, b) => a + b.minutes, 0), apps: USAGE_DEMO, date: "demo" };
  },
};

/* ---------- AI Digital Shepherd bridge (Cloudflare proxy + demo) ---------- */
const PROXY_URL = ""; // ← paste your Cloudflare Worker URL, e.g. https://shepherd.<you>.workers.dev
const shepherd = {
  async chat(messages, context) {
    if (PROXY_URL) {
      try {
        const r = await fetch(PROXY_URL, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, context }),
        });
        const data = await r.json();
        if (data?.reply) return data.reply;
      } catch {}
    }
    return demoShepherd(messages, context);
  },
};
function demoShepherd(messages, ctx) {
  const last = (messages[messages.length - 1]?.content || "").toLowerCase();
  const mins = ctx.usageMinutes ?? 0, goal = ctx.goalMinutes ?? 120;
  if (last.includes("pray")) return "Let's pray together: \u201cLord, You are enough. Quiet the pull of the screen and turn my heart toward You and the people in this room. Amen.\u201d Would you like to sit in silence for a minute after that?";
  if (last.includes("instead") || last.includes("suggest")) return "Try this in the next ten minutes: put the phone in another room, pour a glass of water, and read Psalm 23 slowly. Small, real, enough. Want me to open it for you?";
  if (last.includes("why")) return "Often the scroll isn't really about the screen — it's about a quieter ache: tiredness, loneliness, a need to escape. What were you feeling just before you reached for it?";
  if (mins > goal) return `You've given about ${mins} minutes to your screens today — past your goal of ${goal}. No shame in it; tomorrow's mercies are new. Earlier you said you wanted more presence with the people you love. Shall we pray, or step outside for five minutes?`;
  return "I'm here, walking with you. You're under your goal today — well kept. What's stirring in you right now?";
}

/* ---------- date + sun helpers ---------- */
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
function calcSunUT(date, lat, lng, sunset) {
  const zenith = 90.833, D2R = Math.PI / 180, R2D = 180 / Math.PI, mod = (a, b) => ((a % b) + b) % b;
  const N = dayOfYear(date), lngHour = lng / 15;
  const t = sunset ? N + (18 - lngHour) / 24 : N + (6 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * D2R) + 0.02 * Math.sin(2 * M * D2R) + 282.634; L = mod(L, 360);
  let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R)); RA = mod(RA, 360);
  RA = RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90); RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * D2R), cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(zenith * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));
  if (cosH > 1 || cosH < -1) return null;
  let H = sunset ? R2D * Math.acos(cosH) : 360 - R2D * Math.acos(cosH); H /= 15;
  return mod(H + RA - 0.06571 * t - 6.622 - lngHour, 24);
}
function getSunset(date, lat, lng) {
  const ut = calcSunUT(date, lat, lng, true); if (ut == null) return null;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCMinutes(Math.round(ut * 60)); return d;
}
function computeSabbath(now, lat, lng) {
  for (let i = -1; i <= 8; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    if (d.getDay() === 5) {
      const begin = getSunset(d, lat, lng);
      const sat = new Date(d); sat.setDate(d.getDate() + 1);
      const end = getSunset(sat, lat, lng);
      if (end && end > now) return { begin, end, inSabbath: begin && now >= begin && now < end };
    }
  }
  return null;
}
const fmtTime = (d) => d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";

/* ---------- seed content ---------- */
const LOCATIONS = [
  { label: "Malmesbury, WC", lat: -33.46, lng: 18.73 },
  { label: "Cape Town", lat: -33.92, lng: 18.42 },
  { label: "Johannesburg", lat: -26.20, lng: 28.04 },
  { label: "Windhoek", lat: -22.56, lng: 17.08 },
];
const VOTD = [
  { ref: "Romans 12:2", text: "Be not conformed to this world: but be ye transformed by the renewing of your mind." },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Luke 10:42", text: "But one thing is needful: and Mary hath chosen that good part." },
  { ref: "Isaiah 26:3", text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee." },
  { ref: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness." },
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
  { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
];
const SHIELD_VERSES = [
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Matthew 11:28", text: "Come unto me… and I will give you rest." },
  { ref: "Luke 10:42", text: "One thing is needful." },
  { ref: "Philippians 4:8", text: "Whatsoever things are lovely… think on these things." },
  { ref: "Psalm 23:2", text: "He leadeth me beside the still waters." },
];
const DEVOTIONALS = [
  { title: "The One Thing", body: "Martha was busy with much serving; Mary chose the one thing needful. The feed will always offer a thousand good distractions. Today, choose the one." },
  { title: "Grace, Not Guilt", body: "If yesterday slipped away in the scroll, do not carry shame into today. Elijah repaired a broken altar before the fire fell. Lay one stone now." },
  { title: "A Light, Not a Flood", body: "Your phone can be a lamp for your feet or a flood that sweeps them away. The difference is not the device — it is who is holding it, and Who is holding you." },
  { title: "Rest Is Coming", body: "Sundown Friday, the notifications stop and peace returns. Fast from the digital so the family can feast on the Word." },
];
const PROMPTS = [
  "Where did my attention go today — and where did I want it to go?",
  "Name one thing you are grateful for in this quiet moment.",
  "What is one worry you can hand to God right now?",
  "Who in your home needs your full presence this evening?",
  "What did the Lord teach you in the Word today?",
];
const STEPS = [
  { n: 1, title: "An Honest Beginning", verse: "Romans 7:15", line: "I admit the scroll has taken more of me than I want it to.", prompt: "Name one way distraction has cost you this week." },
  { n: 2, title: "A Greater Hope", verse: "Psalm 23:3", line: "I believe Christ can restore what distraction has scattered.", prompt: "Where do you most long to be restored?" },
  { n: 3, title: "A Quiet Surrender", verse: "Proverbs 3:5–6", line: "I give my attention, and my evenings, into God's hands.", prompt: "Offer today's hours to God in one sentence." },
  { n: 4, title: "A Gentle Look", verse: "Psalm 139:23–24", line: "Without shame, I look honestly at where my time and heart have gone.", prompt: "What might your screen time reveal about a deeper hunger?" },
  { n: 5, title: "Spoken Aloud", verse: "James 5:16", line: "I share honestly with God and one trusted person.", prompt: "Who is your one trusted person?" },
  { n: 6, title: "Willing", verse: "Philippians 1:6", line: "I'm willing to let God change the habits I keep returning to.", prompt: "Which habit are you most ready to release?" },
  { n: 7, title: "Asking", verse: "Psalm 51:10", line: "I ask God, humbly, to create a clean and focused heart in me.", prompt: "Write a short prayer for a clean heart." },
  { n: 8, title: "The People I Missed", verse: "Ephesians 4:32", line: "I remember those my screen has crowded out.", prompt: "Name someone who needs your presence back." },
  { n: 9, title: "Turning Toward", verse: "Romans 12:10", line: "I make space for them again — a meal, a walk, eye contact.", prompt: "Plan one phone-free moment with them." },
  { n: 10, title: "Each Evening", verse: "Lamentations 3:22–23", line: "I take a quiet account of the day — tomorrow, mercies are new.", prompt: "What went well today? What will you carry forward?" },
  { n: 11, title: "The Better Feast", verse: "Matthew 6:6", line: "I seek God in prayer and the Word — not the feed — for peace.", prompt: "Trade five scrolling minutes for five with God today." },
  { n: 12, title: "Passing It On", verse: "2 Corinthians 1:4", line: "Having found a little freedom, I help another family find theirs.", prompt: "Who could you gently encourage this week?" },
];
const SERENITY = "God, grant me grace to accept the notifications I cannot silence, courage to set down the ones I can, and wisdom to know the difference — one faithful day at a time.";
const HALT_ITEMS = [
  { key: "H", label: "Hungry", icon: Coffee, tip: "Eat something real first. The feed is not food." },
  { key: "A", label: "Anxious / Angry", icon: Flame, tip: "Name the feeling to God before you numb it with scrolling." },
  { key: "L", label: "Lonely", icon: Heart, tip: "Reach for a person, not a screen — call someone who loves you." },
  { key: "T", label: "Tired", icon: Moon, tip: "Rest is the real need. Sleep heals what scrolling only delays." },
];
const MILESTONES = [
  { d: 1, label: "Day one" }, { d: 7, label: "One week" }, { d: 30, label: "One month" },
  { d: 90, label: "Ninety days" }, { d: 365, label: "One year" },
];
const REPLACEMENTS = [
  { icon: Footprints, label: "Take a 5-minute walk" },
  { icon: BookOpen, label: "Read Psalm 23 slowly" },
  { icon: Heart, label: "Call someone who loves you" },
  { icon: Wind, label: "Pray for one minute" },
  { icon: Activity, label: "Do 20 push-ups" },
  { icon: Coffee, label: "Make tea, look out a window" },
];
const MOODS = ["Lonely", "Anxious", "Bored", "Tired", "Stressed", "Restless"];
const MEDITATIONS = [
  {
    id: "examen", title: "Search Me, O God", subtitle: "An evening examen · Psalm 139:23\u201324",
    steps: [
      { t: "Be still", body: "Settle your body. Let your shoulders drop. Breathe slowly. You are in the presence of a God who loves you.", secs: 30 },
      { t: "Invite Him in", body: "Pray with David: \u201cSearch me, O God, and know my heart.\u201d Open the day to the One who already knows it.", secs: 30 },
      { t: "Look back gently", body: "Walk back through your day with God. Where did you feel near to Him? Where did your attention wander away?", secs: 45 },
      { t: "Notice, without shame", body: "\u201cTry me, and know my thoughts.\u201d Name what you see \u2014 not to condemn yourself, but to bring it into the light.", secs: 40 },
      { t: "Receive grace", body: "\u201cIf we confess our sins, He is faithful and just to forgive us.\u201d Whatever you named, hand it to Him now. It is covered.", secs: 40 },
      { t: "Be led onward", body: "\u201cLead me in the way everlasting.\u201d Ask for one small, faithful step into tomorrow, and rest in His keeping.", secs: 35 },
    ],
  },
  {
    id: "breath", title: "Breath Prayer", subtitle: "Be still · Psalm 46:10",
    breathPrayer: { in: "Be still,", out: "and know that I am God." },
  },
  {
    id: "lectio", title: "Dwelling in the Word", subtitle: "Lectio · Matthew 11:28",
    steps: [
      { t: "Read", body: "Read it slowly, twice: \u201cCome unto me, all ye that labour and are heavy laden, and I will give you rest.\u201d", secs: 35 },
      { t: "Reflect", body: "Which word shimmers for you? \u201cCome.\u201d \u201cRest.\u201d Stay with it; let it sink past your thoughts into your heart.", secs: 45 },
      { t: "Respond", body: "Speak back to God whatever rises \u2014 a need, a thanks, a quiet surrender.", secs: 40 },
      { t: "Rest", body: "Now simply rest in His presence, holding the verse like a warm coal in cupped hands.", secs: 45 },
    ],
  },
];
const FORGIVENESS = {
  assurances: [
    { ref: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
    { ref: "Psalm 103:12", text: "As far as the east is from the west, so far hath he removed our transgressions from us." },
    { ref: "Romans 8:1", text: "There is therefore now no condemnation to them which are in Christ Jesus." },
    { ref: "Isaiah 1:18", text: "Though your sins be as scarlet, they shall be as white as snow." },
    { ref: "Micah 7:19", text: "Thou wilt cast all their sins into the depths of the sea." },
  ],
  faith: [
    { ref: "2 Corinthians 5:17", text: "If any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new." },
    { ref: "Philippians 1:6", text: "He which hath begun a good work in you will perform it until the day of Jesus Christ." },
    { ref: "Lamentations 3:22\u201323", text: "His compassions fail not. They are new every morning." },
    { ref: "Romans 8:38\u201339", text: "Nothing shall be able to separate us from the love of God, which is in Christ Jesus our Lord." },
  ],
};
const PAYFAST = { sandbox: true, merchant_id: "10000100", merchant_key: "46f0cd694581a" };
function buildDonateUrl(amount) {
  const base = PAYFAST.sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process";
  const p = new URLSearchParams({
    merchant_id: PAYFAST.merchant_id, merchant_key: PAYFAST.merchant_key,
    amount: Number(amount).toFixed(2), item_name: "Wi-Fi vs The Word — donation",
    return_url: "https://wifivstheword.org/thank-you", cancel_url: "https://wifivstheword.org/",
  });
  return `${base}?${p.toString()}`;
}
function openExternal(url) { try { window.open(url, "_blank"); } catch {} }
function composeMessage(partner, body) {
  const enc = encodeURIComponent(body);
  if (partner.channel === "email") return `mailto:${partner.contact}?subject=${encodeURIComponent("A note from Wi-Fi vs The Word")}&body=${enc}`;
  const digits = (partner.contact || "").replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}?text=${enc}` : `https://wa.me/?text=${enc}`;
}
/* the four Health Scores — meaning from on-device signals (higher = healthier) */
function computeScores({ usageTotal, goal, streak, journalCount, steps, redirected }) {
  const attention = clamp(Math.round(100 * (1 - usageTotal / (goal * 2))), 0, 100);
  const dopamine = clamp(Math.round(attention * 0.7 + Math.min(redirected, 10) * 3), 0, 100);
  const family = clamp(Math.round((Math.min(streak, 30) / 30) * 100), 0, 100);
  const spiritual = clamp(Math.round(Math.min(journalCount, 10) * 6 + Math.min(steps, 12) * 3 + 4), 0, 100);
  return [
    { key: "attention", label: "Attention", value: attention },
    { key: "dopamine", label: "Dopamine balance", value: dopamine },
    { key: "family", label: "Family connection", value: family },
    { key: "spiritual", label: "Spiritual life", value: spiritual },
  ];
}
function triggerSummary(log) {
  if (!log || log.length < 2) return null;
  const bucket = (h) => h < 6 ? "late night" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
  const count = (arr, key) => { const m = {}; arr.forEach((x) => { m[x[key]] = (m[x[key]] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0]; };
  const when = count(log.map((e) => ({ b: bucket(e.hour) })), "b");
  const mood = count(log.filter((e) => e.mood), "mood");
  return { when, mood, n: log.length };
}

/* ============================ styles ============================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
.wvw{--ink:#0b1322;--ink2:#0f1a2e;--panel:#13203a;--line:rgba(231,200,128,0.14);
  --gold:#e3b465;--gold2:#f2d49a;--mist:#9fb0c8;--mist2:#6f819d;--cream:#f4ecd8;--creamink:#241d12;--rose:#e3825f;--sage:#86b89a;
  font-family:'Newsreader',Georgia,serif;color:var(--mist);background:var(--ink);max-width:480px;margin:0 auto;min-height:100vh;position:relative;overflow-x:hidden;}
.wvw .display{font-family:'Fraunces',Georgia,serif;}
.wvw-bg{position:fixed;inset:0;max-width:480px;margin:0 auto;pointer-events:none;z-index:0;background:radial-gradient(120% 70% at 50% -10%, rgba(227,180,101,0.10), transparent 60%),radial-gradient(90% 50% at 50% 110%, rgba(20,40,80,0.5), transparent 60%),var(--ink);}
.wvw-grain{position:fixed;inset:0;max-width:480px;margin:0 auto;pointer-events:none;z-index:1;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.wvw-scroll{position:relative;z-index:2;padding:0 18px 130px;}
.wvw-head{padding:26px 2px 14px;display:flex;align-items:center;justify-content:space-between;}
.wvw-logo{font-family:'Fraunces',serif;font-size:19px;letter-spacing:.3px;color:var(--cream);}
.wvw-logo b{color:var(--gold);font-style:italic;font-weight:500;padding:0 2px;}
.wvw-eye{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);opacity:.85;margin-bottom:7px;}
.wvw-h1{font-family:'Fraunces',serif;color:var(--cream);font-size:30px;line-height:1.12;font-weight:500;letter-spacing:-.5px;margin:0 0 6px;}
.wvw-sub{color:var(--mist);font-size:15.5px;line-height:1.55;}
.card{background:linear-gradient(180deg,var(--panel),var(--ink2));border:1px solid var(--line);border-radius:20px;padding:20px;margin:14px 0;box-shadow:0 18px 40px -28px rgba(0,0,0,.9);}
.card-glow{background:linear-gradient(180deg,rgba(227,180,101,.13),rgba(19,32,58,.6));border-color:rgba(227,180,101,.3);}
.label{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);opacity:.9;display:flex;align-items:center;gap:7px;margin-bottom:12px;}
.verse{font-family:'Fraunces',serif;font-size:21px;line-height:1.5;color:var(--cream);}
.verse-ref{margin-top:12px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold2);}
.row{display:flex;gap:10px;}
.btn{font-family:'Newsreader',serif;border:none;cursor:pointer;border-radius:999px;padding:11px 17px;font-size:14.5px;display:inline-flex;align-items:center;gap:8px;transition:transform .15s,opacity .2s;}
.btn:active{transform:scale(.96);} .btn:disabled{opacity:.5;}
.btn-gold{background:linear-gradient(180deg,var(--gold2),var(--gold));color:#2a1d05;font-weight:500;}
.btn-ghost{background:rgba(255,255,255,.05);color:var(--cream);border:1px solid var(--line);}
.btn-sm{padding:8px 13px;font-size:13px;}
.icon-btn{background:rgba(255,255,255,.05);border:1px solid var(--line);color:var(--mist);border-radius:12px;width:40px;height:40px;display:grid;place-items:center;cursor:pointer;}
.divider{height:1px;background:var(--line);margin:16px 0;}
.tabbar{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;z-index:20;display:flex;justify-content:space-around;padding:10px 8px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(11,19,34,.4),var(--ink) 55%);backdrop-filter:blur(14px);border-top:1px solid var(--line);}
.tab{flex:1;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--mist2);font-family:'Newsreader',serif;font-size:11px;padding:4px;transition:color .2s;}
.tab.on{color:var(--gold);} .tab .dot{width:5px;height:5px;border-radius:50%;background:var(--gold);opacity:0;transition:opacity .2s;} .tab.on .dot{opacity:1;}
.flame{transform-origin:center bottom;animation:flick 2.4s ease-in-out infinite;filter:drop-shadow(0 0 10px rgba(227,180,101,.6));}
@keyframes flick{0%,100%{transform:scale(1) rotate(-1deg);opacity:.95}50%{transform:scale(1.06) rotate(1.5deg);opacity:1}}
.fade{animation:fade .6s ease both;} .fade1{animation-delay:.05s}.fade2{animation-delay:.13s}.fade3{animation-delay:.22s}.fade4{animation-delay:.31s}
@keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.count{display:flex;gap:8px;justify-content:center;margin:8px 0 4px;}
.count .u{flex:1;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:14px 6px;text-align:center;}
.count .n{font-family:'Fraunces',serif;font-size:30px;color:var(--cream);line-height:1;} .count .l{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--mist2);margin-top:6px;}
.pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--mist);cursor:pointer;}
.pill.on{background:linear-gradient(180deg,var(--gold2),var(--gold));color:#2a1d05;border-color:transparent;font-weight:500;}
.list-item{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);} .list-item:last-child{border-bottom:none;}
.li-title{color:var(--cream);font-size:17px;font-family:'Fraunces',serif;} .li-sub{color:var(--mist2);font-size:13px;margin-top:2px;}
.input,textarea.input{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--cream);border-radius:14px;padding:13px;font-family:'Newsreader',serif;font-size:16px;resize:none;}
.input:focus{outline:none;border-color:var(--gold);}
.entry{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;padding:14px;margin-top:10px;}
.entry .meta{font-size:12px;color:var(--mist2);display:flex;justify-content:space-between;align-items:center;} .entry .txt{color:var(--cream);margin-top:6px;font-size:16px;line-height:1.5;}
.ans{font-size:12px;color:var(--gold);display:inline-flex;align-items:center;gap:5px;cursor:pointer;}
.bar-row{display:flex;align-items:center;gap:10px;margin:11px 0;} .bar-row .nm{width:96px;font-size:14px;color:var(--cream);flex-shrink:0;}
.bar-track{flex:1;height:9px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;} .bar-fill{height:100%;border-radius:99px;transition:width .8s cubic-bezier(.2,.8,.2,1);} .bar-row .mn{width:46px;text-align:right;font-size:13px;color:var(--mist);}
.note{background:rgba(227,180,101,.08);border:1px solid rgba(227,180,101,.22);border-radius:14px;padding:13px 15px;font-size:13.5px;color:var(--gold2);line-height:1.5;margin-top:12px;}
.muted{color:var(--mist2);font-size:13.5px;line-height:1.55;}
.scores{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.score{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:16px;padding:12px;}
.score .sl{font-size:12px;color:var(--mist);line-height:1.2;} .score .sv{font-family:'Fraunces',serif;font-size:18px;color:var(--cream);}
.chip{display:inline-flex;flex-direction:column;align-items:center;gap:2px;min-width:58px;padding:10px 8px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03);}
.chip.earned{background:linear-gradient(180deg,rgba(242,212,154,.22),rgba(227,180,101,.08));border-color:rgba(227,180,101,.4);}
.chip .cn{font-family:'Fraunces',serif;font-size:20px;color:var(--cream);} .chip .cl{font-size:10px;letter-spacing:.06em;color:var(--mist2);text-transform:uppercase;}
.halt{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:14px;border:1px solid var(--line);margin:8px 0;cursor:pointer;background:rgba(255,255,255,.03);}
.halt.on{border-color:var(--gold);background:rgba(227,180,101,.10);}
.halt .ht{flex:1;} .halt .ht b{color:var(--cream);font-family:'Fraunces',serif;font-weight:500;} .halt .ht span{display:block;color:var(--mist2);font-size:13px;margin-top:2px;}
.repl{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:14px;border:1px solid var(--line);margin:8px 0;background:rgba(255,255,255,.03);color:var(--cream);cursor:pointer;font-size:15px;}
.reader{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:40;background:var(--cream);color:var(--creamink);display:flex;flex-direction:column;animation:fade .3s ease;}
.reader-top{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px;}
.reader-top .r-ref{font-family:'Fraunces',serif;font-size:15px;color:#6b5a3a;letter-spacing:.05em;}
.reader-r-btn{background:none;border:none;color:#6b5a3a;cursor:pointer;display:grid;place-items:center;padding:6px;}
.reader-body{flex:1;overflow-y:auto;padding:8px 26px 60px;}
.reader-title{font-family:'Fraunces',serif;font-size:28px;color:var(--creamink);margin:8px 0 4px;font-weight:500;}
.reader-theme{font-style:italic;color:#7c6a45;margin-bottom:22px;font-size:16px;}
.reader-p{font-family:'Newsreader',serif;line-height:1.85;margin:0 0 14px;} .reader-p sup{color:#b08a3c;font-size:.62em;font-weight:600;margin-right:5px;vertical-align:super;}
.reader-foot{padding:12px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:center;justify-content:space-between;background:var(--cream);}
.t-toggle{display:flex;background:rgba(0,0,0,.05);border-radius:999px;padding:3px;} .t-toggle button{border:none;background:none;padding:7px 14px;border-radius:999px;font-family:'Newsreader',serif;font-size:13px;color:#6b5a3a;cursor:pointer;} .t-toggle button.on{background:var(--creamink);color:var(--cream);}
.shield{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:34px;animation:fade .45s ease;background:radial-gradient(120% 80% at 50% 30%, #16264a, #070d18 80%);overflow-y:auto;}
.shield .halo{width:110px;height:110px;border-radius:50%;display:grid;place-items:center;margin-bottom:20px;background:radial-gradient(circle, rgba(227,180,101,.28), transparent 70%);}
.breathe{animation:breathe 5.5s ease-in-out infinite;} @keyframes breathe{0%,100%{transform:scale(.92);opacity:.85}50%{transform:scale(1.08);opacity:1}}
.shield .sv{font-family:'Fraunces',serif;font-size:26px;line-height:1.4;color:var(--cream);max-width:340px;} .shield .sr{margin-top:12px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);} .shield .sp{margin:22px 0 18px;color:var(--mist);font-size:15px;}
.step-view{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:50;display:flex;flex-direction:column;background:radial-gradient(120% 70% at 50% 0%, #16264a, var(--ink) 70%);animation:fade .3s ease;padding:0 22px calc(18px + env(safe-area-inset-bottom));}
.step-n{font-family:'Fraunces',serif;font-size:58px;color:rgba(227,180,101,.25);line-height:1;margin-top:24px;}
.shep-fab{position:fixed;right:16px;bottom:calc(82px + env(safe-area-inset-bottom));z-index:30;width:56px;height:56px;border-radius:50%;border:1px solid rgba(227,180,101,.5);background:linear-gradient(180deg,#1a2c4a,#0b1322);color:var(--gold);display:grid;place-items:center;cursor:pointer;box-shadow:0 12px 30px -10px rgba(0,0,0,.8);}
.shep{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:65;display:flex;flex-direction:column;background:var(--ink);animation:fade .3s ease;}
.shep-top{display:flex;align-items:center;gap:10px;padding:18px 18px 12px;border-bottom:1px solid var(--line);}
.shep-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;}
.shep-msg{max-width:84%;padding:12px 15px;border-radius:18px;font-size:15.5px;line-height:1.5;}
.shep-msg.me{align-self:flex-end;background:linear-gradient(180deg,var(--gold2),var(--gold));color:#2a1d05;border-bottom-right-radius:6px;}
.shep-msg.her{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--line);color:var(--cream);border-bottom-left-radius:6px;}
.shep-foot{padding:12px 14px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--line);}
.shep-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;}
.med{position:fixed;inset:0;max-width:480px;margin:0 auto;z-index:62;display:flex;flex-direction:column;background:radial-gradient(120% 80% at 50% 22%, #16264a, #070d18 85%);animation:fade .4s ease;padding:0 24px calc(22px + env(safe-area-inset-bottom));}
.med-top{display:flex;align-items:center;justify-content:space-between;padding:16px 0 4px;}
.med-sub{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);}
.med-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.med-body{color:var(--mist);font-size:16.5px;line-height:1.6;max-width:340px;}
.med-foot{padding-top:10px;min-height:40px;}
.med-prog{height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;} .med-prog span{display:block;height:100%;background:var(--gold);transition:width 1s linear;}
.halo-c{border-radius:50%;margin:0 auto;background:radial-gradient(circle, rgba(227,180,101,.28), rgba(227,180,101,.03) 70%);border:1px solid rgba(227,180,101,.35);display:grid;place-items:center;}
.grace{background:linear-gradient(180deg,rgba(134,184,154,.14),rgba(19,32,58,.5));border:1px solid rgba(134,184,154,.4);}
.conf-verse{font-family:'Fraunces',serif;font-size:24px;line-height:1.5;color:var(--cream);}
`;

/* ============================ small bits ============================ */
const Card = ({ glow, className = "", children, style, onClick }) =>
  <div className={`card ${glow ? "card-glow" : ""} ${className}`} style={style} onClick={onClick}>{children}</div>;
const minLabel = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
function FlameMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flame" aria-hidden>
      <path d="M12 2c2 3 .5 4.5-.5 6C10 10.5 9 12 11 14c.6.6 1 .2 1-.5 1.5 1 2.5 2.6 2.5 4.2A4.5 4.5 0 0 1 7.5 18c0-2 1-3.6 2.5-5C7 11 9 7 12 2z" fill="url(#fl)"/>
      <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2d49a"/><stop offset="1" stopColor="#e3825f"/></linearGradient></defs>
    </svg>
  );
}
function ScoreRing({ value, size = 44 }) {
  const r = (size - 7) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  const col = value >= 67 ? "#86b89a" : value >= 34 ? "#e3b465" : "#e3825f";
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .9s ease" }} />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill="#f4ecd8" fontFamily="Fraunces,serif" fontSize="13">{value}</text>
    </svg>
  );
}

/* ============================ Scripture Shield (adaptive) ============================ */
function ScriptureShield({ verse, risk, onStay, onOpen, onMood }) {
  const need = risk === "high" ? 60 : 5;
  const [left, setLeft] = useState(need);
  const [mood, setMood] = useState(null);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft((x) => x - 1), 1000); return () => clearTimeout(t); }, [left]);
  const repl = REPLACEMENTS.slice(0, risk === "high" ? 3 : 2);
  return (
    <div className="shield">
      <div className="halo breathe"><FlameMark size={44} /></div>
      <div className="sv">{verse.text}</div>
      <div className="sr">{verse.ref}</div>
      <div className="sp"><Wind size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Breathe. The feed will still be there.</div>

      {risk === "high" && (
        <div style={{ width: "100%", maxWidth: 340, marginBottom: 14 }}>
          <div className="muted" style={{ marginBottom: 6 }}>What are you feeling right now?</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
            {MOODS.map((m) => (
              <span key={m} className={`pill ${mood === m ? "on" : ""}`} onClick={() => { setMood(m); onMood && onMood(m); }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 340, marginBottom: 14 }}>
        {repl.map((r, i) => {
          const Icon = r.icon;
          return <div className="repl" key={i} onClick={onStay}><Icon size={17} color="#e3b465" />{r.label}</div>;
        })}
      </div>

      <button className="btn btn-gold" style={{ width: "100%", maxWidth: 340, justifyContent: "center" }} onClick={onStay}>Step away — I'll choose the Word</button>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} disabled={left > 0} onClick={onOpen}>
        {left > 0 ? `Open anyway in ${left}s` : "Open anyway (5 min)"}
      </button>
    </div>
  );
}

/* ============================ AI Digital Shepherd ============================ */
function Shepherd({ ctx, onClose, onMeditate }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Peace to you. I'm here to walk with you, not to scold. How is your heart today?" }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, busy]);
  const send = async (content) => {
    const c = (content || "").trim(); if (!c || busy) return;
    const next = [...msgs, { role: "user", content: c }];
    setMsgs(next); setText(""); setBusy(true);
    const reply = await shepherd.chat(next.map(({ role, content }) => ({ role, content })), ctx);
    setMsgs((m) => [...m, { role: "assistant", content: reply }]); setBusy(false);
  };
  return (
    <div className="shep">
      <div className="shep-top">
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "radial-gradient(circle,rgba(227,180,101,.3),transparent 70%)", display: "grid", placeItems: "center" }}><FlameMark size={22} /></div>
        <div style={{ flex: 1 }}>
          <div className="display" style={{ color: "var(--cream)", fontSize: 18 }}>The Shepherd</div>
          <div style={{ fontSize: 12, color: "var(--mist2)" }}>{PROXY_URL ? "a gentle companion" : "demo — connect your proxy to go live"}</div>
        </div>
        <button className="icon-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="shep-body" ref={bodyRef}>
        {msgs.map((m, i) => <div key={i} className={`shep-msg ${m.role === "user" ? "me" : "her"}`}>{m.content}</div>)}
        {busy && <div className="shep-msg her" style={{ opacity: .6 }}>…</div>}
      </div>
      <div className="shep-foot">
        <div className="shep-chips">
          {onMeditate && <span className="pill" onClick={onMeditate} style={{ whiteSpace: "nowrap", borderColor: "rgba(227,180,101,.5)", color: "var(--gold2)" }}><Wind size={13} /> Be still with me</span>}
          {["Pray with me", "Suggest something instead", "Why do I keep scrolling?"].map((q) => (
            <span key={q} className="pill" onClick={() => send(q)} style={{ whiteSpace: "nowrap" }}>{q}</span>
          ))}
        </div>
        <div className="row">
          <input className="input" placeholder="Tell the Shepherd…" value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(text); }} style={{ flex: 1 }} />
          <button className="btn btn-gold" onClick={() => send(text)} disabled={busy}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Step journey ============================ */
function StepJourney({ steps, sat, onSit, onSave, onClose }) {
  const [i, setI] = useState(0); const [note, setNote] = useState("");
  const s = steps[i]; const done = sat.includes(s.n);
  return (
    <div className="step-view">
      <div className="reader-top" style={{ padding: "16px 0 8px" }}>
        <button className="reader-r-btn" style={{ color: "var(--mist)" }} onClick={onClose}><ChevronLeft size={22} /></button>
        <span style={{ fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)" }}>The Journey · {sat.length}/12</span>
        <span style={{ width: 22 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="step-n display">{String(s.n).padStart(2, "0")}</div>
        <div className="display" style={{ fontSize: 26, color: "var(--cream)", margin: "2px 0 14px" }}>{s.title}</div>
        <div className="verse display" style={{ fontSize: 21, lineHeight: 1.45 }}>{s.line}</div>
        <div className="verse-ref">{s.verse}</div>
        <div className="muted" style={{ marginTop: 20, color: "var(--gold2)", fontStyle: "italic" }}>{s.prompt}</div>
        <textarea className="input" rows={3} placeholder="Sit with it. Write what comes…" value={note} onChange={(e) => setNote(e.target.value)} style={{ marginTop: 12 }} />
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { if (note.trim()) { onSave(`Step ${s.n}: ${s.title}`, note.trim()); setNote(""); } }}><Check size={14} /> Save to journal</button>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={15} /> Back</button>
        <button className={`btn btn-sm ${done ? "btn-ghost" : "btn-gold"}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => onSit(s.n)}>{done ? <><Check size={15} /> Sat with this</> : "I've sat with this step"}</button>
        <button className="btn btn-ghost btn-sm" disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>Next <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

/* ============================ Prayer / meditation ============================ */
function BreathHalo({ phase, big }) {
  const size = big ? 220 : 150;
  const scale = phase === "in" ? 1.15 : phase === "out" ? 0.82 : 1;
  const dur = phase === "in" ? 4 : phase === "out" ? 6 : 5.5;
  return (
    <div className="halo-c" style={{ width: size, height: size, transform: `scale(${scale})`, transition: `transform ${dur}s ease-in-out` }}>
      <FlameMark size={big ? 44 : 34} />
    </div>
  );
}
function StepMeditation({ med, onClose, onComplete }) {
  const steps = med.steps;
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const s = steps[i];
  useEffect(() => { setElapsed(0); const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t); }, [i]);
  const pct = Math.min(100, (elapsed / s.secs) * 100);
  const last = i === steps.length - 1;
  return (
    <div className="med">
      <div className="med-top"><button className="icon-btn" onClick={onClose}><X size={18} /></button><span className="med-sub">{med.subtitle}</span><span style={{ width: 40 }} /></div>
      <div className="med-mid">
        <div className="breathe" style={{ marginBottom: 28 }}><BreathHalo /></div>
        <div className="display" style={{ fontSize: 24, color: "var(--cream)", marginBottom: 12 }}>{s.t}</div>
        <div className="med-body">{s.body}</div>
      </div>
      <div className="med-foot">
        <div className="med-prog"><span style={{ width: `${pct}%` }} /></div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={15} /> Back</button>
          {last
            ? <button className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={onComplete}>Amen</button>
            : <button className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => setI(i + 1)}>Next <ChevronRight size={15} /></button>}
        </div>
      </div>
    </div>
  );
}
function BreathMeditation({ med, onClose, onComplete }) {
  const [mins, setMins] = useState(null);
  const [phase, setPhase] = useState("in");
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (mins == null) return;
    setLeft(mins * 60);
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    let alive = true;
    const cycle = () => { if (!alive) return; setPhase("in"); setTimeout(() => { if (alive) { setPhase("out"); setTimeout(cycle, 6000); } }, 4000); };
    cycle();
    return () => { alive = false; clearInterval(tick); };
  }, [mins]);
  if (mins == null) {
    return (
      <div className="med">
        <div className="med-top"><button className="icon-btn" onClick={onClose}><X size={18} /></button><span className="med-sub">{med.subtitle}</span><span style={{ width: 40 }} /></div>
        <div className="med-mid">
          <div className="breathe" style={{ marginBottom: 26 }}><BreathHalo /></div>
          <div className="display" style={{ fontSize: 24, color: "var(--cream)", marginBottom: 10 }}>Breath Prayer</div>
          <div className="med-body" style={{ marginBottom: 22 }}>On the in-breath, receive His word; on the out-breath, give Him your heart. How long shall we rest here?</div>
          <div className="row" style={{ justifyContent: "center", gap: 10 }}>{[3, 5, 10].map((m) => <span key={m} className="pill" onClick={() => setMins(m)}>{m} min</span>)}</div>
        </div>
        <div className="med-foot" />
      </div>
    );
  }
  const done = left <= 0;
  return (
    <div className="med">
      <div className="med-top"><button className="icon-btn" onClick={onClose}><X size={18} /></button><span className="med-sub">{Math.max(0, Math.floor(left / 60))}:{String(Math.max(0, left % 60)).padStart(2, "0")}</span><span style={{ width: 40 }} /></div>
      <div className="med-mid">
        <BreathHalo phase={phase} big />
        <div className="display" style={{ fontSize: 24, color: "var(--cream)", marginTop: 28, minHeight: 58 }}>{phase === "in" ? med.breathPrayer.in : med.breathPrayer.out}</div>
        <div className="med-body">{phase === "in" ? "Breathe in…" : "Breathe out…"}</div>
      </div>
      <div className="med-foot">
        {done ? <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={onComplete}>Amen</button>
              : <div className="muted" style={{ textAlign: "center" }}>Rest in the rhythm. The Word fills the stillness.</div>}
      </div>
    </div>
  );
}
function Meditation({ med, onClose, onComplete }) {
  return med.breathPrayer
    ? <BreathMeditation med={med} onClose={onClose} onComplete={onComplete} />
    : <StepMeditation med={med} onClose={onClose} onComplete={onComplete} />;
}

/* ============================ Confession → assurance → faith ============================ */
function Confession({ onClose, onDone }) {
  const [stage, setStage] = useState(0);
  const [text, setText] = useState("");
  const a = FORGIVENESS.assurances[Math.floor(Math.random() * FORGIVENESS.assurances.length)];
  const f = FORGIVENESS.faith[Math.floor(Math.random() * FORGIVENESS.faith.length)];
  return (
    <div className="med">
      <div className="med-top"><button className="icon-btn" onClick={onClose}><X size={18} /></button><span className="med-sub">Making peace</span><span style={{ width: 40 }} /></div>

      {stage === 0 && (
        <>
          <div className="med-mid">
            <div className="display" style={{ fontSize: 25, color: "var(--cream)", marginBottom: 12 }}>Bring it into the light</div>
            <div className="med-body" style={{ marginBottom: 16 }}>You can be honest here — it stays between you and God; nothing is saved or sent. What do you want to lay down?</div>
            <textarea className="input" rows={4} placeholder="Tell Him plainly…" value={text} onChange={(e) => setText(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
          <div className="med-foot"><button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStage(1)}>Continue</button></div>
        </>
      )}

      {stage === 1 && (
        <>
          <div className="med-mid">
            <div className="breathe" style={{ marginBottom: 24 }}><BreathHalo /></div>
            <div className="display" style={{ fontSize: 23, color: "var(--cream)", marginBottom: 12 }}>Lay it down</div>
            <div className="med-body">Pray, in your own words or these: <span style={{ color: "var(--gold2)", fontStyle: "italic" }}>“Lord, I have wandered, and I'm sorry. I turn back to You. Wash me, and hold me.”</span></div>
          </div>
          <div className="med-foot"><button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStage(2)}>I lay this down</button></div>
        </>
      )}

      {stage === 2 && (
        <>
          <div className="med-mid">
            <div className="label" style={{ justifyContent: "center", color: "var(--sage)" }}><Heart size={13} /> You are forgiven</div>
            <div className="conf-verse" style={{ margin: "6px 0 12px" }}>{a.text}</div>
            <div className="verse-ref" style={{ color: "var(--sage)" }}>{a.ref}</div>
            <div className="med-body" style={{ marginTop: 18 }}>This is not a feeling to wait for. It is finished. Receive it.</div>
          </div>
          <div className="med-foot"><button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={() => setStage(3)}><Check size={16} /> I receive His forgiveness</button></div>
        </>
      )}

      {stage === 3 && (
        <>
          <div className="med-mid">
            <div className="label" style={{ justifyContent: "center" }}><Sparkles size={13} /> Stand in faith</div>
            <div className="conf-verse" style={{ margin: "6px 0 12px" }}>{f.text}</div>
            <div className="verse-ref">{f.ref}</div>
            <div className="med-body" style={{ marginTop: 18 }}>You are not your failure. You are a new creation, kept by the One who finishes what He starts.</div>
          </div>
          <div className="med-foot"><button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={onDone}>I am forgiven. I am free in Christ.</button></div>
        </>
      )}
    </div>
  );
}

/* ============================ tabs ============================ */
function HomeTab({ streak, onCheckin, sabbath, now, votd, devo, onNewDevo, go, scores }) {
  const checkedToday = streak.lastDate === todayKey();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const sline = sabbath ? (sabbath.inSabbath ? `Sabbath rest — until ${fmtTime(sabbath.end)} tomorrow` : `Begins ${fmtTime(sabbath.begin)} Friday`) : "Calculating sunset…";
  return (
    <div className="wvw-scroll">
      <div className="wvw-head"><span className="wvw-logo display">Wi-Fi <b>vs</b> The Word</span><FlameMark /></div>
      <div className="fade fade1" style={{ padding: "4px 2px 6px" }}>
        <div className="wvw-eye">Daily Bread · {greet}</div>
        <div className="wvw-h1 display">The Word,<br />always within reach.</div>
      </div>
      <Card glow className="fade fade2">
        <div className="label"><Quote size={13} /> Verse of the Day</div>
        <div className="verse">{votd.text}</div>
        <div className="verse-ref">{votd.ref}</div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btn-gold btn-sm" onClick={() => go("bible")}><BookOpen size={15} /> Read more</button>
          <button className="btn btn-ghost btn-sm"><Share2 size={15} /> Share</button>
        </div>
      </Card>
      <Card className="fade fade2" onClick={() => go("screen")} style={{ cursor: "pointer" }}>
        <div className="label"><Activity size={13} /> Today's wholeness</div>
        <div className="scores">
          {scores.map((s) => (
            <div className="score" key={s.key}><ScoreRing value={s.value} /><div><div className="sv">{s.value}</div><div className="sl">{s.label}</div></div></div>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 10 }}>Not points to chase — a mirror. The aim is less screen, more life.</div>
      </Card>
      <Card className="fade fade3" onClick={() => go("sabbath")} style={{ cursor: "pointer" }}>
        <div className="label"><Sun size={13} /> Digital Sabbath</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div className="verse" style={{ fontSize: 19 }}>Rest is coming</div><Sun size={28} color="#e3b465" /></div>
        <div className="muted" style={{ marginTop: 6 }}>{sline}</div>
      </Card>
      <Card className="fade fade3">
        <div className="label"><Feather size={13} /> A fresh word</div>
        <div className="verse display" style={{ fontSize: 18, color: "var(--gold2)" }}>{devo.title}</div>
        <div className="wvw-sub" style={{ marginTop: 8 }}>{devo.body}</div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={onNewDevo}><RefreshCw size={14} /> New devotional</button>
      </Card>
      <Card className="fade fade4">
        <div className="label"><Flame size={13} /> The family altar streak</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 46, color: "var(--cream)", lineHeight: 1 }}>{streak.count}</div>
          <div className="muted" style={{ flex: 1 }}>{streak.count === 1 ? "day" : "days"} of presence. One faithful day at a time — and if you miss one, grace.</div>
        </div>
        <button className={`btn btn-sm ${checkedToday ? "btn-ghost" : "btn-gold"}`} style={{ marginTop: 16, width: "100%", justifyContent: "center" }} disabled={checkedToday} onClick={onCheckin}>
          {checkedToday ? <><Check size={15} /> Today's moment kept</> : <>I kept today's phone-free moment</>}
        </button>
      </Card>
    </div>
  );
}

function BibleTab({ translation, setTranslation, open }) {
  return (
    <div className="wvw-scroll">
      <div className="wvw-head"><span className="wvw-logo display">The Scriptures</span><BookOpen size={22} color="#e3b465" /></div>
      <div className="fade fade1" style={{ padding: "0 2px 4px" }}>
        <div className="wvw-eye">Installed · Offline · No links · No noise</div>
        <div className="wvw-h1 display" style={{ fontSize: 26 }}>Read, undistracted.</div>
        <div className="wvw-sub">The whole Bible lives on your device — no signal needed, even in airplane mode. Just the text: no images, no rabbit holes.</div>
        <div style={{ marginTop: 12 }}>
          <span className="pill" style={{ borderColor: "rgba(134,184,154,.5)", color: "var(--sage)" }}><Check size={13} /> Full Bible installed · 66 books · works offline</span>
        </div>
      </div>
      <div className="row fade fade2" style={{ margin: "16px 0 4px" }}>
        <span className={`pill ${translation === "kjv" ? "on" : ""}`} onClick={() => setTranslation("kjv")}>KJV</span>
        <span className={`pill ${translation === "web" ? "on" : ""}`} onClick={() => setTranslation("web")}>WEB</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--mist2)", alignSelf: "center" }}>public domain</span>
      </div>
      <Card className="fade fade3" style={{ padding: "6px 18px" }}>
        {PASSAGES.map((p) => (
          <div className="list-item" key={p.id} onClick={() => open(p)} style={{ cursor: "pointer" }}>
            <BookOpen size={18} color="#e3b465" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div className="li-title">{p.ref}</div><div className="li-sub">{p.theme}</div></div>
            <ChevronRight size={18} style={{ color: "var(--mist2)" }} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function Reader({ passage, translation, setTranslation, scale, setScale, onClose }) {
  const verses = passage[translation];
  return (
    <div className="reader">
      <div className="reader-top">
        <button className="reader-r-btn" onClick={onClose}><ChevronLeft size={22} /></button>
        <span className="r-ref">{passage.ref}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button className="reader-r-btn" onClick={() => setScale(Math.max(0.85, +(scale - 0.1).toFixed(2)))}><Minus size={18} /></button>
          <button className="reader-r-btn" onClick={() => setScale(Math.min(1.6, +(scale + 0.1).toFixed(2)))}><Plus size={18} /></button>
        </div>
      </div>
      <div className="reader-body" style={{ fontSize: `${19 * scale}px` }}>
        <div className="reader-title">{passage.ref}</div>
        <div className="reader-theme">{passage.theme}</div>
        {verses.map((v, i) => <p className="reader-p" key={i}><sup>{i + 1}</sup>{v}</p>)}
      </div>
      <div className="reader-foot">
        <div className="t-toggle">
          <button className={translation === "kjv" ? "on" : ""} onClick={() => setTranslation("kjv")}>KJV</button>
          <button className={translation === "web" ? "on" : ""} onClick={() => setTranslation("web")}>WEB</button>
        </div>
        <span style={{ fontSize: 13, color: "#7c6a45", fontStyle: "italic" }}>Wi-Fi vs The Word</span>
      </div>
    </div>
  );
}

function SabbathTab({ sabbath, now, loc, setLoc }) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 30000); return () => clearInterval(t); }, []);
  const target = sabbath ? (sabbath.inSabbath ? sabbath.end : sabbath.begin) : null;
  let d = 0, h = 0, m = 0;
  if (target) { let ms = Math.max(0, target - new Date()); d = Math.floor(ms / 86400000); h = Math.floor((ms % 86400000) / 3600000); m = Math.floor((ms % 3600000) / 60000); }
  const todaySunset = getSunset(now, loc.lat, loc.lng);
  return (
    <div className="wvw-scroll">
      <div className="wvw-head"><span className="wvw-logo display">Digital Sabbath</span><Sun size={22} color="#e3b465" /></div>
      <div className="fade fade1" style={{ padding: "0 2px 4px" }}>
        <div className="wvw-eye">Sundown Friday → Sundown Saturday</div>
        <div className="wvw-h1 display" style={{ fontSize: 26 }}>{sabbath?.inSabbath ? "It is the Sabbath." : "Rest is coming."}</div>
        <div className="wvw-sub">{sabbath?.inSabbath ? "The notifications can wait. Feast on the Word and the people in the room." : "A weekly rhythm of putting the devices down — to feast on what matters."}</div>
      </div>
      <Card glow className="fade fade2">
        <div className="label"><Sun size={13} /> {sabbath?.inSabbath ? "Sabbath ends in" : "Sabbath begins in"}</div>
        <div className="count">
          <div className="u"><div className="n">{d}</div><div className="l">days</div></div>
          <div className="u"><div className="n">{h}</div><div className="l">hours</div></div>
          <div className="u"><div className="n">{m}</div><div className="l">min</div></div>
        </div>
        {sabbath && <div className="muted" style={{ textAlign: "center", marginTop: 10 }}>Begins {fmtTime(sabbath.begin)} Fri · Ends {fmtTime(sabbath.end)} Sat</div>}
      </Card>
      <Card className="fade fade3">
        <div className="label"><MapPin size={13} /> Your location (for sunset)</div>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {LOCATIONS.map((l) => <span key={l.label} className={`pill ${loc.label === l.label ? "on" : ""}`} onClick={() => setLoc(l)}>{l.label}</span>)}
        </div>
        <div className="muted" style={{ marginTop: 12 }}>Today's sunset here: <span style={{ color: "var(--gold2)" }}>{fmtTime(todaySunset)}</span> · calculated on-device, fully offline.</div>
      </Card>
      <Card className="fade fade4">
        <div className="label"><Sun size={13} /> Home-screen widget (preview)</div>
        <div style={{ background: "linear-gradient(135deg,#0b1322,#1a2c4a)", border: "1px solid var(--line)", borderRadius: 18, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)" }}>Next Sabbath</div>
          <div className="display" style={{ fontSize: 26, color: "var(--cream)", marginTop: 6 }}>{d}d {h}h {m}m</div>
          <div className="muted" style={{ marginTop: 4 }}>{loc.label} · sundown {fmtTime(sabbath?.begin)}</div>
        </div>
        <div className="muted" style={{ marginTop: 10 }}>Ships as a real WidgetKit / App Widget in Phase 3.</div>
      </Card>
    </div>
  );
}

function RenewTab({ journal, addEntry, toggleAnswered, reminders, addReminder, removeReminder, promptIdx, nextPrompt, streak, partner, setPartner, family, setFamily, openSteps, stepSat, onMeditate, onConfess, needsGrace }) {
  const [draft, setDraft] = useState("");
  const [rLabel, setRLabel] = useState(""); const [rTime, setRTime] = useState("06:30"); const [rKind, setRKind] = useState("prayer");
  const [halt, setHalt] = useState(null);
  const [pName, setPName] = useState(partner.name || ""); const [pContact, setPContact] = useState(partner.contact || ""); const [pChannel, setPChannel] = useState(partner.channel || "whatsapp");
  const [member, setMember] = useState(""); const [amount, setAmount] = useState(100);
  const prompt = PROMPTS[promptIdx % PROMPTS.length];
  const savePartner = () => setPartner({ name: pName.trim(), contact: pContact.trim(), channel: pChannel });
  const checkIn = () => openExternal(composeMessage(partner, `Hi ${partner.name || "friend"}, my weekly note from Wi-Fi vs The Word: ${streak.count} day(s) of presence, on the journey at ${stepSat.length}/12 steps. Thank you for walking with me.`));
  const sos = () => openExternal(composeMessage(partner, `Friend, I'm feeling the pull right now and want to choose the Word instead of the scroll. Could you pray for me? — sent from Wi-Fi vs The Word`));
  const addMember = () => { if (member.trim()) { setFamily({ ...family, members: [...family.members, { id: Date.now(), name: member.trim() }] }); setMember(""); } };
  const removeMember = (id) => setFamily({ ...family, members: family.members.filter((m) => m.id !== id) });
  return (
    <div className="wvw-scroll">
      <div className="wvw-head"><span className="wvw-logo display">Renewing the Mind</span><Heart size={22} color="#e3b465" /></div>
      <div className="fade fade1" style={{ padding: "0 2px 4px" }}>
        <div className="wvw-eye">Grace, not guilt · one day at a time</div>
        <div className="wvw-h1 display" style={{ fontSize: 26 }}>Freedom is a daily walk.</div>
      </div>

      <Card className="fade fade1">
        <div className="label"><Award size={13} /> Days of presence</div>
        <div className="row" style={{ gap: 8, overflowX: "auto" }}>
          {MILESTONES.map((m) => <div key={m.d} className={`chip ${streak.count >= m.d ? "earned" : ""}`}><span className="cn">{m.d}</span><span className="cl">{m.label}</span></div>)}
        </div>
        <div className="muted" style={{ marginTop: 10 }}>{streak.count} day{streak.count === 1 ? "" : "s"} kept. Miss one? Grace — simply begin again.</div>
      </Card>

      <Card glow className="fade fade2">
        <div className="label"><ArrowRight size={13} /> The Journey</div>
        <div className="wvw-sub">Twelve gentle steps — borrowed from those who've walked out of deeper addictions — reframed around Christ and the renewing of the mind. Optional, unhurried.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0" }}>
          <div className="display" style={{ fontSize: 34, color: "var(--gold2)" }}>{stepSat.length}<span style={{ fontSize: 18, color: "var(--mist2)" }}>/12</span></div>
          <div className="muted" style={{ flex: 1 }}>steps you've sat with so far.</div>
        </div>
        <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={openSteps}>{stepSat.length ? "Continue the journey" : "Begin the journey"} <ArrowRight size={15} /></button>
      </Card>

      <Card className="fade fade2">
        <div className="label"><Anchor size={13} /> Before you reach for it — pause</div>
        <div className="muted" style={{ marginBottom: 6 }}>Often the phone isn't the real hunger. Which is it right now?</div>
        {HALT_ITEMS.map((it) => { const Icon = it.icon; const on = halt === it.key; return (
          <div key={it.key} className={`halt ${on ? "on" : ""}`} onClick={() => setHalt(on ? null : it.key)}>
            <Icon size={18} color={on ? "#e3b465" : "#9fb0c8"} /><div className="ht"><b>{it.label}</b>{on && <span>{it.tip}</span>}</div>
          </div>); })}
      </Card>

      <Card className="fade fade3">
        <div className="label"><Sparkles size={13} /> Daily inventory</div>
        <div className="verse display" style={{ fontSize: 19, lineHeight: 1.45 }}>{prompt}</div>
        <textarea className="input" rows={3} placeholder="Write a quiet line or two…" value={draft} onChange={(e) => setDraft(e.target.value)} style={{ marginTop: 14 }} />
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-gold btn-sm" onClick={() => { if (draft.trim()) { addEntry(prompt, draft.trim()); setDraft(""); } }}><Check size={15} /> Save entry</button>
          <button className="btn btn-ghost btn-sm" onClick={nextPrompt}><RefreshCw size={14} /> New prompt</button>
        </div>
      </Card>

      <Card glow className="fade fade3">
        <div className="label"><Quote size={13} /> A prayer for serenity</div>
        <div className="verse" style={{ fontSize: 18, lineHeight: 1.55 }}>{SERENITY}</div>
      </Card>

      {needsGrace && (
        <Card className="fade fade3 grace">
          <div className="label" style={{ color: "var(--sage)" }}><Heart size={13} /> Carrying something from earlier?</div>
          <div className="wvw-sub">No hurry, and no shame. When you're ready, lay it down and hear how fully He forgives.</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={onConfess}>Make peace with God</button>
        </Card>
      )}

      <Card className="fade fade3">
        <div className="label"><Wind size={13} /> Stillness & prayer</div>
        <div className="wvw-sub" style={{ marginBottom: 6 }}>Not emptying the mind — filling it with the Word. A few quiet minutes with God.</div>
        {MEDITATIONS.map((m) => (
          <div className="list-item" key={m.id} onClick={() => onMeditate(m)} style={{ cursor: "pointer" }}>
            <Wind size={18} color="#e3b465" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div className="li-title" style={{ fontSize: 16 }}>{m.title}</div><div className="li-sub">{m.subtitle}</div></div>
            <ChevronRight size={18} style={{ color: "var(--mist2)" }} />
          </div>
        ))}
      </Card>

      <Card className="fade fade3">
        <div className="label"><Heart size={13} /> When you've stumbled</div>
        <div className="wvw-sub" style={{ marginBottom: 12 }}>If something is weighing on you — especially a habit you know is sin — bring it to God and walk away truly forgiven. Confession, then assurance, then faith.</div>
        <button className="btn btn-gold btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={onConfess}>Make peace with God</button>
      </Card>

      <Card className="fade fade4">
        <div className="label"><Users size={13} /> Your accountability partner</div>
        <div className="wvw-sub" style={{ marginBottom: 12 }}>Nominate one trusted person — a coach, not a cop. Nothing sends automatically; you choose when to reach out, straight from your phone.</div>
        <input className="input" placeholder="Partner's name" value={pName} onChange={(e) => setPName(e.target.value)} style={{ marginBottom: 8 }} />
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span className={`pill ${pChannel === "whatsapp" ? "on" : ""}`} onClick={() => setPChannel("whatsapp")}>WhatsApp</span>
          <span className={`pill ${pChannel === "email" ? "on" : ""}`} onClick={() => setPChannel("email")}>Email</span>
        </div>
        <input className="input" placeholder={pChannel === "email" ? "name@email.com" : "+27 phone number"} value={pContact} onChange={(e) => setPContact(e.target.value)} />
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={savePartner}><Check size={14} /> Save partner</button>
        {partner.name && (
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={checkIn}><Send size={14} /> Weekly check-in</button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={sos}><Heart size={14} /> Pray for me now</button>
          </div>
        )}
      </Card>

      <Card className="fade fade4">
        <div className="label"><Bell size={13} /> Prayer & study reminders</div>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <span className={`pill ${rKind === "prayer" ? "on" : ""}`} onClick={() => setRKind("prayer")}>Prayer</span>
          <span className={`pill ${rKind === "study" ? "on" : ""}`} onClick={() => setRKind("study")}>Study</span>
        </div>
        <div className="row">
          <input className="input" placeholder={rKind === "prayer" ? "Morning prayer" : "Bible study"} value={rLabel} onChange={(e) => setRLabel(e.target.value)} style={{ flex: 1 }} />
          <input className="input" type="time" value={rTime} onChange={(e) => setRTime(e.target.value)} style={{ width: 120 }} />
        </div>
        <button className="btn btn-gold btn-sm" style={{ marginTop: 10 }} onClick={() => { addReminder({ id: Date.now(), label: rLabel.trim() || (rKind === "prayer" ? "Prayer" : "Study"), time: rTime, kind: rKind }); setRLabel(""); }}><Plus size={15} /> Add reminder</button>
        {reminders.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {reminders.slice().sort((a, b) => a.time.localeCompare(b.time)).map((r) => (
              <div className="list-item" key={r.id}>
                <Bell size={16} color={r.kind === "prayer" ? "#e3b465" : "#9fb0c8"} />
                <div style={{ flex: 1 }}><div className="li-title" style={{ fontSize: 16 }}>{r.label}</div><div className="li-sub">{r.kind === "prayer" ? "Prayer" : "Study"} · daily</div></div>
                <span style={{ color: "var(--gold2)", fontSize: 15 }}>{r.time}</span>
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => removeReminder(r.id)}><X size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="fade fade4">
        <div className="label"><Users size={13} /> Our household</div>
        <textarea className="input" rows={2} placeholder="Our family covenant: phone-free meals, devices charge outside the bedroom…" value={family.covenant} onChange={(e) => setFamily({ ...family, covenant: e.target.value })} />
        <div className="row" style={{ marginTop: 10 }}>
          <input className="input" placeholder="Add a family member" value={member} onChange={(e) => setMember(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-gold btn-sm" onClick={addMember}><Plus size={15} /></button>
        </div>
        {family.members.map((m) => (
          <div className="list-item" key={m.id}><Users size={16} color="#e3b465" /><div style={{ flex: 1 }} className="li-title">{m.name}</div>
            <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => removeMember(m.id)}><X size={15} /></button></div>
        ))}
        <div className="note">Family data stays on this device for now. A private cross-device family link comes later.</div>
      </Card>

      <Card glow className="fade fade4">
        <div className="label"><Gift size={13} /> Keep it free for every family</div>
        <div className="wvw-sub" style={{ marginBottom: 12 }}>This app is given away free. If it has helped your home, a gift helps us reach another — securely through PayFast.</div>
        <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {[50, 100, 250, 500].map((a) => <span key={a} className={`pill ${amount === a ? "on" : ""}`} onClick={() => setAmount(a)}>R{a}</span>)}
        </div>
        <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={() => openExternal(buildDonateUrl(amount))}><Gift size={15} /> Give R{amount}</button>
      </Card>

      {journal.length > 0 && (
        <Card className="fade fade4">
          <div className="label"><Feather size={13} /> Journal</div>
          {journal.map((e) => (
            <div className="entry" key={e.id}>
              <div className="meta"><span>{e.date}</span><span className="ans" onClick={() => toggleAnswered(e.id)}><Check size={13} color={e.answered ? "#e3b465" : "#6f819d"} />{e.answered ? "Answered" : "Mark answered"}</span></div>
              <div className="txt">{e.text}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ScreenTab({ mode, granted, onGrant, usage, scanning, onScan, goal, setGoal, nudge, setNudge, redirected, onShield, scores, trigger }) {
  const total = usage ? usage.totalMinutes : 0;
  const over = total > goal;
  const top = usage ? Math.max(...usage.apps.map((a) => a.minutes), 1) : 1;
  return (
    <div className="wvw-scroll">
      <div className="wvw-head"><span className="wvw-logo display">Screen Time</span><Shield size={22} color="#e3b465" /></div>
      <div className="fade fade1" style={{ padding: "0 2px 4px" }}>
        <div className="wvw-eye">Not a streak that chains you to a screen</div>
        <div className="wvw-h1 display" style={{ fontSize: 26 }}>One that calls you off it.</div>
      </div>

      <Card className="fade fade1">
        <div className="label"><Activity size={13} /> Your four scores</div>
        <div className="scores">
          {scores.map((s) => <div className="score" key={s.key}><ScoreRing value={s.value} /><div><div className="sv">{s.value}</div><div className="sl">{s.label}</div></div></div>)}
        </div>
        <div className="muted" style={{ marginTop: 10 }}>Raw minutes turned into meaning — attention, dopamine balance, family, and the spiritual life.</div>
      </Card>

      {!granted ? (
        <Card glow className="fade fade2">
          <div className="label"><Lock size={13} /> Permission needed</div>
          <div className="wvw-sub">{mode === "usage" ? "Grant usage access so the app can gently show where your attention went today. Your data never leaves this device." : mode === "shield" ? "Grant Screen Time access so the app can shield distracting apps with a verse. Apple keeps the data on your device — we never see it." : "On a real device this asks for usage / Screen Time access. In this preview we'll simulate it."}</div>
          <button className="btn btn-gold" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={onGrant}>Grant access</button>
        </Card>
      ) : (
        <>
          <Card glow className="fade fade2">
            <div className="label"><Shield size={13} /> Today's attention</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div className="display" style={{ fontSize: 40, color: over ? "var(--rose)" : "var(--cream)" }}>{minLabel(total)}</div>
              <div className="muted">of {minLabel(goal)} goal</div>
            </div>
            <div className="muted" style={{ marginBottom: 8 }}>{over ? "Over today's goal — be gentle with yourself, and begin again." : "Within your goal. Well kept."}</div>
            {usage && usage.apps.map((a, i) => (
              <div className="bar-row" key={i}><span className="nm">{a.appName}</span><span className="bar-track"><span className="bar-fill" style={{ width: `${(a.minutes / top) * 100}%`, background: a.color || "#e3b465" }} /></span><span className="mn">{a.minutes}m</span></div>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={onScan} disabled={scanning}><RefreshCw size={14} /> {scanning ? "Reading…" : "Refresh"}</button>
            {mode !== "usage" && <div className="note">On iOS, Apple keeps raw minutes private — this view reflects your set limits and threshold events, not exact per-app time.</div>}
          </Card>

          <Card className="fade fade3">
            <div className="label"><Activity size={13} /> When the pull comes</div>
            {trigger ? (
              <div className="wvw-sub">Your honest pattern: the pull tends to come in the <span style={{ color: "var(--gold2)" }}>{trigger.when}</span>, often when you feel <span style={{ color: "var(--gold2)" }}>{trigger.mood || "restless"}</span>. Name it, and you can meet it with prayer instead of the scroll.</div>
            ) : (
              <div className="muted">Not enough data yet. Each time the Shield appears and you name a feeling, the pattern grows clearer — privately, on this device only.</div>
            )}
          </Card>

          <Card className="fade fade3">
            <div className="label"><Sparkles size={13} /> Daily goal & gentle nudge</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>{[60, 90, 120, 180].map((g) => <span key={g} className={`pill ${goal === g ? "on" : ""}`} onClick={() => setGoal(g)}>{minLabel(g)}</span>)}</div>
            <div className="divider" />
            <div className="label" style={{ marginBottom: 8 }}><Bell size={13} /> Nudge after</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>{[15, 30, 45].map((n) => <span key={n} className={`pill ${nudge === n ? "on" : ""}`} onClick={() => setNudge(n)}>{n} min</span>)}</div>
            <div className="muted" style={{ marginTop: 10 }}>“You've given {nudge} min to the scroll — relax, breathe, pray?” No shaming, just a quiet tap.</div>
          </Card>

          <Card className="fade fade4">
            <div className="label"><Shield size={13} /> The Scripture Shield · adaptive friction</div>
            <div className="wvw-sub">A short pause for a light moment; a longer one — with a verse, a breath, and something better to do — when you're past your limit.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0" }}>
              <div className="display" style={{ fontSize: 36, color: "var(--gold2)" }}>{redirected}</div>
              <div className="muted" style={{ flex: 1 }}>{redirected === 1 ? "time" : "times"} the shield turned you back toward peace.</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onShield("low")}>Preview · light</button>
              <button className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onShield("high")}><Shield size={15} /> Preview · high-risk</button>
            </div>
            <div className="note"><b style={{ color: "var(--gold2)" }}>Android:</b> real usage + overlay shield. <b style={{ color: "var(--gold2)" }}>iOS:</b> Family Controls shield. Both replace the app with this, and offer a real alternative — not just a block.</div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ============================ root ============================ */
export default function WiFiVsTheWord() {
  const [tab, setTab] = useState("home");
  const [translation, setTranslation] = useState("kjv");
  const [openPassage, setOpenPassage] = useState(null);
  const [scale, setScale] = useState(1);
  const [now, setNow] = useState(new Date());
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [journal, setJournal] = useState([]);
  const [reminders, setReminders] = useState([
    { id: 1, label: "Morning prayer", time: "06:00", kind: "prayer" },
    { id: 2, label: "Evening Bible study", time: "20:00", kind: "study" },
  ]);
  const [devoIdx, setDevoIdx] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [stMode, setStMode] = useState("demo");
  const [granted, setGranted] = useState(false);
  const [usage, setUsage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [goal, setGoalV] = useState(120);
  const [nudge, setNudgeV] = useState(30);
  const [redirected, setRedirected] = useState(0);
  const [shield, setShield] = useState(null); // {risk}
  const [partner, setPartner] = useState({ name: "", channel: "whatsapp", contact: "" });
  const [family, setFamily] = useState({ members: [], covenant: "" });
  const [stepSat, setStepSat] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [showShep, setShowShep] = useState(false);
  const [triggerLog, setTriggerLog] = useState([]);
  const [showMed, setShowMed] = useState(null);
  const [showConfession, setShowConfession] = useState(false);
  const [needsGrace, setNeedsGrace] = useState(false);
  const shieldVerse = SHIELD_VERSES[dayOfYear(now) % SHIELD_VERSES.length];

  useEffect(() => {
    (async () => {
      setStreak(await store.get("streak", { count: 0, lastDate: null }));
      setJournal(await store.get("journal", []));
      setReminders(await store.get("reminders", reminders));
      setLoc(await store.get("loc", LOCATIONS[0]));
      setGoalV(await store.get("goal", 120));
      setNudgeV(await store.get("nudge", 30));
      setRedirected(await store.get("redirected", 0));
      setPartner(await store.get("partner", { name: "", channel: "whatsapp", contact: "" }));
      setFamily(await store.get("family", { members: [], covenant: "" }));
      setStepSat(await store.get("stepSat", []));
      setTriggerLog(await store.get("triggerLog", []));
      setNeedsGrace(await store.get("needsGrace", false));
      const sup = await screenTime.isSupported(); setStMode(sup.mode || "demo");
      const auth = await screenTime.checkAuthorization(); setGranted(!!auth.granted);
    })();
    const seed = dayOfYear(new Date());
    setDevoIdx(seed % DEVOTIONALS.length); setPromptIdx(seed % PROMPTS.length);
    const t = setInterval(() => setNow(new Date()), 60000);
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ label: "My location", lat: p.coords.latitude, lng: p.coords.longitude }), () => {}, { timeout: 4000 });
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const votd = VOTD[dayOfYear(now) % VOTD.length];
  const devo = DEVOTIONALS[devoIdx % DEVOTIONALS.length];
  const sabbath = computeSabbath(now, loc.lat, loc.lng);
  const usageTotal = usage ? usage.totalMinutes : USAGE_DEMO.reduce((a, b) => a + b.minutes, 0);
  const scores = computeScores({ usageTotal, goal, streak: streak.count, journalCount: journal.length, steps: stepSat.length, redirected });
  const trigger = triggerSummary(triggerLog);
  const shepCtx = { usageMinutes: usageTotal, goalMinutes: goal, streak: streak.count, steps: stepSat.length, longing: "more presence with God and the people I love" };

  const checkin = () => {
    const today = todayKey(); if (streak.lastDate === today) return;
    const yest = todayKey(new Date(Date.now() - 86400000));
    const next = { count: streak.lastDate === yest ? streak.count + 1 : 1, lastDate: today };
    setStreak(next); store.set("streak", next);
  };
  const addEntry = (prompt, text) => { const e = { id: Date.now(), date: new Date().toLocaleDateString([], { day: "numeric", month: "short" }), prompt, text, answered: false }; const next = [e, ...journal]; setJournal(next); store.set("journal", next); };
  const toggleAnswered = (id) => { const next = journal.map((e) => e.id === id ? { ...e, answered: !e.answered } : e); setJournal(next); store.set("journal", next); };
  const addReminder = (r) => { const next = [...reminders, r]; setReminders(next); store.set("reminders", next); };
  const removeReminder = (id) => { const next = reminders.filter((r) => r.id !== id); setReminders(next); store.set("reminders", next); };
  const setLocP = (l) => { setLoc(l); store.set("loc", l); };
  const setGoal = (g) => { setGoalV(g); store.set("goal", g); };
  const setNudge = (n) => { setNudgeV(n); store.set("nudge", n); };
  const setPartnerP = (p) => { setPartner(p); store.set("partner", p); };
  const setFamilyP = (f) => { setFamily(f); store.set("family", f); };
  const sitStep = (n) => { if (!stepSat.includes(n)) { const next = [...stepSat, n]; setStepSat(next); store.set("stepSat", next); } };
  const logMood = (mood) => { const next = [...triggerLog, { hour: new Date().getHours(), mood }].slice(-60); setTriggerLog(next); store.set("triggerLog", next); };

  const scan = async () => { setScanning(true); const u = await screenTime.getUsageToday(); setUsage(u); setScanning(false); };
  const grant = async () => { const r = await screenTime.requestAuthorization(); if (r.granted) { setGranted(true); scan(); } };
  useEffect(() => { if (granted && !usage) scan(); }, [granted]); // eslint-disable-line

  const shieldStay = () => { const n = redirected + 1; setRedirected(n); store.set("redirected", n); setShield(null); };
  const shieldOpen = () => { setShield(null); setNeedsGrace(true); store.set("needsGrace", true); };
  const confessDone = () => { setShowConfession(false); setNeedsGrace(false); store.set("needsGrace", false); };

  const TABS = [
    { id: "home", label: "Home", Icon: Home },
    { id: "bible", label: "Bible", Icon: BookOpen },
    { id: "sabbath", label: "Sabbath", Icon: Sun },
    { id: "renew", label: "Renew", Icon: Heart },
    { id: "screen", label: "Screen", Icon: Shield },
  ];

  return (
    <div className="wvw">
      <style>{CSS}</style>
      <div className="wvw-bg" /><div className="wvw-grain" />

      {tab === "home" && <HomeTab streak={streak} onCheckin={checkin} sabbath={sabbath} now={now} votd={votd} devo={devo} onNewDevo={() => setDevoIdx((i) => i + 1)} go={setTab} scores={scores} />}
      {tab === "bible" && <BibleTab translation={translation} setTranslation={setTranslation} open={setOpenPassage} />}
      {tab === "sabbath" && <SabbathTab sabbath={sabbath} now={now} loc={loc} setLoc={setLocP} />}
      {tab === "renew" && <RenewTab journal={journal} addEntry={addEntry} toggleAnswered={toggleAnswered} reminders={reminders} addReminder={addReminder} removeReminder={removeReminder} promptIdx={promptIdx} nextPrompt={() => setPromptIdx((i) => i + 1)} streak={streak} partner={partner} setPartner={setPartnerP} family={family} setFamily={setFamilyP} openSteps={() => setShowSteps(true)} stepSat={stepSat} onMeditate={(m) => setShowMed(m)} onConfess={() => setShowConfession(true)} needsGrace={needsGrace} />}
      {tab === "screen" && <ScreenTab mode={stMode} granted={granted} onGrant={grant} usage={usage} scanning={scanning} onScan={scan} goal={goal} setGoal={setGoal} nudge={nudge} setNudge={setNudge} redirected={redirected} onShield={(risk) => setShield({ risk })} scores={scores} trigger={trigger} />}

      {openPassage && <Reader passage={openPassage} translation={translation} setTranslation={setTranslation} scale={scale} setScale={setScale} onClose={() => setOpenPassage(null)} />}
      {shield && <ScriptureShield verse={shieldVerse} risk={shield.risk} onStay={shieldStay} onOpen={shieldOpen} onMood={logMood} />}
      {showSteps && <StepJourney steps={STEPS} sat={stepSat} onSit={sitStep} onSave={addEntry} onClose={() => setShowSteps(false)} />}
      {showShep && <Shepherd ctx={shepCtx} onClose={() => setShowShep(false)} onMeditate={() => { setShowShep(false); setShowMed(MEDITATIONS[1]); }} />}
      {showMed && <Meditation med={showMed} onClose={() => setShowMed(null)} onComplete={() => setShowMed(null)} />}
      {showConfession && <Confession onClose={() => setShowConfession(false)} onDone={confessDone} />}

      {!showShep && !shield && !showSteps && !openPassage && !showMed && !showConfession && (
        <button className="shep-fab" onClick={() => setShowShep(true)} aria-label="Talk to the Shepherd"><MessageCircle size={24} /></button>
      )}

      <nav className="tabbar">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}><Icon size={21} strokeWidth={1.8} /><span>{label}</span><span className="dot" /></button>
        ))}
      </nav>
    </div>
  );
}
