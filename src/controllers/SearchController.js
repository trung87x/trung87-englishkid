import BaseController from "./BaseController.js";
import { performSearch } from "../services/SearchService.js";

export default class SearchController extends BaseController {
  async index(params = {}) {
    const q = params.q ?? getQueryFromHash();
    const items = performSearch({ q });
    console.log(`[Search] Tìm "${q}", có ${items.length} kết quả`);
    await this.render("Search/Results.html", {
      title: "Kết quả",
      q: q || "",
      items,
    });
  }
}

// Helper nhỏ: lấy q từ hash nếu router chưa parse
function getQueryFromHash() {
  const hash = window.location.hash || ""; // ví dụ: #/search?q=cat
  const qs = hash.split("?")[1] || "";
  const sp = new URLSearchParams(qs);
  return sp.get("q") || "";
}
