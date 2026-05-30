/* ============================================================
   Wi-Fi vs The Word — FAITH ENGINE
   Shared helpers used across features:
     • Bible  — fetch verses (bible-api.com, free, WEB translation) + cache
     • Store  — grace-based local progress (streaks, plans) in localStorage
     • Cards  — generate a branded shareable verse image (canvas)
   Local-first: everything works with no login, privately, instantly.
   ============================================================ */
(function(global){
  "use strict";

  /* ---------- BIBLE ---------- */
  /* Public-domain translations available from bible-api.com (no key needed). */
  var TRANSLATIONS = [
    { id:"web",   name:"World English Bible" },
    { id:"kjv",   name:"King James Version" },
    { id:"asv",   name:"American Standard Version" },
    { id:"bbe",   name:"Bible in Basic English" },
    { id:"darby", name:"Darby Translation" }
  ];
  var TKEY = "wvtw_translation";
  var CACHE_KEY = "wvtw_verse_cache_v1";

  /* persistent verse cache (survives reloads -> offline reuse) */
  function loadCache(){
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveCache(c){
    try {
      var keys = Object.keys(c);
      if(keys.length > 400){ keys.slice(0, keys.length-400).forEach(function(k){ delete c[k]; }); }
      localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    } catch(e){}
  }
  var memCache = loadCache();

  var Bible = {
    translations: TRANSLATIONS,
    getTranslation: function(){
      try { return localStorage.getItem(TKEY) || "web"; } catch(e){ return "web"; }
    },
    setTranslation: function(id){
      try { localStorage.setItem(TKEY, id); } catch(e){}
    },
    /* fetch a reference -> Promise<{text, reference, translation, offline}> */
    get: function(ref, translation){
      ref = (ref||"").trim();
      if(!ref) return Promise.reject(new Error("no reference"));
      var tr = translation || this.getTranslation();
      var ck = tr + "|" + ref;
      if(memCache[ck]) return Promise.resolve(memCache[ck]);
      return fetch("https://bible-api.com/" + encodeURIComponent(ref) + "?translation=" + tr)
        .then(function(r){ return r.json(); })
        .then(function(d){
          if(d && d.text){
            var v = { text:d.text.trim().replace(/\s+/g," "), reference:d.reference||ref,
                      translation:tr, offline:false };
            memCache[ck] = v; saveCache(memCache); return v;
          }
          throw new Error("not found");
        })
        .catch(function(err){
          /* offline / failed — try the bundled copy (WEB) as a graceful fallback */
          if(OFFLINE[ref]){
            return { text:OFFLINE[ref], reference:ref, translation:"web", offline:true };
          }
          throw err;
        });
    },
    /* curated verses on the ministry's themes (for VOTD, fallbacks) */
    themed: ["John 3:16","Philippians 4:8","Psalm 23:1","Romans 12:2","Proverbs 3:5-6",
      "Joshua 1:9","Isaiah 40:31","Matthew 11:28","Philippians 4:13","Psalm 46:10",
      "Jeremiah 29:11","2 Corinthians 5:17","Galatians 5:22-23","Psalm 119:105",
      "Matthew 6:33","Proverbs 4:23","Colossians 3:2","Psalm 1:1-2","Romans 8:28",
      "Deuteronomy 6:6-7","Luke 10:41-42","1 Kings 18:30","Nehemiah 6:3","Mark 1:35"],
    /* deterministic "verse of the day" — same verse all day, changes daily */
    today: function(){
      var d = new Date();
      var seed = d.getFullYear()*1000 + (d.getMonth()*31 + d.getDate());
      return this.themed[seed % this.themed.length];
    }
  };

  /* Bundled offline text (WEB, public domain) for the themed verses + plan verses.
     Ensures the Verse of the Day and reading plans still work with no connection. */
  var OFFLINE = {
    "John 3:16":"For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
    "Philippians 4:8":"Finally, brothers, whatever things are true, whatever things are honorable, whatever things are just, whatever things are pure, whatever things are lovely, whatever things are of good report; if there is any virtue, and if there is any praise, think about these things.",
    "Psalm 23:1":"Yahweh is my shepherd: I shall lack nothing.",
    "Romans 12:2":"Don't be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God.",
    "Proverbs 3:5-6":"Trust in Yahweh with all your heart, and don't lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.",
    "Joshua 1:9":"Haven't I commanded you? Be strong and courageous. Don't be afraid, neither be dismayed: for Yahweh your God is with you wherever you go.",
    "Isaiah 40:31":"But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
    "Matthew 11:28":"Come to me, all you who labor and are heavily burdened, and I will give you rest.",
    "Philippians 4:13":"I can do all things through Christ, who strengthens me.",
    "Psalm 46:10":"Be still, and know that I am God.",
    "Jeremiah 29:11":"For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future.",
    "2 Corinthians 5:17":"Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.",
    "Galatians 5:22-23":"But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law.",
    "Psalm 119:105":"Your word is a lamp to my feet, and a light for my path.",
    "Matthew 6:33":"But seek first God's Kingdom, and his righteousness; and all these things will be given to you as well.",
    "Proverbs 4:23":"Keep your heart with all diligence, for out of it is the wellspring of life.",
    "Colossians 3:2":"Set your mind on the things that are above, not on the things that are on the earth.",
    "Psalm 1:1-2":"Blessed is the man who doesn't walk in the counsel of the wicked, nor stand on the path of sinners, nor sit in the seat of scoffers; but his delight is in Yahweh's law. On his law he meditates day and night.",
    "Romans 8:28":"We know that all things work together for good for those who love God, for those who are called according to his purpose.",
    "Deuteronomy 6:6-7":"These words, which I command you today, shall be on your heart; and you shall teach them diligently to your children, and shall talk of them when you sit in your house, and when you walk by the way, and when you lie down, and when you rise up.",
    "Luke 10:41-42":"Jesus answered her, \u201CMartha, Martha, you are anxious and troubled about many things, but one thing is needed. Mary has chosen the good part, which will not be taken away from her.\u201D",
    "1 Kings 18:30":"Elijah said to all the people, \u201CCome near to me\u201D; and all the people came near to him. He repaired the altar of Yahweh that was thrown down.",
    "Nehemiah 6:3":"I sent messengers to them, saying, \u201CI am doing a great work, so that I can't come down. Why should the work cease while I leave it, and come down to you?\u201D",
    "Mark 1:35":"Early in the morning, while it was still dark, he rose up and went out, and departed into a deserted place, and prayed there.",
    "Genesis 2:2-3":"On the seventh day God finished his work which he had done; and he rested on the seventh day from all his work. God blessed the seventh day, and made it holy.",
    "Exodus 20:8-10":"Remember the Sabbath day, to keep it holy. You shall labor six days, and do all your work, but the seventh day is a Sabbath to Yahweh your God.",
    "Mark 2:27":"He said to them, \u201CThe Sabbath was made for man, not man for the Sabbath.\u201D",
    "Isaiah 58:13-14":"If you turn away your foot from the Sabbath, from doing your pleasure on my holy day, and call the Sabbath a delight, then you will delight yourself in Yahweh.",
    "Hebrews 4:9-10":"There remains therefore a Sabbath rest for the people of God. For he who has entered into his rest has himself also rested from his works, as God did from his.",
    "Psalm 127:2":"It is vain for you to rise up early, to stay up late, eating the bread of toil; for he gives sleep to his loved ones.",
    "2 Corinthians 10:5":"throwing down imaginations and every high thing that is exalted against the knowledge of God, and bringing every thought into captivity to the obedience of Christ.",
    "Isaiah 26:3":"You will keep whoever's mind is steadfast in perfect peace, because he trusts in you."
  };

  /* ---------- STORE (grace-based progress) ---------- */
  var KEY = "wvtw_progress_v1";
  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e){ return {}; }
  }
  function save(data){
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch(e){ return false; }
  }
  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function daysBetween(a,b){
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  var Store = {
    available: (function(){ try{ localStorage.setItem("_t","1"); localStorage.removeItem("_t"); return true; }catch(e){ return false; } })(),
    get: function(k, fallback){ var d=load(); return (k in d)? d[k] : fallback; },
    set: function(k, v){ var d=load(); d[k]=v; save(d); return v; },

    /* STREAK — grace-based. Missing days never shames; it just resets gently.
       Returns {count, best, today:boolean} */
    streak: function(){
      var d = load();
      var s = d.streak || { count:0, best:0, last:null };
      return { count:s.count, best:s.best, last:s.last,
               doneToday: s.last === todayStr() };
    },
    checkIn: function(){
      var d = load();
      var s = d.streak || { count:0, best:0, last:null };
      var t = todayStr();
      if(s.last === t) return this.streak();        // already done today
      if(s.last && daysBetween(s.last, t) === 1){    // consecutive
        s.count += 1;
      } else {                                       // first ever, or after a gap (grace)
        s.count = 1;
      }
      s.best = Math.max(s.best||0, s.count);
      s.last = t;
      d.streak = s; save(d);
      return this.streak();
    },

    /* PLANS — track day completion per plan id.
       Returns array of completed day-numbers. */
    planProgress: function(id){ var d=load(); return (d.plans && d.plans[id]) || []; },
    completeDay: function(id, day){
      var d = load(); d.plans = d.plans || {};
      var arr = d.plans[id] || [];
      if(arr.indexOf(day) < 0) arr.push(day);
      d.plans[id] = arr; save(d);
      // a plan day also counts as a check-in toward the streak
      this.checkIn();
      return arr;
    },
    resetPlan: function(id){ var d=load(); if(d.plans) delete d.plans[id]; save(d); }
  };

  /* ---------- CARDS (shareable verse image) ---------- */
  var Cards = {
    /* draws a 1080x1080 branded verse card to a canvas, returns dataURL */
    make: function(text, reference, opts){
      opts = opts || {};
      var S = 1080;
      var c = document.createElement("canvas");
      c.width = S; c.height = S;
      var x = c.getContext("2d");

      // background gradient (deep navy)
      var bg = x.createLinearGradient(0,0,S,S);
      bg.addColorStop(0,"#0b1322"); bg.addColorStop(.55,"#0e1830"); bg.addColorStop(1,"#070d18");
      x.fillStyle = bg; x.fillRect(0,0,S,S);

      // gold glow top-right
      var g = x.createRadialGradient(S*0.85,S*0.1,40, S*0.85,S*0.1,S*0.6);
      g.addColorStop(0,"rgba(224,181,82,0.20)"); g.addColorStop(1,"rgba(224,181,82,0)");
      x.fillStyle = g; x.fillRect(0,0,S,S);

      // signal rings (decorative)
      x.strokeStyle = "rgba(224,181,82,0.18)"; x.lineWidth = 2;
      [180,260,340].forEach(function(r){
        x.beginPath(); x.arc(S*0.9, S*0.08, r, 0, Math.PI*2); x.stroke();
      });

      // brand mark (cross)
      x.strokeStyle = "#e0b552"; x.lineWidth = 12; x.lineCap = "round";
      var bx = 90, by = 96;
      x.beginPath(); x.moveTo(bx+26, by); x.lineTo(bx+26, by+58); x.stroke();
      x.beginPath(); x.moveTo(bx, by+24); x.lineTo(bx+52, by+24); x.stroke();
      // brand name
      x.fillStyle = "#f6f2e9"; x.font = "600 34px 'Spline Sans',system-ui,sans-serif";
      x.fillText("Wi-Fi vs The Word", bx+78, by+38);

      // verse text (wrapped, serif italic)
      x.fillStyle = "#f6f2e9";
      var size = text.length > 240 ? 44 : text.length > 140 ? 52 : 60;
      x.font = "italic 500 " + size + "px 'Fraunces',Georgia,serif";
      var words = ("\u201C"+text+"\u201D").split(" ");
      var lines = [], line = "", maxW = S - 200;
      for(var i=0;i<words.length;i++){
        var test = line + words[i] + " ";
        if(x.measureText(test).width > maxW && line){ lines.push(line); line = words[i]+" "; }
        else line = test;
      }
      lines.push(line);
      var lh = size * 1.4;
      var startY = (S - lines.length*lh)/2 + 40;
      lines.forEach(function(ln,idx){ x.fillText(ln.trim(), 100, startY + idx*lh); });

      // reference
      x.fillStyle = "#e0b552"; x.font = "600 38px 'Fraunces',Georgia,serif";
      x.fillText("\u2014 " + reference, 100, startY + lines.length*lh + 30);

      // footer url
      x.fillStyle = "#7e879c"; x.font = "500 26px 'Spline Sans',system-ui,sans-serif";
      x.fillText("wifivstheword.org", 100, S - 70);

      return c.toDataURL("image/png");
    },
    /* trigger a download of the card */
    download: function(dataUrl, filename){
      var a = document.createElement("a");
      a.href = dataUrl; a.download = filename || "verse.png";
      document.body.appendChild(a); a.click(); a.remove();
    }
  };

  global.Faith = { Bible: Bible, Store: Store, Cards: Cards };
})(window);
