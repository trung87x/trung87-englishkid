import { DB } from "../data/load.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { mountFiltersBar } from "../ui/filters.js";
import { renderList } from "../ui/list.js";
import { search } from "../search/index.js";

export function pageBrowseAZ() {
  const root = document.createElement("section");
  root.className = "grid gap-5";

  // Search
  const sb = document.createElement("div");
  mountSearchBox(sb);
  root.appendChild(sb);

  // Filters
  const filters = document.createElement("div");
  const facets = { pos: DB.pos, topics: DB.topics, tags: DB.tags };
  const state = { q: "", letter: null }; // null = tất cả
  const api = mountFiltersBar(filters, facets, onFilterChange);
  root.appendChild(filters);

  // Container có padding phải để chừa chỗ cho thanh A-Z dọc
  const container = document.createElement("div");
  container.className = "relative"; // chừa chỗ cho nav dọc
  root.appendChild(container);

  // A-Z dọc
  const letters = [
    ...new Set(DB.words.map((x) => x.word?.[0]?.toUpperCase()).filter(Boolean)),
  ].sort();

  const rail = document.createElement("div");
  // đặt rail ở mép phải, bọc lấy phần sticky bên trong
  rail.className = "fixed right-4 top-40 h-full";
  const nav = document.createElement("div");
  nav.className = "flex flex-col gap-1 sticky";
  const baseBtn =
    "w-7 h-7 grid place-items-center rounded-md border text-xs bg-white/70 backdrop-blur border-emerald-200 text-emerald-700 hover:bg-emerald-50";
  const activeBtn = "bg-emerald-600 text-white border-emerald-600";
  const btnMap = new Map();

  function makeBtn(label, value) {
    const b = document.createElement("button");
    b.className = baseBtn;
    b.textContent = label;
    b.addEventListener("click", () => {
      state.letter = value; // null là tất cả
      setActive(value);
      paint(api.get().sort);
    });
    btnMap.set(value ?? "__ALL__", b);
    return b;
  }

  nav.appendChild(makeBtn("•", null)); // nút "Tất cả"
  for (const L of letters) nav.appendChild(makeBtn(L, L));
  rail.appendChild(nav);
  container.appendChild(rail);

  // Khu vực list
  const listZone = document.createElement("div");
  listZone.className = "px-14"; // thêm chút khoảng cách với nav
  container.appendChild(listZone);

  // Gõ tìm kiếm -> reset về "Tất cả"
  const qInput = sb.querySelector("#q");
  if (qInput) {
    qInput.addEventListener("input", (e) => {
      state.q = e.target.value.trim();
      state.letter = null;
      setActive(null);
      paint(api.get().sort);
    });
  }

  function onFilterChange({ pos, topic, tag, sort }) {
    paint(sort);
  }

  function setActive(value) {
    for (const [, b] of btnMap) b.className = baseBtn;
    const key = value ?? "__ALL__";
    const b = btnMap.get(key);
    if (b) b.className = `${baseBtn} ${activeBtn}`;
  }

  function computeCurrent() {
    const { pos, topic, tag } = api.get();
    let arr = search(state.q, { pos, topic, tag });
    if (state.letter) {
      arr = arr.filter((x) => x.word?.[0]?.toUpperCase() === state.letter);
    }
    return arr;
  }

  function paint(sort = "az") {
    const current = computeCurrent();
    const sorted = [...current].sort((a, b) =>
      sort === "az"
        ? a.word.localeCompare(b.word)
        : b.word.localeCompare(a.word)
    );
    renderList(listZone, sorted);
  }

  setActive(null);
  paint("az");
  return root;
}
