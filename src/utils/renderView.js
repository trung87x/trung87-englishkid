// Load TẤT CẢ file HTML trong /src/views dưới dạng chuỗi (raw), không fetch, không bị Vite tiêm @vite/client
const TPL = import.meta.glob("/src/views/**/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

export async function renderView(viewPath, model = {}) {
  // 1) View HTML
  const viewFull = `/src/views/${viewPath}`;
  const viewHtml = TPL[viewFull];
  if (!viewHtml) throw new Error(`View not found: ${viewFull}`);

  // 2) Layout từ <meta name="layout"> (mặc định _Layout.html)
  const layoutName =
    viewHtml.match(
      /<meta\s+name=["']layout["']\s+content=["']([^"']+)["']/i
    )?.[1] || "_Layout.html";
  const layoutFull = `/src/views/${layoutName}`;
  const layoutHtml = TPL[layoutFull];
  if (!layoutHtml) throw new Error(`Layout not found: ${layoutFull}`);

  // 3) Merge vào {{{body}}} (+ optional {{title}})
  const viewBody = viewHtml.replace(/<meta[^>]*>/i, "").trim();
  let merged = layoutHtml.replace(/{{{body}}}/g, viewBody);
  merged = merged.replace(/{{title}}/g, model.title ?? "");

  // 4) Mount
  document.body.innerHTML = merged;

  // 5) Re-exec <script> (layout + view) để initView được định nghĩa
  delete window.initView;
  const scripts = Array.from(document.body.querySelectorAll("script"));
  await Promise.allSettled(
    scripts.map((old) => {
      const s = document.createElement("script");
      for (const { name, value } of old.attributes) s.setAttribute(name, value);
      if (old.src) {
        return new Promise((ok, err) => {
          s.onload = ok;
          s.onerror = err;
          s.src = old.src;
          old.replaceWith(s);
        });
      } else {
        s.text = old.textContent || "";
        old.replaceWith(s);
        return Promise.resolve();
      }
    })
  );

  // 6) Gọi initView(model) nếu có
  window.__viewData = model;
  if (typeof window.initView === "function") {
    const fn = window.initView;
    delete window.initView;
    await fn(model);
  }
}
