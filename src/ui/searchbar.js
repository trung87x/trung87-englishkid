// src/ui/searchbar.js
import { DB } from "../data/load.js";
import { normalize } from "../utils/text.js";

export function mountSearchBox(container) {
  container.innerHTML = `
<div class="overlay">
  <div class="relative">
    <input id="q" type="text" autocomplete="off" placeholder="Tìm EN/VI..."
      class="w-full px-4 py-3 rounded-xl border border-slate-300"/>
    <div id="ac" class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow hidden z-10"></div>
  </div>
</div>`;

  const input = container.querySelector("#q");
  const ac = container.querySelector("#ac");

  const MAX = 8;
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

  const firstVI = (x) => {
    const raw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi[0]
      : x.meaning_vi ?? x.vi ?? x.meaning ?? "";
    return String(raw);
  };

  function renderAC(list, { rawLow, useRaw }) {
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
        const vi = firstVI(x);
        let viHTML = escapeHTML(vi);
        if (useRaw && rawLow) {
          const viLow = vi.toLowerCase();
          const k = viLow.indexOf(rawLow);
          if (k >= 0) {
            viHTML =
              escapeHTML(vi.slice(0, k)) +
              `<mark class="bg-yellow-200">${escapeHTML(
                vi.slice(k, k + rawLow.length)
              )}</mark>` +
              escapeHTML(vi.slice(k + rawLow.length));
          }
        }
        return `
<button type="button"
  class="ac-item block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 ${
    i === sel ? "bg-emerald-50" : ""
  }">
  <div class="font-medium">${escapeHTML(x.word)}</div>
  <div class="text-xs text-slate-500 truncate">${viHTML}</div>
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
    location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
  }

  function updateSel() {
    ac.querySelectorAll(".ac-item").forEach((el, i) =>
      el.classList.toggle("bg-emerald-50", i === sel)
    );
  }

  // --- Gợi ý dropdown ---
  input.addEventListener("input", () => {
    const raw = input.value.trim();
    if (!raw) return renderAC([], { rawLow: "", useRaw: false });

    const rawLow = raw.toLowerCase();
    const norm = normalize(rawLow);
    const useRaw = hasDiacritics(rawLow); // có dấu => match đúng dấu trên nghĩa VI

    items = DB.words
      .filter((x) => {
        const en = normalize(x.word);
        const viAll = firstVI(x);
        const viLow = viAll.toLowerCase();
        const viNorm = normalize(viAll);

        if (useRaw) {
          // gõ có dấu: so khớp tiếng Việt theo include
          return viLow.includes(rawLow);
        } else {
          // gõ không dấu: lọc theo EN/VI đã bỏ dấu
          return en.includes(norm) || viNorm.includes(norm);
        }
      })
      .slice(0, MAX);

    renderAC(items, { rawLow, useRaw });
  });

  // --- Phím tắt ---
  input.addEventListener("keydown", (e) => {
    if (ac.classList.contains("hidden")) {
      if (e.key === "Enter") {
        const q = input.value.trim();
        location.hash = `#/results?q=${encodeURIComponent(q)}`;
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      sel = (sel + 1) % items.length;
      updateSel();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel - 1 + items.length) % items.length;
      updateSel();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (sel >= 0) choose(sel);
      else {
        const q = input.value.trim();
        ac.classList.add("hidden");
        location.hash = `#/results?q=${encodeURIComponent(q)}`;
      }
    }
    if (e.key === "Escape") ac.classList.add("hidden");
  });
}
