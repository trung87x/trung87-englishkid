import { loadSharedView } from "/src/utils/viewLoader.js";

export async function init(m) {
  console.log("[Results] init chạy", m);
  await loadSharedView("sb", "_SearchBox.html");

  const z = document.getElementById("resultZone");
  if (!m.items?.length) {
    z.innerHTML = `<p>Không có kết quả.</p>`;
    return;
  }
  z.innerHTML = m.items
    .map((x) => `<div>${x.word} – ${x.meaning_vi}</div>`)
    .join("");
}
