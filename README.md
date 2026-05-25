# Wi-Fi vs The Word — Complete Website & Launch Guide

Your website is finished. This guide is everything you do by hand to get it live and growing. Work through it top to bottom — nothing here needs a developer.

---

## PART 1 — What you have

A complete **8-page website**, plus a content engine:

```
index.html         Home — hero, AI companion, self-check, devotional, tools, Covenant Wall
start-here.html    Gentle on-ramp for new visitors
tools.html         4 interactive tools (Altar Builder, Algorithm Cleanse, etc.)
articles.html      Blog listing
articles/the-digital-wall.html   A complete example article
resources.html     Downloads hub
sermon-notes.html  Full sermon outline + study questions
events.html        Events & workshops
testimonies.html   Testimonies + submission form
prayer.html        Prayer Wall — share and pray over requests
about.html         The ministry's story
faq.html           Frequently asked questions
recommended.html   Recommended books, tools & links
contact.html       Contact page
404.html           Friendly "page not found" page

theme.css         Shared styling — every page uses this
shared.js         Shared behaviour — every page uses this
worker.js         The secure AI server (deployed separately, Part 4)
manifest.json     Makes the site installable as an app
sw.js             Makes the site work offline
social-card.png   The image shown when the site is shared
sitemap.xml       Helps Google find every page
robots.txt        Tells search engines they may index the site
.nojekyll         Makes GitHub Pages serve files correctly — DO NOT delete
CNAME.txt         Only needed for a custom domain (Part 3)
scripts/          ⭐ Four DeepSeek scripts to fill out the site cheaply
README.md         This guide
```

---

## PART 2 — THE LAUNCH CHECKLIST (do these in order)

### ☐ Step 1 — Put in your contact details (5 minutes)

Open **`shared.js`** in any text editor (Notepad works). At the very top is a block
called `CONFIG`. Change these:

```
whatsappNumber: "27000000000",     → your WhatsApp number, full international
                                     format, NO + and NO spaces.
                                     South African example: 27821234567
whatsappMessage: "Hi! I'd love..." → leave as-is, or word it your way
email: "hello@wifivstheword.org",  → your real ministry email address
siteUrl: "https://wifivstheword.org", → your real web address (see Step 3)
aiEndpoint: "/api/ai"              → leave this for now; you set it in Part 4
```

Save the file. **This one edit updates every page** — every WhatsApp button, every
email link, all sharing. You do not edit any other file for this.

### ☐ Step 2 — Create a GitHub account and upload the site (15 minutes)

1. Go to **github.com** and sign up (free).
2. Click the **+** (top right) → **New repository**.
3. Name it `wifivstheword` (or anything). Set it to **Public**. Click **Create**.
4. On the new repository page, click **uploading an existing file**.
5. Open your website folder. Select **everything inside it** — all the `.html` files,
   `theme.css`, `shared.js`, the `articles` folder, the `scripts` folder, all of it —
   and drag it into the browser.
   - **Important:** also upload the file called **`.nojekyll`** (it may look invisible
     or empty — it is meant to be empty; it still matters).
6. Click **Commit changes**.

### ☐ Step 3 — Turn the website on (2 minutes)

1. In your repository, click **Settings** (top menu).
2. Click **Pages** (left menu).
3. Under "Branch", choose **`main`**, folder **`/ (root)`**. Click **Save**.
4. Wait about one minute, then refresh. GitHub shows your live link near the top —
   something like `https://yourname.github.io/wifivstheword`.

**That link is your live website.** Open it on your phone — it works.

Go back to `shared.js`, set `siteUrl` to this exact link, and re-upload `shared.js`
(repository → click the file → pencil icon → paste → Commit). This makes sharing
links correct.

### ☐ Step 4 — Test it (5 minutes)

On your phone, open the live link and check:
- ☐ Every menu item opens its page.
- ☐ The WhatsApp button (green circle, bottom right) opens a chat to your number.
- ☐ The self-check quiz on the home page works start to finish.
- ☐ On the Contact page, filling the form and tapping "Open in my email app" opens
  your email with the message ready.
- ☐ Try "Add to Home Screen" from your phone browser menu — it installs like an app.

If all five work, **you are live.** The AI features show good pre-written answers
until Part 4 is done — that is expected, and you can launch without it.

---

## PART 3 — Using your own domain (optional)

To use `wifivstheword.org` instead of the long github.io address:

1. Buy the domain from any registrar (e.g. domains.co.za, GoDaddy).
2. In your website files, rename **`CNAME.txt`** to exactly **`CNAME`** (no `.txt`).
   Open it, follow the short instructions inside, then upload it to GitHub.
3. In GitHub → Settings → Pages, enter your domain in the "Custom domain" box.
4. At your registrar, add the DNS records GitHub shows you. (GitHub gives exact
   instructions on that same Pages screen.)
5. Tick "Enforce HTTPS" once it becomes available.

If you skip this, the free github.io link works perfectly — many ministries never
buy a domain.

---

## PART 4 — Switching on the AI features (≈15 minutes, do when ready)

The site works without this. When you want the **live** AI companion, devotional,
and personalised quiz steps, do this.

**Why it needs a separate step:** an API key is like a credit card. It must never
sit inside a website file that visitors can read. So `worker.js` is a tiny, free
server that holds the key safely; the website talks to it.

