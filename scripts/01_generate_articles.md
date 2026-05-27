# DeepSeek Script 01 — Generate Articles

**What this does:** Produces complete, ready-to-upload article pages for the Wi-Fi vs The Word website, matching the exact design of the existing example article.

**How to use it:**
1. Open DeepSeek (chat.deepseek.com).
2. Copy *everything* in the grey box below.
3. Paste it into DeepSeek and send.
4. DeepSeek will produce one complete HTML file. Save it into your `articles/` folder with the filename it tells you.
5. Repeat — change the topic line each time to generate a different article.
6. After generating articles, also run the "GRID UPDATE" prompt at the bottom to add them to the articles listing page.

> **Why DeepSeek and not Claude here:** writing articles from a fixed template is repetitive pattern-work. DeepSeek does it cheaply and well once the pattern exists. Save Claude for design and judgement calls.

---

## THE SCRIPT — copy everything below into DeepSeek

```
You are a Christian content writer for a ministry called "Wi-Fi vs The Word" — a digital
discipleship and family restoration ministry. You write warm, hopeful, biblically grounded
articles for parents and families about faith, attention and technology.

TASK: Write ONE complete HTML article page.

TOPIC FOR THIS ARTICLE: "Technoference — The Guest Who Never Leaves"
(How constant phone interruption erodes connection between parent and child.)

TONE RULES:
- Warm, hopeful, practical. Never fear-driven, never condemning, never preachy.
- Technology is a tool — never anti-technology. The question is "who is discipling whom?"
- Ground it in Scripture naturally. Use real verses, quoted accurately.
- About 700-900 words. Aim for a 6-minute read.
- Include one or two practical, doable steps a tired parent can act on this week.
- South African / Seventh-day Adventist family context is welcome but keep it widely Christian.

OUTPUT FORMAT — return ONLY this HTML file, nothing else. Fill in the [BRACKETS]:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[ARTICLE TITLE] — Wi-Fi vs The Word</title>
<meta name="description" content="[One-sentence summary, max 150 chars]">
<meta name="theme-color" content="#0e1726">
<meta property="og:title" content="[ARTICLE TITLE]">
<meta property="og:description" content="[One-sentence summary]">
<meta property="og:type" content="article">
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
      <a href="../resources.html">Resources</a>
      <a href="../events.html">Events</a>
      <a href="../testimonies.html">Testimonies</a>
      <a href="../about.html">Our Story</a>
      <a href="../index.html#involved">Get Involved</a>
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
    <p class="crumb"><a href="../index.html">Home</a> / <a href="../articles.html">Articles</a> / [SHORT TITLE]</p>
    <span class="eyebrow">[CATEGORY, e.g. The Battle for the Mind]</span>
    <h1>[ARTICLE TITLE — wrap one key word in <span class="em">word</span>]</h1>
    <p>[The one-sentence summary]</p>
    <div style="display:flex;gap:18px;align-items:center;margin-top:20px;flex-wrap:wrap">
      <span class="note">6 min read</span><span class="note">&middot;</span>
      <span class="note">[CATEGORY]</span>
      <div id="shareBar" style="display:flex;gap:8px;align-items:center;margin-left:auto" data-url="https://wifivstheword.org/articles/[FILENAME]" data-msg="[ARTICLE TITLE] — an article from Wi-Fi vs The Word: https://wifivstheword.org/articles/[FILENAME]"></div>
    </div>
  </div>
</section>
<section>
  <div class="prose">
    [THE ARTICLE BODY. Use <p> for paragraphs. Use <h2> for 2-3 section headings.
     Use <span class="verse">"verse text" &mdash; Reference</span> for highlighted Scripture.
     Use <blockquote> for one key pull-quote. Use <ul> or <ol> for the practical steps.
     Use <hr> before the final paragraph. End with one closing <span class="verse">.]
  </div>
</section>
<section class="tint">
  <div class="wrap-text" style="text-align:center">
    <span class="eyebrow">Take the next step</span>
    <h2 style="font-size:1.8rem;margin:12px 0 14px">[A SHORT ENCOURAGING HEADING]</h2>
    <p style="color:var(--warm-mute);margin-bottom:22px">[One sentence pointing them to the Digital Sabbath reset.]</p>
    <div class="cta-row">
      <a href="../index.html#sabbath" class="btn btn-primary">Start the 7-Day Reset</a>
      <a href="../articles.html" class="btn btn-ghost">More articles</a>
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
        <a href="../articles.html">Articles</a><a href="../resources.html">Resources</a>
        <a href="../events.html">Events</a><a href="../testimonies.html">Testimonies</a>
        <a href="../about.html">Our Story</a></div>
      <div class="foot-col"><h5>Connect</h5>
        <a href="../index.html#companion">Ask the Ministry</a><a href="../index.html#media">Watch the Sermon</a>
        <a href="../index.html#covenant-wall">Take the Covenant</a><a href="../index.html#involved">Newsletter</a></div>
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

After the HTML, tell me on a separate line: SAVE AS: articles/[your-suggested-filename].html
(use lowercase words separated by hyphens, e.g. technoference-the-guest.html)
```

---

## Suggested topics — run the script once per topic

Change the `TOPIC FOR THIS ARTICLE` line to each of these. Your sermon contains all the raw material:

1. Technoference — The Guest Who Never Leaves
2. The Slot Machine in Your Pocket (how apps are engineered like gambling)
3. Mary, Martha, and the Distracted Heart (Luke 10 — the "one thing")
4. By Beholding We Become Changed (the science + Scripture of attention)
5. Guarding the Marriage in a Connected World (2 Samuel 11 — David's rooftop)
6. The Renewed Mind: God as the Highest Novelty (Romans 12:2)
7. Wait Until 8th — The Case for Delaying Smartphones
8. The Algorithm Cleanse — Applying the Philippians 4:8 Filter

---

## GRID UPDATE prompt — adds finished articles to the listing page

After you've generated articles, paste this into DeepSeek to update `articles.html`:

```
Here is my current articles.html file: [PASTE THE FILE]

I have created these new article pages in my articles/ folder:
- articles/technoference-the-guest.html — title "Technoference: The Guest Who Never Leaves" — summary "How absent presence quietly erodes the connection between parent and child." — category "The Battle for the Mind"
[list each new article the same way]

For each new article, replace one of the greyed-out "Coming soon" placeholder
<article class="article-card"> blocks with a real clickable card in this exact format:

<a class="article-card reveal" href="articles/FILENAME">
  <div class="ac-top"></div>
  <div class="ac-body">
    <span class="ac-meta">CATEGORY</span>
    <h3>TITLE</h3>
    <p>SUMMARY</p>
    <span class="ac-read">6 min read</span>
  </div>
</a>

If there are more new articles than placeholders, add extra cards inside the
<div class="grid grid-3" id="articleGrid"> container. Return the complete updated articles.html file.
```

That's it. Each article costs you cents on DeepSeek instead of Claude credits.
