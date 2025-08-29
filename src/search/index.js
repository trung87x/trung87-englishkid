import { normalize, lev1 } from "../utils/text.js";

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

export function search(query, facets) {
  const cond = parseQuery(query || "");
  const ntext = normalize(cond.text.join(" "));
  const fpos = facets.pos || "",
    ftopic = facets.topic || "",
    ftag = facets.tag || "";
  return DB.words.filter((x) => {
    if (fpos && x.pos !== fpos) return false;
    if (ftopic && !(x.topics || []).includes(ftopic)) return false;
    if (ftag && !(x.tags || []).includes(ftag)) return false;
    if (!ntext) return true;
    const w = normalize(x.word);
    const m = normalize(x.meaning_vi || "");
    if (w.includes(ntext) || m.includes(ntext)) return true;
    return lev1(ntext, w.slice(0, Math.max(ntext.length, 1))) <= 1;
  });
}
