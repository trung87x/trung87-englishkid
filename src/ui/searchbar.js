import { normalize, trieSuggest } from "../utils/text.js";
import { INDEX } from "../data/load.js";

export function mountSearchBox(container) {
  container.innerHTML = `
<div class="overlay">
<div class="relative">
<input id="q" type="text" placeholder="Tìm EN/VI… hỗ trợ pos:, topic:, tag:"
class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
<div id="ac" class="absolute mt-1 left-0 right-0 hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-80 overflow-auto"></div>
</div>
</div>`;
  const input = container.querySelector("#q");
  const ac = container.querySelector("#ac");

  const renderAC = (items) => {
    if (!items.length) {
      ac.classList.add("hidden");
      ac.innerHTML = "";
      return;
    }
    ac.classList.remove("hidden");
    ac.innerHTML = items
      .map(
        (s) =>
          `<button type="button" class="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">${s}</button>`
      )
      .join("");
    ac.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        input.value = btn.textContent;
        location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
      })
    );
  };

  let t;
  const debounce = (fn, ms = 150) => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
  input.addEventListener("input", () => {
    debounce(() => {
      const v = normalize(input.value);
      if (!v) {
        renderAC([]);
        return;
      }
      const last = v.split(/\s+/).pop();
      const sugg = last ? trieSuggest(INDEX.trie, last, 8) : [];
      renderAC(sugg);
    }, 150);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
      location.hash = `#/results?q=${encodeURIComponent(input.value)}`;
  });
}
