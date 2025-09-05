// Đơn giản: import JSON và xuất DB.words
import high from "./high.json";
import med from "./med.json";
import low from "./low.json";

export const DB = {
  words: [
    ...(Array.isArray(high) ? high : []),
    ...(Array.isArray(med) ? med : []),
    ...(Array.isArray(low) ? low : []),
  ],
};

export async function loadData() {
  return DB;
}
