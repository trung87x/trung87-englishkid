// /src/utils/viewRenderer.js
export async function renderView(viewPath, model = {}) {
  console.log(`[ViewRenderer] render view: ${viewPath}`, model);
  // View
  const viewUrl = `/src/views/${viewPath}`;
  const vRes = await fetch(viewUrl, { cache: "no-cache" });
  if (!vRes.ok) throw new Error(`View not found: ${viewPath}`);
  const viewHtml = await vRes.text();

  // Layout (mặc định _Layout.html)
  const layoutName =
    viewHtml.match(
      /<meta\s+name=['"]layout['"]\s+content=['"]([^'"]+)['"]/
    )?.[1] || "_Layout.html";
  const layoutUrl = `/src/views/${layoutName}`;
  const lRes = await fetch(layoutUrl, { cache: "no-cache" });
  if (!lRes.ok) throw new Error(`Layout not found: ${layoutName}`);
  let layoutHtml = await lRes.text();

  // Merge
  const bodyHtml = viewHtml.replace(/<meta[^>]*>/gi, "").trim();
  layoutHtml = layoutHtml.replace(/{{title}}/g, model.title ?? "");
  layoutHtml = layoutHtml.replace(/{{{body}}}/g, bodyHtml);

  // Mount
  document.body.innerHTML = layoutHtml;

  // (Tuỳ chọn) init JS của view nếu có file cùng tên: Views/Results/Results.js -> export init(model)
  try {
    const viewModuleUrl = viewUrl.replace(/\.html$/i, ".js");
    const mod = await import(viewModuleUrl);
    if (typeof mod?.init === "function") await mod.init(model);
  } catch {
    /* không có JS cho view thì thôi */
  }

  // Fallback kiểu cũ
  if (typeof window.initView === "function") {
    const fn = window.initView;
    delete window.initView;
    await fn(model);
  }
  console.log("[ViewRenderer] render DONE");
}
