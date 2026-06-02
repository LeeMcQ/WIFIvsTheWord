/**
 * shepherd-proxy — Cloudflare Worker for the AI Digital Shepherd
 * Wi-Fi vs The Word
 *
 * The app sends { messages:[{role,content}], context:{...} }. This Worker injects
 * the Shepherd persona + the user's on-device context, calls your AI provider with
 * a key that NEVER reaches the client, and returns { reply }. OpenAI-compatible, so
 * it works with DeepSeek or Groq by changing two env vars.
 *
 * Deploy:
 *   wrangler init shepherd-proxy
 *   # paste this as src/index.js, then:
 *   wrangler secret put AI_API_KEY
 *   wrangler deploy
 * Then put the resulting URL into PROXY_URL in the app.
 *
 * wrangler.toml:
 *   name = "shepherd-proxy"
 *   main = "src/index.js"
 *   compatibility_date = "2024-11-01"
 *   [vars]
 *   AI_BASE_URL = "https://api.deepseek.com/chat/completions"   # or Groq's URL
 *   MODEL = "deepseek-chat"                                     # or "llama-3.3-70b-versatile"
 *   ALLOW_ORIGIN = "*"                                          # tighten to your app origin in prod
 *   # optional rate limiting:  [[kv_namespaces]] binding = "RL"  id = "..."
 */

const SYSTEM = `You are "the Shepherd", a gentle Christian companion inside an app that helps families overcome screen addiction. Your voice is warm, unhurried, and full of grace — never clinical, never shaming. You are a coach, not a cop.

Core convictions:
- The goal is not more time in this app. It is less screen time and more real life: prayer, Scripture, family, rest, presence. Gently point people AWAY from their phone and back to God and the people in the room.
- Grace, not guilt. If someone has scrolled too long, never scold. Remind them tomorrow's mercies are new (Lamentations 3:22–23) and invite the next small faithful step.
- Christ is the source of freedom and rest. You may quote Scripture briefly and naturally (KJV or a plain rendering), but you are not preachy.
- Address the deeper hunger beneath the scroll — loneliness, tiredness, anxiety, boredom — with compassion.

Style:
- Brief. Usually 2–4 sentences. This is a chat, not a sermon.
- Offer ONE concrete, doable next step when helpful (a 5-minute walk, a psalm, calling someone, a minute of prayer, sleep).
- Ask a gentle question to keep the heart open, but don't interrogate.
- Never encourage self-harm or unhealthy extremes; if someone is in real crisis, kindly urge them to reach out to a trusted person or local help.
Stay strictly in this caring, Scripture-rooted companion role.`;

function buildContext(ctx = {}) {
  const parts = [];
  if (ctx.usageMinutes != null) parts.push(`Screen time today: about ${ctx.usageMinutes} min (their goal is ${ctx.goalMinutes ?? "—"} min).`);
  if (ctx.streak != null) parts.push(`Days of presence kept: ${ctx.streak}.`);
  if (ctx.steps != null) parts.push(`On the recovery journey: ${ctx.steps}/12 steps.`);
  if (ctx.longing) parts.push(`What they say they long for: ${ctx.longing}.`);
  return parts.length ? `\n\nQuiet context about the person (use with care, don't recite it back):\n- ${parts.join("\n- ")}` : "";
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);

    // optional, simple per-IP daily rate limit if a KV namespace "RL" is bound
    if (env.RL) {
      const ip = request.headers.get("CF-Connecting-IP") || "anon";
      const key = `rl:${ip}:${new Date().toISOString().slice(0, 10)}`;
      const used = parseInt((await env.RL.get(key)) || "0", 10);
      if (used >= (parseInt(env.DAILY_LIMIT || "60", 10))) {
        return json({ reply: "Let's rest our conversation for now — we've talked a lot today. I'm here again tomorrow. Take a breath, say a prayer, and step into your evening." }, 200, cors);
      }
      await env.RL.put(key, String(used + 1), { expirationTtl: 172800 });
    }

    let payload;
    try { payload = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }
    const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
    const system = SYSTEM + buildContext(payload.context);

    try {
      const res = await fetch(env.AI_BASE_URL || "https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.AI_API_KEY}` },
        body: JSON.stringify({
          model: env.MODEL || "deepseek-chat",
          messages: [{ role: "system", content: system }, ...messages],
          max_tokens: 320,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      return json({ reply: reply || fallback() }, 200, cors);
    } catch (e) {
      return json({ reply: fallback() }, 200, cors);
    }
  },
};

function fallback() {
  return "I'm here, walking with you. Take a slow breath — what would help your heart most right now: a moment of prayer, a psalm, or stepping outside for a few minutes?";
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
