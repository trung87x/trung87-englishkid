# feature-search.md

> Mục tiêu: **tạo trang Search** gồm **SearchController** và **view hiển
> thị kết quả**. Không bàn tối ưu. Làm rõ **data nào**, **service nào
> lấy data**, **controller**, và **route**.

---

## 1. SRS -- Feature Requirement Specification

### 1.1 Mục đích

Hiển thị kết quả tìm kiếm khi người dùng điều hướng tới
`#/search?q=...`.

### 1.2 Phạm vi

- Chỉ gồm: **SearchController** + **Search/Results.html** để **nhập
  (đã có SearchBox partial)** và **hiển thị kết quả**.
- Service **chỉ đọc data từ DB** (do `data/load.js` cung cấp). Không
  tối ưu hoá.

### 1.3 Functional Requirements

- **FR-1**: Nhận query từ URL (`q`).
- **FR-2**: Gọi `SearchService.performSearch({ q })` để lấy danh sách.
- **FR-3**: Render danh sách kết quả lên view.

### 1.4 Non-functional Requirements

- Code đơn giản, dễ thay thế.

---

## 2. Use Case / User Flow

- User gõ từ trong **SearchBox** (partial) → nhấn Enter → điều hướng
  tới `#/search?q=...`.
- Router gọi **SearchController.index** với param `q` → gọi
  **SearchService** → render **Search/Results.html**.

---

## 3. Software Design Document (SDD)

### 3.1 Cấu trúc thư mục liên quan

    src/
    ├─ controllers/
    │  └─ SearchController.js
    ├─ services/
    │  └─ SearchService.js     # dùng DB từ data/load.js
    ├─ data/
    │  ├─ load.js              # load JSON, build DB
    │  └─ high.json            # sample data
    └─ views/
       └─ Search/
          └─ Results.html      # view hiển thị kết quả

### 3.2 Data source

- **`data/high.json`**: danh sách từ mẫu (đủ để test hiển thị).
- **`data/load.js`**: import JSON và expose `DB.words`.

### 3.3 Service

- **`services/SearchService.js`**: nhận `{ q }`, đọc `DB.words`, lọc
  đơn giản theo `word` hoặc `meaning_vi`.

### 3.4 Controller

- **`SearchController.index(params)`**: lấy `q`, gọi service, render
  view.

### 3.5 View

- **`views/Search/Results.html`**: meta layout, hiển thị tiêu đề +
  danh sách kết quả.

---

## 4. Test Plan / Test Cases (tối thiểu)

- **TC-1**: `#/search?q=cat` → hiện items chứa "cat".
- **TC-2**: `#/search?q=chân` → hiện items có nghĩa VI chứa "chân".
- **TC-3**: `q` rỗng hoặc không có → view báo "Không có kết quả".

### 4.1 Unit tests (Vitest)

#### `tests/text-utils.test.js`

```js
import { describe, it, expect } from "vitest";
import { normalize, hasDiacritics } from "../utils/text.js";

describe("normalize", () => {
  it("strips VI diacritics & punctuation", () => {
    expect(normalize("chân")).toBe("chan");
    expect(normalize("Apple, Inc.")).toBe("apple inc");
  });
});

describe("hasDiacritics", () => {
  it("detects", () => {
    expect(hasDiacritics("chân")).toBe(true);
    expect(hasDiacritics("chan")).toBe(false);
  });
});
```

#### `tests/search.test.js`

```js
import { describe, it, expect, beforeAll } from "vitest";
import { performSearch } from "..services/SearchService.js";
import { loadData } from "../data/load.js";

beforeAll(async () => {
  await loadData();
});

describe("search", () => {
  it("EN search", () => {
    const r = performSearch({ q: "apple" });
    expect(r.length).greaterThan(0);
  });
  it("VI search with diacritics", () => {
    const r = performSearch({ q: "chân" });
    expect(r.length).greaterThan(0);
  });
  it("VI search without diacritics", () => {
    const r = performSearch({ q: "chan" });
    expect(r.length).greaterThan(0);
  });
});
```

> Ghi chú: đảm bảo `src/data/load.js` export **`loadData()`** và có
> `DB.words`.

---

## 5. Implementation / Source Code Overview

> Lưu ý: code bám đúng mô hình **MVC + renderView** (giống tài liệu
> setup). Không tối ưu, chỉ đủ chạy.

### 5.1 `src/data/high.json` (sample)

