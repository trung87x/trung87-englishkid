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
