// handleforge — modern usernames, no tuff-guy / jolly energy.
// Modes: combo (real+real), invented (pronounceable, 2-3 syllables), streamer (short root + suffix)

const ADJ = {
  clean: ["north","atlas","civic","coastal","common","daily","early","equal","field","frame","fresh","given","honest","inner","linear","local","low","lunar","mid","minor","modern","narrow","novel","open","outer","parallel","plain","prime","quiet","rapid","regular","remote","round","second","silent","simple","single","slow","solid","stable","static","still","true","ultra","upper","urban","usual","valid","whole","clear","calm","neutral","polar","binary","static","remote","silent"],
  soft: ["amber","ashen","birch","cloud","cotton","dune","fern","foggy","grove","hazy","linen","lumen","maple","marble","meadow","milky","misty","mossy","oat","opal","pastel","pebble","plum","porch","prairie","sandy","silky","sunny","velvet","willow","wooly","aloe","cove","halo","harbor","juniper","lagoon","lark","lotus","mallow","melon","oasis","cinna","thyra","willa","novella"],
  tech: ["analog","arcade","binary","bit","buffer","cache","chrome","cipher","circuit","codec","cyber","data","digital","diode","disk","drift","echo","fiber","flux","glitch","grid","hex","hyper","index","integral","kernel","laser","latent","logic","loop","matrix","mesh","micro","modem","node","packet","patch","pixel","proxy","pulse","quantum","radar","raster","router","sample","sensor","signal","solar","sync","system","vector","volt","wire"]
};

const NOUN = {
  clean: ["break","coast","crest","current","drift","fall","field","flow","grove","harbor","line","loop","mark","meadow","month","north","point","port","reach","ridge","river","road","shore","sky","stone","trail","vale","view","wind","wood","yard","zone","patch","signal","frame"],
  soft: ["bean","bloom","brook","breeze","bun","cloud","dew","dove","ember","finch","fawn","feather","fern","flake","flora","glow","haze","herb","hollow","ivy","leaf","loft","moth","mouse","nest","owl","petal","pine","plume","pond","quail","ray","reed","robin","root","seed","sparrow","sprig","wren","thyra","lyra","nira","ora"],
  tech: ["arc","array","band","base","byte","chip","click","code","core","dash","drive","drone","frame","gate","gig","hack","hub","integral","interface","key","kit","lab","link","main","mod","monitor","panel","parse","ping","port","query","render","rig","scope","script","server","shift","socket","stack","stream","switch","tape","terminal","wav","widget","window"]
};

// NOTE: numeric-only nouns ("404","808") removed from pools so combos never render as "binary404" blobs.
// Numbers are applied separately via the numbers UI.

const SHARP_ONSETS = ["b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","z","bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","tr","sh","ch","rh","zh","vr","kv"];
const SOFT_ONSETS = ["b","c","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","y","z","l","m","n","s","th","sh","ch","ph","wh","c","th","n","l"];
const NUCLEI_SHORT = ["a","e","i","o","u","y","ix","ex","ax"];
const CODA_SHARP = ["x","z","q","ck","sh","th","sk","rx","nx","px","ph","ff"];

const COOL_CHUNKS = ["404","808","101","247","303","616","721","909","24","07","11"];
const PRETTY_ENDINGS = ["yra","ora","ina","ara","eth","essa","ella","ina","yra","ora"];
const LEET = { a:"4", e:"3", i:"1", o:"0", s:"5", l:"1", t:"7", g:"9", b:"8" };

const $ = id => document.getElementById(id);
let mode = "combo";
let faves = [];
try { faves = JSON.parse(localStorage.getItem("hf_faves") || "[]"); } catch(e){ faves = []; }

const rnd = a => a[Math.floor(Math.random() * a.length)];
const rint = (a,b) => a + Math.floor(Math.random()*(b-a+1));

function syllable(soft=true){
  if(!soft){
    return rnd(SHARP_ONSETS) + rnd(NUCLEI_SHORT) + rnd(CODA_SHARP);
  }
  const onset = rnd(SOFT_ONSETS);
  const r = Math.random();
  const nuc = r < 0.72 ? rnd(["a","e","i","o","u"]) : r < 0.85 ? "y" : rnd(["ae","ai","ea","io","ou"]);
  const single = nuc.length === 1;
  const coda = single
    ? rnd(["","","","","l","n","m","r","s","ra","na","la","lo","ri"])
    : rnd(["","","","","","l","n","m","r","s"]);
  return onset + nuc + coda;
}

