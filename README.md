# 📁 Project structure (copy this)

public/
  data/
    grade-1-full.json
src/
  main.js
  style.css
  utils/
    text.js
  data/
    load.js
  search/
    index.js
  ui/
    searchbar.js
    filters.js
    list.js
  routes/
    home.js
    browse-topic.js
    browse-az.js
    browse-tags.js
    results.js
index.html

---

// ===================== index.html =====================
<!DOCTYPE html>
<html lang="vi" class="h-full">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EnglishKid — Tra cứu Grade 1</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body class="min-h-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <header class="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <a href="#/" class="font-bold text-lg">EnglishKid</a>
        <nav class="ml-auto flex items-center gap-1 text-sm">
          <a href="#/browse/topic" class="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Topic</a>
          <a href="#/browse/a-z" class="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">A–Z</a>
          <a href="#/browse/tags" class="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Tags</a>
        </nav>
      </div>
    </header>

    <main id="app" class="max-w-6xl mx-auto px-4 py-6"></main>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>

---

// ===================== src/style.css =====================
html { scroll-behavior: smooth; }

/* Autocomplete dropdown layering */
.overlay { position: relative; z-index: 10; }

/* Clamp helper (if Tailwind plugin not present) */
.line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }

---

// ===================== src/utils/text.js =====================
export const VIET_MAP = {
  a:/[àáạảãâầấậẩẫăằắặẳẵ]/g, A:/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g,
  e:/[èéẹẻẽêềếệểễ]/g, E:/[ÈÉẸẺẼÊỀẾỆỂỄ]/g,
  i:/[ìíịỉĩ]/g, I:/[ÌÍỊỈĨ]/g,
  o:/[òóọỏõôồốộổỗơờớợởỡ]/g, O:/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g,
  u:/[ùúụủũưừứựửữ]/g, U:/[ÙÚỤỦŨƯỪỨỰỬỮ]/g,
  y:/[ỳýỵỷỹ]/g, Y:/[ỲÝỴỶỸ]/g,
  d:/[đ]/g, D:/[Đ]/g
};

export function normalize(str=""){
  let s = (str+"").trim();
  for (const k in VIET_MAP) s = s.replace(VIET_MAP[k], k);
  return s.toLowerCase();
}

// Edit distance <=1 quick check
export function lev1(a, b){
  if (Math.abs(a.length-b.length) > 1) return 9;
  let i=0,j=0,edits=0;
  while(i<a.length && j<b.length){
    if (a[i]===b[j]){ i++; j++; continue; }
    edits++; if (edits>1) return 9;
    if (a.length>b.length) i++; else if (a.length<b.length) j++; else { i++; j++; }
  }
  if (i<a.length || j<b.length) edits++;
  return edits;
}

export function insertTrie(trie, word){
  let node=trie;
  for (const ch of word){ node[ch]=node[ch]||{}; node=node[ch]; }
  node.$=true;
}

export function trieSuggest(trie, prefix, limit=8){
  let node=trie;
  for (const ch of prefix){ node=node[ch]; if (!node) return []; }
  const out=[], buf=[];
  const dfs = (n)=>{
    if (out.length>=limit) return;
    if (n.$) out.push(buf.join(""));
    for (const k of Object.keys(n)) if (k!=="$"){
      buf.push(k); dfs(n[k]); buf.pop();
    }
  };
  dfs(node);
  return out.map(s=>prefix+s);
}

---

// ===================== src/data/load.js =====================
import { normalize, insertTrie } from "../utils/text.js";

export const DB = { raw: [], words: [], topics: [], tags: [], pos: [] };
export const INDEX = { byWord: new Map(), trie: {} };

export async function loadData(){
  const url = "/public/data/grade-1-full.json"; // adjust if needed
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  const data = await res.json();

  let items = [];
  if (Array.isArray(data)) items = data;
  else if (data.categories) items = data.categories.flatMap(c=>c.items||[]);
  else if (data.items) items = data.items; else items = [];

  DB.raw = items.map((it, idx)=>({
    id: it.id || `w_${idx+1}`,
    word: it.word || "",
    meaning_vi: it.meaning_vi || it.meaning || "",
    pos: it.pos || "",
    topics: it.topics || it.topic || [],
    tags: it.tags || []
  })).filter(x=>x.word && x.meaning_vi);

  DB.pos = [...new Set(DB.raw.map(x=>x.pos).filter(Boolean))].sort();
  DB.topics = [...new Set(DB.raw.flatMap(x=>x.topics||[]))].sort();
  DB.tags = [...new Set(DB.raw.flatMap(x=>x.tags||[]))].sort();

  for (const x of DB.raw){
    const key = normalize(x.word);
    INDEX.byWord.set(key, (INDEX.byWord.get(key)||[]).concat([x]));
    insertTrie(INDEX.trie, key);
  }
  DB.words = DB.raw;
}

