# AI Provider Guide — Groq, DeepSeek & Claude

Your website's AI features (the companion chat, the devotional generator, the
personalised quiz step) can run on **any one of three providers**. You choose which,
and you can switch any time by changing **one setting** in Cloudflare — no code edits.

---

## How it works

The `worker.js` file (your secure AI server on Cloudflare) reads an environment
variable called **`AI_PROVIDER`**. Whatever you set it to — `groq`, `deepseek`, or
`claude` — the Worker sends all AI requests to that provider. Switching is just
changing that one word and clicking Save.

| Provider | Speed | Cost | Notes |
|---|---|---|---|
| **Groq** | Extremely fast | Free tier, then very cheap | Great default. Runs open models (Llama). |
| **DeepSeek** | Fast | Cheapest paid option | Strong quality for the price. |
| **Claude** | Fast | Most expensive of the three | Highest-quality, most careful answers. |

A sensible plan: **start on Groq** (free, fast), and switch to Claude for special
seasons if you want the most polished tone. The ministry's content is gentle and
pastoral, so test each and use whichever *sounds* most like you.

---

## STEP 1 — Get an API key for the provider(s) you want

You only need a key for the provider(s) you'll actually use. You can set up one now
and add others later.

### Groq
1. Go to **console.groq.com** and sign up (free).
2. Left menu → **API Keys** → **Create API Key**.
3. Copy the key somewhere safe.

### DeepSeek
1. Go to **platform.deepseek.com** and sign up.
2. Add a small amount of credit (a few dollars lasts a long time).
3. Go to **API Keys** → **Create new API key**. Copy it.

### Claude (Anthropic)
1. Go to **console.anthropic.com** and sign up.
2. Add credit — **$5 is plenty to start.**
3. Create an API key. Copy it.

---

## STEP 2 — Deploy the Worker (if you haven't already)

1. Go to **dash.cloudflare.com**, sign up (free).
2. Left menu → **Workers & Pages** → **Create** → **Create Worker**.
3. Give it a name like `wvtw-ai`. Delete the sample code.
4. Open your **`worker.js`** file, copy ALL of it, paste it in.
5. Click **Deploy**.

If your Worker is already deployed from before, just update its code: open the
Worker → **Edit code** → paste the new `worker.js` → **Deploy**.

---

## STEP 3 — Add your settings (this is where you choose the provider)

In your Worker: **Settings → Variables and Secrets**. Add the following.

**Always add this one:**

| Type | Name | Value |
|---|---|---|
| Text (plaintext) | `AI_PROVIDER` | `groq` *(or `deepseek`, or `claude`)* |

**Then add a Secret for the provider you chose** — only the one(s) you'll use:

| Type | Name | Value |
|---|---|---|
| Secret (encrypted) | `GROQ_API_KEY` | your Groq key |
| Secret (encrypted) | `DEEPSEEK_API_KEY` | your DeepSeek key |
| Secret (encrypted) | `ANTHROPIC_API_KEY` | your Claude key |

> **Important:** the API keys must be added as **Secret** (encrypted), never as plain
> text. `AI_PROVIDER` is fine as plain text — it's not sensitive.

Click **Save and Deploy**.

**Optional — override the model:** add a plain-text variable `AI_MODEL` to use a
specific model. If you skip it, each provider uses a sensible default:
- Groq → `llama-3.3-70b-versatile`
- DeepSeek → `deepseek-chat`
- Claude → `claude-sonnet-4-20250514`

---

## STEP 4 — Connect the website to the Worker

1. Your Worker has an address like `wvtw-ai.yourname.workers.dev`.
2. Open **`shared.js`**, find the `CONFIG` block at the top, and set:
   ```
   aiEndpoint: "https://wvtw-ai.yourname.workers.dev/api/ai"
   ```
3. Re-upload `shared.js` to GitHub.

The AI features are now live on your chosen provider.

---

## STEP 5 — How to switch providers later

This is the whole point — switching is easy:

1. Go to your Worker → **Settings → Variables**.
2. Change **`AI_PROVIDER`** to the new provider (`groq`, `deepseek`, or `claude`).
3. Make sure that provider's API key Secret is also present (add it if not).
4. **Save and Deploy.**

That's it. The website doesn't change at all — it just talks to the Worker, and the
Worker now uses the new provider. You can switch as often as you like.

---

## Testing it works

After setup, open your live site, go to the home page, and use the **"Ask the
Ministry"** companion. If it gives a real, fresh answer, the provider is connected.

If it gives the same pre-written answer every time, the AI isn't connected yet —
check that `aiEndpoint` in `shared.js` points to your Worker, and that `AI_PROVIDER`
and the matching key are set in Cloudflare.

**To see an error reason:** the Worker returns a short `detail` message when
something is wrong (e.g. "Missing GROQ_API_KEY"). You can test the endpoint directly
by visiting your Worker URL with `/api/ai` — though normally the website handles it.

---

## A note on cost

All three bill per use, not monthly. For a ministry website's traffic the cost is
small — often free (Groq) or a few dollars a month. Each provider's dashboard lets
you set a spending limit, so there are never surprises. Start low; raise it only if
you ever need to.

The AI is a helper, not a pastor — whichever provider you choose, keep reviewing what
it produces. The tool serves the ministry; it never replaces you.
