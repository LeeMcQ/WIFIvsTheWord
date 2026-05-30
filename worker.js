/**
 * Wi-Fi vs The Word — secure AI proxy (Cloudflare Worker)
 * ------------------------------------------------------
 * This serverless function sits between your website and the AI provider.
 * It keeps your API keys SECRET (they live on Cloudflare's servers,
 * never in the website code a visitor can see).
 *
 * MULTI-PROVIDER: supports Groq, DeepSeek, and Claude (Anthropic).
 * You choose which one is active by setting ONE environment variable
 * in Cloudflare: AI_PROVIDER = "groq" | "deepseek" | "claude".
 * To switch providers later, just change that variable — no code edits.
 *
 * Endpoints the website calls:
 *   POST /api/ai        -> AI companion, devotional, quiz next-step
 *   POST /api/covenant  -> records a family on the Covenant Wall
 *   GET  /api/covenant  -> returns the live count + recent families
 *   POST /api/testimony -> stores a testimony submission
 *   POST /api/prayer    -> stores a prayer request
 *   POST /api/subscribe -> stores a newsletter signup
 *
 * SETUP: see README.md, "Connecting the AI". Takes ~15 minutes.
 */

const ALLOWED_ORIGIN = "*"; // tighten to "https://wifivstheword.org" once live

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    ...extra,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    // ---- AI endpoint (multi-provider) ----------------------------------
    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const body = await request.json();
        const reply = await callAI(env, body.system || "", body.messages || []);
        return new Response(JSON.stringify({ reply }), { headers: cors() });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "ai_failed", detail: String(e.message || e) }),
          { status: 500, headers: cors() }
        );
      }
    }

    // ---- Covenant Wall -------------------------------------------------
    // Uses a Cloudflare KV namespace bound as COVENANT (see README).
    if (url.pathname === "/api/covenant") {
      if (!env.COVENANT) {
        return new Response(JSON.stringify({ count: null }), { headers: cors() });
      }
      if (request.method === "GET") {
        const raw = await env.COVENANT.get("data");
        const data = raw ? JSON.parse(raw) : { count: 127, recent: [] };
        return new Response(JSON.stringify(data), { headers: cors() });
      }
      if (request.method === "POST") {
        const entry = await request.json();
        const raw = await env.COVENANT.get("data");
        const data = raw ? JSON.parse(raw) : { count: 127, recent: [] };
        data.count = (data.count || 127) + 1;
        data.recent = [...(data.recent || []), {
          n: String(entry.n || "").slice(0, 40),
          t: String(entry.t || "").slice(0, 30),
        }].slice(-50);
        await env.COVENANT.put("data", JSON.stringify(data));
        return new Response(JSON.stringify({ ok: true, count: data.count }), {
          headers: cors(),
        });
      }
    }

    // ---- Testimonies ---------------------------------------------------
    // Stores submitted testimonies in KV for the ministry to review.
    if (url.pathname === "/api/testimony" && request.method === "POST") {
      if (!env.COVENANT) {
        return new Response(JSON.stringify({ ok: true }), { headers: cors() });
      }
      const t = await request.json();
      const key = "testimony:" + Date.now();
      await env.COVENANT.put(key, JSON.stringify({
        name: String(t.name || "").slice(0, 60),
        loc: String(t.loc || "").slice(0, 40),
        story: String(t.story || "").slice(0, 1000),
        at: new Date().toISOString(),
        approved: false,
      }));
      return new Response(JSON.stringify({ ok: true }), { headers: cors() });
    }

    // ---- Prayer Wall ---------------------------------------------------
    if (url.pathname === "/api/prayer" && request.method === "POST") {
      if (!env.COVENANT) {
        return new Response(JSON.stringify({ ok: true }), { headers: cors() });
      }
      const pr = await request.json();
      const key = "prayer:" + Date.now();
      await env.COVENANT.put(key, JSON.stringify({
        text: String(pr.t || "").slice(0, 280),
        name: String(pr.n || "").slice(0, 30),
        at: new Date().toISOString(),
        approved: false,
      }));
      return new Response(JSON.stringify({ ok: true }), { headers: cors() });
    }

    // ---- Newsletter ----------------------------------------------------
    // Stores signups in KV. To send actual emails, connect Beehiiv or
    // Mailchimp here (see README) — or just export this list periodically.
    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      if (!env.COVENANT) {
        return new Response(JSON.stringify({ ok: true }), { headers: cors() });
      }
      const sub = await request.json();
      const key = "sub:" + Date.now();
      await env.COVENANT.put(key, JSON.stringify({
        name: String(sub.name || "").slice(0, 60),
        email: String(sub.email || "").slice(0, 120),
        at: new Date().toISOString(),
      }));
      return new Response(JSON.stringify({ ok: true }), { headers: cors() });
    }

    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: cors(),
    });
  },
};

/* ============================================================
   MULTI-PROVIDER AI ROUTER
   ------------------------------------------------------------
   Picks the provider from env.AI_PROVIDER and calls the right
   API. Groq and DeepSeek both use the OpenAI-style chat format;
   Claude uses Anthropic's format. All three return one string.

   Required Cloudflare environment variables:
     AI_PROVIDER        "groq" | "deepseek" | "claude"
     GROQ_API_KEY       (only if using Groq)
     DEEPSEEK_API_KEY   (only if using DeepSeek)
     ANTHROPIC_API_KEY  (only if using Claude)
   Optional:
     AI_MODEL           override the default model for the chosen provider
   ============================================================ */

const PROVIDERS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    keyName: "GROQ_API_KEY",
    style: "openai",
  },
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-chat",
    keyName: "DEEPSEEK_API_KEY",
    style: "openai",
  },
  claude: {
    url: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-sonnet-4-20250514",
    keyName: "ANTHROPIC_API_KEY",
    style: "anthropic",
  },
};

async function callAI(env, system, messages) {
  const name = (env.AI_PROVIDER || "claude").toLowerCase().trim();
  const p = PROVIDERS[name];
  if (!p) {
    throw new Error(
      "Unknown AI_PROVIDER '" + name + "'. Use groq, deepseek, or claude."
    );
  }
  const key = env[p.keyName];
  if (!key) {
    throw new Error(
      "Missing " + p.keyName + ". Add it in Cloudflare settings, " +
        "or set AI_PROVIDER to a provider whose key you have configured."
    );
  }
  const model = (env.AI_MODEL && env.AI_MODEL.trim()) || p.defaultModel;

  if (p.style === "anthropic") {
    const res = await fetch(p.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 400,
        system: system,
        messages: messages,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "claude error");
    return (data.content || []).map((c) => c.text || "").join("").trim();
  }

  // openai-style (Groq + DeepSeek): system is the first message
  const fullMessages = system
    ? [{ role: "system", content: system }, ...messages]
    : messages;
  const res = await fetch(p.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 400,
      messages: fullMessages,
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(
      (data.error.message || data.error) + " (provider: " + name + ")"
    );
  }
  return ((data.choices && data.choices[0] && data.choices[0].message &&
    data.choices[0].message.content) || "").trim();
}
