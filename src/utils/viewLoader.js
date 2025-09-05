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
