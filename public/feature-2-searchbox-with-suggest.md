# feature-searchbox-with-suggest.md

> Mục tiêu: Xây dựng **SearchBox component** có gợi ý
> (suggest/autocomplete). Component được đặt ở
> `views/Shared/_SearchBox.html` để tái sử dụng nhiều trang. Demo tích
> hợp vào **Search/Results.html**.

------------------------------------------------------------------------

## 1. SRS -- Feature Requirement Specification

### 1.1 Mục đích

-   Cho phép người dùng nhập từ khoá tìm kiếm EN/VI trong SearchBox.
-   Hiển thị gợi ý (suggest) khi gõ.
-   Có thể tái sử dụng component trên nhiều trang.

### 1.2 Phạm vi

-   SearchBox được định nghĩa trong `views/Shared/_SearchBox.html`.
-   Demo sử dụng ngay trong `Search/Results.html`.

### 1.3 Functional Requirements

-   **FR-1**: Người dùng nhập từ khoá → hiện tối đa 5 gợi ý.
-   **FR-2**: Chọn gợi ý → điền vào input và điều hướng tới
    `#/search?q=...`.
-   **FR-3**: Nhấn Enter → điều hướng tới `#/search?q=...`.
-   **FR-4**: Có thể include SearchBox vào bất kỳ trang nào bằng
    `loadSharedView`.

### 1.4 Non-functional Requirements

-   UI đơn giản, responsive.
-   Component độc lập, không phụ thuộc view cụ thể.

------------------------------------------------------------------------

## 2. Use Case / User Flow

-   User mở trang Search (`#/search`).
-   Thấy ô SearchBox hiển thị sẵn.
-   Khi gõ "ch" → gợi ý hiện "chan", "chân", "chop", ... (tối đa 5).
-   User chọn một gợi ý → tự động chuyển sang `#/search?q=gợi_ý`.

------------------------------------------------------------------------

## 3. Software Design Document (SDD)

### 3.1 Cấu trúc liên quan

    src/
    ├─ services/
    │  └─ SearchService.js     # có performSearch + suggest
    ├─ views/
    │  ├─ Shared/
    │  │   └─ _SearchBox.html  # component SearchBox
    │  └─ Search/
    │      └─ Results.html     # include SearchBox

### 3.2 Component

-   **SearchBox partial**: markup + script xử lý input/suggest.
-   **SearchService.suggest(q)**: trả về danh sách từ gợi ý.

### 3.3 Integration

-   Trong `Results.html` gọi `loadSharedView("sb", "_SearchBox.html")`
    để nạp component.

------------------------------------------------------------------------

## 4. Test Plan / Test Cases

-   **TC-1**: Nhập "ch" → hiển thị tối đa 5 gợi ý.
-   **TC-2**: Click gợi ý → điều hướng sang `#/search?q=...`.
-   **TC-3**: Nhấn Enter → điều hướng đúng với input.
-   **TC-4**: Component dùng lại ở 2 trang khác vẫn hoạt động
    (reusable).

------------------------------------------------------------------------

## 5. Implementation / Source Code Overview

### 5.1 `src/views/Shared/_SearchBox.html`

``` html
<div class="relative">
  <input id="q" type="text" autocomplete="off" placeholder="Tìm EN/VI..."
    class="w-full px-4 py-2 border rounded-xl" />
  <div id="ac" class="absolute left-0 right-0 mt-1 bg-white border rounded-xl shadow hidden"></div>
</div>

<script type="module">
  import * as SearchService from "/src/services/SearchService.js";

  const input = document.getElementById("q");
  const ac = document.getElementById("ac");

  function navigate(v) {
    location.hash = `#/search?q=${encodeURIComponent(v)}`;
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) {
      ac.innerHTML = "";
      ac.classList.add("hidden");
      return;
    }
    const items = SearchService.suggest(q, 5);
    ac.innerHTML = items
      .map((w) => `<div class="px-3 py-1 hover:bg-slate-100 cursor-pointer">${w}</div>`)
      .join("");
    ac.classList.remove("hidden");

    ac.querySelectorAll("div").forEach((el) => {
      el.addEventListener("click", () => navigate(el.textContent));
    });
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") navigate(input.value);
  });
</script>
```

### 5.2 `src/services/SearchService.js` (cùng file với performSearch)

``` js
import { DB } from "../data/load.js";
import { normalize, hasDiacritics } from "../utils/text.js";

export function performSearch({ q = "" } = {}) {
  const rawQ = (q || "").trim();
  const normQ = normalize(rawQ);
  const useRaw = hasDiacritics(rawQ);
  if (!rawQ) return [];

  return DB.words.filter((x) => {
    const en = normalize(x.word || "");
    const viRaw = Array.isArray(x.meaning_vi) ? x.meaning_vi.join(" ") : (x.meaning_vi || "");
    const viNorm = normalize(viRaw);

    const match = useRaw
      ? (x.word || "").toLowerCase().includes(rawQ.toLowerCase()) ||
        viRaw.toLowerCase().includes(rawQ.toLowerCase())
      : en.includes(normQ) || viNorm.includes(normQ);

    return match;
  });
}

export function suggest(q, limit = 5) {
  const results = performSearch({ q });
  return results.slice(0, limit).map((x) => x.word);
}
```

### 5.3 `src/views/Search/Results.html` (tích hợp SearchBox)

``` html
<meta name="layout" content="_Layout.html" />

<div id="sb" class="mb-4"></div>
<section>
  <h1>Kết quả cho "{{q}}"</h1>
  <div id="resultZone"></div>
</section>

<script type="module">
  import { loadSharedView } from "/src/utils/viewLoader.js";

  window.initView = async (m) => {
    await loadSharedView("sb", "_SearchBox.html");

    const z = document.getElementById("resultZone");
    if (!m.items?.length) {
      z.innerHTML = `<p>Không có kết quả.</p>`;
      return;
    }
    z.innerHTML = m.items.map((x) => `<div>${x.word} – ${x.meaning_vi}</div>`).join("");
  };
</script>
```

------------------------------------------------------------------------

## 6. Change Log / Version History

  -------------------------------------------------------------------------
    Version Ngày         Thay đổi
  --------- ------------ --------------------------------------------------
        1.0 2025-09-05   Tạo SearchBox partial, gợi ý, tích hợp vào Search

  -------------------------------------------------------------------------
