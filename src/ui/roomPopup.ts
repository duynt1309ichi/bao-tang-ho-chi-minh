import { exhibitsIn, room, roomNo } from '../content';
import type { RoomId } from '../content/types';
import { h, openOverlay } from './dom';

/**
 * SCR-06 — popup vào phòng (FR-09). `room` là phòng P01…P10 hoặc 'review' (phòng ôn tập, 1b).
 * "Đi vào phòng" → onEnter; "Quay lại" / ESC → onBack (nơi gọi lùi nhân vật 1 m ra hành lang).
 */
export function showRoomPopup(ui: HTMLElement, id: RoomId | 'review', explored: ReadonlySet<string>, onEnter: () => void, onBack: () => void) {
  const enter = h('button', { class: 'btn primary' }, 'Đi vào phòng →');
  const back = h('button', { class: 'btn' }, 'Quay lại');
  const info: HTMLElement[] = [];
  let zone = 'review';
  if (id === 'review') {
    info.push(h('h2', { id: 'room-title' }, 'Phòng ôn tập'), h('p', { class: 'muted' }, 'Mỗi trạm là bài trắc nghiệm của một phòng.'));
  } else {
    const r = room(id);
    const items = exhibitsIn(id);
    zone = r.zone.toLowerCase();
    info.push(
      h('p', { class: 'kicker' }, `${roomNo(id)} · Chương ${r.chapter}`),
      h('h2', { id: 'room-title' }, r.title),
      h('p', { class: 'muted' }, `Giáo trình tr.${r.pages[0]}–${r.pages[1]}`),
      h('p', {}, `Đã khám phá ${items.filter((e) => explored.has(e.id)).length}/${items.length} hiện vật`),
    );
  }
  const dialog = h(
    'section',
    { class: 'panel panel-center room-popup', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'room-title' },
    ...info,
    h('div', { class: 'actions' }, back, enter),
  );
  dialog.style.borderLeftColor = `var(--zone-${zone})`; // vạch màu khu (SCR-06 element 1)
  const close = openOverlay(ui, dialog, { onEsc: () => done(onBack), focus: enter });
  const done = (then: () => void) => {
    close();
    then();
  };
  enter.addEventListener('click', () => done(onEnter));
  back.addEventListener('click', () => done(onBack));
}