---

// ===================== src/search/index.js =====================
import { normalize, lev1 } from "../utils/text.js";
import { DB } from "../data/load.js";

export function parseQuery(q){
  const tokens = (q||"").trim().split(/\s+/).filter(Boolean);
  const cond = { text: [], pos: [], topic: [], tag: [] };
  for (const t of tokens){
    if (t.startsWith("pos:")) cond.pos.push(t.slice(4));
    else if (t.startsWith("topic:")) cond.topic.push(t.slice(6));
    else if (t.startsWith("tag:")) cond.tag.push(t.slice(4));
    else cond.text.push(t);
  }
  return cond;
}

export function search(query, facets){
  const cond = parseQuery(query||"");
  const ntext = normalize(cond.text.join(" "));
  const fpos=facets.pos||"", ftopic=facets.topic||"", ftag=facets.tag||"";
  return DB.words.filter(x=>{
    if (fpos && x.pos!==fpos) return false;
    if (ftopic && !(x.topics||[]).includes(ftopic)) return false;
    if (ftag && !(x.tags||[]).includes(ftag)) return false;
    if (!ntext) return true;
    const w = normalize(x.word);
    const m = normalize(x.meaning_vi||"");
    if (w.includes(ntext) || m.includes(ntext)) return true;
    return lev1(ntext, w.slice(0, Math.max(ntext.length,1))) <= 1;
  });
}

---

// ===================== src/ui/searchbar.js =====================
import { normalize, trieSuggest } from "../utils/text.js";
import { INDEX } from "../data/load.js";

export function mountSearchBox(container){
  container.innerHTML = `
    <div class="overlay">
      <div class="relative">
        <input id="q" type="text" placeholder="Tìm EN/VI… hỗ trợ pos:, topic:, tag:"
          class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <div id="ac" class="absolute mt-1 left-0 right-0 hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-80 overflow-auto"></div>
      </div>
    </div>`;
  const input = container.querySelector('#q');
  const ac = container.querySelector('#ac');

  const renderAC = (items)=>{
    if (!items.length){ ac.classList.add('hidden'); ac.innerHTML=''; return; }
    ac.classList.remove('hidden');
    ac.innerHTML = items.map(s=>`<button type="button" class="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">${s}</button>`).join('');
    ac.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      input.value = btn.textContent; location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
    }));
  };

  let t; const debounce=(fn,ms=150)=>{ clearTimeout(t); t=setTimeout(fn,ms); };
  input.addEventListener('input', ()=>{
    debounce(()=>{
      const v = normalize(input.value);
      if (!v){ renderAC([]); return; }
      const last = v.split(/\s+/).pop();
      const sugg = last ? trieSuggest(INDEX.trie, last, 8) : [];
      renderAC(sugg);
    }, 150);
  });
  input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') location.hash = `#/results?q=${encodeURIComponent(input.value)}`; });
}

---

