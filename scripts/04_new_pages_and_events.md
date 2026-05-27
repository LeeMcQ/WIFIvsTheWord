# DeepSeek Script 04 — New Pages & Events

**What this does:** Two jobs in one file —
- **Part A:** add or update events on `events.html`.
- **Part B:** build an entirely new page (e.g. a Contact page, a FAQ page, a specific campaign page) that matches the site perfectly.

---

## PART A — Add an event

When you have a new workshop or event to announce, paste this into DeepSeek:

```
You are updating the events page for "Wi-Fi vs The Word" ministry.

Here is my current events.html: [PASTE THE FILE]

Add this new event as the FIRST card inside <div class="grid" style="gap:14px" id="eventList">:

EVENT NAME: [e.g. Parent Workshop — Cape Town]
DATE: [day number, e.g. 14] | MONTH: [3-letter, e.g. MAR]
DESCRIPTION: [one or two sentences]
DETAILS LINE: [e.g. "In person · Free · Malmesbury SDA Church"]
BUTTON: [either a "Notify me" button linking to data-email, or a "Learn more"
         button linking to a relevant page]

Use EXACTLY this card format:

<div class="event reveal">
  <div class="event-date"><div class="ed-day">DAY</div><div class="ed-mon">MONTH</div></div>
  <div>
    <h3>EVENT NAME</h3>
    <p>DESCRIPTION</p>
    <span class="ev-meta">DETAILS LINE</span>
  </div>
  <a data-email href="#" class="btn btn-ghost btn-sm">Notify me</a>
</div>

Return the complete updated events.html file.
```

---

## PART B — Build a brand-new page

To add a page that doesn't exist yet (Contact, FAQ, a campaign landing page),
paste this into DeepSeek:

```
You are building a new page for the "Wi-Fi vs The Word" ministry website. It must match
the existing site exactly. The site uses a shared stylesheet (theme.css) and shared
script (shared.js) — your page only needs to LINK to them, never redefine styles.

NEW PAGE PURPOSE: [describe it — e.g. "A Contact page with the ministry's WhatsApp,
email, and a simple message form."]

Build a complete HTML file using ONLY these building blocks from theme.css (do not
invent new CSS — only use these classes):
- Page hero:   <section class="page-hero"> with <div class="wrap">, a <p class="crumb">,
               an <span class="eyebrow">, an <h1> (wrap one word in <span class="em">),
               and a <p> intro.
- Sections:    <section> or <section class="tint"> with <div class="wrap"> or
               <div class="wrap-text"> inside.
- Headings:    <div class="section-head"> (add class "center" to centre it) containing
               <span class="eyebrow"> + <h2> + <p>.
- Cards:       <div class="grid grid-2"> or "grid grid-3", with <div class="card">
               inside (each card: optional <span class="tag">, <h3>, <p>,
               optional <a class="card-link">).
- Buttons:     <a class="btn btn-primary"> or <a class="btn btn-ghost">.
- Forms:       <div class="field"> wrapping <input>/<textarea>, with a
               <div class="form-success"> for confirmation.
- CTA banner:  <section class="cta-banner"> with <div class="wrap">, <h2>, <p>,
               and <div class="cta-row"> of buttons.
- WhatsApp link: any link with the attribute  data-wa  is auto-wired.
- Email link:    any link with the attribute  data-email  is auto-wired.

The page MUST start and end with exactly this shell (fill the [BRACKETS] and put your
sections where it says PAGE CONTENT):

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[PAGE TITLE] — Wi-Fi vs The Word</title>
<meta name="description" content="[one-sentence summary]">
<meta name="theme-color" content="#0e1726">
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
      <a href="resources.html">Resources</a>
      <a href="events.html">Events</a>
      <a href="testimonies.html">Testimonies</a>
      <a href="about.html">Our Story</a>
      <a href="index.html#involved">Get Involved</a>
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

  [PAGE CONTENT — your sections go here]

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
        <a href="articles.html">Articles</a><a href="resources.html">Resources</a>
        <a href="events.html">Events</a><a href="testimonies.html">Testimonies</a>
        <a href="about.html">Our Story</a></div>
      <div class="foot-col"><h5>Connect</h5>
        <a href="index.html#companion">Ask the Ministry</a><a href="index.html#media">Watch the Sermon</a>
        <a href="index.html#covenant-wall">Take the Covenant</a><a href="index.html#involved">Newsletter</a></div>
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

Tone: warm, hopeful, biblically grounded, never fear-driven. Return ONLY the complete
HTML file. Then tell me the filename to save it as, and which nav links to update.
```

---

## After adding a new page — two small manual steps

1. **Add it to the menu.** Open `theme.css`? No — the menu lives in each page's `<header>`.
   The easy way: tell DeepSeek *"add a link to [page] in the nav-links of every page"* and
   give it each file, or just add one line `<a href="newpage.html">Name</a>` to the
   `<nav class="nav-links">` block on each page.
2. **Add it to `sitemap.xml`** so Google finds it — copy an existing `<url>` line and
   change the address.
