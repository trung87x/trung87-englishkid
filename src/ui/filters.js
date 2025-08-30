export function mountFiltersBar(container, facetsData = {}, onChange) {
  // ======= CONFIG – chỉ ẩn UI, KHÔNG tắt tính năng =======
  const SETTINGS = {
    filtersUi: "hide", // "on" | "hide"  → hide = render đầy đủ nhưng giấu khỏi mắt
    defaultSort: "az",
  };
  // =======================================================

  if (!container.id) container.id = "filtersBar";

  // Luôn RENDER UI (để sự kiện/logic hoạt động), nhưng có thể ẩn đi
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

  for (const p of facetsData.pos || [])
    fPos.insertAdjacentHTML("beforeend", `<option value="${p}">${p}</option>`);
  for (const t of facetsData.topics || [])
    fTopic.insertAdjacentHTML(
      "beforeend",
      `<option value="${t}">${t}</option>`
    );
  for (const g of facetsData.tags || [])
    fTag.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);

  // Giá trị khởi tạo
  sort.value = SETTINGS.defaultSort || "az";

  const emit = () => {
    onChange &&
      onChange({
        pos: fPos.value,
        topic: fTopic.value,
        tag: fTag.value,
        sort: sort.value,
      });
  };

  [fPos, fTopic, fTag, sort].forEach((el) =>
    el.addEventListener("change", emit)
  );

  // Gọi ngay để logic chạy đầy đủ dù UI bị ẩn
  queueMicrotask(emit);

  // Ẩn UI nhưng KHÔNG loại bỏ khỏi DOM (logic vẫn hoạt động)
  if (SETTINGS.filtersUi === "hide") {
    // bạn có thể dùng CSS .hidden; ở đây ẩn cứng
    container.style.display = "none";
  }

  // API lập trình để thay đổi filter khi UI đang ẩn
  return {
    get: () => ({
      pos: fPos.value,
      topic: fTopic.value,
      tag: fTag.value,
      sort: sort.value,
    }),
    set: (next = {}) => {
      if ("pos" in next) fPos.value = next.pos || "";
      if ("topic" in next) fTopic.value = next.topic || "";
      if ("tag" in next) fTag.value = next.tag || "";
      if ("sort" in next)
        sort.value = next.sort || SETTINGS.defaultSort || "az";
      emit();
    },
    show: () => {
      container.style.display = "";
    },
    hide: () => {
      container.style.display = "none";
    },
  };
}
