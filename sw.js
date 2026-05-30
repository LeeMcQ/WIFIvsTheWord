/* Wi-Fi vs The Word — service worker (multi-page, v4) */
const CACHE="wvtw-v9";
const ASSETS=["./","./index.html","./articles.html","./resources.html","./events.html",
  "./testimonies.html","./about.html","./contact.html","./404.html",
  "./theme.css","./shared.js","./manifest.json","./social-card.png",
  "./tools.html","./prayer.html","./faq.html","./start-here.html","./recommended.html","./sermon-notes.html","./the-story.html","./plans.html","./faith-engine.js","./plans-data.js","./articles/the-digital-wall.html"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r;
  }).catch(()=>caches.match("./index.html"))));
});
