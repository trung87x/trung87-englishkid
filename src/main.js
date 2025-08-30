import { loadData } from "./data/load.js";
import { pageHome } from "./routes/home.js";
import { pageBrowseTopic } from "./routes/browse-topic.js";
import { pageBrowseAZ } from "./routes/browse-az.js";
import { pageBrowseTags } from "./routes/browse-tags.js";
import { pageResults } from "./routes/results.js";

async function router() {
  const app = document.getElementById("app");
  const [hash, qs] = location.hash.split("?");
  const params = Object.fromEntries(new URLSearchParams(qs || ""));

  if (!window.__db_loaded) {
    try {
      await loadData();
      window.__db_loaded = true;
    } catch (e) {
      app.innerHTML = `<div class='p-6 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'>${e.message}</div>`;
      return;
    }
  }

  app.innerHTML = "";
  switch (hash) {
    case "#/browse/topic":
      app.appendChild(pageBrowseTopic());
      break;
    case "#/browse/a-z":
      app.appendChild(pageBrowseAZ());
      break;
    case "#/browse/tags":
      app.appendChild(pageBrowseTags());
      break;
    case "#/results":
      app.appendChild(pageResults(params));
      break;
    default:
      app.appendChild(pageHome());
  }
}

window.addEventListener("hashchange", router);
router();

// src/main.js (chỉ phần liên quan phát âm)
import TTS from "./features/pronounce-tts.js";

// Đợi danh sách voice sẵn sàng, rồi gắn lắng nghe click
TTS.ready().then(() => {
  // Lắng nghe toàn trang, hoặc truyền container danh sách kết quả nếu muốn
  TTS.bindClicks(document);
});

// (khuyến nghị) mở khóa iOS lần đầu người dùng tương tác
window.addEventListener(
  "click",
  function unlockOnce() {
    if ("_ensureUnlockedOnce" in TTS) TTS._ensureUnlockedOnce();
    window.removeEventListener("click", unlockOnce, { capture: false });
  },
  { once: true }
);