function awkward(w){
  return /yy|[^aeiouy]{4}|[aeiou]{3}/.test(w) || /^(yy|ae|ea)/.test(w);
}

// sylCount 2 = classic (lumora), 3 = flowing (cinathyra)
function invented(soft=true, sylCount=2){
  for(let t=0;t<8;t++){
    let parts = [];
    for(let i=0;i<sylCount;i++) parts.push(syllable(soft));
    let w = parts.join("").toLowerCase().replace(/[^a-z]/g,"");
    // pretty ending variation, e.g. cina + thyra
    if(soft && sylCount >= 3 && Math.random() < 0.4){
      w += rnd(PRETTY_ENDINGS);
    }
    w = w.replace(/(.)\1\1/g,"$1$1").replace(/^q([^u])/,"qu$1");
    if(w.length < 4) w += rnd(["a","o","i","e"]);
    if(!awkward(w)) return w;
  }
  return sylCount >= 3 ? "cinathyra" : "lumora";
}

function sharpRoot(){
  const o = rnd(SHARP_ONSETS);
  const n = rnd(["a","e","i","o","u","y"]);
  const c = rnd(CODA_SHARP);
  let w = (o + n + c).replace(/[^a-z]/g,"");
  if(w.length > 5) w = w.slice(0,4);
  if(w.length < 3) w += rnd(["x","z","n"]);
  return w;
}

function targetSylCount(len){
  if(len === "short") return Math.random() < 0.7 ? 1 : 2;
  if(len === "long") return Math.random() < 0.7 ? 3 : 2;
  return 2; // medium / any
}

// ---- builders (length-aware) ----
function comboName(vibe, len){
  const poolA = vibe==="clean" ? [...ADJ.clean,...ADJ.tech.slice(0,20)]
    : vibe==="soft" ? [...ADJ.soft,...ADJ.clean.slice(0,15)]
    : [...ADJ.tech,...ADJ.clean.slice(0,15)];
  const poolN = vibe==="clean" ? [...NOUN.clean,...NOUN.tech.slice(0,20)]
    : vibe==="soft" ? [...NOUN.soft,...NOUN.clean.slice(0,15)]
    : [...NOUN.tech,...NOUN.clean.slice(0,10)];
  const longish = arr => arr.filter(w => w.length >= 5);
  const shortish = arr => arr.filter(w => w.length <= 4);
  for(let t=0;t<20;t++){
    let a = len==="long" ? rnd(longish(poolA).length?longish(poolA):poolA)
      : len==="short" ? rnd(shortish(poolA).length?shortish(poolA):poolA) : rnd(poolA);
    let b = len==="long" ? rnd(longish(poolN).length?longish(poolN):poolN)
      : len==="short" ? rnd(shortish(poolN).length?shortish(poolN):poolN) : rnd(poolN);
    if(a===b) continue;
    let raw = a + b; // separators applied later via UI
    if(len==="long" && raw.length < 12) raw += rnd(["ly","ra","on","is","er","al"]);
    if(fitsLength(raw, len)) return raw;
  }
  // fallback: force-fit by trimming/padding
  let a = rnd(poolA), b = rnd(poolN);
  let raw = (a + b).slice(0, len==="short" ? 8 : 16);
  if(len==="long" && raw.length < 12) raw += invented(true, 2).slice(0, 12 - raw.length + 2);
  return raw;
}

function inventedName(vibe, len, seed){
  const soft = vibe !== "tech";
  const n = targetSylCount(len);
  if(seed && Math.random() < 0.4){
    const tail = invented(soft, Math.max(1, n - 1));
    return Math.random() < 0.5 ? tail + seed : seed + tail;
  }
  return invented(soft, len === "any" ? rnd([2,2,3]) : n);
}

function streamerName(seed, len){
  const root = (seed || "").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,10)
    || (Math.random() < 0.6 ? sharpRoot() : invented(false, 1).slice(0,5));
  const roll = Math.random();
  if(roll < 0.4) return root + rnd(["ttv","tv","live","gg","wav","x","tv"]);
  if(roll < 0.6) return rnd(["im","its","not","iam"]) + root;
  if(len === "long") return root + invented(true, 2).slice(0,6);
  return root + invented(true, 1).slice(0,4);
}

// ---- number / separator application ----
function makeDigits(count, style){
  if(count <= 0) return "";
  if(style === "random"){
    let s = "";
    for(let i=0;i<count;i++) s += String(rint(0,9));
    if(s.length > 1 && s[0] === "0") s = String(rint(1,9)) + s.slice(1); // no leading zero
    return s;
  }
  let s = "";
  while(s.length < count) s += rnd(COOL_CHUNKS);
  return s.slice(0, count);
}

