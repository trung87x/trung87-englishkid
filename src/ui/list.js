// src/ui/list.js
export function renderList(container, items) {
  container.innerHTML = `
    <div id="list" class="space-y-2"></div>
    <div class="text-center mt-4">
      <button id="btnMore" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
        Tải thêm
      </button>
    </div>`;

  const listEl = container.querySelector("#list");
  const btn = container.querySelector("#btnMore");

  let page = 0;
  const SIZE = 50;

  // ===== helpers =====
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

  const playSvg = `
    <svg viewBox="0 0 24 24" class="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M15 10.5a3.5 3.5 0 0 1 0 3"/><path d="M18 9a6 6 0 0 1 0 6"/>
    </svg>`;

  const tagsHtml = (x) => {
    const arr = [];
    if (Array.isArray(x.tags)) arr.push(...x.tags);
    if (Array.isArray(x.topics)) arr.push(...x.topics);
    if (!arr.length) return "";
    return `
      <div class="tags mt-2 hidden flex-wrap justify-end gap-1">
        ${arr
          .slice(0, 3)
          .map(
            (t) =>
              `<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
             ${esc(t)}
           </span>`
          )
          .join("")}
      </div>`;
  };

  function renderChunk() {
    const slice = items.slice(page * SIZE, (page + 1) * SIZE);

    const html = slice
      .map(
        (x) => `
<div class="card group grid grid-cols-[1fr_auto] items-center gap-3
            rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 md:p-5
            hover:shadow-sm active:scale-[.99] transition cursor-pointer
            dark:border-emerald-900/50 dark:bg-emerald-400/5
            focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
     data-speak="${escAttr(x.word || "")}"
     role="button" tabindex="0" aria-expanded="false"
     aria-label="Phát âm ${escAttr(x.word || "")}">
  <!-- Left: EN (to, xanh đậm) + VI (ẩn mặc định) -->
  <div class="min-w-0">
    <div class="word text-2xl md:text-3xl font-extrabold tracking-tight
                text-emerald-800 dark:text-emerald-300 truncate">
      ${esc(x.word || "")}
    </div>
    <div class="vi mt-1 text-lg md:text-xl text-emerald-700 dark:text-emerald-200 hidden">
      ${esc(x.meaning_vi || "")}
    </div>
  </div>

  <!-- Right: Play (to hơn) + tags (ẩn mặc định, nằm dưới) -->
  <div class="flex flex-col items-end">
    <button class="play inline-grid place-items-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-sm
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Play ${escAttr(x.word || "")}">
      ${playSvg}
    </button>
    ${tagsHtml(x)}
  </div>
</div>`
      )
      .join("");

    listEl.insertAdjacentHTML("beforeend", html);

    page++;
    if (page * SIZE >= items.length) btn.classList.add("hidden");
  }

  // ---- Speak ----
  function speak(word) {
    try {
      if (window.TTS && typeof window.TTS.speak === "function") {
        window.TTS.speak(word);
        return;
      }
    } catch {}
    if ("speechSynthesis" in window && word) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }

  // ---- Open/close (chỉ 1 thẻ mở) ----
  let openedCard = null;

  function setExpanded(card, expanded) {
    const vi = card.querySelector(".vi");
    const tags = card.querySelector(".tags");
    if (vi) vi.classList.toggle("hidden", !expanded);
    if (tags) tags.classList.toggle("hidden", !expanded);

    card.classList.toggle("ring-2", expanded);
    card.classList.toggle("ring-emerald-400", expanded);
    card.classList.toggle("bg-emerald-100/80", expanded);

    card.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function toggleCard(card) {
    const isOpen = card.getAttribute("aria-expanded") === "true";
    if (!isOpen) {
      if (openedCard && openedCard !== card) setExpanded(openedCard, false);
      setExpanded(card, true);
      openedCard = card;
    } else {
      setExpanded(card, false);
      openedCard = null;
    }
  }

  // ---- Events ----
  listEl.addEventListener("click", (e) => {
    const card = e.target.closest("[data-speak]");
    if (!card) return;
    toggleCard(card);
    speak(card.dataset.speak);
  });

  // Enter/Space cũng hoạt động
  listEl.addEventListener("keydown", (e) => {
    const card = e.target.closest("[data-speak]");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCard(card);
      speak(card.dataset.speak);
    }
  });

  btn.addEventListener("click", renderChunk);
  renderChunk();
}
