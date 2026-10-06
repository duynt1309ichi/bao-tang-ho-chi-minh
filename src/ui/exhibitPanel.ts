import { audio } from '../audio';
import { formatPages, room, roomNo } from '../content';
import type { Exhibit, ExhibitKind } from '../content/types';
import { mount, transition, type Event, type State } from '../exhibits/interactive/base';
import { INTERACTIVES } from '../exhibits/interactive';
import type { ModelRotator } from '../exhibits/viewer';
import { h, openOverlay } from './dom';

// 🖼 và 🎛 mặc định hiện dạng chữ (ô vuông trên nhiều máy) — ️ ép hiện dạng emoji.
const KIND: Record<ExhibitKind, string> = {
  portrait: '🖼️ Chân dung',
  text: '📜 Pano văn bản',
  model: '🧊 Mô hình',
  interactive: '🎛️ Hiện vật tương tác',
};

/** Nội dung đầy đủ (SCR-07 element 4–8). */
function content(e: Exhibit) {
  const body = h('div', { class: 'exhibit-body' });
  if (e.image) {
    // FR-13 2c: ảnh + nguồn ảnh; ảnh lỗi thì báo MSG-13, bảng vẫn mở và vẫn tính khám phá.
    const img = h('img', { src: e.image.src, alt: e.title, width: '480', height: '640', decoding: 'async' });
    img.addEventListener('error', () => img.replaceWith(h('p', { class: 'muted' }, 'Không tải được hình ảnh.')));
    body.append(h('figure', { class: 'portrait' }, img, h('figcaption', {}, e.image.credit)));
  }
  for (const para of e.body.split('\n\n')) body.append(h('p', {}, para));
  if (e.quote) body.append(h('blockquote', {}, h('p', {}, `“${e.quote.text}”`), h('footer', {}, `— ${e.quote.author}`)));
  if (e.illustrative) body.append(h('span', { class: 'badge' }, '(minh họa)'));
  body.append(h('p', { class: 'source' }, `Giáo trình Triết học Mác – Lênin (2021), tr.${formatPages(e.pages)}`));
  return body;
}

/**
 * SCR-07, và SCR-08 cho hiện vật 🎛 (FR-14). Đóng bằng ✕, ESC hoặc E (FR-13 bước 4).
 * `model`: hiện vật 🧊 — kéo trên khung 3D (ngoài bảng) để xoay, nút "Đặt lại góc" (FR-13 2a, SCR-07 element 9).
 */
export function showExhibitPanel(ui: HTMLElement, e: Exhibit, onClose: () => void, model?: ModelRotator) {
  const r = room(e.room);
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Đóng' }, '✕');
  // Điện thoại: bảng chiếm 60% dưới; bấm tay kéo để mở toàn màn / thu lại (FSD SCR-07).
  const handle = h('button', { class: 'sheet-handle', 'aria-label': 'Mở rộng bảng', 'aria-expanded': 'false' });
  const scroll = h('div', { class: 'panel-scroll', tabindex: '0' });
  const dialog = h(
    'aside',
    { class: 'panel panel-side', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'exhibit-title' },
    handle,
    h('header', { class: 'panel-head' }, h('p', { class: 'kicker' }, KIND[e.kind]), closeBtn),
    h('h2', { id: 'exhibit-title' }, e.title),
    h('p', { class: 'muted' }, `${roomNo(r.id)} · ${r.title}`),
    scroll,
  );

  const expand = (open: boolean) => {
    dialog.classList.toggle('expanded', open);
    handle.setAttribute('aria-expanded', String(open));
  };
  handle.addEventListener('click', () => expand(!dialog.classList.contains('expanded')));

  // 🎛: máy trạng thái Sẵn sàng → Đang thao tác → Hoàn thành; đóng giữa chừng thì lần sau lại từ Sẵn sàng.
  const factory = e.interactive && INTERACTIVES[e.id];
  let state: State = 'ready';
  let unmount: (() => void) | null = null;
  const fire = (ev: Event) => {
    const next = transition(state, ev);
    if (next === state) return;
    state = next;
    if (state === 'done') audio.play('chime');
    render();
  };
  function render() {
    unmount?.();
    unmount = null;
    if (!factory) return scroll.replaceChildren(content(e));
    const skip = h('button', { class: 'link-btn' }, 'Xem giải thích luôn');
    skip.addEventListener('click', () => fire('skip'));
    if (state === 'ready') {
      const start = h('button', { class: 'btn primary' }, 'Bắt đầu');
      start.addEventListener('click', () => fire('start'));
      scroll.replaceChildren(h('p', {}, e.interactive!.hint), h('div', { class: 'actions start' }, start, skip));
      start.focus();
    } else if (state === 'doing') {
      const host = h('div', { class: 'stage-host' });
      scroll.replaceChildren(h('p', { class: 'muted' }, e.interactive!.hint), host, h('div', { class: 'actions start' }, skip));
      unmount = mount(host, factory, () => fire('complete'));
      host.querySelector<HTMLElement>('button, input')?.focus();
    } else {
      const redo = h('button', { class: 'btn' }, 'Làm lại');
      redo.addEventListener('click', () => fire('redo'));
      scroll.replaceChildren(h('p', { class: 'success' }, '✓ Hoàn thành'), content(e), h('div', { class: 'actions' }, redo));
      scroll.scrollTop = 0;
    }
  }
  render();

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    unmount?.();
    model?.reset();
    closeOverlay();
    onClose();
  };
  closeBtn.addEventListener('click', close);
  const closeOverlay = openOverlay(ui, dialog, {
    scrim: false,
    onEsc: close,
    onKey: (ev) => {
      // E đóng bảng — trừ khi đang gõ/kéo điều khiển của hiện vật.
      if (ev.code === 'KeyE' && !ev.repeat && !(ev.target instanceof HTMLInputElement)) close();
    },
  });
  if (model) attachModelTools(dialog.parentElement!, model);
}

/** Lớp phủ của bảng phủ cả khung 3D: kéo trên phần lớp phủ ngoài bảng thì xoay mô hình (chuột và ngón tay). */
function attachModelTools(overlay: HTMLElement, model: ModelRotator) {
  const reset = h('button', { class: 'btn' }, 'Đặt lại góc');
  reset.addEventListener('click', () => model.reset());
  overlay.append(h('div', { class: 'model-tools' }, h('p', {}, '🧊 Kéo để xoay mô hình'), reset));
  overlay.classList.add('model-drag');
  let last: { id: number; x: number; y: number } | null = null;
  overlay.addEventListener('pointerdown', (ev) => {
    if (ev.target !== overlay || last) return;
    last = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
    try {
      overlay.setPointerCapture(ev.pointerId); // kéo ra ngoài cửa sổ vẫn nhận move/up
    } catch {
      /* con trỏ đã nhả */
    }
  });
  overlay.addEventListener('pointermove', (ev) => {
    if (last?.id !== ev.pointerId) return;
    model.rotate(ev.clientX - last.x, ev.clientY - last.y);
    last.x = ev.clientX;
    last.y = ev.clientY;
  });
  const up = (ev: PointerEvent) => {
    if (last?.id === ev.pointerId) last = null;
  };
  overlay.addEventListener('pointerup', up);
  overlay.addEventListener('pointercancel', up);
}
