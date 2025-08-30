// src/ui/searchbar.js
import { DB } from "../data/load.js";
import { normalize } from "../utils/text.js";

export function mountSearchBox(container, opts = {}) {
  container.innerHTML = `
<div class="overlay">
  <div class="relative">
    <input id="q" type="text" autocomplete="off" placeholder="Tìm EN/VI..."
      class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
    <div id="ac"
      class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow z-10 hidden max-h-80 overflow-auto"></div>
  </div>
</div>`;

  const input = container.querySelector("#q");
  const ac = container.querySelector("#ac");

  // ===== CONFIG =====
  const MAX = 8;
  const USE_HISTORY = true;
  const HISTORY_KEY = "ek_search_recent";
  // ==================

  let items = [];
  let sel = -1;

  const hasDiacritics = (s) =>
    /[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(
      s
    );

  const escapeHTML = (s = "") =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );

  const simpleNorm = (s = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const firstVI = (x) => {
    const raw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi[0]
      : x.meaning_vi ?? x.vi ?? x.meaning ?? "";
    return String(raw);
  };

  const toView = (x, kind) => ({ kind, word: x.word, vi: firstVI(x) });

  // ---- History helpers ----
  const loadHistory = () => {
    if (!USE_HISTORY) return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveHistory = (q) => {
    if (!USE_HISTORY) return;
    const v = (q || "").trim();
    if (!v) return;
    const cur = loadHistory();
    const next = [v, ...cur.filter((x) => x !== v)].slice(0, MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  // ---- Highlight helpers ----
  const highlightAllEN = (label, qNorm) => {
    if (!qNorm) return escapeHTML(label);
    const n = simpleNorm(label);
    let i = 0,
      out = "",
      pos = 0;
    while ((i = n.indexOf(qNorm, pos)) >= 0) {
      out += escapeHTML(label.slice(pos, i));
      out += `<mark class="bg-yellow-200">${escapeHTML(
        label.slice(i, i + qNorm.length)
      )}</mark>`;
      pos = i + qNorm.length;
    }
    out += escapeHTML(label.slice(pos));
    return out;
  };

  const highlightAllVI = (vi, rawLow) => {
    if (!rawLow) return escapeHTML(vi);
    const low = vi.toLowerCase();
    let i = 0,
      out = "",
      pos = 0;
    while ((i = low.indexOf(rawLow, pos)) >= 0) {
      out += escapeHTML(vi.slice(pos, i));
      out += `<mark class="bg-yellow-200">${escapeHTML(
        vi.slice(i, i + rawLow.length)
      )}</mark>`;
      pos = i + rawLow.length;
    }
    out += escapeHTML(vi.slice(pos));
    return out;
  };

  const dedupeByWord = (list, prefer = "EN") => {
    const seen = new Map(); // word -> item
    for (const it of list) {
      const k = it.word.toLowerCase();
      if (!seen.has(k)) seen.set(k, it);
      else {
        const cur = seen.get(k);
        if (prefer === "EN" && it.kind === "EN") seen.set(k, it);
        if (prefer === "VI" && it.kind === "VI") seen.set(k, it);
      }
    }
    return [...seen.values()].slice(0, MAX);
  };

  const pill = (t) =>
    `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 mr-2">${t}</span>`;

  function renderAC(list, ctx) {
    if (!list.length) {
      ac.classList.add("hidden");
      ac.innerHTML = "";
      sel = -1;
      return;
    }
    ac.classList.remove("hidden");
    sel = -1;

    ac.innerHTML = list
      .map((x, i) => {
        const vi = x.vi || "";
        const top =
          x.kind === "EN"
            ? pill("EN") +
              `<span class="font-medium">${highlightAllEN(
                x.word,
                ctx.qNorm
              )}</span>`
            : pill("VI") +
              `<span class="font-medium">${escapeHTML(x.word)}</span>`;
        const sub =
          x.kind === "EN"
            ? `<div class="text-xs text-slate-500 truncate">${escapeHTML(
                vi
              )}</div>`
            : `<div class="text-xs text-slate-500 truncate">${highlightAllVI(
                vi,
                ctx.rawLow
              )}</div>`;
        return `
<button type="button"
  class="ac-item block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 ${
    i === sel ? "bg-emerald-50" : ""
  }">
  <div class="flex items-center">${top}</div>
  ${sub}
</button>`;
      })
      .join("");

    ac.querySelectorAll(".ac-item").forEach((btn, i) =>
      btn.addEventListener("click", () => choose(i))
    );
  }

  function choose(i) {
    if (i < 0 || i >= items.length) return;
    input.value = items[i].word;
    ac.classList.add("hidden");
    saveHistory(input.value);
    location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
  }

  function updateSel() {
    const rows = ac.querySelectorAll(".ac-item");
    rows.forEach((el, i) => el.classList.toggle("bg-emerald-50", i === sel));
    // Auto-scroll item đang chọn vào khung nhìn
    const el = rows[sel];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // --- Dropdown: gợi ý theo input ---
  input.addEventListener("input", () => {
    const raw = input.value.trim();
    if (!raw) {
      if (USE_HISTORY) {
        const hist = loadHistory();
        if (hist.length) {
          items = hist.map((h) => ({ kind: "RECENT", word: h }));
          ac.innerHTML = hist
            .map(
              (h, i) => `
<button type="button" class="ac-item block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50">
  <div class="flex items-center">${pill(
    "RECENT"
  )}<span class="font-medium">${escapeHTML(h)}</span></div>
</button>`
            )
            .join("");
          ac.classList.remove("hidden");
          ac.querySelectorAll(".ac-item").forEach((btn, i) =>
            btn.addEventListener("click", () => {
              input.value = hist[i];
              ac.classList.add("hidden");
              saveHistory(input.value);
              location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
            })
          );
          return;
        }
      }
      return renderAC([], { rawLow: "", qNorm: "" });
    }

    const rawLow = raw.toLowerCase();
    const qNorm = normalize(rawLow);
    const diac = hasDiacritics(rawLow);

    const INTER = Math.max(12, MAX * 2);

    // EN: include theo normalize
    const enList = DB.words
      .filter((x) => normalize(x.word).includes(qNorm))
      .map((x) => ({ kind: "EN", word: x.word }))
      .slice(0, INTER);

    // VI: có dấu -> include raw; không dấu -> include normalize
    const viList = DB.words
      .filter((x) => {
        const vi = firstVI(x);
        return diac
          ? vi.toLowerCase().includes(rawLow)
          : normalize(vi).includes(qNorm);
      })
      .map((x) => toView(x, "VI"))
      .slice(0, INTER);

    const prefer = diac ? "VI" : "EN";
    items = dedupeByWord([...viList, ...enList], prefer);

    renderAC(items, { rawLow, qNorm });
  });

  // --- Phím tắt ---
  input.addEventListener("keydown", (e) => {
    if (ac.classList.contains("hidden")) {
      if (e.key === "Enter") {
        const q = input.value.trim();
        saveHistory(q);
        location.hash = `#/results?q=${encodeURIComponent(q)}`;
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = (sel + 1) % items.length;
      updateSel();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel - 1 + items.length) % items.length;
      updateSel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (sel < 0 && items.length) sel = 0;
      if (sel >= 0) choose(sel);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (sel >= 0) choose(sel);
      else {
        const q = input.value.trim();
        ac.classList.add("hidden");
        saveHistory(q);
        location.hash = `#/results?q=${encodeURIComponent(q)}`;
      }
    } else if (e.key === "Escape") {
      ac.classList.add("hidden");
    }
  });

  // --- Đóng khi blur / click ra ngoài ---
  input.addEventListener("blur", () => {
    // trì hoãn để click vào dropdown vẫn chọn được
    setTimeout(() => ac.classList.add("hidden"), 120);
  });
  document.addEventListener("mousedown", (e) => {
    if (!container.contains(e.target)) ac.classList.add("hidden");
  });
}
