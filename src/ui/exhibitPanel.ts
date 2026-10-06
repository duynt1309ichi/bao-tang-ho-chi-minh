import { audio } from '../audio';
import { formatPages, room, roomNo } from '../content';
import type { Exhibit, ExhibitKind } from '../content/types';
import { mount, transition, type Event, type State } from '../exhibits/interactive/base';
import { INTERACTIVES } from '../exhibits/interactive';
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
  for (const para of e.body.split('\n\n')) body.append(h('p', {}, para));
  if (e.quote) body.append(h('blockquote', {}, h('p', {}, `“${e.quote.text}”`), h('footer', {}, `— ${e.quote.author}`)));
  if (e.illustrative) body.append(h('span', { class: 'badge' }, '(minh họa)'));
  body.append(h('p', { class: 'source' }, `Giáo trình Triết học Mác – Lênin (2021), tr.${formatPages(e.pages)}`));
  return body;
}

/** SCR-07, và SCR-08 cho hiện vật 🎛 (FR-14). Đóng bằng ✕, ESC hoặc E (FR-13 bước 4). */
export function showExhibitPanel(ui: HTMLElement, e: Exhibit, onClose: () => void) {
  const r = room(e.room);
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Đóng' }, '✕');
  const scroll = h('div', { class: 'panel-scroll', tabindex: '0' });
  const dialog = h(
    'aside',
    { class: 'panel panel-side', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'exhibit-title' },
    h('header', { class: 'panel-head' }, h('p', { class: 'kicker' }, KIND[e.kind]), closeBtn),
    h('h2', { id: 'exhibit-title' }, e.title),
    h('p', { class: 'muted' }, `${roomNo(r.id)} · ${r.title}`),
    scroll,
  );

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
}
