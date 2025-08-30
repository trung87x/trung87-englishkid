export function mountFiltersBar(container, facetsData, onChange) {
  container.className = "flex flex-wrap items-center gap-2 text-sm";
  container.innerHTML = `
<span class="text-slate-500">Bộ lọc:</span>
<select id="fPos" class="px-3 py-2 rounded border bg-transparent"><option value="">POS (tất cả)</option></select>
<select id="fTopic" class="px-3 py-2 rounded border bg-transparent"><option value="">Topic (tất cả)</option></select>
<select id="fTag" class="px-3 py-2 rounded border bg-transparent"><option value="">Tag (tất cả)</option></select>
<select id="sort" class="ml-auto px-3 py-2 rounded border bg-transparent">
<option value="az">Sắp xếp A–Z</option>
<option value="za">Sắp xếp Z–A</option>
</select>`;
  const fPos = container.querySelector("#fPos");
  const fTopic = container.querySelector("#fTopic");
  const fTag = container.querySelector("#fTag");
  const sort = container.querySelector("#sort");

  for (const p of facetsData.pos)
    fPos.insertAdjacentHTML("beforeend", `<option value="${p}">${p}</option>`);
  for (const t of facetsData.topics)
    fTopic.insertAdjacentHTML(
      "beforeend",
      `<option value="${t}">${t}</option>`
    );
  for (const g of facetsData.tags)
    fTag.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);

  [fPos, fTopic, fTag, sort].forEach((el) =>
    el.addEventListener("change", () =>
      onChange({
        pos: fPos.value,
        topic: fTopic.value,
        tag: fTag.value,
        sort: sort.value,
      })
    )
  );

  return {
    get: () => ({
      pos: fPos.value,
      topic: fTopic.value,
      tag: fTag.value,
      sort: sort.value,
    }),
  };
}

// // ui/filters.js (hoặc nơi bạn đang định nghĩa mountFiltersBar)
// export function mountFiltersBar(container, facetsData, onChange) {
//   // Không render gì và ẩn hẳn
//   container.innerHTML = "";
//   container.style.display = "none"; // hoặc: container.hidden = true;

//   // Trạng thái rỗng cho tương thích code cũ
//   const state = { pos: "", topic: "", tag: "", sort: "az" }; // giữ sort="az" để không phá thứ tự mặc định

//   // Nếu code ngoài có chờ onChange để render lần đầu, vẫn gọi 1 lần
//   if (typeof onChange === "function") {
//     queueMicrotask(() => onChange(state));
//   }

//   // Trả về API cũ để chỗ gọi filters.get() không lỗi
//   return { get: () => ({ ...state }) };
// }
