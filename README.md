# Wi-Fi vs The Word — Website Guide

Everything you need to launch, run, and grow the ministry site. No jargon. Where a step needs a real person (not AI), it says so plainly.

---

## 1. What you received

| File | What it is | Do you edit it? |
|---|---|---|
| `index.html` | The entire website | Yes — small config block only |
| `manifest.json` | Makes the site installable as an app | No |
| `sw.js` | Makes the site work offline | No |
| `worker.js` | The secure AI "middleman" (see §4) | No — just deploy it |
| `sitemap.xml` / `robots.txt` | Helps Google find the site | Change the domain once |
| `README.md` | This guide | — |

---

## 2. The 5-minute launch (do this first)

The site works the moment you deploy it. AI features show thoughtful pre-written content until you connect the AI in §4 — so you can go live today and add AI later.

**Step 1 — Edit your details.**
Open `index.html` in any text editor. Near the bottom, find the block that starts with `const CONFIG`. Change three things:

```
whatsappNumber: "27000000000",   <- your WhatsApp number, no + or spaces
email: "hello@wifivstheword.org", <- your real email
siteUrl: "https://wifivstheword.org" <- your real domain
```

Save. That is the only edit the site requires.

**Step 2 — Put it online (GitHub Pages, free).**
1. Create a free account at github.com.
2. Make a new repository (the "+" top right → New repository). Name it anything.
3. Upload all the files (Add file → Upload files → drag them in → Commit).
4. Go to the repo's **Settings → Pages**. Under "Branch", pick `main`, folder `/ (root)`, Save.
5. Wait ~1 minute. GitHub gives you a live link like `yourname.github.io/repo`.

That link is your live website. To use your own domain (e.g. `wifivstheword.org`), buy it from any registrar and follow GitHub's "Custom domain" instructions on that same Pages settings screen.

> **Important:** the offline/install features only switch on over a real `https://` link (which GitHub Pages gives you automatically). Opening the file by double-clicking it on your computer will not show those features — that is normal.

---

## 3. The features, and which ones use AI

Your site has two kinds of features. Here is the honest breakdown.

### Works on its own — no AI, no setup
- **Self-check quiz** — the 5 questions and results are built in.
- **Covenant Wall** — counts families, shows the wall. (Counter starts at a number you set; see §5.)
- **Share buttons** — WhatsApp, Facebook, copy-link on the sermon and quiz result.
- **Invite-your-pastor tool** — pre-written message, sends via WhatsApp.
- **Newsletter signup, FAQ, dark mode, offline install** — all built in.

### Powered by AI — needs the §4 setup to go "live"
| Feature | What the AI does | Without AI connected |
|---|---|---|
| **Ask the Ministry** chat | Answers visitors' real questions in your ministry's voice | Shows one solid pre-written answer |
| **Today's Devotional** | Generates a fresh short devotional each tap | Rotates 3 hand-written devotionals |
| **Quiz "next step"** | Writes a personal next step based on their score | Shows a strong pre-written step per result |

**You do not have to do anything manually for these.** Once §4 is done, they generate content automatically, forever. The "manual" question only applies to the *content library* — see §7.

---

## 4. Connecting the AI (the secure way, ~10 minutes)

**Why this step exists:** an API key is like a credit card. It must never sit inside `index.html`, because anyone visiting your site can read that file. So we put the key on a tiny free server ("a Worker") that your site talks to. The key stays hidden there.

You already chose "I'll add an API key later" — here is exactly how, when you are ready.

**Step 1 — Get an Anthropic API key.**
- Go to `console.anthropic.com`, create an account.
- Add a small amount of credit (see costs below).
- Create an API key. Copy it somewhere safe. *This is the only secret.*

**Step 2 — Deploy the Worker (free).**
- Go to `dash.cloudflare.com`, create a free account.
- Left menu → **Workers & Pages** → **Create** → **Create Worker**.
- It opens a code editor. Delete what's there, paste in the entire contents of `worker.js`. Click **Deploy**.
- Open the new Worker → **Settings → Variables** → under "Environment Variables" add:
  - Name: `ANTHROPIC_API_KEY`  Value: *(paste your key)*  → tick **Encrypt** → Save.

**Step 3 — Point the website at the Worker.**
- Your Worker has a URL like `wvtw-ai.yourname.workers.dev`.
- In `index.html`, in the `CONFIG` block, change:
  ```
  aiEndpoint: "/api/ai"
  ```
  to your Worker URL:
  ```
  aiEndpoint: "https://wvtw-ai.yourname.workers.dev/api/ai"
  ```
- Re-upload `index.html` to GitHub. Done — the AI is now live.

**What it costs.** Anthropic charges per use, not monthly. The model used here (Claude Sonnet) is roughly **US$3 per million words in, $15 per million out**. In plain terms: a typical chat answer or devotional costs a fraction of a cent. A busy month of hundreds of visitors using the AI is usually a **few US dollars**. You set the credit ceiling — it can never surprise-bill you. Start with $5 and watch how it goes.

**A note on the model name.** `worker.js` uses `claude-sonnet-4-20250514`. Model names change over time. If the AI ever stops working after months, check `docs.claude.com` for the current model name and update that one line in `worker.js`.

---

## 5. The Covenant Wall — keeping the number real

Out of the box, the counter starts at **127** with six example families, so the wall never looks empty at launch. That number is a placeholder. Two honest options:

**Option A — simple, manual.** In `index.html` find `baseCount=127` and set it to the *true* number of families who have committed (start at the real number, even if it's small — honesty builds trust). Update it by hand as the ministry grows. Real visitor submissions add to it live during their session but reset on reload.

**Option B — automatic, permanent.** If you deployed the Worker in §4, add free storage so submissions are saved forever:
- In Cloudflare: **Workers & Pages → KV → Create namespace**, name it `covenant-data`.
- Open your Worker → **Settings → Variables → KV Namespace Bindings** → add binding: Variable name `COVENANT`, namespace `covenant-data`. Save.
- Now every family that takes the covenant is counted permanently, and `/api/subscribe` also stores newsletter signups there. You can read them in the KV dashboard.

Set the honest starting number in the Worker's KV later, or just let it climb from real signups.

---

## 6. The newsletter — collecting emails properly

The signup form works immediately, but to *actually email people* you need a mailing service (sending bulk email yourself gets flagged as spam). All have free tiers:

- **Beehiiv** or **MailerLite** — easiest, generous free tier.
- **Mailchimp** — well known, free up to a point.

**Simplest path (no code):** each of these gives you a hosted signup form or an "embed". Replace the newsletter box in the site with their embed code, or simply link the "Join the Newsletter" button to their hosted form. If you'd like, I can wire whichever one you pick directly into the site — just tell me which.

Until then, signups are stored via the Worker (if you set up KV in §5) so no one is lost.

---

## 7. Growing the ministry — and where AI saves you weeks

This is the part you asked about most. Your site is the *engine*; here is the *fuel*, and how AI does the heavy lifting.

### 7a. Things the site already does to grow itself
- **WhatsApp-first sharing** — every share defaults to WhatsApp, the strongest channel in South Africa. One tap sends the sermon to a whole family group.
- **The pastor-invite tool** — turns one visitor into a whole congregation. This is your single highest-leverage growth feature.
- **Social proof** — the Covenant Wall counter makes commitment feel like a movement, which makes more people commit.
- **SEO built in** — the page is tagged so Google understands it. Searches like "digital sabbath for families" or "delaying smartphones christian" can find you.

### 7b. The content library — AI-assisted, you approve

Your sermon already contains "50+ articles' worth" of material. You do **not** write these from scratch. Here is the workflow for each:

**Blog articles / devotionals (AI drafts, you approve).**
*How:* Open Claude (claude.ai). Paste your sermon, then ask: *"Write a 600-word article for a Christian family ministry on [the Digital Wall / Technoference / etc.], in a warm, hopeful, non-condemning tone, grounded in Scripture."* Claude drafts it; you read it, correct anything, and publish. **This must be human-approved** — you are responsible for the theology and tone. AI drafts; you are the pastor.
*Time saved:* a 2-hour article becomes a 15-minute review.

**Short social media posts (AI generates in bulk).**
*How:* Ask Claude: *"From this sermon, write 20 short Facebook/WhatsApp-status posts, each under 40 words, each with one Scripture and one practical tip."* You get a month of posts in one sitting. Skim, pick the good ones, schedule them.
*Done manually only:* the actual posting (or use a free scheduler like Buffer).

**The downloadable resources (AI drafts, you finalise).**
The site lists six resources marked "coming soon" (Family Digital Covenant, 7-Day Guide, etc.). For each: ask Claude to draft it, review it, and I can turn the final text into a polished PDF for you to upload. Tell me when you want to start — the Family Digital Covenant is the most-requested, so begin there.

**Sermon clips / video (mostly manual).**
Editing video is human work. But AI helps: paste your sermon transcript and ask Claude to *"identify the 8 most shareable 60-second moments and give each a caption."* Then an editor (or you) cuts those clips.

### 7c. A simple 90-day growth rhythm
- **Weeks 1–2:** Launch. Share the link in your own WhatsApp groups and church. Ask 5 families to take the covenant so the wall is genuine.
- **Weeks 3–6:** Publish one AI-drafted, you-approved article per week. Post 3 short social posts per week.
- **Weeks 7–12:** Use the pastor-invite tool yourself — send it to 10 pastors. Release the Family Digital Covenant PDF. Aim for one church to run a Digital Sabbath.

Exponential growth is not one big push; it is one church teaching three churches. The site is built for exactly that hand-off.

---

## 8. Quick troubleshooting

- **AI says the same thing every time** → the Worker isn't connected yet, or `aiEndpoint` still says `/api/ai`. Revisit §4.
- **Install / offline not working** → you opened the file directly. It only works on the live `https://` link.
- **Changes not showing** → your browser cached the old version. Hard-refresh (Ctrl+Shift+R), or it updates within a day on its own.
- **The AI gave an odd answer** → it has guardrails, but AI is not a pastor. The chat shows a disclaimer pointing serious questions to a real person. Review it occasionally.

---

## 9. A word on responsibility

The AI features are a wonderful servant and a poor master — fittingly, the very lesson of your sermon. They draft, suggest, and tirelessly answer common questions. But the ministry's voice, theology, and care are *yours*. Read what the AI produces. Keep the human in the loop. The technology is a tool. The question, as you preached, is who is discipling whom.

May the Lord bless the work of your hands.

— Built for the Wi-Fi vs The Word ministry
