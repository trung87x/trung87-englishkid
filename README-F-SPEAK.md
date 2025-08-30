# PronounceTTS (Web Speech API) — không dùng file .mp3

Triển khai phát âm bằng **Text‑to‑Speech của trình duyệt**. Chỉ 1 luồng phát trong toàn app, có toggle, event delegation. Copy các khối dưới đây vào dự án.

---

## 1) `src/features/pronounce-tts.js`

```js
// src/features/pronounce-tts.js
// Phát âm tiếng Anh bằng Web Speech API. Không dùng file .mp3
// Usage nhanh:
//   import TTS from "./features/pronounce-tts.js";
//   await TTS.ready();
//   TTS.bindClicks(document); // lắng nghe các phần tử có [data-speak]
//   // hoặc: TTS.speak("apple");

const supported =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

function now() {
  return Date.now();
}
function sanitize(word) {
  if (!word) return "";
  // bỏ nội dung trong ngoặc, bỏ dấu câu
  let s = String(word)
    .replace(/\([^)]*\)/g, " ")
    .replace(/["'“”‘’.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}
function isAcronym(s) {
  return /^[A-Z]{2,6}$/.test(s);
}
function spellOut(s) {
  return s.split("").join(" ");
}

// Gợi ý tên voice hay gặp để ưu tiên
const PREFERRED_NAME_REGEX = [
  /google.*english/i, // Chrome
  /microsoft.*(aria|ava|emma).*english/i, // Edge/Windows
  /(samantha|karen|daniel|serena)/i, // Safari/iOS
];

const TTS = (() => {
  let voices = [];
  let current = { utterance: null, word: null, btn: null };
  let clickLockUntil = 0;
  let unlocked = false; // iOS unlock

  const state = {
    accent: localStorage.getItem("ttsAccent") || "en-US",
    voiceURI: localStorage.getItem("ttsVoiceURI") || null,
    rate: parseFloat(localStorage.getItem("ttsRate") || "0.95"),
    pitch: parseFloat(localStorage.getItem("ttsPitch") || "1"),
  };

  function loadVoices() {
    try {
      voices = window.speechSynthesis.getVoices() || [];
    } catch {}
  }

  function pickVoice(accent, voiceURI) {
    if (!supported) return null;
    loadVoices();
    if (voiceURI) {
      const v = voices.find((v) => v.voiceURI === voiceURI);
      if (v) return v;
    }
    // Ưu tiên đúng accent
    const sameAccent = voices.filter((v) =>
      (v.lang || "").toLowerCase().startsWith(accent.toLowerCase())
    );
    for (const rx of PREFERRED_NAME_REGEX) {
      const v = sameAccent.find((v) => rx.test(v.name));
      if (v) return v;
    }
    if (sameAccent[0]) return sameAccent[0];
    // Fallback: bất kỳ en-*
    const anyEN = voices.filter((v) => /^en-/i.test(v.lang || ""));
    return anyEN[0] || null;
  }

  function setSpeaking(btn, on) {
    if (!btn) return;
    btn.classList.toggle("speaking", !!on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function clearOtherSpeaking(except) {
    document.querySelectorAll("[data-speak].speaking").forEach((el) => {
      if (el !== except) setSpeaking(el, false);
    });
  }

  function ensureUnlockedOnce() {
    if (unlocked || !supported) return;
    // Trên iOS/Safari cần phát trong user gesture lần đầu
    try {
      const u = new SpeechSynthesisUtterance(".");
      u.volume = 0; // im lặng
      u.onend = () => {
        unlocked = true;
      };
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function stop() {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setSpeaking(current.btn, false);
    current = { utterance: null, word: null, btn: null };
  }

  function speak(word, opts = {}) {
    if (!supported) {
      console.warn("Text-to-Speech không được hỗ trợ trên trình duyệt này.");
      return;
    }
    const t = now();
    if (t < clickLockUntil) return; // chống spam click
    clickLockUntil = t + 250;

    ensureUnlockedOnce();

    let text = sanitize(word);
    if (!text) return;
    if (isAcronym(text)) text = spellOut(text);

    const accent = opts.accent || state.accent;
    const voice = pickVoice(accent, state.voiceURI);

    // Nếu đang nói đúng từ đó thì toggle dừng
    if (
      current.word &&
      text.toLowerCase() === String(current.word).toLowerCase()
    ) {
      if (window.speechSynthesis.speaking) {
        stop();
        return;
      }
    }

    stop(); // dừng cái cũ nếu có

    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = accent;
    }
    u.rate = state.rate;
    u.pitch = state.pitch;
    u.volume = 1;

    u.onstart = () => {
      current = { utterance: u, word, btn: opts.btn || null };
      if (current.btn) {
        clearOtherSpeaking(current.btn);
        setSpeaking(current.btn, true);
      }
    };
    u.onend = () => {
      setSpeaking(current.btn, false);
      current = { utterance: null, word: null, btn: null };
    };
    u.onerror = () => {
      setSpeaking(current.btn, false);
      current = { utterance: null, word: null, btn: null };
    };

    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
    }
  }

  function bindClicks(root = document) {
    // Lắng nghe mọi click trên phần tử có [data-speak]
    root.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-speak]");
      if (!btn || !root.contains(btn)) return;
      const word = btn.getAttribute("data-speak") || btn.textContent.trim();
      speak(word, { btn });
    });
  }

  function setAccent(accent) {
    state.accent = accent || "en-US";
    localStorage.setItem("ttsAccent", state.accent);
  }
  function setVoiceURI(uri) {
    state.voiceURI = uri || "";
    localStorage.setItem("ttsVoiceURI", state.voiceURI);
  }
  function setRate(v) {
    const num = Math.max(0.5, Math.min(1.2, Number(v) || 1));
    state.rate = num;
    localStorage.setItem("ttsRate", String(num));
  }
  function setPitch(v) {
    const num = Math.max(0.5, Math.min(2.0, Number(v) || 1));
    state.pitch = num;
    localStorage.setItem("ttsPitch", String(num));
  }

  async function ready() {
    if (!supported) return;
    loadVoices();
    if (voices.length) return;
    await new Promise((res) => {
      const handler = () => {
        loadVoices();
        res();
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      // Safari có thể không bắn; set timeout như fallback
      setTimeout(() => {
        loadVoices();
        res();
      }, 800);
    });
  }

  function getVoices() {
    return voices.filter((v) => /^en-/i.test(v.lang || ""));
  }
  function isSpeaking() {
    return supported && window.speechSynthesis.speaking;
  }
  function currentWord() {
    return current.word;
  }

  return {
    // public API
    ready,
    bindClicks,
    speak,
    stop,
    isSpeaking,
    currentWord,
    getVoices,
    setAccent,
    setVoiceURI,
    setRate,
    setPitch,
    // nội bộ cho iOS nếu muốn gọi thủ công
    _ensureUnlockedOnce: ensureUnlockedOnce,
  };
})();

export default TTS;
```

