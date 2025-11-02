import { useEffect, useMemo, useState } from "react";
import { loadData, searchLocalRaw } from "./data/load";

/**
 * EnglishKid – Local Dictionary (JSON)
 * - Tìm trong các file JSON: high.json, med.json, low.json
 * - Debounce 400ms, Enter để search
 * - Hiển thị: word, meaning_vi, pos, topics, tags (đúng schema JSON)
 * - Lưu "Favorites" (theo word) vào localStorage
 */

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// --- Chrome TTS ---
function useSpeech() {
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const load = () => {
      const vs = window.speechSynthesis?.getVoices?.() || [];

      // 🔧 CHỈNH Ở ĐÂY: chọn giọng cụ thể bạn muốn
      // F12 → Console tab
      // window.speechSynthesis.getVoices().forEach((v, i) =>
      //   console.log(i, v.name, v.lang)
      // );

      const preferredNames = [
        "Google US English", // fallback
        "Microsoft Zira - English (United States)", // ✅ nữ Mỹ (Windows)
        "Microsoft Aria Online (Natural) - English (United States)", // Edge/Win
        "Samantha", // macOS
        "Daniel", // macOS UK
      ];

      // tìm theo tên cụ thể trước
      const exact = vs.find((v) => preferredNames.includes(v.name));
      // fallback: chọn giọng tiếng Anh (en)
      const en = vs.find((v) => v.lang?.toLowerCase?.().startsWith("en"));

      // ✅ fix: ưu tiên exact trước
      setVoice(exact || en || vs[0] || null);

      // debug: xem đang dùng giọng nào
      if (exact || en) console.log("🎙 Voice:", (exact || en)?.name);
    };

    load();

    // Khi danh sách voice sẵn sàng
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!text || !window.speechSynthesis) return;
    // window.speechSynthesis.cancel(); // dừng phát trước đó (nếu có)
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || "en-US";
    u.rate = 0.9;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  };

  return speak;
}

// Card hiển thị đúng schema JSON
function LocalWordCard({ item, onFavToggle, isFav, isOpen, onOpen }) {
  const { id, word, meaning_vi, pos, topics = [], tags = [] } = item;
  const speak = useSpeech();

  if (!word) return null;

  const handleCardClick = () => {
    if (!isOpen) onOpen(id || word); // mở card mới nếu đang đóng
    speak(word); // luôn phát âm
  };

  const handleFavClick = (e) => {
    e.stopPropagation(); // không kích hoạt click card
    onFavToggle(word);
  };

  return (
    <article
      onClick={handleCardClick}
      className="cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 shadow-sm hover:shadow-md transition"
      aria-expanded={isOpen}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {word}
        </h2>
        <button
          type="button"
          onClick={handleFavClick}
          className={`shrink-0 rounded-xl px-3 py-2 text-sm border transition hover:scale-105 ${
            isFav
              ? "bg-yellow-400/20 text-yellow-800 border-yellow-300 dark:text-yellow-200 dark:border-yellow-700"
              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
          aria-label={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          {isFav ? "★ Favorited" : "☆ Favorite"}
        </button>
      </div>

      {isOpen && meaning_vi && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {meaning_vi}
          </p>
        </div>
      )}
    </article>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [data, setData] = useState([]); // mảng item đúng schema JSON
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useLocalStorage("englishkid:favorites", []);
  const [openId, setOpenId] = useState(null); // ✅ chỉ cho phép 1 card mở

  // Cache toàn bộ DB (nếu bạn muốn dùng cho feature khác sau này)
  const [db, setDb] = useState({ words: [] });

  useEffect(() => {
    (async () => {
      const all = await loadData();
      setDb(all);
    })();
  }, []);

  const debouncedQ = useDebounce(q, 400);

  const isFav = (w) => favorites.includes(w?.toLowerCase?.());
  const toggleFav = (w) => {
    const key = w?.toLowerCase?.();
    setFavorites((prev) => {
      const next = prev.includes(key)
        ? prev.filter((x) => x !== key)
        : [...prev, key];
      return Array.from(new Set(next)).sort();
    });
  };

  // Tìm kiếm local thuần JSON
  useEffect(() => {
    if (!debouncedQ?.trim()) {
      setStatus("idle");
      setData([]);
      setError("");
      return;
    }
    setStatus("loading");
    const results = searchLocalRaw(debouncedQ);
    setData(results);
    setStatus("done");
    setError(results.length ? "" : "No local match");
  }, [debouncedQ]);

  const onSubmit = (e) => {
    e.preventDefault();
    setQ(q.trim());
  };

  const suggestions = useMemo(() => {
    if (!q) return [];
    const k = q.toLowerCase();
    return favorites.filter((w) => w.includes(k)).slice(0, 6);
  }, [favorites, q]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50">
      <div className="mx-auto max-w-md px-4 py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">EnglishKid</h1>
          <a
            className="text-sm underline hover:no-underline opacity-80"
            href="https://github.com/new"
            target="_blank"
            rel="noreferrer"
          >
            Publish to GitHub →
          </a>
        </header>

        {/* Search */}
        <form onSubmit={onSubmit} className="mt-6">
          <label
            className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="q"
          >
            Tra cứu (từ, topic, tag)
          </label>
          <div className="relative">
            <input
              id="q"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. the, function, high…"
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-4 py-3 pe-28 outline-none focus:ring-4 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 active:translate-y-px"
            >
              Search
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Gợi ý:{" "}
              {suggestions.map((s, i) => (
                <button
                  key={s + i}
                  type="button"
                  onClick={() => setQ(s)}
                  className="me-2 underline hover:no-underline"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* States */}
        <section className="mt-8 space-y-4">
          {status === "idle" && (
            <div className="text-gray-600 dark:text-gray-300">
              Nhập từ hoặc topic/tag để tra cứu. Ví dụ:{" "}
              <button className="underline" onClick={() => setQ("the")}>
                the
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="animate-pulse text-gray-600 dark:text-gray-300">
              Đang tìm…
            </div>
          )}

          {status === "done" && data.length === 0 && (
            <div className="text-gray-600 dark:text-gray-300">
              Không có dữ liệu phù hợp.
            </div>
          )}

          {data.map((item) => {
            const key = item.id || item.word;
            const isOpen = key === openId;
            return (
              <LocalWordCard
                key={key}
                item={item}
                isOpen={isOpen}
                onOpen={setOpenId} // click card khác -> set id mới (đóng card cũ)
                onFavToggle={toggleFav} // GIỮ Favorites
                isFav={isFav(item.word)} // GIỮ Favorites
              />
            );
          })}
        </section>

        {/* Favorites */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-3">Favorites</h3>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chưa có từ nào. Hãy đánh dấu ★ để lưu nhanh.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map((w) => (
                <button
                  key={w}
                  onClick={() => setQ(w)}
                  className="rounded-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-14 text-xs text-gray-500 dark:text-gray-400">
          Local JSON Dictionary — no external API.
        </footer>
      </div>
    </div>
  );
}