### Step A — Get an AI key
1. Go to **console.anthropic.com**, create an account.
2. Add a small amount of credit — **$5 is plenty to start.**
3. Create an API key. Copy it somewhere safe. This is your only secret.

### Step B — Deploy the secure server
1. Go to **dash.cloudflare.com**, create a free account.
2. Left menu → **Workers & Pages** → **Create** → **Create Worker**.
3. Delete the sample code. Open **`worker.js`**, copy ALL of it, paste it in.
4. Click **Deploy**.
5. Open the Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Type: **Secret**  ·  Name: `ANTHROPIC_API_KEY`  ·  Value: *(paste your key)*
   - Save.

### Step C — Connect the website to it
1. Your Worker has an address like `wvtw-ai.yourname.workers.dev`.
2. In **`shared.js`**, change:
   `aiEndpoint: "/api/ai"`  →  `aiEndpoint: "https://wvtw-ai.yourname.workers.dev/api/ai"`
3. Re-upload `shared.js` to GitHub.

The AI is now live. **Cost:** a few US dollars in a busy month; you set the ceiling,
so it can never surprise you.

### Step D — (Optional) Save Covenant Wall signups and testimonies permanently
1. In Cloudflare → **Workers & Pages** → **KV** → **Create namespace**, name it
   `covenant-data`.
2. Open your Worker → **Settings** → **Variables** → **KV Namespace Bindings** →
   **Add**: Variable name `COVENANT`, namespace `covenant-data`. Save.

Now every family on the Covenant Wall, every newsletter signup, every testimony, and
every prayer request submitted is stored permanently. You can read them in the Cloudflare KV dashboard.

Without this step, those still work for the visitor — they just aren't saved.

---

## PART 5 — The newsletter (collecting emails properly)

The signup form works, but to actually *send* emails you need a mailing service
(sending bulk email yourself gets blocked as spam). All have free tiers:

- **MailerLite** or **Beehiiv** — easiest, generous free plans.
- **Mailchimp** — well known.

Simplest path: each gives you a hosted signup page. Link the "Join the Newsletter"
button to that page. Or, if you did Part 4 Step D, signups are already saved in
Cloudflare and you can export them.

---

## PART 6 — Filling out the site with DeepSeek (saves money)

The site is built; now it grows with **content**. The `scripts/` folder has four
copy-paste prompts for **DeepSeek** (chat.deepseek.com) — far cheaper than Claude
for repetitive work.

| Script | Generates | Run it when |
|---|---|---|
| `01_generate_articles.md` | Full article pages from your sermon | To build the blog (8 topics suggested) |
| `02_add_testimonies.md`   | Real testimonies formatted into cards | A real story comes in |
| `03_draft_resources.md`   | Text for the printable resources | Before making each PDF |
| `04_new_pages_and_events.md` | New events, or whole new pages | Adding events or a new page |
| `05_devotional_and_series.md` | The 28-day devotional + content series | To fill out the articles section |
| `06_glossary.md` | The complete Glossary page | Once, to add the glossary |

**How to use one:** open the script file → copy the grey box → paste into DeepSeek →
it returns a finished file → upload it to GitHub. No Claude credits used.

**Leave to Claude (worth the credits, rarely):** turning approved resource text into
polished PDFs; any change to `theme.css` (it affects every page); new interactive
features. *DeepSeek writes and copies patterns; Claude designs and builds logic.*

**A sensible order:** launch first → generate 3–4 articles → draft the Family Digital
Covenant and have Claude make the PDF → swap in real testimonies as they arrive →
add real event dates. One article a week, shared on WhatsApp, compounds over a year.

---

## PART 7 — Honesty notes (please read)

- **The testimonies** on `testimonies.html` are clearly-labelled *examples* so the
  page isn't empty at launch. Replace them with real stories (script 02) as soon as
  you have them. Never present an invented story as real.
- **The Covenant Wall counter** starts at a placeholder number. In `index.html`, find
  `baseCount=127` and set it to the *true* number of committed families — even if
  small. Honest and growing beats large and false.
- **The sermon video** is a placeholder. When you have the YouTube link, open
  `index.html`, find `Sermon video coming soon`, and follow the one-line comment
  just above it to embed the real video.
- **The AI** is a helper, not a pastor. It has guardrails and a visible disclaimer
  pointing serious questions to a real person. Review what it produces.

---

## PART 8 — Quick fixes

| Problem | Fix |
|---|---|
| A page looks plain/unstyled | Its link to `theme.css` is wrong. Pages in `articles/` need `../theme.css`. |
| Menu or theme button dead | Page is missing `<script src="shared.js"></script>` before `</body>`. |
| AI repeats the same answer | Worker not connected (Part 4), or `aiEndpoint` still says `/api/ai`. |
| Changes not showing | Browser cache. Hard-refresh: Ctrl+Shift+R (or wait a day). |
| Offline/install missing | You opened the file directly. It only works on the live `https://` link. |

---

## A closing word

The site models its own message — calm, uncluttered, no manipulative tricks. As you
fill it out, keep that spirit: warm, hopeful, grace-based, never fear-driven. The
technology here is a good servant. You remain the steward.

May the Lord bless the work of your hands.

— Built for the Wi-Fi vs The Word ministry
