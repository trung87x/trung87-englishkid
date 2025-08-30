(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const u of r.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function e(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=e(n);fetch(n.href,r)}})();function I(t){return(t??"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}function D(t,s){let e=t;for(const i of s)e[i]=e[i]||{},e=e[i];e.$=!0}const m={raw:[],words:[],topics:[],tags:[],pos:[]},w={byWord:new Map,trie:{},trieEN:{},trieVI:{},viDisplay:{},enDisplay:{},byWordFirstVI:{},vi2words:{},posList:[],topicList:[],tagList:[]};async function V(){const t=["./data/high.json","./data/med.json","./data/low.json"];let s=[];for(const e of t){const i=await fetch(e,{cache:"no-cache"});if(!i.ok)throw new Error(`Không tải được ${e} (HTTP ${i.status})`);const n=await i.json();let r=[];Array.isArray(n)?r=n:n.categories?r=n.categories.flatMap(u=>u.items||[]):n.items&&(r=n.items),s=s.concat(r)}m.raw=s.map((e,i)=>({id:e.id||`w_${i+1}`,word:e.word||"",meaning_vi:e.meaning_vi||e.meaning||"",pos:e.pos||"",topics:e.topics||e.topic||[],tags:e.tags||[]})).filter(e=>e.word&&e.meaning_vi),m.pos=[...new Set(m.raw.map(e=>e.pos).filter(Boolean))].sort(),m.topics=[...new Set(m.raw.flatMap(e=>e.topics||[]))].sort(),m.tags=[...new Set(m.raw.flatMap(e=>e.tags||[]))].sort(),w.byWord.clear(),w.trie={},w.trieEN=w.trie,w.trieVI={},w.viDisplay={},w.enDisplay={},w.byWordFirstVI={},w.vi2words={},w.posList=m.pos,w.topicList=m.topics,w.tagList=m.tags;for(const e of m.raw){const i=I(e.word);if(i){if(w.byWord.set(i,(w.byWord.get(i)||[]).concat([e])),w.enDisplay[i]||(w.enDisplay[i]=e.word),!w.byWordFirstVI[i]){const l=Array.isArray(e.meaning_vi)?e.meaning_vi[0]:String(e.meaning_vi);w.byWordFirstVI[i]=l||""}D(w.trieEN,i)}const r=(Array.isArray(e.meaning_vi)?e.meaning_vi.join(" "):e.meaning_vi??"").match(/[A-Za-zÀ-Ỵà-ỵ0-9]+/g)||[],u=new Set;for(const l of r){const f=I(l);!f||f.length<2||u.has(f)||(u.add(f),w.viDisplay[f]||(w.viDisplay[f]=l),D(w.trieVI,f),i&&(w.vi2words[f]||=new Set).add(i))}}for(const e in w.vi2words)w.vi2words[e]=[...w.vi2words[e]];m.words=m.raw}function $(t){t.innerHTML=`
<div class="overlay">
  <div class="relative">
    <input id="q" type="text" autocomplete="off" placeholder="Tìm EN/VI..."
      class="w-full px-4 py-3 rounded-xl border border-slate-300"/>
    <div id="ac" class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow hidden z-10"></div>
  </div>
</div>`;const s=t.querySelector("#q"),e=t.querySelector("#ac"),i=8;let n=[],r=-1;const u=o=>/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(o),l=(o="")=>o.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]),f=o=>{const c=Array.isArray(o.meaning_vi)?o.meaning_vi[0]:o.meaning_vi??o.vi??o.meaning??"";return String(c)};function d(o,{rawLow:c,useRaw:v}){if(!o.length){e.classList.add("hidden"),e.innerHTML="",r=-1;return}e.classList.remove("hidden"),r=-1,e.innerHTML=o.map((a,p)=>{const y=f(a);let E=l(y);if(v&&c){const C=y.toLowerCase().indexOf(c);C>=0&&(E=l(y.slice(0,C))+`<mark class="bg-yellow-200">${l(y.slice(C,C+c.length))}</mark>`+l(y.slice(C+c.length)))}return`
<button type="button"
  class="ac-item block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 ${p===r?"bg-emerald-50":""}">
  <div class="font-medium">${l(a.word)}</div>
  <div class="text-xs text-slate-500 truncate">${E}</div>
</button>`}).join(""),e.querySelectorAll(".ac-item").forEach((a,p)=>a.addEventListener("click",()=>k(p)))}function k(o){o<0||o>=n.length||(s.value=n[o].word,e.classList.add("hidden"),location.hash=`#/results?q=${encodeURIComponent(s.value)}`)}function h(){e.querySelectorAll(".ac-item").forEach((o,c)=>o.classList.toggle("bg-emerald-50",c===r))}s.addEventListener("input",()=>{const o=s.value.trim();if(!o)return d([],{rawLow:"",useRaw:!1});const c=o.toLowerCase(),v=I(c),a=u(c);n=m.words.filter(p=>{const y=I(p.word),E=f(p),M=E.toLowerCase(),C=I(E);return a?M.includes(c):y.includes(v)||C.includes(v)}).slice(0,i),d(n,{rawLow:c,useRaw:a})}),s.addEventListener("keydown",o=>{if(e.classList.contains("hidden")){if(o.key==="Enter"){const c=s.value.trim();location.hash=`#/results?q=${encodeURIComponent(c)}`}return}if(o.key==="ArrowDown"&&(o.preventDefault(),r=(r+1)%n.length,h()),o.key==="ArrowUp"&&(o.preventDefault(),r=(r-1+n.length)%n.length,h()),o.key==="Enter")if(o.preventDefault(),r>=0)k(r);else{const c=s.value.trim();e.classList.add("hidden"),location.hash=`#/results?q=${encodeURIComponent(c)}`}o.key==="Escape"&&e.classList.add("hidden")})}function O(){const t=document.createElement("section");return t.className="grid gap-6",t.innerHTML=`
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
`,$(t.querySelector("#sb")),t}function U(t,s={},e){const i={defaultSort:"az"};t.id||(t.id="filtersBar"),t.className="flex flex-wrap items-center gap-2 text-sm",t.innerHTML=`
<span class="text-slate-500">Bộ lọc:</span>
<select id="fPos" class="px-3 py-2 rounded border bg-transparent"><option value="">POS (tất cả)</option></select>
<select id="fTopic" class="px-3 py-2 rounded border bg-transparent"><option value="">Topic (tất cả)</option></select>
<select id="fTag" class="px-3 py-2 rounded border bg-transparent"><option value="">Tag (tất cả)</option></select>
<select id="sort" class="ml-auto px-3 py-2 rounded border bg-transparent">
  <option value="az">Sắp xếp A–Z</option>
  <option value="za">Sắp xếp Z–A</option>
</select>`;const n=t.querySelector("#fPos"),r=t.querySelector("#fTopic"),u=t.querySelector("#fTag"),l=t.querySelector("#sort");for(const d of s.pos||[])n.insertAdjacentHTML("beforeend",`<option value="${d}">${d}</option>`);for(const d of s.topics||[])r.insertAdjacentHTML("beforeend",`<option value="${d}">${d}</option>`);for(const d of s.tags||[])u.insertAdjacentHTML("beforeend",`<option value="${d}">${d}</option>`);l.value=i.defaultSort;const f=()=>{e&&e({pos:n.value,topic:r.value,tag:u.value,sort:l.value})};return[n,r,u,l].forEach(d=>d.addEventListener("change",f)),queueMicrotask(f),t.style.display="none",{get:()=>({pos:n.value,topic:r.value,tag:u.value,sort:l.value}),set:(d={})=>{"pos"in d&&(n.value=d.pos||""),"topic"in d&&(r.value=d.topic||""),"tag"in d&&(u.value=d.tag||""),"sort"in d&&(l.value=d.sort||i.defaultSort),f()},show:()=>{t.style.display=""},hide:()=>{t.style.display="none"}}}function _(t,s){t.innerHTML=`
    <div id="list" class="space-y-2"></div>
    <div class="text-center mt-4">
      <button id="btnMore" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
        Tải thêm
      </button>
    </div>`;const e=t.querySelector("#list"),i=t.querySelector("#btnMore");let n=0;const r=50,u=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),l=a=>u(a).replace(/"/g,"&quot;"),f=`
    <svg viewBox="0 0 24 24" class="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M15 10.5a3.5 3.5 0 0 1 0 3"/><path d="M18 9a6 6 0 0 1 0 6"/>
    </svg>`,d=a=>{const p=[];return Array.isArray(a.tags)&&p.push(...a.tags),Array.isArray(a.topics)&&p.push(...a.topics),p.length?`
      <div class="tags mt-2 hidden flex-wrap justify-end gap-1">
        ${p.slice(0,3).map(y=>`<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
             ${u(y)}
           </span>`).join("")}
      </div>`:""};function k(){const p=s.slice(n*r,(n+1)*r).map(y=>`
<div class="card group grid grid-cols-[1fr_auto] items-center gap-3
            rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 md:p-5
            hover:shadow-sm active:scale-[.99] transition cursor-pointer
            dark:border-emerald-900/50 dark:bg-emerald-400/5
            focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
     data-speak="${l(y.word||"")}"
     role="button" tabindex="0" aria-expanded="false"
     aria-label="Phát âm ${l(y.word||"")}">
  <!-- Left: EN (to, xanh đậm) + VI (ẩn mặc định) -->
  <div class="min-w-0">
    <div class="word text-2xl md:text-3xl font-extrabold tracking-tight
                text-emerald-800 dark:text-emerald-300 truncate">
      ${u(y.word||"")}
    </div>
    <div class="vi mt-1 text-lg md:text-xl text-emerald-700 dark:text-emerald-200 hidden">
      ${u(y.meaning_vi||"")}
    </div>
  </div>

  <!-- Right: Play (to hơn) + tags (ẩn mặc định, nằm dưới) -->
  <div class="flex flex-col items-end">
    <button class="play inline-grid place-items-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-sm
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Play ${l(y.word||"")}">
      ${f}
    </button>
    ${d(y)}
  </div>
</div>`).join("");e.insertAdjacentHTML("beforeend",p),n++,n*r>=s.length&&i.classList.add("hidden")}function h(a){try{if(window.TTS&&typeof window.TTS.speak=="function"){window.TTS.speak(a);return}}catch{}if("speechSynthesis"in window&&a){const p=new SpeechSynthesisUtterance(a);p.lang="en-US",window.speechSynthesis.cancel(),window.speechSynthesis.speak(p)}}let o=null;function c(a,p){const y=a.querySelector(".vi"),E=a.querySelector(".tags");y&&y.classList.toggle("hidden",!p),E&&E.classList.toggle("hidden",!p),a.classList.toggle("ring-2",p),a.classList.toggle("ring-emerald-400",p),a.classList.toggle("bg-emerald-100/80",p),a.setAttribute("aria-expanded",p?"true":"false")}function v(a){a.getAttribute("aria-expanded")==="true"?(c(a,!1),o=null):(o&&o!==a&&c(o,!1),c(a,!0),o=a)}e.addEventListener("click",a=>{const p=a.target.closest("[data-speak]");p&&(v(p),h(p.dataset.speak))}),e.addEventListener("keydown",a=>{const p=a.target.closest("[data-speak]");p&&(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),v(p),h(p.dataset.speak))}),i.addEventListener("click",k),k()}function P(t){return/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(t)}function R(t){const s=(t||"").trim().toLowerCase(),e=I(s),i=P(s);return m.words.filter(n=>{const r=I(n.word),u=Array.isArray(n.meaning_vi)?n.meaning_vi.join(" "):n.meaning_vi??"",l=I(u),f=u.toLowerCase();return i?f.includes(s):r.includes(e)||l.includes(e)})}function j(){const t=document.createElement("section");t.className="grid gap-5";const s=document.createElement("div");$(s),t.appendChild(s);const e=document.createElement("div"),i={pos:m.pos,topics:m.topics,tags:m.tags};let n=m.words;const r=({pos:h,topic:o,tag:c,sort:v})=>{n=R(""),k(v)},u=U(e,i,r);t.appendChild(e);const l=document.createElement("div");t.appendChild(l);const f=document.createElement("div");f.className="grid sm:grid-cols-2 md:grid-cols-3 gap-3";for(const h of m.topics){const o=m.words.filter(v=>v.topics?.includes(h)).length,c=document.createElement("a");c.href="javascript:void(0)",c.className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40",c.innerHTML=`<div class="font-medium">${h}</div><div class="text-sm text-slate-500">${o} từ</div>`,c.addEventListener("click",()=>{e.querySelector("#fTopic").value=h,r({...u.get(),topic:h})}),f.appendChild(c)}l.appendChild(f);const d=document.createElement("div");d.className="mt-3",l.appendChild(d);function k(h="az"){const o=[...n].sort((c,v)=>h==="az"?c.word.localeCompare(v.word):v.word.localeCompare(c.word));_(d,o)}return k("az"),t}function B(){const t=document.createElement("section");t.className="grid gap-5";const s=document.createElement("div");$(s),t.appendChild(s);const e=document.createElement("div"),i={pos:m.pos,topics:m.topics,tags:m.tags};let n=m.words;const u=U(e,i,({pos:o,topic:c,tag:v,sort:a})=>{n=R(""),h(a)});t.appendChild(e);const l=document.createElement("div");t.appendChild(l);const f=[...new Set(m.words.map(o=>o.word?.[0]?.toUpperCase()).filter(Boolean))].sort(),d=document.createElement("div");d.className="flex flex-wrap gap-1 mb-2";for(const o of f){const c=document.createElement("button");c.className="px-2 py-1 rounded border text-sm hover:bg-slate-50 dark:hover:bg-slate-800",c.textContent=o,c.addEventListener("click",()=>{n=m.words.filter(v=>v.word?.[0]?.toUpperCase()===o),h(u.get().sort)}),d.appendChild(c)}l.appendChild(d);const k=document.createElement("div");l.appendChild(k);function h(o="az"){const c=[...n].sort((v,a)=>o==="az"?v.word.localeCompare(a.word):a.word.localeCompare(v.word));_(k,c)}return h("az"),t}function Z(){const t=document.createElement("section");t.className="grid gap-5";const s=document.createElement("div");$(s),t.appendChild(s);const e=document.createElement("div"),i={pos:m.pos,topics:m.topics,tags:m.tags};let n=m.words;const r=({pos:h,topic:o,tag:c,sort:v})=>{n=R(""),k(v)},u=U(e,i,r);t.appendChild(e);const l=document.createElement("div");t.appendChild(l);const f=document.createElement("div");f.className="flex flex-wrap gap-2";for(const h of m.tags){const o=document.createElement("button");o.className="px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 dark:hover:bg-slate-800",o.textContent=`#${h}`,o.addEventListener("click",()=>{e.querySelector("#fTag").value=h,r({...u.get(),tag:h})}),f.appendChild(o)}l.appendChild(f);const d=document.createElement("div");d.className="mt-3",l.appendChild(d);function k(h="az"){const o=[...n].sort((c,v)=>h==="az"?c.word.localeCompare(v.word):v.word.localeCompare(c.word));_(d,o)}return k("az"),t}function W(t){const s=document.createElement("section");s.className="grid gap-4";const e=document.createElement("div");$(e),s.appendChild(e);const i=document.createElement("div");s.appendChild(i);const n=t.q||"",r=R(n),u=document.createElement("h2");return u.className="text-slate-500 text-sm",u.textContent=n?`Kết quả cho: "${n}" (${r.length} mục)`:`Tất cả (${r.length} mục)`,s.appendChild(u),_(i,r),s}const N=typeof window<"u"&&"speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;function F(){return Date.now()}function G(t){return t?String(t).replace(/\([^)]*\)/g," ").replace(/["'“”‘’.,!?;:]/g," ").replace(/\s+/g," ").trim():""}function K(t){return/^[A-Z]{2,6}$/.test(t)}function X(t){return t.split("").join(" ")}const Q=[/google.*english/i,/microsoft.*(aria|ava|emma).*english/i,/(samantha|karen|daniel|serena)/i],q=(()=>{let t=[],s={word:null,btn:null},e=0,i=!1;const n={accent:localStorage.getItem("ttsAccent")||"en-US",voiceURI:localStorage.getItem("ttsVoiceURI")||null,rate:parseFloat(localStorage.getItem("ttsRate")||"0.95"),pitch:parseFloat(localStorage.getItem("ttsPitch")||"1")};function r(){try{t=window.speechSynthesis.getVoices()||[]}catch{}}function u(g,b){if(!N)return null;if(r(),b){const x=t.find(A=>A.voiceURI===b);if(x)return x}const L=t.filter(x=>(x.lang||"").toLowerCase().startsWith(g.toLowerCase()));for(const x of Q){const A=L.find(S=>x.test(S.name));if(A)return A}return L[0]?L[0]:t.filter(x=>/^en-/i.test(x.lang||""))[0]||null}function l(g,b){g&&(g.classList.toggle("speaking",!!b),g.setAttribute("aria-pressed",b?"true":"false"))}function f(g){document.querySelectorAll("[data-speak].speaking").forEach(b=>{b!==g&&l(b,!1)})}function d(){if(!(i||!N))try{const g=new SpeechSynthesisUtterance(".");g.volume=0,g.onend=()=>{i=!0},window.speechSynthesis.speak(g)}catch{}}function k(){if(N){try{window.speechSynthesis.cancel()}catch{}l(s.btn,!1),s={utterance:null,word:null,btn:null}}}function h(g,b={}){if(!N){console.warn("Text-to-Speech không được hỗ trợ trên trình duyệt này.");return}const L=F();if(L<e)return;e=L+250,d();let T=G(g);if(!T)return;K(T)&&(T=X(T));const x=b.accent||n.accent,A=u(x,n.voiceURI);if(s.word&&T.toLowerCase()===String(s.word).toLowerCase()&&window.speechSynthesis.speaking){k();return}k();const S=new SpeechSynthesisUtterance(T);A?(S.voice=A,S.lang=A.lang):S.lang=x,S.rate=n.rate,S.pitch=n.pitch,S.volume=1,S.onstart=()=>{s={utterance:S,word:g,btn:b.btn||null},s.btn&&(f(s.btn),l(s.btn,!0))},S.onend=()=>{l(s.btn,!1),s={utterance:null,word:null,btn:null}},S.onerror=()=>{l(s.btn,!1),s={utterance:null,word:null,btn:null}};try{window.speechSynthesis.speak(S)}catch(H){console.error(H)}}function o(g=document){g.addEventListener("click",b=>{const L=b.target.closest("[data-speak]");if(!L||!g.contains(L))return;const T=L.getAttribute("data-speak")||L.textContent.trim();h(T,{btn:L})})}function c(g){n.accent=g||"en-US",localStorage.setItem("ttsAccent",n.accent)}function v(g){n.voiceURI=g||"",localStorage.setItem("ttsVoiceURI",n.voiceURI)}function a(g){const b=Math.max(.5,Math.min(1.2,Number(g)||1));n.rate=b,localStorage.setItem("ttsRate",String(b))}function p(g){const b=Math.max(.5,Math.min(2,Number(g)||1));n.pitch=b,localStorage.setItem("ttsPitch",String(b))}async function y(){N&&(r(),!t.length&&await new Promise(g=>{const b=()=>{r(),g(),window.speechSynthesis.removeEventListener("voiceschanged",b)};window.speechSynthesis.addEventListener("voiceschanged",b),setTimeout(()=>{r(),g()},800)}))}function E(){return t.filter(g=>/^en-/i.test(g.lang||""))}function M(){return N&&window.speechSynthesis.speaking}function C(){return s.word}return{ready:y,bindClicks:o,speak:h,stop:k,isSpeaking:M,currentWord:C,getVoices:E,setAccent:c,setVoiceURI:v,setRate:a,setPitch:p,_ensureUnlockedOnce:d}})();async function z(){const t=document.getElementById("app"),[s,e]=location.hash.split("?"),i=Object.fromEntries(new URLSearchParams(e||""));if(!window.__db_loaded)try{await V(),window.__db_loaded=!0}catch(n){t.innerHTML=`<div class='p-6 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'>${n.message}</div>`;return}switch(t.innerHTML="",s){case"#/browse/topic":t.appendChild(j());break;case"#/browse/a-z":t.appendChild(B());break;case"#/browse/tags":t.appendChild(Z());break;case"#/results":t.appendChild(W(i));break;default:t.appendChild(O())}}window.addEventListener("hashchange",z);z();q.ready().then(()=>{q.bindClicks(document)});window.addEventListener("click",function t(){"_ensureUnlockedOnce"in q&&q._ensureUnlockedOnce(),window.removeEventListener("click",t,{capture:!1})},{once:!0});
