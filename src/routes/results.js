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

  // 👉 đặt placeholder = giá trị q trên URL
  const q = params.q ? String(params.q) : "";
  const input = sb.querySelector("#q");
  if (input) input.placeholder = q || "Tìm EN/VI..."; // không set value, chỉ là placeholder

  // Kết quả
  const listZone = document.createElement("div");
  root.appendChild(listZone);

  const items = search(q);
  renderList(listZone, items);

  return root;
}
