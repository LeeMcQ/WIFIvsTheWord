# DeepSeek Script 02 — Add Testimonies

**What this does:** Formats real testimonies you collect into the exact card layout used on `testimonies.html`.

**How to use it:**
1. Collect real testimonies (from the form on the site, WhatsApp, or in person).
2. Open DeepSeek, paste the script below, fill in the real stories where shown.
3. DeepSeek returns updated card HTML — paste it into `testimonies.html`, replacing the example cards.

> **Important — honesty:** the site launches with *example* testimonies clearly labelled as illustrative. Replace them with real stories as soon as you have them. Never present an invented story as real. This script only *formats* genuine testimonies you provide.

---

## THE SCRIPT — copy everything below into DeepSeek

```
You are formatting real testimonies for the "Wi-Fi vs The Word" ministry website.

Here are real testimonies the ministry has collected (name, location, story):

1. NAME: [e.g. The Smith Family] | LOCATION: [e.g. Durban] | STORY: [paste their words]
2. NAME: [...] | LOCATION: [...] | STORY: [...]
3. NAME: [...] | LOCATION: [...] | STORY: [...]
[add as many as you have]

TASK: For each testimony, produce one HTML card in EXACTLY this format:

<div class="testimony reveal">
  <p class="t-quote">[The story, lightly tidied for grammar and length — keep their voice,
   keep it under 50 words, do not invent anything]</p>
  <div class="t-who">
    <div class="t-av">[FIRST LETTER of their name]</div>
    <div>
      <div class="t-name">[NAME]</div>
      <div class="t-loc">[LOCATION]</div>
    </div>
  </div>
</div>

RULES:
- Do NOT invent or embellish. Only tidy grammar and trim length.
- Keep each quote warm and genuine — their voice, not a marketing voice.
- If a story is too long, trim it; never add detail that isn't there.
- The t-av letter is just the first letter of the name (e.g. "The Smith Family" -> "S",
  "A mother of three" -> "A").

Return all the cards together, ready to paste. Then tell me:
"Paste these inside the <div class="masonry"> in testimonies.html, replacing the example cards."
```

---

That's all. As real stories come in over the months, just re-run this with the new ones.
