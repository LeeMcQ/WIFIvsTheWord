/* ============================================================
   Wi-Fi vs The Word — SHARED SCRIPT
   Linked by every page. Handles config, header, theme,
   reveal animations, sharing, and the AI helper.
   ============================================================ */

/* ---- CONFIG: edit these once, every page updates ---- */
const CONFIG = {
  whatsappNumber: "27000000000",
  whatsappMessage: "Hi! I'd love to know more about the Wi-Fi vs The Word ministry.",
  email: "hello@wifivstheword.org",
  siteUrl: "https://wifivstheword.org",
  aiEndpoint: "/api/ai"   /* set to your Worker URL — see README section 4 */
};

/* ---- shared AI system prompt ---- */
const AI_SYSTEM = "You are the Digital Discipleship Companion for 'Wi-Fi vs The Word', a Christian " +
  "family ministry. You give warm, practical, Bible-grounded guidance on family life and technology. " +
  "Core themes: technology is a tool not an enemy; guard the mind (Romans 12:2, Philippians 4:8); " +
  "rebuild the family altar; the Digital Sabbath; delay smartphones for children; replace screen " +
  "time with relationship. Tone: warm, hopeful, never condemning. Keep replies under 130 words. " +
  "Cite Scripture naturally. For serious personal crises, gently point to a pastor or professional.";

/* ---- AI call with graceful fallback ---- */
async function askAI(messages, system){
  try{
    const res = await fetch(CONFIG.aiEndpoint, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({system:system||AI_SYSTEM, messages:messages})
    });
    if(!res.ok) throw new Error("ai "+res.status);
    const data = await res.json();
    if(data.reply) return data.reply.trim();
    if(data.content) return data.content.map(c=>c.text||"").join("").trim();
    throw new Error("bad shape");
  }catch(e){ return null; }
}

/* ---- run on every page load ---- */
document.addEventListener("DOMContentLoaded", function(){

  /* contact links — any element with these IDs gets wired */
  const waHref = "https://wa.me/"+CONFIG.whatsappNumber+"?text="+encodeURIComponent(CONFIG.whatsappMessage);
  document.querySelectorAll("[data-wa]").forEach(el=>el.href=waHref);
  document.querySelectorAll("[data-email]").forEach(el=>
    el.href="mailto:"+CONFIG.email+"?subject="+encodeURIComponent("Wi-Fi vs The Word — Enquiry"));
  const yr=document.getElementById("year"); if(yr) yr.textContent=new Date().getFullYear();

  /* theme toggle */
  const tBtn=document.getElementById("themeBtn");
  if(tBtn){
    const icon=document.getElementById("themeIcon");
    const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    const moon='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    let light=false;
    tBtn.addEventListener("click",()=>{
      light=!light;
      document.documentElement.classList.toggle("light",light);
      if(icon) icon.innerHTML=light?moon:sun;
      document.querySelector('meta[name=theme-color]')?.setAttribute('content',light?'#f4f0e6':'#0e1726');
    });
  }

  /* mobile menu */
  const mBtn=document.getElementById("menuBtn"), nav=document.getElementById("navLinks");
  if(mBtn&&nav){
    mBtn.addEventListener("click",()=>nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
  }

  /* scroll reveal */
  const els=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver((ents)=>{
      ents.forEach((en,i)=>{if(en.isIntersecting){
        setTimeout(()=>en.target.classList.add("in"),(i%4)*70);io.unobserve(en.target);}});
    },{threshold:.12});
    els.forEach(e=>io.observe(e));
  }else{ els.forEach(e=>e.classList.add("in")); }

  /* register service worker */
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
});

/* ---- sharing helpers (callable from any page) ---- */
function shareText(text){
  if(navigator.share){ navigator.share({text:text}).catch(()=>copyToClip(text)); }
  else{ copyToClip(text); }
}
function copyToClip(text){
  const done=()=>{
    let t=document.getElementById("toast");
    if(!t){ t=document.createElement("div"); t.id="toast"; t.className="toast";
      t.textContent="Link copied to clipboard"; document.body.appendChild(t); }
    t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200);
  };
  if(navigator.clipboard){ navigator.clipboard.writeText(text).then(done).catch(done); }
  else{
    const ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta);
    ta.select(); try{document.execCommand("copy");}catch(e){} ta.remove(); done();
  }
}
/* builds a share bar into any element with id="shareBar" (uses its data-url + data-msg) */
function buildShareBar(){
  const bar=document.getElementById("shareBar");
  if(!bar) return;
  const url=bar.dataset.url||CONFIG.siteUrl;
  const msg=bar.dataset.msg||("Wi-Fi vs The Word — "+url);
  const wa='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>';
  const fb='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>';
  const cp='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  bar.innerHTML='<span style="font-size:.82rem;color:var(--text-dim);margin-right:4px">Share:</span>'+
    '<a class="icon-btn" style="color:var(--wa)" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(msg)+'" aria-label="WhatsApp">'+wa+'</a>'+
    '<a class="icon-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url)+'" aria-label="Facebook">'+fb+'</a>'+
    '<button class="icon-btn" onclick="copyToClip(\''+msg.replace(/'/g,"\\'")+'\')" aria-label="Copy link">'+cp+'</button>';
}
document.addEventListener("DOMContentLoaded",buildShareBar);
