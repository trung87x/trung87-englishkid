// src/data/load.js
import high from "./high.json";
import med from "./med.json";
import low from "./low.json";

// Gộp thành "database" đơn giản theo đúng schema JSON của bạn
export const DB = {
  words: [
    ...(Array.isArray(high) ? high : []),
    ...(Array.isArray(med) ? med : []),
    ...(Array.isArray(low) ? low : []),
  ],
};

// Trả về nguyên DB (item giữ nguyên schema)
export async function loadData() {
  return DB;
}

// Tìm kiếm trên word / topics / tags (giữ nguyên schema khi trả về)
export function searchLocalRaw(keyword) {
  if (!keyword?.trim()) return [];
  const k = keyword.toLowerCase();

  return DB.words.filter((it) => {
    const w = (it.word || "").toLowerCase();
    const topics = (it.topics || []).map((t) => t.toLowerCase());
    const tags = (it.tags || []).map((t) => t.toLowerCase());
    return (
      w.includes(k) ||
      topics.some((t) => t.includes(k)) ||
      tags.some((t) => t.includes(k))
    );
  });
}
