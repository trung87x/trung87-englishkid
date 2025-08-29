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
    const slice = items.slice(page * SIZE, (page + 1) * SIZE); // ✅ sửa lỗi: thêm *
    listEl.insertAdjacentHTML(
      "beforeend",
      slice
        .map(
          (x) => `
      <div class="p-3 grid grid-cols-[1fr_auto] gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50">
        <div>
          <div class="font-medium">
            ${x.word}
            <span class="text-xs text-slate-500">· ${x.pos || "—"}</span>
          </div>
          <div class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">${
            x.meaning_vi || ""
          }</div>
          <div class="mt-1 text-xs text-slate-500">
            ${(x.topics || []).join(", ")}${
            x.tags?.length ? " · " + x.tags.join(", ") : ""
          }
          </div>
        </div>
        <div class="text-xs text-slate-500 self-center">${(
          x.word?.[0] || ""
        ).toUpperCase()}</div>
      </div>
    `
        )
        .join("")
    );

    page++;
    if (page * SIZE >= items.length) {
      // ✅ sửa lỗi: thêm *
      btn.classList.add("hidden");
    }
  }

  btn.addEventListener("click", renderChunk);
  renderChunk();
}