// ===================== src/ui/filters.js =====================
export function mountFiltersBar(container, facetsData, onChange){
  container.className = 'flex flex-wrap items-center gap-2 text-sm';
  container.innerHTML = `
    <span class="text-slate-500">Bộ lọc:</span>
    <select id="fPos" class="px-3 py-2 rounded border bg-transparent"><option value="">POS (tất cả)</option></select>
    <select id="fTopic" class="px-3 py-2 rounded border bg-transparent"><option value="">Topic (tất cả)</option></select>
    <select id="fTag" class="px-3 py-2 rounded border bg-transparent"><option value="">Tag (tất cả)</option></select>
    <select id="sort" class="ml-auto px-3 py-2 rounded border bg-transparent">
      <option value="az">Sắp xếp A–Z</option>
      <option value="za">Sắp xếp Z–A</option>
    </select>`;
  const fPos=container.querySelector('#fPos');
  const fTopic=container.querySelector('#fTopic');
  const fTag=container.querySelector('#fTag');
  const sort=container.querySelector('#sort');

  for (const p of facetsData.pos) fPos.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`);
  for (const t of facetsData.topics) fTopic.insertAdjacentHTML('beforeend', `<option value="${t}">${t}</option>`);
  for (const g of facetsData.tags) fTag.insertAdjacentHTML('beforeend', `<option value="${g}">${g}</option>`);

  [fPos,fTopic,fTag,sort].forEach(el=>el.addEventListener('change',()=>onChange({
    pos: fPos.value, topic: fTopic.value, tag: fTag.value, sort: sort.value
  })));

  return { get:()=>({ pos:fPos.value, topic:fTopic.value, tag:fTag.value, sort:sort.value }) };
}

---

// ===================== src/ui/list.js =====================
export function renderList(container, items){
  container.innerHTML = `
    <div id="list" class="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"></div>
    <div class="text-center mt-4">
      <button id="btnMore" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Tải thêm</button>
    </div>`;
  const listEl = container.querySelector('#list');
  const btn = container.querySelector('#btnMore');
  let page=0; const SIZE=50;
  function renderChunk(){
    const slice = items.slice(page*SIZE, (page+1)*SIZE);
    listEl.insertAdjacentHTML('beforeend', slice.map(x=>`
      <div class="p-3 grid grid-cols-[1fr_auto] gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50">
        <div>
          <div class="font-medium">${x.word} <span class="text-xs text-slate-500">· ${x.pos||'—'}</span></div>
          <div class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">${x.meaning_vi}</div>
          <div class="mt-1 text-xs text-slate-500">${(x.topics||[]).join(', ')} ${x.tags?.length? ' · '+x.tags.join(', ') : ''}</div>
        </div>
        <div class="text-xs text-slate-500 self-center">${(x.word[0]||'').toUpperCase()}</div>
      </div>`).join(''));
    page++;
    if (page*SIZE >= items.length) btn.classList.add('hidden');
  }
  btn.addEventListener('click', renderChunk);
  renderChunk();
}

---

// ===================== src/routes/home.js =====================
import { mountSearchBox } from "../ui/searchbar.js";

export function pageHome(){
  const root = document.createElement('section');
  root.className = 'grid gap-6';
  root.innerHTML = `
    <div class="text-center py-8">
      <h1 class="text-2xl md:text-3xl font-semibold">Tra cứu từ vựng Grade 1</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">Duyệt theo Topic, A–Z, Tags, hoặc tìm kiếm nhanh EN/VI.</p>
    </div>
    <div id="sb"></div>
    <div class="grid sm:grid-cols-3 gap-4">
      <a href="#/browse/topic" class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition">
        <div class="text-xl font-medium">Browse theo Topic</div>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Chủ đề: animals, school, home…</p>
      </a>
      <a href="#/browse/a-z" class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition">
        <div class="text-xl font-medium">Browse theo A–Z</div>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Danh mục theo chữ cái đầu.</p>
      </a>
      <a href="#/browse/tags" class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition">
        <div class="text-xl font-medium">Browse theo Tags</div>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Độ khó, ngữ cảnh…</p>
      </a>
    </div>`;
  mountSearchBox(root.querySelector('#sb'));
  return root;
}

---

// ===================== src/routes/browse-topic.js =====================
import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseTopic(){
  const root = document.createElement('section');
  root.className = 'grid gap-5';
  const sb = document.createElement('div');
  mountSearchBox(sb);
  root.appendChild(sb);

  const filters = document.createElement('div');
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = DB.words;
  const handle = ({pos,topic,tag,sort})=>{
    current = search('', {pos, topic, tag});
    paint(sort);
  };
  const api = mountFiltersBar(filters, facets, handle);
  root.appendChild(filters);

  const container = document.createElement('div');
  root.appendChild(container);

  // Topic grid
  const grid = document.createElement('div');
  grid.className = 'grid sm:grid-cols-2 md:grid-cols-3 gap-3';
  for (const t of DB.topics){
    const count = DB.words.filter(x=>x.topics?.includes(t)).length;
    const a = document.createElement('a');
    a.href = 'javascript:void(0)';
    a.className = 'rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40';
    a.innerHTML = `<div class="font-medium">${t}</div><div class="text-sm text-slate-500">${count} từ</div>`;
    a.addEventListener('click', ()=>{ filters.querySelector('#fTopic').value=t; handle({ ...api.get(), topic:t }); });
    grid.appendChild(a);
  }
  container.appendChild(grid);

  const listZone = document.createElement('div');
  listZone.className = 'mt-3';
  container.appendChild(listZone);

  function paint(sort='az'){
    const sorted = [...current].sort((a,b)=> sort==='az' ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word));
    renderList(listZone, sorted);
  }
  paint('az');
  return root;
}

---

// ===================== src/routes/browse-az.js =====================
import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseAZ(){
  const root = document.createElement('section');
  root.className = 'grid gap-5';
  const sb = document.createElement('div');
  mountSearchBox(sb); root.appendChild(sb);

  const filters = document.createElement('div');
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = DB.words;
  const handle = ({pos,topic,tag,sort})=>{ current = search('', {pos, topic, tag}); paint(sort); };
  const api = mountFiltersBar(filters, facets, handle);
  root.appendChild(filters);

  const container = document.createElement('div');
  root.appendChild(container);

  const letters = [...new Set(DB.words.map(x=>x.word?.[0]?.toUpperCase()).filter(Boolean))].sort();
  const nav = document.createElement('div');
  nav.className = 'flex flex-wrap gap-1 mb-2';
  for (const L of letters){
    const btn = document.createElement('button');
    btn.className = 'px-2 py-1 rounded border text-sm hover:bg-slate-50 dark:hover:bg-slate-800';
    btn.textContent = L;
    btn.addEventListener('click', ()=>{ current = DB.words.filter(x=>x.word?.[0]?.toUpperCase()===L); paint(api.get().sort); });
    nav.appendChild(btn);
  }
  container.appendChild(nav);

  const listZone = document.createElement('div');
  container.appendChild(listZone);

  function paint(sort='az'){
    const sorted = [...current].sort((a,b)=> sort==='az' ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word));
    renderList(listZone, sorted);
  }
  paint('az');
  return root;
}

---

// ===================== src/routes/browse-tags.js =====================
import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseTags(){
  const root = document.createElement('section');
  root.className = 'grid gap-5';
  const sb = document.createElement('div');
  mountSearchBox(sb); root.appendChild(sb);

  const filters = document.createElement('div');
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = DB.words;
  const handle = ({pos,topic,tag,sort})=>{ current = search('', {pos, topic, tag}); paint(sort); };
  const api = mountFiltersBar(filters, facets, handle);
  root.appendChild(filters);

  const container = document.createElement('div');
  root.appendChild(container);

  const box = document.createElement('div');
  box.className = 'flex flex-wrap gap-2';
  for (const tag of DB.tags){
    const btn = document.createElement('button');
    btn.className = 'px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 dark:hover:bg-slate-800';
    btn.textContent = `#${tag}`;
    btn.addEventListener('click', ()=>{ filters.querySelector('#fTag').value=tag; handle({ ...api.get(), tag }); });
    box.appendChild(btn);
  }
  container.appendChild(box);

  const listZone = document.createElement('div');
  listZone.className = 'mt-3';
  container.appendChild(listZone);

  function paint(sort='az'){
    const sorted = [...current].sort((a,b)=> sort==='az' ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word));
    renderList(listZone, sorted);
  }
  paint('az');
  return root;
}

