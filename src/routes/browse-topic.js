import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseTopic() {
  const root = document.createElement("section");
  root.className = "grid gap-5";
  const sb = document.createElement("div");
  mountSearchBox(sb);
  root.appendChild(sb);

  const filters = document.createElement("div");
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = DB.words;
  const handle = ({ pos, topic, tag, sort }) => {
    current = search("", { pos, topic, tag });
    paint(sort);
  };
  const api = mountFiltersBar(filters, facets, handle);
  root.appendChild(filters);

  const container = document.createElement("div");
  root.appendChild(container);

  // Topic grid
  const grid = document.createElement("div");
  grid.className = "grid sm:grid-cols-2 md:grid-cols-3 gap-3";
  for (const t of DB.topics) {
    const count = DB.words.filter((x) => x.topics?.includes(t)).length;
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.className =
      "rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40";
    a.innerHTML = `<div class="font-medium">${t}</div><div class="text-sm text-slate-500">${count} từ</div>`;
    a.addEventListener("click", () => {
      filters.querySelector("#fTopic").value = t;
      handle({ ...api.get(), topic: t });
    });
    grid.appendChild(a);
  }
  container.appendChild(grid);

  const listZone = document.createElement("div");
  listZone.className = "mt-3";
  container.appendChild(listZone);

  function paint(sort = "az") {
    const sorted = [...current].sort((a, b) =>
      sort === "az"
        ? a.word.localeCompare(b.word)
        : b.word.localeCompare(a.word)
    );
    renderList(listZone, sorted);
  }
  paint("az");
  return root;
}
