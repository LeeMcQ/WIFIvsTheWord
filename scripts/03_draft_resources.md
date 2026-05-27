# DeepSeek Script 03 — Draft Resource Content

**What this does:** Drafts the actual *text* for the printable resources listed on `resources.html` (the Family Digital Covenant, checklists, Bible studies, etc.).

**How the workflow splits:**
- **DeepSeek** drafts the content (this script) — cheap, fast.
- **You** read and approve it — you are the pastor; the theology is yours.
- **Claude** turns the approved text into a polished, printable PDF — this is a design job worth a few Claude credits, and you only do it once per resource.

---

## THE SCRIPT — copy everything below into DeepSeek

```
You are writing content for a printable resource from "Wi-Fi vs The Word", a Christian
digital discipleship and family restoration ministry. The tone is warm, hopeful, practical,
biblically grounded — never fear-driven or condemning. Technology is a tool; the question
is "who is discipling whom?"

RESOURCE TO WRITE: "The Family Digital Covenant"
(A one-page printable agreement the whole household reads and signs together.)

Produce the resource as clean, structured text with these parts:

1. TITLE and a one-line subtitle.
2. A short opening paragraph (3-4 sentences) explaining what this covenant is and why
   the family is making it together — grace-based, not rule-based.
3. THE COMMITMENTS — 6 to 8 short, concrete promises the family makes. Each should be
   one clear sentence a child can understand. Cover: phone-free meals, devices out of
   bedrooms at night, a weekly Digital Sabbath, asking before downloading, treating
   people kindly online, and replacing screen time with family time.
4. ONE anchoring Scripture verse (quoted accurately with reference).
5. A SIGNATURE BLOCK — lines for each family member to sign and date.
6. A short closing blessing (1-2 sentences).

Keep the whole thing to roughly one page of content. Return it as plain structured text
with clear headings — I will have it turned into a designed PDF afterwards.
```

---

## Other resources — change the `RESOURCE TO WRITE` line

Run the script once per resource:

1. **The Family Digital Covenant** — household agreement (start here, most requested)
2. **7-Day Digital Sabbath Guide** — one short page per day: a verse, a focus, a reflection question
3. **Digital Hygiene Checklist** — a room-by-room tick-list for parents
4. **Digital Covenant for Couples** — marriage-focused: open-door honesty, shared passwords
5. **Renewed Mind Bible Study** — a 4-session study outline for teens
6. **Church Sermon Kit outline** — what a church receives: script, slides, 4-week study

For each one, adjust part 3 of the script to fit (e.g. for the Bible study, ask for
"4 sessions, each with a passage, 3 discussion questions, and a practical challenge").

---

## When the text is approved — hand it to Claude

Once you've read and approved a draft, give it to Claude with:

> "Here is the approved text for the [resource name]. Please turn it into a polished,
> printable A4 PDF matching the Wi-Fi vs The Word brand (deep navy, warm white, gold)."

Claude builds the PDF once, you upload it, and you link it from the resource card on
`resources.html` (change the "Request the PDF" button's `href` to the PDF file).
