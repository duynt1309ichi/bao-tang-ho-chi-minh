import { formatPages, room, roomNo } from '../content';
import type { Exhibit, ExhibitKind } from '../content/types';
import { h, openOverlay } from './dom';

// 🖼 và 🎛 mặc định hiện dạng chữ (ô vuông trên nhiều máy) — ️ ép hiện dạng emoji.
const KIND: Record<ExhibitKind, string> = {
  portrait: '🖼️ Chân dung',
  text: '📜 Pano văn bản',
  model: '🧊 Mô hình',
  interactive: '🎛️ Hiện vật tương tác',
};

/** SCR-07 (và khung SCR-08). Đóng bằng ✕, ESC hoặc E (FR-13 bước 4). */
export function showExhibitPanel(ui: HTMLElement, e: Exhibit, onClose: () => void) {
  const r = room(e.room);
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Đóng' }, '✕');
  const body = h('div', { class: 'panel-scroll', tabindex: '0' });
  for (const para of e.body.split('\n\n')) body.append(h('p', {}, para));
  if (e.quote) {
    body.append(h('blockquote', {}, h('p', {}, `“${e.quote.text}”`), h('footer', {}, `— ${e.quote.author}`)));
  }
  if (e.interactive) {
    // ponytail: phần thao tác 🎛 (FR-14) làm ở M4; tới lúc đó bảng hiện thẳng trạng thái Hoàn thành.
    body.append(h('p', { class: 'note' }, `Thao tác: ${e.interactive.hint} (đang được xây dựng)`));
  }

  const dialog = h(
    'aside',
    { class: 'panel panel-side', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'exhibit-title' },
    h('header', { class: 'panel-head' }, h('p', { class: 'kicker' }, KIND[e.kind]), closeBtn),
    h('h2', { id: 'exhibit-title' }, e.title),
    h('p', { class: 'muted' }, `${roomNo(r.id)} · ${r.title}`),
    e.illustrative ? h('span', { class: 'badge' }, '(minh họa)') : null,
    body,
    h('p', { class: 'source' }, `Giáo trình Triết học Mác – Lênin (2021), tr.${formatPages(e.pages)}`),
  );

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    closeOverlay();
    onClose();
  };
  closeBtn.addEventListener('click', close);
  const closeOverlay = openOverlay(ui, dialog, {
    scrim: false,
    onEsc: close,
    onKey: (ev) => {
      if (ev.code === 'KeyE' && !ev.repeat) close();
    },
  });
}
