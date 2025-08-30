import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseAZ() {
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

  const letters = [
    ...new Set(DB.words.map((x) => x.word?.[0]?.toUpperCase()).filter(Boolean)),
  ].sort();
  const nav = document.createElement("div");
  nav.className = "flex flex-wrap gap-1 mb-2";
  for (const L of letters) {
    const btn = document.createElement("button");
    btn.className =
      "px-2 py-1 rounded border text-sm hover:bg-slate-50 dark:hover:bg-slate-800";
    btn.textContent = L;
    btn.addEventListener("click", () => {
      current = DB.words.filter((x) => x.word?.[0]?.toUpperCase() === L);
      paint(api.get().sort);
    });
    nav.appendChild(btn);
  }
  container.appendChild(nav);

  const listZone = document.createElement("div");
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
