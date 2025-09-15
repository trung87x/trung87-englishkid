import { DB } from "../data/load.js";
import { normalize, hasDiacritics } from "../utils/text.js";

export function performSearch({ q = "" } = {}) {
  const rawQ = (q || "").trim();
  const normQ = normalize(rawQ);
  const useRaw = hasDiacritics(rawQ);
  if (!rawQ) return [];

  return DB.words.filter((x) => {
    const en = normalize(x.word || "");
    const viRaw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi || "";
    const viNorm = normalize(viRaw);

    const match = useRaw
      ? (x.word || "").toLowerCase().includes(rawQ.toLowerCase()) ||
        viRaw.toLowerCase().includes(rawQ.toLowerCase())
      : en.includes(normQ) || viNorm.includes(normQ);

    return match;
  });
}

export function suggest(q, limit = 5) {
  const results = performSearch({ q });
  return results.slice(0, limit).map((x) => x.word);
}
