import { mountSearchBox } from "../ui/searchbar.js";

export function pageHome() {
  const root = document.createElement("section");
  root.className = "grid gap-6";
  root.innerHTML = `
<div class="text-center py-8">
  <h1 class="text-2xl md:text-3xl font-semibold">Tra cứu từ vựng Grade 1</h1>
  <p class="text-slate-600 dark:text-slate-400 mt-1">
    Duyệt theo Topic, A–Z, Tags, hoặc tìm kiếm nhanh EN/VI.
  </p>
</div>
<div id="sb"></div>
<div class="grid sm:grid-cols-3 gap-4">
  <a
    href="#/browse/topic"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo Topic</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Chủ đề: animals, school, home…
    </p>
  </a>
  <a
    href="#/browse/a-z"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo A–Z</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Danh mục theo chữ cái đầu.
    </p>
  </a>
  <a
    href="#/browse/tags"
    class="group rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-sm transition"
  >
    <div class="text-xl font-medium">Browse theo Tags</div>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Độ khó, ngữ cảnh…
    </p>
  </a>
</div>
`;
  mountSearchBox(root.querySelector("#sb"));
  return root;
}