function applyLeet(name, count){
  const idx = [];
  for(let i=0;i<name.length;i++){ if(LEET[name[i].toLowerCase()]) idx.push(i); }
  if(!idx.length) return name; // nothing replaceable: caller falls back to suffix
  // shuffle
  for(let i=idx.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
  const arr = name.split("");
  idx.slice(0, Math.max(1,count)).forEach(i => { arr[i] = LEET[arr[i].toLowerCase()]; });
  return arr.join("");
}

function applyNumbers(name, count, pos, style){
  if(count <= 0) return name;
  if(pos === "leet"){
    const out = applyLeet(name, count);
    if(out !== name) return out;
    pos = "end"; // fallback: no replaceable letters (e.g. "zzz"), append instead
  }
  const digits = makeDigits(count, style);
  if(pos === "start") return digits + name;
  if(pos === "end") return name + digits;
  if(pos === "anywhere"){
    const at = rint(1, Math.max(1, name.length - 1));
    return name.slice(0, at) + digits + name.slice(at);
  }
  // mixed: split digits across two spots
  if(digits.length === 1) return Math.random() < 0.5 ? digits + name : name + digits;
  const cut = rint(1, digits.length - 1);
  const a = digits.slice(0, cut), b = digits.slice(cut);
  const at = rint(1, Math.max(1, name.length - 1));
  return a + name.slice(0, at) + b + name.slice(at);
}

function applySeparators(name, chars, max){
  name = name.replace(/[._-]+/g, ""); // normalize, then insert exactly per UI
  if(max <= 0 || !chars.length || name.length < 4) return name;
  const gaps = [];
  for(let i=1;i<name.length-1;i++) gaps.push(i);
  // shuffle gaps
  for(let i=gaps.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [gaps[i],gaps[j]]=[gaps[j],gaps[i]]; }
  const picks = gaps.slice(0, Math.min(max, 2)).sort((a,b)=>a-b);
  if(picks.length === 2 && picks[1] - picks[0] < 2) picks.pop(); // keep readable, no adjacent seps
  let out = "", gi = 0;
  for(let i=0;i<name.length;i++){
    if(gi < picks.length && i === picks[gi]){ out += rnd(chars); gi++; }
    out += name[i];
  }
  return out;
}

function platformCleanup(name, lower, safe){
  let n = name;
  if(lower) n = n.toLowerCase();
  n = safe ? n.replace(/[^a-zA-Z0-9_.-]/g,"") : n.replace(/[^a-zA-Z0-9_.-]/g,"");
  n = n.replace(/[._-]{2,}/g, m => m[0]); // no doubled separators
  n = n.replace(/^[._-]+|[._-]+$/g, "");   // no leading/trailing
  return n.slice(0, 24);
}

function fitsLength(n, len){
  const L = n.replace(/[._-]/g,"").length;
  if(len==="short") return L>=4 && L<=8;
  if(len==="medium") return L>=6 && L<=12;
  if(len==="long") return L>=12 && L<=20;
  return L>=3 && L<=20;
}

// platform-wide badge: youtube allows letters/numbers/._- ; twitch only letters/numbers/_
function platformBadge(name){
  const L = name.replace(/[._-]/g,"").length;
  const lenOk = L >= 3 && L <= 24;
  const twitchOk = /^[a-zA-Z0-9_]+$/.test(name) && L >= 4 && L <= 25;
  const ytOk = /^[a-zA-Z0-9_.-]+$/.test(name) && L >= 3 && L <= 30;
  if(!lenOk) return { t:"bad length", cls:"bad" };
  if(twitchOk && ytOk) return { t:"twitch + youtube ok", cls:"ok" };
  if(ytOk) return { t:"youtube ok · not twitch-safe", cls:"warn" };
  return { t:"rename needed", cls:"bad" };
}

function rarityNote(name){
  const hasDigit = /\d/.test(name), hasSep = /[._-]/.test(name);
  if(!hasDigit && !hasSep) return "common — likely taken";
  if(hasDigit && hasSep) return "unique-ish ✓";
  return "better odds ✓";
}

function readOpts(){
  const chars = [];
  if($("sepDot").checked) chars.push(".");
  if($("sepUnder").checked) chars.push("_");
  if($("sepDash").checked) chars.push("-");
  return {
    numCount: parseInt($("numCount").value, 10),
    numPos: $("numPos").value,
    numStyle: $("numStyle").value,
    sepChars: chars,
    sepMax: parseInt($("sepMax").value, 10),
    lower: $("optLower").checked,
    safe: $("optSafe").checked,
    vibe: $("vibeSelect").value,
    len: $("lenSelect").value,
    seed: $("seedInput").value.trim()
  };
}

function genOne(){
  const o = readOpts();
  for(let i=0;i<200;i++){
    let raw;
    if(mode==="combo") raw = o.seed && Math.random()<0.5
      ? o.seed + rnd([...(o.vibe==="soft"?NOUN.soft:o.vibe==="tech"?NOUN.tech:NOUN.clean)])
      : comboName(o.vibe, o.len);
    else if(mode==="invented") raw = inventedName(o.vibe, o.len, o.seed);
    else raw = streamerName(o.seed, o.len);
    let n = applyNumbers(raw, o.numCount, o.numPos, o.numStyle);
    n = applySeparators(n, o.sepChars, o.sepMax);
    n = platformCleanup(n, o.lower, o.safe);
    if(n.length >= 3 && fitsLength(n, o.len)) return n;
  }
  // guaranteed fallback that respects length (fixes "long still shows short")
  let raw = mode==="combo" ? comboName(o.vibe, o.len) : invented(o.vibe!=="tech", o.len==="short"?1:3);
  if(o.len==="long" && raw.replace(/[._-]/g,"").length < 12)
    raw += invented(true, 2);
  let n = applySeparators(applyNumbers(raw, o.numCount, o.numPos, o.numStyle), o.sepChars, o.sepMax);
  return platformCleanup(n, o.lower, o.safe).slice(0, 20);
}

function card(name, isFav){
  const d = document.createElement("div");
  d.className = "card";
  const badge = platformBadge(name);
  d.innerHTML = `<div class="name" title="${name}">${name}</div>
    <div class="meta"><span>${name.replace(/[._-]/g,"").length} chars</span><span class="pill ${badge.cls}">${badge.t}</span><span class="dim">${rarityNote(name)}</span></div>
    <div class="btnrow"></div>`;
  const row = d.querySelector(".btnrow");
  const mk = (label, title, fn) => {
    const b = document.createElement("button");
    b.textContent = label; b.title = title; b.onclick = fn;
    row.append(b); return b;
  };
  const copy = mk("copy", "copy full name", () =>
    navigator.clipboard.writeText(name).then(()=>{copy.textContent="✓";setTimeout(()=>copy.textContent="copy",900);}));
  mk(isFav ? "unsave" : "☆ save", isFav ? "remove" : "save", () => toggleFav(name));
  if(!isFav) mk("↻", "reroll this one", () => {
    const n = genOne();
    d.querySelector(".name").textContent = n;
    d.querySelector(".name").title = n;
  });
  // clicking the name also copies (fixes "cut off" frustration — full value always in title + clipboard)
  d.querySelector(".name").onclick = () => navigator.clipboard.writeText(d.querySelector(".name").title);
  return d;
}

function render(){
  const box = $("results"); box.innerHTML = "";
  const seen = new Set();
  let guard = 0;
  while(seen.size < 12 && guard++ < 600) seen.add(genOne());
  [...seen].forEach(n => box.append(card(n)));
}

function renderFaves(){
  const box = $("favList"); box.innerHTML = "";
  $("favCount").textContent = faves.length;
  faves.forEach(n => box.append(card(n, true)));
}

function toggleFav(n){
  if(faves.includes(n)) faves = faves.filter(x=>x!==n);
  else faves.push(n);
  try{ localStorage.setItem("hf_faves", JSON.stringify(faves)); }catch(e){}
  renderFaves();
}

const HINTS = {
  combo: "real + real, length-aware. plain pairs get taken — add 1–2 numbers / a separator.",
  invented: "2 syllables normally, 3 when long (cinathyra-style). tweak numbers for uniqueness.",
  streamer: "short root + suffix. leet mode turns supreme → supr3me."
};

$("modeTabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  mode = b.dataset.mode;
  document.querySelectorAll("#modeTabs button").forEach(x=>x.classList.toggle("active", x===b));
  $("modeHint").textContent = HINTS[mode];
});
$("genBtn").onclick = render;
["numCount","numPos","numStyle","sepMax","sepDot","sepUnder","sepDash","optLower","optSafe","vibeSelect","lenSelect"].forEach(id=>{
  document.getElementById(id).addEventListener("change", render);
});
$("seedInput").addEventListener("input", () => {});
$("modeHint").textContent = HINTS.combo;
render(); renderFaves();
