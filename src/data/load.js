import { normalize, insertTrie } from "../utils/text.js";

export const DB = { raw: [], words: [], topics: [], tags: [], pos: [] };
export const INDEX = { byWord: new Map(), trie: {} };

export async function loadData() {
  const url = "./data/grade-1-full.json"; // adjust if needed
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  const data = await res.json();

  let items = [];
  if (Array.isArray(data)) items = data;
  else if (data.categories)
    items = data.categories.flatMap((c) => c.items || []);
  else if (data.items) items = data.items;
  else items = [];

  DB.raw = items
    .map((it, idx) => ({
      id: it.id || `w_${idx + 1}`,
      word: it.word || "",
      meaning_vi: it.meaning_vi || it.meaning || "",
      pos: it.pos || "",
      topics: it.topics || it.topic || [],
      tags: it.tags || [],
    }))
    .filter((x) => x.word && x.meaning_vi);

  DB.pos = [...new Set(DB.raw.map((x) => x.pos).filter(Boolean))].sort();
  DB.topics = [...new Set(DB.raw.flatMap((x) => x.topics || []))].sort();
  DB.tags = [...new Set(DB.raw.flatMap((x) => x.tags || []))].sort();

  for (const x of DB.raw) {
    const key = normalize(x.word);
    INDEX.byWord.set(key, (INDEX.byWord.get(key) || []).concat([x]));
    insertTrie(INDEX.trie, key);
  }
  DB.words = DB.raw;
}
