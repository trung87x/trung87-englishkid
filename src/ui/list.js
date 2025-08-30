// src/ui/list.js
export function renderList(container, items) {
  container.innerHTML = `
    <div id="list" class="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"></div>
    <div class="text-center mt-4">
      <button id="btnMore" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Tải thêm</button>
    </div>`;

  const listEl = container.querySelector("#list");
  const btn = container.querySelector("#btnMore");

  let page = 0;
  const SIZE = 50;

  function renderChunk() {
    const slice = items.slice(page * SIZE, (page + 1) * SIZE);

    listEl.insertAdjacentHTML(
      "beforeend",
      slice
        .map((x) => {
          const letter = (x.word?.[0] || "").toUpperCase();
          const topics = (x.topics || []).join(", ");
          const tags = x.tags?.length ? " · " + x.tags.join(", ") : "";
          return `
  <!-- CẢ VÙNG BẤM ĐƯỢC: data-speak trên wrapper -->
  <div
    class="group p-4 md:p-5 grid grid-cols-[1fr_auto] gap-3 items-start
           hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10 active:scale-[.99]
           transition rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    data-speak="${x.word}"
    role="button"
    tabindex="0"
    aria-label="Phát âm ${x.word}"
  >
    <div class="space-y-1.5">
      <div class="flex items-center gap-3">
        <span class="text-lg md:text-2xl font-semibold text-slate-900 dark:text-slate-100">${
          x.word
        }</span>

        <!-- icon chỉ để HIỂN THỊ, click là click cả vùng -->
        <span class="play-icon inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8
                     rounded-full bg-indigo-100 text-indigo-700
                     dark:bg-indigo-400/20 dark:text-indigo-200"
              aria-hidden="true">🔊</span>

        <span class="text-xs md:text-sm text-slate-500">· ${x.pos || "—"}</span>
      </div>

      <div class="text-base md:text-lg text-slate-700 dark:text-slate-300">${
        x.meaning_vi || ""
      }</div>

      <div class="text-xs md:text-sm text-slate-500">${topics}${tags}</div>
    </div>

    <div class="text-xs md:text-sm text-slate-500 self-center">${letter}</div>
  </div>`;
        })
        .join("")
    );

    page++;
    if (page * SIZE >= items.length) btn.classList.add("hidden");
  }

  // Enter/Space cũng phát âm (hỗ trợ bàn phím)
  listEl.addEventListener("keydown", (e) => {
    const el = e.target.closest("[data-speak]");
    if (!el) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click(); // TTS.bindClicks(document) sẽ lo phần speak
    }
  });

  btn.addEventListener("click", renderChunk);
  renderChunk();
}
