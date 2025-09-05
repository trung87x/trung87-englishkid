// Load partials dưới dạng chuỗi (raw) — không fetch
const PARTIALS = import.meta.glob("/src/views/Shared/*.html", {
  as: "raw",
  eager: true,
});

export async function loadSharedView(elementId, viewName) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const key = `/src/views/Shared/${viewName}`;
  const html = PARTIALS[key];
  if (!html) {
    console.warn("[loadSharedView] not found:", key);
    return;
  }

  el.innerHTML = html;

  // Re-exec <script> bên trong partial
  const scripts = Array.from(el.querySelectorAll("script"));
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
}
