# DeepSeek Script 05 — Devotional Series & Content Series

**What this does:** Generates longer multi-part content — the 28-day family devotional, the "Digital Babylon" explainer series, and the church leader how-to guides. Each becomes article-style pages that match the site.

**How to use it:** Open DeepSeek, copy the relevant grey box, paste, send. Save each file it returns into your `articles/` folder. Then run the GRID UPDATE prompt from Script 01 to list them.

---

## 5A — The 28-Day Family Devotional

Run this **once per week of devotionals** (4 runs gives you all 28 days), so DeepSeek can give each day proper care.

```
You are writing for "Wi-Fi vs The Word", a Christian digital discipleship and family
restoration ministry. Tone: warm, hopeful, practical, biblically grounded — never
fear-driven or condemning. Technology is a tool; the question is "who is discipling
whom?"

TASK: Write Days 1 to 7 of a 28-day family devotional on living focused and present
in a digital age. (Next runs will cover Days 8-14, 15-21, 22-28.)

For EACH day produce:
- A day number and a short title.
- One Scripture verse, quoted accurately with reference.
- A reflection of about 120-150 words — a real thought, not filler.
- One "Today's Step" — a single concrete thing the family can do that day.
- One short closing prayer (2-3 sentences).

Themes to draw from across the 28 days: the one needful thing (Luke 10), the renewed
mind (Romans 12:2), guarding the heart (Proverbs 4:23), Sabbath rest, comparison and
contentment, the family altar, stillness before God, deep work and attention,
parenting with intention, and readiness for Christ's return.

OUTPUT: Return ONE complete HTML file containing all 7 days, using this structure —
fill the [BRACKETS]:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>28-Day Devotional: Days 1-7 — Wi-Fi vs The Word</title>
<meta name="description" content="Days 1 to 7 of a 28-day family devotional on living focused and present in a digital age.">
<meta name="theme-color" content="#0e1726">
<meta property="og:title" content="28-Day Family Devotional: Days 1-7">
<meta property="og:description" content="A family devotional on faith, focus and the digital home.">
<meta property="og:type" content="article">
<meta property="og:image" content="https://wifivstheword.org/social-card.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230e1726'/%3E%3Cpath d='M50 24v52M34 40h32' stroke='%23d4a843' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="manifest" href="../manifest.json">
<link rel="stylesheet" href="../theme.css">
</head>
<body>
<header>
  <div class="wrap nav">
    <a href="../index.html" class="brand" aria-label="Wi-Fi vs The Word home">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 9h14" stroke="#d4a843" stroke-width="2.4" stroke-linecap="round"/></svg></span>
      <span class="brand-name">Wi-Fi <b>vs</b> The Word</span>
    </a>
    <nav class="nav-links" id="navLinks">
      <a href="../index.html">Home</a>
      <a href="../articles.html" class="active">Articles</a>
      <a href="../tools.html">Tools</a>
      <a href="../resources.html">Resources</a>
      <a href="../events.html">Events</a>
      <a href="../about.html">Our Story</a>
      <a href="../contact.html">Contact</a>
    </nav>
    <div class="nav-tools">
      <button class="icon-btn" id="themeBtn" aria-label="Toggle theme">
        <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>
<main>
<article>
<section class="page-hero">
  <div class="wrap-text">
    <p class="crumb"><a href="../index.html">Home</a> / <a href="../articles.html">Articles</a> / 28-Day Devotional</p>
    <span class="eyebrow">Family Devotional</span>
    <h1>28 Days of <span class="em">Focused Faith</span> — Days 1-7</h1>
    <p>One short reading each day, to be shared at the family table.</p>
  </div>
</section>
<section>
  <div class="prose">
    [For each day, output a block exactly like this:]
    <h2>Day [N] — [Title]</h2>
    <span class="verse">"[verse]" &mdash; [Reference]</span>
    <p>[the reflection]</p>
    <blockquote>Today's Step: [the concrete step]</blockquote>
    <p><strong>Prayer:</strong> [the closing prayer]</p>
    <hr>
    [repeat for all 7 days; omit the final <hr>]
  </div>
</section>
<section class="tint">
  <div class="wrap-text" style="text-align:center">
    <span class="eyebrow">Keep going</span>
    <h2 style="font-size:1.8rem;margin:12px 0 14px">Day 8 awaits</h2>
    <p style="color:var(--warm-mute);margin-bottom:22px">Continue the journey with the next week of readings.</p>
    <div class="cta-row">
      <a href="../articles.html" class="btn btn-primary">All devotionals</a>
      <a href="../tools.html" class="btn btn-ghost">Family Tools</a>
    </div>
  </div>
</section>
</article>
</main>
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a href="../index.html" class="brand">
          <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 9h14" stroke="#d4a843" stroke-width="2.4" stroke-linecap="round"/></svg></span>
          <span class="brand-name">Wi-Fi <b>vs</b> The Word</span>
        </a>
        <p>A Christian digital discipleship and family restoration ministry.</p>
      </div>
      <div class="foot-col"><h5>Explore</h5>
        <a href="../articles.html">Articles</a><a href="../tools.html">Interactive Tools</a>
        <a href="../resources.html">Resources</a><a href="../events.html">Events</a>
        <a href="../testimonies.html">Testimonies</a></div>
      <div class="foot-col"><h5>Connect</h5>
        <a href="../prayer.html">Prayer Wall</a><a href="../start-here.html">Start Here</a>
        <a href="../about.html">Our Story</a><a href="../faq.html">FAQ</a>
        <a href="../contact.html">Contact</a></div>
    </div>
    <div class="foot-bottom">
      <span>&copy; <span id="year"></span> Wi-Fi vs The Word Ministry.</span>
      <span>"The issue is not merely screens. The issue is discipleship."</span>
    </div>
  </div>
</footer>
<a class="wa-fab" data-wa href="#" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>
</a>
<script src="../shared.js"></script>
</body>
</html>

Then tell me: SAVE AS: articles/devotional-days-1-7.html
```

For the other three weeks, change the TASK line to "Days 8 to 14", "Days 15 to 21",
"Days 22 to 28", and update the title, `<h1>`, filename and crumb accordingly.

---

## 5B — The "Digital Babylon" Series

Same as Script 01's article format, but run it with these topics — a connected series
on how secular digital culture forms us:

1. What Is Digital Babylon? — the idea of a culture that disciples us
2. The Captivity We Don't Notice — how formation happens quietly
3. Daniel in Babylon — staying faithful inside the culture, not fleeing it
4. Coming Out of Babylon — practical steps for a family

Use the article HTML shell from **Script 01**, with category "Digital Babylon".

---

## 5C — Church Leader How-To Guides

Use the Script 01 article shell, category "For Church Leaders", topics:

1. How to Run a Church-Wide Digital Sabbath
2. How to Host a Family Digital Wellness Workshop
3. Preaching on Technology Without Fear or Legalism
4. Starting a Tech-Wise Families Small Group

For these, tell DeepSeek: *"Write this as a practical how-to guide with clear numbered
steps a busy pastor can follow, not as a devotional essay."*
