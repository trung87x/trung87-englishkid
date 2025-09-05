const TEMPLATES = import.meta.glob('/src/views/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function getTemplate(relPath) {
  const key = relPath.startsWith('/src/views')
    ? relPath
    : `/src/views/${relPath}`;
  return TEMPLATES[key];
}

export async function loadSharedView(elementId, viewName, model = {}) {
  const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
  if (!el) return;
  const html = getTemplate(`Shared/${viewName}`);
  if (!html) {
    console.warn('[loadSharedView] not found:', viewName);
    return;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  await executeScripts(tmp, model);
  el.innerHTML = '';
  while (tmp.firstChild) el.appendChild(tmp.firstChild);
}

export async function executeScripts(root, model = {}) {
  const scripts = Array.from(root.querySelectorAll('script'));
  for (const old of scripts) {
    const s = document.createElement('script');
    for (const { name, value } of old.attributes) s.setAttribute(name, value);
    const isModule = (old.type || '').toLowerCase() === 'module';
    if (old.src || isModule) {
      await new Promise((ok, err) => {
        s.onload = ok;
        s.onerror = err;
        if (old.src) s.src = old.src;
        else s.text = old.textContent || '';
        old.replaceWith(s);
      });
    } else {
      s.text = old.textContent || '';
      old.replaceWith(s);
    }
  }
  if (typeof window.initView === 'function') {
    const fn = window.initView;
    delete window.initView;
    await fn(model);
  }
}
