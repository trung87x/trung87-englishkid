// Service chỉ đọc DB và lọc đơn giản theo từ khoá
import { DB } from "../data/load.js";

export function performSearch({ q = "" } = {}) {
  const kw = (q || "").trim().toLowerCase();
  if (!kw) return [];

  return DB.words.filter((x) => {
    const en = (x.word || "").toLowerCase();
    const vi = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi || "";
    return en.includes(kw) || vi.toLowerCase().includes(kw);
  });
}
