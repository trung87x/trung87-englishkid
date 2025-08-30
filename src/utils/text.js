export function normalize(s) {
  return (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD") // tách dấu thanh
    .replace(/[\u0300-\u036f]/g, "") // bỏ toàn bộ dấu
    .replace(/đ/g, "d") // đ -> d
    .replace(/[^a-z0-9\s-]/g, " ") // bỏ ký tự lạ
    .replace(/\s+/g, " ") // gom khoảng trắng
    .trim();
}

// Edit distance <=1 quick check
export function lev1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 9;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return 9;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  if (i < a.length || j < b.length) edits++;
  return edits;
}

export function insertTrie(trie, word) {
  let node = trie;
  for (const ch of word) {
    node[ch] = node[ch] || {};
    node = node[ch];
  }
  node.$ = true;
}

export function trieSuggest(trie, prefix, limit = 8) {
  let node = trie;
  for (const ch of prefix) {
    node = node[ch];
    if (!node) return [];
  }
  const out = [],
    buf = [];
  const dfs = (n) => {
    if (out.length >= limit) return;
    if (n.$) out.push(buf.join(""));
    for (const k of Object.keys(n))
      if (k !== "$") {
        buf.push(k);
        dfs(n[k]);
        buf.pop();
      }
  };
  dfs(node);
  return out.map((s) => prefix + s);
}
