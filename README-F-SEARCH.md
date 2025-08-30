Ok, mình note lại **theo từng feature** để bạn rà soát nhanh:

# Autocomplete & Search – Feature Notes

### 1) Gợi ý EN + VI (hợp nhất)

- **File:** `src/ui/searchbar.js`
- **Key:** dùng `trieSuggest(INDEX.trieEN)` và `trieSuggest(INDEX.trieVI)` rồi `mergeUnique`.
- **Hiển thị:** EN dùng `INDEX.enDisplay[n]`, VI chuyển **token VI → headword EN** qua `INDEX.vi2words` + `INDEX.byWordFirstVI` (snippet).
- **Chọn mục VI:** thay **toàn bộ** input = headword EN (tránh “con cat”).
  (Trong `choose()`: nếu `data-kind="vi"` → `input.value = val`.)

### 2) Facet autocomplete (`pos:`, `topic:`, `tag:`)

- **File:** `src/ui/searchbar.js`
- **Key:** `facetSuggest()` lọc prefix cho `INDEX.posList/topicList/tagList`.
- **Khi gõ `pos:`...** dropdown chuyển sang danh sách facet tương ứng.

### 3) Highlight nhiều token (giữ dấu)

- **File:** `src/ui/searchbar.js`
- **Key:** `highlightAll(label, qTokens)` → tô **mọi token** bạn gõ (bỏ facet).
- **Áp dụng:** cả `label` lẫn `sub` (snippet nghĩa VI).

### 4) UX bàn phím (↑ / ↓ / Enter / Esc)

- **File:** `src/ui/searchbar.js`
- **Key:**

  - `sel = -1` (không auto chọn dòng đầu).
  - **Enter**: nếu **chưa chọn** mục nào → tìm **nguyên văn**; nếu đã chọn → `choose(sel)`.
  - **Esc**: đóng dropdown.

- _(Tuỳ chọn)_ **Tab** nhận gợi ý đầu: xử lý trong `keydown` (đã hướng dẫn).

### 5) Cache autocomplete theo prefix

- **File:** `src/ui/searchbar.js`
- **Key:** `memo` (Map), `MEMO_TTL = 8000`.
- **Luồng:** trước khi build gợi ý -> đọc cache; sau khi build -> ghi cache.

### 6) Snippet nghĩa VI bối cảnh hoá

- **File:** `src/ui/searchbar.js`
- **Key:** `makeSnippet(vi, nTok)` cắt “…12 ký tự trước/sau…” và thêm dấu `…`.

### 7) Debounce nhập liệu

- **File:** `src/ui/searchbar.js`
- **Key:** `debounce(fn, 150)` giảm reflow/recalc khi gõ nhanh.

### 8) Kết quả tìm (logic backend)

- **File:** `src/search/index.js`
- **Key:** `normalize()` bỏ dấu + `lev1()` fuzzy (sai 1 ký tự) trên **EN**; so khớp cả `word` lẫn `meaning_vi`.
- **Facet filter:** `pos/topic/tag` áp trước khi match text.

### 9) Chỉ mục dữ liệu (cho autocomplete mạnh)

- **File:** `src/data/load.js`
- **Key fields cần có:**

  - `INDEX.trieEN`, `INDEX.trieVI`
  - `INDEX.enDisplay` (giữ hoa/thường), `INDEX.viDisplay` (token VI có dấu – dùng cho build)
  - `INDEX.vi2words` (nToken → \[nWord]), `INDEX.byWordFirstVI` (snippet)
  - `INDEX.posList/topicList/tagList`

---

## Quick QA checklist

- `quả táo` → dropdown có **apple** (sub “…quả táo…”), **Enter** (khi **không** chọn mục) → tìm “quả táo”.
- `con mèo` → không tự đổi thành “con cat” khi Enter; dùng **↓ + Enter** hoặc click mới thay thành “cat”.
- `pos: n` → gợi ý danh sách POS bắt đầu bằng **n…**.
- Gõ rất nhanh → dropdown vẫn mượt (cache + debounce).
- Gõ `ban chan` → ra “bàn chân” (normalize + fuzzy).

Nếu cần mình gom thêm “Recent searches” + “Ranking score” (ưu tiên exact/prefix) thành patch riêng, nói mình nhét vào cùng file luôn nhé.
