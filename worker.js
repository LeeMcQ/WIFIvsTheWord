/**
 * Wi-Fi vs The Word — secure AI proxy (Cloudflare Worker)
 * ------------------------------------------------------
 * This tiny serverless function sits between your website and the
 * Anthropic API. It keeps your API key SECRET (the key lives on
 * Cloudflare's servers, never in the website code a visitor can see).
 *
 * It handles three endpoints the website calls:
 *   POST /api/ai        -> the AI companion, devotional, quiz next-step
 *   POST /api/covenant  -> records a family on the Covenant Wall
 *   GET  /api/covenant  -> returns the live count + recent families
 *   POST /api/subscribe -> stores a newsletter signup
 *
 * SETUP: see README.md, section "Connecting the AI". Takes ~10 minutes.
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

    // ---- AI endpoint ---------------------------------------------------
    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const body = await request.json();
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            system: body.system || "",
            messages: body.messages || [],
          }),
        });
        const data = await aiRes.json();
        const reply = (data.content || [])
          .map((c) => c.text || "")
          .join("")
          .trim();
        return new Response(JSON.stringify({ reply }), { headers: cors() });
      } catch (e) {
        return new Response(JSON.stringify({ error: "ai_failed" }), {
          status: 500,
          headers: cors(),
        });
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
