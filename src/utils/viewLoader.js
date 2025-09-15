export async function loadSharedView(elementId, viewName) {
  const target = document.getElementById(elementId);
  if (!target) return;

  const url = `/src/views/Shared/${viewName}`;
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) return;

  target.innerHTML = await res.text();

  // Re-exec <script> bên trong shared view (ưu tiên dùng src module)
  const scripts = Array.from(target.querySelectorAll("script"));
  await Promise.allSettled(
    scripts.map((old) => {
      const s = document.createElement("script");
      if (old.type) s.type = old.type; // giữ type="module" nếu có
      if (old.src) {
        return new Promise((ok, err) => {
          s.onload = ok;
          s.onerror = err;
          s.src = old.src;
          old.replaceWith(s);
        });
      } else {
        // Khuyên: hạn chế inline; nhưng vẫn hỗ trợ nếu có
        s.textContent = old.textContent || "";
        old.replaceWith(s);
        return Promise.resolve();
      }
    })
  );
}