```json
[
  {
    "word": "cat",
    "meaning_vi": "con mèo",
    "pos": "noun",
    "topic": "animal",
    "tags": ["basic"]
  },
  {
    "word": "run",
    "meaning_vi": "chạy",
    "pos": "verb",
    "topic": "action",
    "tags": ["basic"]
  },
  {
    "word": "leg",
    "meaning_vi": "chân",
    "pos": "noun",
    "topic": "body",
    "tags": ["basic"]
  }
]
```

### 5.2 `src/data/load.js`

```js
// Đơn giản: import JSON và xuất DB.words
import high from "./high.json";

export const DB = {
  words: Array.isArray(high) ? high : [],
};
```

### 5.3 `src/utils/text.js`

```js
// Chuẩn hoá chuỗi: bỏ dấu tiếng Việt + hạ lowercase + bỏ ký tự đặc biệt
export function normalize(str = "") {
  return (str || "")
    .toLowerCase()
    .normalize("NFD") // tách dấu
    .replace(/\p{Diacritic}+/gu, "") // xoá dấu
    .replace(/[.,!?;:()\[\]{}\/\-]+/g, " ") // xoá dấu câu cơ bản
    .replace(/\s+/g, " ") // gom space
    .trim();
}

// Kiểm tra có dấu tiếng Việt không
export function hasDiacritics(str = "") {
  return /[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(
    str
  );
}
```

### 5.4 `src/services/SearchService.js`

```js
// Service chỉ đọc DB và lọc đơn giản theo từ khoá
import { DB } from "../data/load.js";

export function performSearch({ q = "" } = {}) {
  const kw = (q || "").trim().toLowerCase();
  if (!kw) return [];

  return DB.words.filter((x) => {
    const en = (x.word || "").toLowerCase();
    const vi = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi || "";
    return en.includes(kw) || vi.toLowerCase().includes(kw);
  });
}
```

### 5.5 `src/controllers/SearchController.js`

```js
import BaseController from "./BaseController.js";
import { performSearch } from "../services/SearchService.js";

export default class SearchController extends BaseController {
  async index(params = {}) {
    const q = params.q ?? getQueryFromHash();
    const items = performSearch({ q });
    await this.render("Search/Results.html", {
      title: "Kết quả",
      q: q || "",
      items,
    });
  }
}

// Helper nhỏ: lấy q từ hash nếu router chưa parse
function getQueryFromHash() {
  const hash = window.location.hash || ""; // ví dụ: #/search?q=cat
  const qs = hash.split("?")[1] || "";
  const sp = new URLSearchParams(qs);
  return sp.get("q") || "";
}
```

### 5.6 `src/views/Search/Results.html`

```html
<meta name="layout" content="_Layout.html" />

<section class="px-4 py-4">
  <h1 class="text-2xl font-semibold">Kết quả cho: "{{q}}"</h1>
  <div id="resultZone" class="mt-3"></div>
</section>

<script>
  window.initView = (m) => {
    const z = document.getElementById("resultZone");
    if (!m.q) {
      z.innerHTML = `<p class="text-slate-600">Nhập từ khoá để tìm kiếm.</p>`;
      return;
    }
    if (!m.items || !m.items.length) {
      z.innerHTML = `<p class="text-slate-600">Không có kết quả.</p>`;
      return;
    }
    z.innerHTML = m.items
      .map(
        (x) => `
        <div class="py-2 border-b border-slate-200">
          <div class="font-medium">${x.word}</div>
          <div class="text-sm text-slate-600">${
            Array.isArray(x.meaning_vi)
              ? x.meaning_vi.join(", ")
              : x.meaning_vi || ""
          }</div>
          <div class="text-xs text-slate-500">${x.pos || ""} · ${
          x.topic || ""
        }</div>
        </div>
      `
      )
      .join("");
  };
</script>
```

### 5.7 Bổ sung route `#/search`

- Mở `src/router.js`, thêm route tới `SearchController`:

```js
import SearchController from "./controllers/SearchController.js";

const routes = [
  { path: /^#\/?$/, controller: HomeController, action: "index" },
  { path: /^#\/about$/, controller: HomeController, action: "about" },
  { path: /^#\/contact$/, controller: HomeController, action: "contact" },
  // Cho phép có querystring sau ?
  {
    path: /^#\/search(?:\?.*)?$/,
    controller: SearchController,
    action: "index",
  },
];
```

> Ghi chú: nếu router đã có sẵn cơ chế parse query → truyền `params.q`
> vào `SearchController.index`. Nếu chưa, helper `getQueryFromHash()` ở
> trên sẽ lo phần này.

---

## 6. Change Log / Version History

    Version Ngày         Thay đổi

---

        1.0 2025-09-05   Tạo SearchController + Results view + wiring
