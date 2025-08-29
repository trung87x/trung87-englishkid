import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";
import { DB } from "../data/load.js";

export function pageResults(params) {
  const root = document.createElement("section");
  root.className = "grid gap-4";

  const sb = document.createElement("div");
  mountSearchBox(sb);
  root.appendChild(sb);

  const bar = document.createElement("div");
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  let current = [];
  const handle = ({ pos, topic, tag, sort }) => {
    current = search(params.q || "", { pos, topic, tag });
    paint(sort);
  };
  const api = mountFiltersBar(bar, facets, handle);
  root.appendChild(bar);

  const listZone = document.createElement("div");
  root.appendChild(listZone);

  function paint(sort = "az") {
    const sorted = [...current].sort((a, b) =>
      sort === "az"
        ? a.word.localeCompare(b.word)
        : b.word.localeCompare(a.word)
    );
    renderList(listZone, sorted);
  }
  handle({ ...api.get(), sort: "az" });
  return root;
}
