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