---

## 2) Khởi tạo trong `src/main.js`

```js
// src/main.js (chỉ phần liên quan phát âm)
import TTS from "./features/pronounce-tts.js";

// Đợi danh sách voice sẵn sàng, rồi gắn lắng nghe click
TTS.ready().then(() => {
  // Lắng nghe toàn trang, hoặc truyền container danh sách kết quả nếu muốn
  TTS.bindClicks(document);
});

// (khuyến nghị) mở khóa iOS lần đầu người dùng tương tác
window.addEventListener(
  "click",
  function unlockOnce() {
    if ("_ensureUnlockedOnce" in TTS) TTS._ensureUnlockedOnce();
    window.removeEventListener("click", unlockOnce, { capture: false });
  },
  { once: true }
);
```

---

## 3) Markup ví dụ (ở nơi render mỗi kết quả)

```html
<!-- Ví dụ trong mỗi row từ vựng -->
<div class="item flex items-center gap-2 py-3">
  <span class="word font-medium cursor-pointer" data-speak="apple">apple</span>
  <button
    class="speak-btn text-slate-500 hover:text-slate-800"
    type="button"
    aria-pressed="false"
    title="Phát âm"
    data-speak="apple"
  >
    🔊
  </button>
</div>
```

Bạn có thể đặt `data-speak` ở chính tiêu đề từ (span) **và** ở nút loa để click vào đâu cũng phát.

---

## 4) CSS nhỏ cho trạng thái

```css
/* Có thể bỏ vào src/style.css */
.speak-btn.speaking,
[data-speak].speaking {
  animation: pulse 1s linear infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 5) Gợi ý UI Cài đặt (tùy chọn)

- Accent mặc định: `en-US` hoặc `en-GB` → `TTS.setAccent("en-GB")`.
- Chọn voice cụ thể: lấy từ `TTS.getVoices()` rồi gọi `TTS.setVoiceURI(uri)`.
- Tốc độ/cao độ: `TTS.setRate(0.95)`, `TTS.setPitch(1)`.

---

## 6) Tiêu chí kiểm thử nhanh

1. Click vào `apple` → nghe phát âm, nút bật hiệu ứng `speaking`.
2. Khi đang phát `apple`, click `banana` → `apple` dừng, `banana` phát.
3. Click lại đúng `banana` khi đang phát → dừng.
4. Đổi accent (nếu có UI) → phát lại với giọng mới.
5. Trình duyệt cũ không hỗ trợ Web Speech → không lỗi JS, chỉ cảnh báo console.

```

```
