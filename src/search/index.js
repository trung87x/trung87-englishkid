import { normalize } from "../utils/text.js";
import { DB } from "../data/load.js";

function hasDiacritics(str) {
  return /[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/i.test(
    str
  );
}

export function search(query) {
  const rawQ = (query || "").trim().toLowerCase();
  const normQ = normalize(rawQ);

  const useRaw = hasDiacritics(rawQ);
  // nếu query có dấu => so khớp raw (chính xác, giữ dấu)
  // nếu không có dấu => so khớp normalize

  return DB.words.filter((x) => {
    const en = normalize(x.word);
    const viRaw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi ?? "";
    const viNorm = normalize(viRaw);
    const viRawLow = viRaw.toLowerCase();

    if (useRaw) {
      // so khớp raw (có dấu)
      return viRawLow.includes(rawQ);
    } else {
      // so khớp không dấu (EN hoặc VI)
      return en.includes(normQ) || viNorm.includes(normQ);
    }
  });
}
