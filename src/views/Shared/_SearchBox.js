import * as SearchService from "/src/services/SearchService.js";

const input = document.getElementById("q");
const ac = document.getElementById("ac");

function navigate(v) {
  location.hash = `#/search?q=${encodeURIComponent(v)}`;
}

input.addEventListener("input", () => {
  const q = input.value.trim();
  if (!q) {
    ac.innerHTML = "";
    ac.classList.add("hidden");
    return;
  }

  const items = SearchService.suggest(q, 5);
  ac.innerHTML = items
    .map(
      (w) =>
        `<div class="px-3 py-1 hover:bg-slate-100 cursor-pointer">${w}</div>`
    )
    .join("");
  ac.classList.remove("hidden");

  ac.querySelectorAll("div").forEach((el) => {
    el.addEventListener("click", () => navigate(el.textContent));
  });
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") navigate(input.value);
});
