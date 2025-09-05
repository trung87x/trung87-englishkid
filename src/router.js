import HomeController from "./controllers/HomeController.js";
import SearchController from "./controllers/SearchController.js";

const routes = [
  { path: /^#\/?$/, controller: HomeController, action: "index" },
  { path: /^#\/about$/, controller: HomeController, action: "about" },
  { path: /^#\/contact$/, controller: HomeController, action: "contact" },
  {
    path: /^#\/search(?:\?.*)?$/,
    controller: SearchController,
    action: "index",
  },
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
