import { normalize, lev1 } from "../utils/text.js";
import { DB } from "../data/load.js";

export function parseQuery(q) {
  const tokens = (q || "").trim().split(/\s+/).filter(Boolean);
  const cond = { text: [], pos: [], topic: [], tag: [] };
  for (const t of tokens) {
    if (t.startsWith("pos:")) cond.pos.push(t.slice(4));
    else if (t.startsWith("topic:")) cond.topic.push(t.slice(6));
    else if (t.startsWith("tag:")) cond.tag.push(t.slice(4));
    else cond.text.push(t);
  }
  return cond;
}

export function search(query, facets = {}) {
  const cond = parseQuery(query || "");
  const ntext = normalize(cond.text.join(" "));
  const fpos = facets.pos || "";
  const ftopic = facets.topic || "";
  const ftag = facets.tag || "";

  return DB.words.filter((x) => {
    if (fpos && x.pos !== fpos) return false;
    if (ftopic && !(x.topics || []).includes(ftopic)) return false;
    if (ftag && !(x.tags || []).includes(ftag)) return false;
    if (!ntext) return true;

    const w = normalize(x.word);

    // meaning_vi có thể là string, mảng, hoặc field tên khác (tuỳ dataset)
    const viRaw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi ?? x.vi ?? x.meaning ?? ""; // fallback an toàn

    const m = normalize(viRaw);

    // Khớp trực tiếp EN hoặc VI (đã bỏ dấu)
    if (w.includes(ntext) || m.includes(ntext)) return true;

    // Fuzzy EN: cho phép sai 1 ký tự ở phần đầu
    if (lev1(ntext, w.slice(0, Math.max(ntext.length, 1))) <= 1) return true;

    // Fuzzy VI theo token: mỗi token cho phép sai 1 ký tự hoặc prefix
    const tokens = ntext.split(" ");
    const mTokens = m.split(" ");
    const allTokensOk = tokens.every(
      (t) => t && mTokens.some((mm) => mm.startsWith(t) || lev1(t, mm) <= 1)
    );
    return allTokensOk;
  });
}
