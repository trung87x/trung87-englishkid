import { normalize, insertTrie } from "../utils/text.js";

export const DB = { raw: [], words: [], topics: [], tags: [], pos: [] };
export const INDEX = {
  byWord: new Map(),
  trie: {}, // alias EN (giữ nguyên để không phá chỗ khác)
  trieEN: {}, // EN trie thực
  trieVI: {}, // VI trie (token)
  viDisplay: {}, // nToken -> token có dấu để hiển thị
  enDisplay: {}, // nWord  -> bản gốc (hoa/thường đúng)
  byWordFirstVI: {}, // nWord -> câu nghĩa VI đầu tiên (để làm snippet)
  vi2words: {}, // nToken -> Array<nWord> chứa token đó
  posList: [],
  topicList: [],
  tagList: [],
};

export async function loadData() {
  const urls = ["./data/high.json", "./data/med.json", "./data/low.json"];

  let items = [];
  for (const url of urls) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
    const data = await res.json();

    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (data.categories)
      arr = data.categories.flatMap((c) => c.items || []);
    else if (data.items) arr = data.items;

    items = items.concat(arr);
  }

  // Chuẩn hoá DB.raw
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

  // POS, topics, tags
  DB.pos = [...new Set(DB.raw.map((x) => x.pos).filter(Boolean))].sort();
  DB.topics = [...new Set(DB.raw.flatMap((x) => x.topics || []))].sort();
  DB.tags = [...new Set(DB.raw.flatMap((x) => x.tags || []))].sort();

  // Reset INDEX
  INDEX.byWord.clear();
  INDEX.trie = {};
  INDEX.trieEN = INDEX.trie;
  INDEX.trieVI = {};
  INDEX.viDisplay = {};
  INDEX.enDisplay = {};
  INDEX.byWordFirstVI = {};
  INDEX.vi2words = {};
  INDEX.posList = DB.pos;
  INDEX.topicList = DB.topics;
  INDEX.tagList = DB.tags;

  // Build INDEX
  for (const x of DB.raw) {
    // EN
    const nWord = normalize(x.word);
    if (nWord) {
      INDEX.byWord.set(nWord, (INDEX.byWord.get(nWord) || []).concat([x]));
      if (!INDEX.enDisplay[nWord]) INDEX.enDisplay[nWord] = x.word;
      if (!INDEX.byWordFirstVI[nWord]) {
        const viStr = Array.isArray(x.meaning_vi)
          ? x.meaning_vi[0]
          : String(x.meaning_vi);
        INDEX.byWordFirstVI[nWord] = viStr || "";
      }
      insertTrie(INDEX.trieEN, nWord);
    }

    // VI token -> trie + map token->words
    const viRaw = Array.isArray(x.meaning_vi)
      ? x.meaning_vi.join(" ")
      : x.meaning_vi ?? "";
    const tokens = viRaw.match(/[A-Za-zÀ-Ỵà-ỵ0-9]+/g) || [];
    const seen = new Set();
    for (const tok of tokens) {
      const nTok = normalize(tok);
      if (!nTok || nTok.length < 2 || seen.has(nTok)) continue;
      seen.add(nTok);

      if (!INDEX.viDisplay[nTok]) INDEX.viDisplay[nTok] = tok;
      insertTrie(INDEX.trieVI, nTok);

      if (nWord) {
        (INDEX.vi2words[nTok] ||= new Set()).add(nWord);
      }
    }
  }

  // Chuyển Set -> Array cho nhẹ DOM serialize
  for (const k in INDEX.vi2words) {
    INDEX.vi2words[k] = [...INDEX.vi2words[k]];
  }

  DB.words = DB.raw;
}
