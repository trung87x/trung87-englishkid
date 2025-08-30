import { search } from "../search/index.js";
import { mountSearchBox } from "../ui/searchbar.js";
import { renderList } from "../ui/list.js";

export function pageResults(params) {
  const root = document.createElement("section");
  root.className = "grid gap-4";

  // Search box
  const sb = document.createElement("div");
  mountSearchBox(sb);
  root.appendChild(sb);

  // Hiển thị kết quả
  const listZone = document.createElement("div");
  root.appendChild(listZone);

  // Search
  const q = params.q || "";
  const items = search(q);

  // Tiêu đề nhỏ
  const h = document.createElement("h2");
  h.className = "text-slate-500 text-sm";
  h.textContent = q
    ? `Kết quả cho: "${q}" (${items.length} mục)`
    : `Tất cả (${items.length} mục)`;
  root.appendChild(h);

  renderList(listZone, items);

  return root;
}
