import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseTags() {
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

  const box = document.createElement("div");
  box.className = "flex flex-wrap gap-2";
  for (const tag of DB.tags) {
    const btn = document.createElement("button");
    btn.className =
      "px-3 py-1.5 rounded-full border text-sm hover:bg-slate-50 dark:hover:bg-slate-800";
    btn.textContent = `#${tag}`;
    btn.addEventListener("click", () => {
      filters.querySelector("#fTag").value = tag;
      handle({ ...api.get(), tag });
    });
    box.appendChild(btn);
  }
  container.appendChild(box);

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
