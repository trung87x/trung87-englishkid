# project-setup-vite-vanilla-mvc.md

> Hướng dẫn khởi tạo dự án **Vite (Vanilla JS)** theo **MVC + Controller-based features**.  
> Bản này tập trung mô tả setup tổng thể + demo controllers/views để test layout/render.  
> Đã bổ sung lệnh khởi tạo dự án và nâng cấp `viewLoader` để script trong partial (\_Header, \_SearchBox.html) chạy đúng.

---

## 1. SRS – Feature Requirement Specification

### 1.1 Mục đích

Xây dựng nền tảng dự án EnglishKid MVC bằng Vite (Vanilla JS), theo mô hình **MVC + Controller-based features** để dễ mở rộng.  
Bản demo giúp kiểm tra router, controller, layout, view render có hoạt động đúng.

### 1.2 Phạm vi

- Khởi tạo và cấu trúc dự án.
- Áp dụng mô hình MVC.
- Router hash-based.
- Demo controllers (HomeController với index/about/contact).
- Layout chung (\_Layout, \_Header, \_Footer).
- Đảm bảo partial có script (vd: \_SearchBox.html) chạy đúng.

### 1.3 Functional Requirements

- **FR-1**: Khởi tạo project với Vite (Vanilla JS).
- **FR-2**: Cấu trúc thư mục MVC.
- **FR-3**: Router hash-based, controller-based features.
- **FR-4**: Layout + header + footer render đúng.
- **FR-5**: Script trong partial (header/searchbox) được kích hoạt.
- **FR-6**: Unit test với Vitest (khi mở rộng).

### 1.4 Non-functional Requirements

- Dễ mở rộng thêm feature.
- Code tổ chức rõ ràng, dễ test/maintain.
- Giao diện view system tách biệt HTML/JS.

---

## 2. Use Case / User Flow

### Actors

- **Developer**: khởi tạo dự án, thêm controllers, views, services, data.
- **Người dùng cuối**: sử dụng app qua router và UI.

### Use Cases

- **UC-1**: Người dùng vào `#/` → Home.
- **UC-2**: Người dùng click About → `#/about`.
- **UC-3**: Người dùng click Contact → `#/contact`.
- **UC-4**: Partial có script (vd: \_SearchBox.html) → script chạy đúng khi render.

---

## 3. Software Design Document (SDD)

### Frontend

- **main.js**: bootstrap app, khởi động router.
- **router.js**: parse hash, gọi controller.
- **views**: HTML partial + `window.initView(model)`.

### Controllers

- **BaseController**: lớp cơ sở render view.
- **HomeController**: có index, about, contact.

### views/Layout

- **\_Layout.html**: layout chung.
- **\_Header.html**: menu Home, About, Contact.
- **\_Footer.html**: footer demo.
- **\_SearchBox.html**: partial có script inline.

---

## 4. Test Plan / Test Cases

- **TC-1**: Truy cập `#/` → hiển thị Home.
- **TC-2**: Truy cập `#/about` → hiển thị About.
- **TC-3**: Truy cập `#/contact` → hiển thị Contact.
- **TC-4**: Menu trong Header dẫn đúng router.
- **TC-5**: Partial `_SearchBox.html` chạy được script.

---

## 5. Implementation / Source Code Overview

### 5.0 Khởi tạo dự án

```bash
# 1) Tạo project Vite (Vanilla)
npm create vite@latest englishkid-mvc-demo -- --template vanilla
cd englishkid-mvc-demo

# 2) Cài dev deps (tuỳ chọn nếu test)
npm i -D vitest jsdom

# 3) Chạy dev
npm run dev
```

**package.json (scripts mẫu):**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

---

### 5.1 Cấu trúc thư mục

```
englishkid-mvc-demo/
├─ index.html
├─ src/
│  ├─ main.js
│  ├─ router.js
│  ├─ controllers/
│  │   ├─ BaseController.js
│  │   └─ HomeController.js
│  ├─ utils/
│  │   ├─ renderView.js
│  │   └─ viewLoader.js
│  └─ views/
│      ├─ _Layout.html
│      ├─ Shared/
│      │   ├─ _Header.html
│      │   ├─ _Footer.html
│      │   └─ _SearchBox.html
│      └─ Home/
│          ├─ Index.html
│          ├─ About.html
│          └─ Contact.html
```

### 5.2 index.html

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EnglishKid MVC Demo</title>
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 5.3 src/main.js

```js
import { startRouter } from "./router.js";

(async function bootstrap() {
  startRouter();
})();
```

### 5.4 src/router.js

```js
import HomeController from "./controllers/HomeController.js";

const routes = [
  { path: /^#\/?$/, controller: HomeController, action: "index" },
  { path: /^#\/about$/, controller: HomeController, action: "about" },
  { path: /^#\/contact$/, controller: HomeController, action: "contact" },
];

function parse() {
  const hash = window.location.hash || "#/";
  for (const r of routes) {
    const m = hash.match(r.path);
    if (m) {
      return { controller: r.controller, action: r.action, params: {} };
    }
  }
  return { controller: HomeController, action: "index", params: {} };
}

export function startRouter() {
  const run = async () => {
    const { controller, action, params } = parse();
    const Ctor = controller;
    const inst = new Ctor();
    await inst[action](params);
  };
  window.addEventListener("hashchange", run);
  run();
}
```

### 5.5 src/controllers/BaseController.js

