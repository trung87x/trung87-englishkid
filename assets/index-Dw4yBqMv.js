(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const a of e)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function s(e){const a={};return e.integrity&&(a.integrity=e.integrity),e.referrerPolicy&&(a.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?a.credentials="include":e.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(e){if(e.ep)return;e.ep=!0;const a=s(e);fetch(e.href,a)}})();const C={a:/[àáạảãâầấậẩẫăằắặẳẵ]/g,A:/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g,e:/[èéẹẻẽêềếệểễ]/g,E:/[ÈÉẸẺẼÊỀẾỆỂỄ]/g,i:/[ìíịỉĩ]/g,I:/[ÌÍỊỈĨ]/g,o:/[òóọỏõôồốộổỗơờớợởỡ]/g,O:/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g,u:/[ùúụủũưừứựửữ]/g,U:/[ÙÚỤỦŨƯỪỨỰỬỮ]/g,y:/[ỳýỵỷỹ]/g,Y:/[ỲÝỴỶỸ]/g,d:/[đ]/g,D:/[Đ]/g};function h(t=""){let o=(t+"").trim();for(const s in C)o=o.replace(C[s],s);return o.toLowerCase()}function T(t,o){if(Math.abs(t.length-o.length)>1)return 9;let s=0,r=0,e=0;for(;s<t.length&&r<o.length;){if(t[s]===o[r]){s++,r++;continue}if(e++,e>1)return 9;t.length>o.length?s++:(t.length<o.length||s++,r++)}return(s<t.length||r<o.length)&&e++,e}function L(t,o){let s=t;for(const r of o)s[r]=s[r]||{},s=s[r];s.$=!0}function $(t,o,s=8){let r=t;for(const n of o)if(r=r[n],!r)return[];const e=[],a=[],c=n=>{if(!(e.length>=s)){n.$&&e.push(a.join(""));for(const i of Object.keys(n))i!=="$"&&(a.push(i),c(n[i]),a.pop())}};return c(r),e.map(n=>o+n)}const d={raw:[],words:[],topics:[],tags:[],pos:[]},w={byWord:new Map,trie:{}};async function S(){const t="./public/data/grade-1-full.json",o=await fetch(t,{cache:"no-cache"});if(!o.ok)throw new Error(`Không tải được ${t} (HTTP ${o.status})`);const s=await o.json();let r=[];Array.isArray(s)?r=s:s.categories?r=s.categories.flatMap(e=>e.items||[]):s.items?r=s.items:r=[],d.raw=r.map((e,a)=>({id:e.id||`w_${a+1}`,word:e.word||"",meaning_vi:e.meaning_vi||e.meaning||"",pos:e.pos||"",topics:e.topics||e.topic||[],tags:e.tags||[]})).filter(e=>e.word&&e.meaning_vi),d.pos=[...new Set(d.raw.map(e=>e.pos).filter(Boolean))].sort(),d.topics=[...new Set(d.raw.flatMap(e=>e.topics||[]))].sort(),d.tags=[...new Set(d.raw.flatMap(e=>e.tags||[]))].sort();for(const e of d.raw){const a=h(e.word);w.byWord.set(a,(w.byWord.get(a)||[]).concat([e])),L(w.trie,a)}d.words=d.raw}function v(t){t.innerHTML=`
<div class="overlay">
<div class="relative">
<input id="q" type="text" placeholder="Tìm EN/VI… hỗ trợ pos:, topic:, tag:"
class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
<div id="ac" class="absolute mt-1 left-0 right-0 hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-80 overflow-auto"></div>
</div>
</div>`;const o=t.querySelector("#q"),s=t.querySelector("#ac"),r=c=>{if(!c.length){s.classList.add("hidden"),s.innerHTML="";return}s.classList.remove("hidden"),s.innerHTML=c.map(n=>`<button type="button" class="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">${n}</button>`).join(""),s.querySelectorAll("button").forEach(n=>n.addEventListener("click",()=>{o.value=n.textContent,location.hash=`#/results?q=${encodeURIComponent(o.value)}`}))};let e;const a=(c,n=150)=>{clearTimeout(e),e=setTimeout(c,n)};o.addEventListener("input",()=>{a(()=>{const c=h(o.value);if(!c){r([]);return}const n=c.split(/\s+/).pop(),i=n?$(w.trie,n,8):[];r(i)},150)}),o.addEventListener("keydown",c=>{c.key==="Enter"&&(location.hash=`#/results?q=${encodeURIComponent(o.value)}`)})}function M(){const t=document.createElement("section");return t.className="grid gap-6",t.innerHTML=`
<div class="text-center py-8">
  <h1 class="text-2xl md:text-3xl font-semibold">Tra cứu từ vựng Grade 1</h1>
  <p class="text-slate-600 dark:text-slate-400 mt-1">
    Duyệt theo Topic, A–Z, Tags, hoặc tìm kiếm nhanh EN/VI.
  </p>
</div>
<div id="sb"></div>
<div class="grid sm:grid-cols-3 gap-4">
  <a
    href="#/browse/topic"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo Topic</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Chủ đề: animals, school, home…
    </p>
  </a>
  <a
    href="#/browse/a-z"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo A–Z</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Danh mục theo chữ cái đầu.
    </p>
  </a>
  <a
    href="#/browse/tags"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo Tags</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Độ khó, ngữ cảnh…
    </p>
  </a>
</div>
`,v(t.querySelector("#sb")),t}function x(t,o,s){t.className="flex flex-wrap items-center gap-2 text-sm",t.innerHTML=`
<span class="text-slate-500">Bộ lọc:</span>
<select id="fPos" class="px-3 py-2 rounded border bg-transparent"><option value="">POS (tất cả)</option></select>
<select id="fTopic" class="px-3 py-2 rounded border bg-transparent"><option value="">Topic (tất cả)</option></select>
<select id="fTag" class="px-3 py-2 rounded border bg-transparent"><option value="">Tag (tất cả)</option></select>
<select id="sort" class="ml-auto px-3 py-2 rounded border bg-transparent">
<option value="az">Sắp xếp A–Z</option>
<option value="za">Sắp xếp Z–A</option>
</select>`;const r=t.querySelector("#fPos"),e=t.querySelector("#fTopic"),a=t.querySelector("#fTag"),c=t.querySelector("#sort");for(const n of o.pos)r.insertAdjacentHTML("beforeend",`<option value="${n}">${n}</option>`);for(const n of o.topics)e.insertAdjacentHTML("beforeend",`<option value="${n}">${n}</option>`);for(const n of o.tags)a.insertAdjacentHTML("beforeend",`<option value="${n}">${n}</option>`);return[r,e,a,c].forEach(n=>n.addEventListener("change",()=>s({pos:r.value,topic:e.value,tag:a.value,sort:c.value}))),{get:()=>({pos:r.value,topic:e.value,tag:a.value,sort:c.value})}}function y(t,o){t.innerHTML=`
<div id="list" class="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"></div>
<div class="text-center mt-4">
<button id="btnMore" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Tải thêm</button>
</div>`;const s=t.querySelector("#list"),r=t.querySelector("#btnMore");let e=0;const a=50;function c(){const n=o.slice(e*a,(e+1)*a);s.insertAdjacentHTML("beforeend",n.map(i=>`
<div class="p-3 grid grid-cols-[1fr_auto] gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50">
<div>
<div class="font-medium">${i.word} <span class="text-xs text-slate-500">· ${i.pos||"—"}</span></div>
<div class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">${i.meaning_vi}</div>
<div class="mt-1 text-xs text-slate-500">${(i.topics||[]).join(", ")} ${i.tags?.length?" · "+i.tags.join(", "):""}</div>
</div>
<div class="text-xs text-slate-500 self-center">${(i.word[0]||"").toUpperCase()}</div>
</div>`).join("")),e++,e*a>=o.length&&r.classList.add("hidden")}r.addEventListener("click",c),c()}function N(t){const o=(t||"").trim().split(/\s+/).filter(Boolean),s={text:[],pos:[],topic:[],tag:[]};for(const r of o)r.startsWith("pos:")?s.pos.push(r.slice(4)):r.startsWith("topic:")?s.topic.push(r.slice(6)):r.startsWith("tag:")?s.tag.push(r.slice(4)):s.text.push(r);return s}function E(t,o){const s=N(t||""),r=h(s.text.join(" ")),e=o.pos||"",a=o.topic||"",c=o.tag||"";return DB.words.filter(n=>{if(e&&n.pos!==e||a&&!(n.topics||[]).includes(a)||c&&!(n.tags||[]).includes(c))return!1;if(!r)return!0;const i=h(n.word),f=h(n.meaning_vi||"");return i.includes(r)||f.includes(r)?!0:T(r,i.slice(0,Math.max(r.length,1)))<=1})}function q(){const t=document.createElement("section");t.className="grid gap-5";const o=document.createElement("div");v(o),t.appendChild(o);const s=document.createElement("div"),r={pos:d.pos,topics:d.topics,tags:d.tags};let e=d.words;const a=({pos:u,topic:p,tag:l,sort:m})=>{e=E("",{pos:u,topic:p,tag:l}),g(m)},c=x(s,r,a);t.appendChild(s);const n=document.createElement("div");t.appendChild(n);const i=document.createElement("div");i.className="grid sm:grid-cols-2 md:grid-cols-3 gap-3";for(const u of d.topics){const p=d.words.filter(m=>m.topics?.includes(u)).length,l=document.createElement("a");l.href="javascript:void(0)",l.className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40",l.innerHTML=`<div class="font-medium">${u}</div><div class="text-sm text-slate-500">${p} từ</div>`,l.addEventListener("click",()=>{s.querySelector("#fTopic").value=u,a({...c.get(),topic:u})}),i.appendChild(l)}n.appendChild(i);const f=document.createElement("div");f.className="mt-3",n.appendChild(f);function g(u="az"){const p=[...e].sort((l,m)=>u==="az"?l.word.localeCompare(m.word):m.word.localeCompare(l.word));y(f,p)}return g("az"),t}function z(){const t=document.createElement("section");t.className="grid gap-5";const o=document.createElement("div");v(o),t.appendChild(o);const s=document.createElement("div"),r={pos:d.pos,topics:d.topics,tags:d.tags};let e=d.words;const c=x(s,r,({pos:p,topic:l,tag:m,sort:b})=>{e=E("",{pos:p,topic:l,tag:m}),u(b)});t.appendChild(s);const n=document.createElement("div");t.appendChild(n);const i=[...new Set(d.words.map(p=>p.word?.[0]?.toUpperCase()).filter(Boolean))].sort(),f=document.createElement("div");f.className="flex flex-wrap gap-1 mb-2";for(const p of i){const l=document.createElement("button");l.className="px-2 py-1 rounded border text-sm hover:bg-slate-50 dark:hover:bg-slate-800",l.textContent=p,l.addEventListener("click",()=>{e=d.words.filter(m=>m.word?.[0]?.toUpperCase()===p),u(c.get().sort)}),f.appendChild(l)}n.appendChild(f);const g=document.createElement("div");n.appendChild(g);function u(p="az"){const l=[...e].sort((m,b)=>p==="az"?m.word.localeCompare(b.word):b.word.localeCompare(m.word));y(g,l)}return u("az"),t}function j(){const t=document.createElement("section");t.className="grid gap-5";const o=document.createElement("div");v(o),t.appendChild(o);const s=document.createElement("div"),r={pos:d.pos,topics:d.topics,tags:d.tags};let e=d.words;const a=({pos:u,topic:p,tag:l,sort:m})=>{e=E("",{pos:u,topic:p,tag:l}),g(m)},c=x(s,r,a);t.appendChild(s);const n=document.createElement("div");t.appendChild(n);const i=document.createElement("div");i.className="flex flex-wrap gap-2";for(const u of d.tags){const p=document.createElement("button");p.className="px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 dark:hover:bg-slate-800",p.textContent=`#${u}`,p.addEventListener("click",()=>{s.querySelector("#fTag").value=u,a({...c.get(),tag:u})}),i.appendChild(p)}n.appendChild(i);const f=document.createElement("div");f.className="mt-3",n.appendChild(f);function g(u="az"){const p=[...e].sort((l,m)=>u==="az"?l.word.localeCompare(m.word):m.word.localeCompare(l.word));y(f,p)}return g("az"),t}function A(t){const o=document.createElement("section");o.className="grid gap-4";const s=document.createElement("div");v(s),o.appendChild(s);const r=document.createElement("div"),e={pos:d.pos,topics:d.topics,tags:d.tags};let a=[];const c=({pos:g,topic:u,tag:p,sort:l})=>{a=E(t.q||"",{pos:g,topic:u,tag:p}),f(l)},n=x(r,e,c);o.appendChild(r);const i=document.createElement("div");o.appendChild(i);function f(g="az"){const u=[...a].sort((p,l)=>g==="az"?p.word.localeCompare(l.word):l.word.localeCompare(p.word));y(i,u)}return c({...n.get(),sort:"az"}),o}async function k(){const t=document.getElementById("app"),[o,s]=location.hash.split("?"),r=Object.fromEntries(new URLSearchParams(s||""));if(!window.__db_loaded)try{await S(),window.__db_loaded=!0}catch(e){t.innerHTML=`<div class='p-6 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'>${e.message}</div>`;return}switch(t.innerHTML="",o){case"#/browse/topic":t.appendChild(q());break;case"#/browse/a-z":t.appendChild(z());break;case"#/browse/tags":t.appendChild(j());break;case"#/results":t.appendChild(A(r));break;default:t.appendChild(M())}}window.addEventListener("hashchange",k);k();