---

// ===================== src/routes/results.js =====================
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";
import { DB } from "../data/load.js";

export function pageResults(params){
  const root = document.createElement('section');
  root.className = 'grid gap-4';

  const sb = document.createElement('div');
  mountSearchBox(sb); root.appendChild(sb);

  const bar = document.createElement('div');
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = [];
  const handle = ({pos,topic,tag,sort})=>{ current = search(params.q||'', {pos,topic,tag}); paint(sort); };
  const api = mountFiltersBar(bar, facets, handle);
  root.appendChild(bar);

  const listZone = document.createElement('div');
  root.appendChild(listZone);

  function paint(sort='az'){
    const sorted = [...current].sort((a,b)=> sort==='az' ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word));
    renderList(listZone, sorted);
  }
  handle({ ...api.get(), sort:'az' });
  return root;
}

---

// ===================== src/main.js =====================
import { loadData } from "./data/load.js";
import { pageHome } from "./routes/home.js";
import { pageBrowseTopic } from "./routes/browse-topic.js";
import { pageBrowseAZ } from "./routes/browse-az.js";
import { pageBrowseTags } from "./routes/browse-tags.js";
import { pageResults } from "./routes/results.js";

async function router(){
  const app = document.getElementById('app');
  const [hash, qs] = location.hash.split('?');
  const params = Object.fromEntries(new URLSearchParams(qs||''));

  if (!window.__db_loaded){
    try { await loadData(); window.__db_loaded = true; }
    catch(e){ app.innerHTML = `<div class='p-6 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'>${e.message}</div>`; return; }
  }

  app.innerHTML = '';
  switch(hash){
    case '#/browse/topic': app.appendChild(pageBrowseTopic()); break;
    case '#/browse/a-z': app.appendChild(pageBrowseAZ()); break;
    case '#/browse/tags': app.appendChild(pageBrowseTags()); break;
    case '#/results': app.appendChild(pageResults(params)); break;
    default: app.appendChild(pageHome());
  }
}

window.addEventListener('hashchange', router);
router();
