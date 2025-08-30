// src/ui/searchbar.js
import { normalize, trieSuggest } from "../utils/text.js";
import { INDEX } from "../data/load.js";

export function mountSearchBox(container) {
  // ======= CONFIG – chỉnh UX trong 10 giây =======
  const SETTINGS = {
    maxItems: 8, // số gợi ý hiển thị
    useHistory: true, // gợi ý “tìm gần đây” khi ô trống
    tabAccept: true, // Tab nhận gợi ý đang focus (hoặc đầu tiên)
    preferLiteralEnter: true, // Enter khi chưa chọn -> tìm nguyên văn
    replaceAllOnVI: true, // chọn gợi ý VI -> thay toàn bộ input = headword EN
    memoTTL: 8000, // cache autocomplete (ms)
  };
  // ================================================

  container.innerHTML = `
<div class="overlay">
  <div class="relative">
    <input id="q" type="text" autocomplete="off" placeholder="Tìm EN/VI… hỗ trợ pos:, topic:, tag:"
      class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
    <div id="ac" class="absolute mt-1 left-0 right-0 hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-80 overflow-auto"></div>
  </div>
</div>`;

  const input = container.querySelector("#q");
  const ac = container.querySelector("#ac");

  // ===== Cache autocomplete theo prefix =====
  const memo = new Map(); // key: lastNorm -> { ts, items }

  // ===== Lịch sử tìm kiếm =====
  const HISTORY_KEY = "ek_search_recent";
  const loadHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveHistory = (q) => {
    const v = (q || "").trim();
    if (!v) return;
    const arr = loadHistory();
    const next = [v, ...arr.filter((x) => x !== v)].slice(0, SETTINGS.maxItems);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  // ===== Highlight tất cả token văn bản (bỏ qua pos:/topic:/tag:) =====
  const highlightAll = (label, qs = []) => {
    if (!qs.length) return label;
    const nLabel = normalize(label);
    const ranges = [];
    for (const q of qs) {
      const nQ = normalize(q);
      if (!nQ) continue;
      const i = nLabel.indexOf(nQ);
      if (i >= 0) ranges.push([i, i + nQ.length]);
    }
    if (!ranges.length) return label;
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0]];
    for (let k = 1; k < ranges.length; k++) {
      const [s, e] = ranges[k];
      const last = merged[merged.length - 1];
      if (s <= last[1]) last[1] = Math.max(last[1], e);
      else merged.push([s, e]);
    }
    let out = "",
      pos = 0;
    for (const [s, e] of merged) {
      out += label.slice(pos, s);
      out += `<mark class="bg-yellow-200 px-0.5 rounded">${label.slice(
        s,
        e
      )}</mark>`;
      pos = e;
    }
    out += label.slice(pos);
    return out;
  };

  const replaceLastToken = (raw, replacement) => {
    const parts = raw.trimEnd().split(/\s+/);
    if (!parts.length) return replacement;
    parts[parts.length - 1] = replacement;
    return parts.join(" ");
  };

  const makeSnippet = (vi, nTok) => {
    if (!vi) return "";
    const nVi = normalize(vi);
    const i = nVi.indexOf(nTok);
    if (i < 0) return vi.length > 80 ? vi.slice(0, 77) + "…" : vi;
    const start = Math.max(0, i - 12);
    const end = Math.min(vi.length, i + nTok.length + 12);
    return (
      (start > 0 ? "…" : "") +
      vi.slice(start, end) +
      (end < vi.length ? "…" : "")
    );
  };

  let sel = -1; // index item đang chọn

  const renderAC = (items) => {
    if (!items.length) {
      ac.classList.add("hidden");
      ac.innerHTML = "";
      sel = -1;
      return;
    }
    ac.classList.remove("hidden");
    sel = -1; // không auto chọn dòng đầu

    // Lấy toàn bộ token người dùng gõ (bỏ facets)
    const qTokens = input.value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((t) => !/^(pos:|topic:|tag:)/.test(t));

    ac.innerHTML = items
      .map((s, i) => {
        const labelHTML = highlightAll(s.label, qTokens);
        const subHTML = s.sub
          ? `<div class="text-xs text-slate-500 truncate">${highlightAll(
              s.sub,
              qTokens
            )}</div>`
          : "";
        return `
<button type="button" data-kind="${s.kind}" data-value="${s.value}"
  class="ac-item w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 ${
    i === sel ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
  }">
  <div class="flex items-center gap-2">
    <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">${s.kind.toUpperCase()}</span>
    <span class="truncate">${labelHTML}</span>
  </div>
  ${subHTML}
</button>`;
      })
      .join("");

    // click chọn
    ac.querySelectorAll(".ac-item").forEach((btn, i) => {
      btn.addEventListener("click", () => choose(i));
    });

    function choose(i) {
      const btn = ac.querySelectorAll(".ac-item")[i];
      const val = btn?.getAttribute("data-value") || btn?.textContent || "";
      const kind = btn?.getAttribute("data-kind") || "";

      // Gợi ý VI & Recent -> thay toàn bộ input (nếu bật)
      if ((kind === "vi" && SETTINGS.replaceAllOnVI) || kind === "recent") {
        input.value = val;
      } else {
        input.value = replaceLastToken(input.value, val);
      }

      // Lưu lịch sử
      if (SETTINGS.useHistory) saveHistory(input.value);

      ac.classList.add("hidden");
      location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
    }

    // expose helpers
    renderAC.choose = choose;
    renderAC.itemsLen = items.length;
    renderAC.setSel = (i) => {
      sel = (i + items.length) % items.length;
      ac.querySelectorAll(".ac-item").forEach((el, idx) => {
        el.classList.toggle("bg-emerald-50", idx === sel);
        el.classList.toggle("dark:bg-emerald-900/20", idx === sel);
      });
    };
  };

  const mergeUnique = (lists, limit = SETTINGS.maxItems) => {
    const out = [];
    const seen = new Set();
    for (const list of lists) {
      for (const it of list) {
        const key = `${it.kind}|${(it.value || it.label).toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(it);
        if (out.length >= limit) return out;
      }
    }
    return out;
  };

  const facetSuggest = (typed, list, kind) => {
    const q = typed.slice(kind.length + 1);
    const nq = normalize(q);
    return list
      .filter((x) => normalize(x).startsWith(nq))
      .slice(0, SETTINGS.maxItems)
      .map((v) => ({ label: v, value: `${kind}:${v}`, kind }));
  };

  // Scoring: exact > prefix > sub-contains
  const score = (it, q) => {
    const nL = normalize(it.label),
      nQ = normalize(q || "");
    if (!nQ) return 0;
    if (nL === nQ) return 100;
    if (nL.startsWith(nQ)) return 80;
    if (it.sub && normalize(it.sub).includes(nQ)) return 40;
    return 10;
  };

  let t;
  const debounce = (fn, ms = 150) => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };

  input.addEventListener("input", () => {
    debounce(() => {
      const raw = input.value;
      const tokens = raw.trim().split(/\s+/).filter(Boolean);
      const lastRaw = tokens.at(-1) || "";

      // Nếu trống -> hiện lịch sử (nếu bật), ngược lại ẩn
      if (!lastRaw) {
        if (SETTINGS.useHistory) {
          const hist = loadHistory();
          return renderAC(
            hist.map((h) => ({ label: h, value: h, kind: "recent" }))
          );
        } else {
          return renderAC([]);
        }
      }

      // facets
      if (lastRaw.startsWith("pos:"))
        return renderAC(facetSuggest(lastRaw, INDEX.posList || [], "pos"));
      if (lastRaw.startsWith("topic:"))
        return renderAC(facetSuggest(lastRaw, INDEX.topicList || [], "topic"));
      if (lastRaw.startsWith("tag:"))
        return renderAC(facetSuggest(lastRaw, INDEX.tagList || [], "tag"));

      const lastNorm = normalize(lastRaw);
      if (!lastNorm) return renderAC([]);

      // Đọc cache
      const now = Date.now();
      const cached = memo.get(lastNorm);
      if (cached && now - cached.ts < SETTINGS.memoTTL) {
        return renderAC(cached.items);
      }

      const MAX = SETTINGS.maxItems;
      const INTER = Math.max(8, MAX * 3); // số lượng trung gian để ranking

      // EN headword theo prefix
      const enNorms = trieSuggest(INDEX.trieEN || INDEX.trie, lastNorm, INTER);
      const en = enNorms.map((n) => ({
        label: INDEX.enDisplay?.[n] || n,
        value: INDEX.enDisplay?.[n] || n,
        sub: INDEX.byWordFirstVI?.[n] || "",
        kind: "en",
      }));

      // VI token -> list headword EN liên quan + snippet
      const viTokens = trieSuggest(INDEX.trieVI, lastNorm, INTER);
      const viAsWords = [];
      const added = new Set();
      for (const nTok of viTokens) {
        const words = INDEX.vi2words?.[nTok] || [];
        for (const nWord of words) {
          if (added.has(nWord)) continue;
          added.add(nWord);
          const label = INDEX.enDisplay?.[nWord] || nWord;
          const viStr = INDEX.byWordFirstVI?.[nWord] || "";
          viAsWords.push({
            label,
            value: label,
            sub: makeSnippet(viStr, nTok),
            kind: "vi",
          });
          if (viAsWords.length >= INTER) break;
        }
        if (viAsWords.length >= INTER) break;
      }

      // Trộn + Ranking + Cache
      const merged = mergeUnique([en, viAsWords], INTER)
        .sort((a, b) => score(b, lastRaw) - score(a, lastRaw))
        .slice(0, MAX);

      memo.set(lastNorm, { ts: now, items: merged });
      renderAC(merged);
    }, 150);
  });

  input.addEventListener("keydown", (e) => {
    if (ac.classList.contains("hidden")) {
      if (e.key === "Enter") {
        if (SETTINGS.useHistory) saveHistory(input.value);
        location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      renderAC.setSel(sel + 1); // lần đầu -1+1 = 0
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      renderAC.setSel(sel - 1);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (sel >= 0) {
        renderAC.choose(sel); // chọn mục đang focus
      } else {
        if (SETTINGS.preferLiteralEnter) {
          ac.classList.add("hidden");
          if (SETTINGS.useHistory) saveHistory(input.value);
          location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
        } else if (renderAC.itemsLen > 0) {
          // chọn gợi ý đầu nếu không ưu tiên literal
          renderAC.setSel(0);
          renderAC.choose(0);
        }
      }
    }
    if (e.key === "Tab" && SETTINGS.tabAccept) {
      if (!ac.classList.contains("hidden")) {
        e.preventDefault();
        if (sel < 0 && renderAC.itemsLen > 0) renderAC.setSel(0);
        if (sel >= 0) renderAC.choose(sel);
      }
    }
    if (e.key === "Escape") {
      ac.classList.add("hidden");
    }
  });
}
