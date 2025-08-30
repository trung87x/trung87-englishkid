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
