import { getTemplate, executeScripts } from './viewLoader.js';

export async function renderView(viewPath, model = {}) {
  const viewHtmlRaw = getTemplate(viewPath);
  if (!viewHtmlRaw) throw new Error(`View not found: /src/views/${viewPath}`);

  const layoutName =
    viewHtmlRaw.match(/<meta\s+name=['"]layout['"]\s+content=['"]([^'"]+)['"]/i)?.[1] ||
    '_Layout.html';
  const layoutHtmlRaw = getTemplate(layoutName);
  if (!layoutHtmlRaw) throw new Error(`Layout not found: /src/views/${layoutName}`);

  const viewHtml = viewHtmlRaw.replace(/<meta[^>]*>/i, '').trim();

  // chuẩn bị view và chạy script trong view trước
  document.body.innerHTML = '';
  const viewContainer = document.createElement('div');
  viewContainer.innerHTML = viewHtml;
  document.body.appendChild(viewContainer);
  await executeScripts(viewContainer, model);

  // chuẩn bị layout, chèn view vào và chạy script trong layout
  let layoutHtml = layoutHtmlRaw.replace(/{{title}}/g, model.title ?? '');
  layoutHtml = layoutHtml.replace(/{{{body}}}/g, '<div id="__view_placeholder__"></div>');
  const layoutContainer = document.createElement('div');
  layoutContainer.innerHTML = layoutHtml;
  const placeholder = layoutContainer.querySelector('#__view_placeholder__');
  if (placeholder) {
    while (viewContainer.firstChild) {
      placeholder.appendChild(viewContainer.firstChild);
    }
  }

  document.body.innerHTML = '';
  while (layoutContainer.firstChild) {
    document.body.appendChild(layoutContainer.firstChild);
  }

  await executeScripts(document.body, model);
}