```js
import { renderView } from "../utils/renderView.js";

export default class BaseController {
  async render(viewPath, model = {}) {
    await renderView(viewPath, model);
  }
}
```

### 5.6 src/controllers/HomeController.js

```js
import BaseController from "./BaseController.js";

export default class HomeController extends BaseController {
  async index() {
    await this.render("Home/Index.html", {
      title: "Trang chủ",
      message: "Đây là trang Home demo.",
    });
  }

  async about() {
    await this.render("Home/About.html", {
      title: "Giới thiệu",
      message: "Đây là trang About demo.",
    });
  }

  async contact() {
    await this.render("Home/Contact.html", {
      title: "Liên hệ",
      message: "Đây là trang Contact demo.",
    });
  }
}
```

### 5.7 src/utils/renderView.js

```js
import { loadSharedView } from "./viewLoader.js";

export async function renderView(viewPath, model = {}) {
  const res = await fetch(`/src/views/${viewPath}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`View not found: ${viewPath}`);
  const viewHtml = await res.text();

  const layoutName =
    viewHtml.match(/<meta\s+name="layout"\s+content="([^"]+)"/)?.[1] ||
    "_Layout.html";

  const layoutRes = await fetch(`/src/views/${layoutName}`, {
    cache: "no-cache",
  });
  if (!layoutRes.ok) throw new Error(`Layout not found: ${layoutName}`);
  let layoutHtml = await layoutRes.text();

  const bodyHtml = viewHtml.replace(/<meta[^>]*>/g, "").trim();
  layoutHtml = layoutHtml.replace(/{{title}}/g, model.title || "");
  layoutHtml = layoutHtml.replace(/{{{body}}}/g, bodyHtml);

  document.body.innerHTML = layoutHtml;

  await loadSharedView("header", "_Header.html");
  await loadSharedView("footer", "_Footer.html");

  if (window.initView) {
    const fn = window.initView;
    delete window.initView;
    await fn(model);
  }
}
```

### 5.8 src/utils/viewLoader.js (nâng cấp để script chạy)

```js
export async function loadSharedView(elementId, viewName) {
  const target = document.getElementById(elementId);
  if (!target) return;

  const res = await fetch(`/src/views/Shared/${viewName}`, {
    cache: "no-cache",
  });
  if (!res.ok) return;

  const html = await res.text();
  target.innerHTML = html;

  // Kích hoạt lại script
  const oldScripts = Array.from(target.querySelectorAll("script"));
  const pending = oldScripts.map((old) => {
    const s = document.createElement("script");
    if (old.type) s.type = old.type;
    if (old.src) {
      return new Promise((resolve, reject) => {
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        s.src = old.src;
        old.replaceWith(s);
      });
    } else {
      s.textContent = old.textContent || "";
      old.replaceWith(s);
      return Promise.resolve();
    }
  });

  await Promise.allSettled(pending);
}
```

### 5.9 Views

#### \_Layout.html

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>{{title}}</title>
  </head>
  <body>
    <header id="header"></header>
    <main id="app">{{{body}}}</main>
    <footer id="footer"></footer>
  </body>
</html>
```

#### \_Header.html

```html
<nav>
  <a href="#/">Home</a> | <a href="#/about">About</a> |
  <a href="#/contact">Contact</a>
</nav>
```

#### \_Footer.html

```html
<footer>
  <small>© 2025 EnglishKid Demo</small>
</footer>
```

#### \_SearchBox.html (ví dụ partial có script)

```html
<div class="relative">
  <input id="q" type="text" placeholder="Tìm EN/VI..." />
  <button id="go">Tìm</button>
</div>

<script type="module">
  const input = document.getElementById("q");
  const go = document.getElementById("go");
  function navigate() {
    const v = encodeURIComponent(input.value || "");
    location.hash = `#/search?q=${v}`;
  }
  go?.addEventListener("click", navigate);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") navigate();
  });
</script>
```

#### Home/Index.html

```html
<meta name="layout" content="_Layout.html" />
<h1 id="title"></h1>
<p id="msg"></p>
<script>
  window.initView = (m) => {
    document.getElementById("title").textContent = m.title ?? "";
    document.getElementById("msg").textContent = m.message ?? "";
  };
</script>
```

#### Home/About.html

```html
<meta name="layout" content="_Layout.html" />
<h1 id="title"></h1>
<p id="msg"></p>
<script>
  window.initView = (m) => {
    document.getElementById("title").textContent = m.title ?? "";
    document.getElementById("msg").textContent = m.message ?? "";
  };
</script>
```

#### Home/Contact.html

```html
<meta name="layout" content="_Layout.html" />
<h1 id="title"></h1>
<p id="msg"></p>
<script>
  window.initView = (m) => {
    document.getElementById("title").textContent = m.title ?? "";
    document.getElementById("msg").textContent = m.message ?? "";
  };
</script>
```

---

## 6. Change Log / Version History

| Version | Ngày | Thay đổi                                                     |
| ------- | ---- | ------------------------------------------------------------ |
| 1.0     | X    | Khởi tạo Vite + MVC cơ bản                                   |
| 1.1     | Y    | Bổ sung BaseController, HomeController (index/about/contact) |
| 1.2     | Z    | Thêm layout + header + footer + views demo                   |
| 1.3     | …    | Nâng cấp viewLoader để script trong partial chạy đúng        |
