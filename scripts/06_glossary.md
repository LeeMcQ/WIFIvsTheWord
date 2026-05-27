# DeepSeek Script 06 — The Glossary Page

**What this does:** Builds a complete Glossary page — plain-language definitions of the terms the ministry uses (dopamine loop, technoference, frontal lobe, algorithm, etc.). One run produces the whole page, ready to upload.

**How to use it:** Open DeepSeek, paste the grey box, send. Save the result as `glossary.html` in your main site folder (not the articles folder). Then add a link to it — see the note at the bottom.

---

## THE SCRIPT — copy everything below into DeepSeek

```
You are building a Glossary page for "Wi-Fi vs The Word", a Christian digital
discipleship and family restoration ministry. Tone: warm, clear, plain-language —
explaining terms simply for ordinary parents, never academic or fear-driven.

TASK: Build a complete Glossary HTML page defining these terms. For each term write
2-4 plain sentences a non-technical parent would understand, and where natural,
gently connect it to the ministry's themes (guarding the mind, the family altar,
intentional technology). Do NOT be alarmist — explain calmly and truthfully.

TERMS TO DEFINE:
- Technoference
- Dopamine loop
- The algorithm
- Attention economy
- Absent presence
- Frontal lobe
- Neuroplasticity
- Digital Sabbath
- Digital hygiene
- Doomscrolling
- Deep work
- AI companion
- Algorithm cleanse
- Digital Babylon
- The family altar

OUTPUT: Return ONE complete HTML file. Use this exact shell, and for the glossary
itself put each term inside the grid as a card. Fill the [BRACKETS]:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glossary — Wi-Fi vs The Word</title>
<meta name="description" content="Plain-language definitions of the key terms used in digital discipleship — technoference, dopamine loops, the algorithm and more.">
<meta name="theme-color" content="#0e1726">
<meta property="og:title" content="Glossary — Wi-Fi vs The Word">
<meta property="og:description" content="Plain-language definitions for families navigating technology and faith.">
<meta property="og:type" content="website">
<meta property="og:image" content="https://wifivstheword.org/social-card.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230e1726'/%3E%3Cpath d='M50 24v52M34 40h32' stroke='%23d4a843' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="manifest" href="manifest.json">
<link rel="stylesheet" href="theme.css">
</head>
<body>
<header>
  <div class="wrap nav">
    <a href="index.html" class="brand" aria-label="Wi-Fi vs The Word home">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 9h14" stroke="#d4a843" stroke-width="2.4" stroke-linecap="round"/></svg></span>
      <span class="brand-name">Wi-Fi <b>vs</b> The Word</span>
    </a>
    <nav class="nav-links" id="navLinks">
      <a href="index.html">Home</a>
      <a href="articles.html">Articles</a>
      <a href="tools.html">Tools</a>
      <a href="resources.html">Resources</a>
      <a href="events.html">Events</a>
      <a href="about.html">Our Story</a>
      <a href="contact.html">Contact</a>
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
<section class="page-hero">
  <div class="wrap">
    <p class="crumb"><a href="index.html">Home</a> / Glossary</p>
    <span class="eyebrow">Plain Language</span>
    <h1>The Words, <span class="em">Explained Simply</span></h1>
    <p>You don't need to be a scientist to protect your family. Here are the key terms, in plain language.</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="grid grid-2">
      [For EACH term, output one card exactly like this:]
      <div class="card reveal">
        <h3>[Term]</h3>
        <p>[The plain-language definition, 2-4 sentences.]</p>
      </div>
      [repeat for all 15 terms]
    </div>
  </div>
</section>
<section class="cta-banner">
  <div class="wrap">
    <h2>Now put it into practice</h2>
    <p>Understanding the words is the first step. The tools help you take the next one.</p>
    <div class="cta-row">
      <a href="tools.html" class="btn btn-primary">Try the Family Tools</a>
      <a href="start-here.html" class="btn btn-ghost">Start Here</a>
    </div>
  </div>
</section>
</main>
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a href="index.html" class="brand">
          <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 9h14" stroke="#d4a843" stroke-width="2.4" stroke-linecap="round"/></svg></span>
          <span class="brand-name">Wi-Fi <b>vs</b> The Word</span>
        </a>
        <p>A Christian digital discipleship and family restoration ministry.</p>
      </div>
      <div class="foot-col"><h5>Explore</h5>
        <a href="articles.html">Articles</a><a href="tools.html">Interactive Tools</a>
        <a href="resources.html">Resources</a><a href="events.html">Events</a>
        <a href="testimonies.html">Testimonies</a></div>
      <div class="foot-col"><h5>Connect</h5>
        <a href="prayer.html">Prayer Wall</a><a href="start-here.html">Start Here</a>
        <a href="about.html">Our Story</a><a href="faq.html">FAQ</a>
        <a href="contact.html">Contact</a></div>
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
<script src="shared.js"></script>
</body>
</html>

Return ONLY the complete HTML file.
```

---

## After saving — one manual step

Add a link so people can find the glossary. The simplest spot is the footer. On each
page, in the `<div class="foot-col"><h5>Connect</h5>` block, add:
`<a href="glossary.html">Glossary</a>`

Or ask DeepSeek (Script 04, Part B style): *"add a Glossary link to the footer Connect
column of every page"* and give it the files. Then add a `<url>` line to `sitemap.xml`.
