import { h, openOverlay } from './dom';

// Nội dung theo SRS FR-03. N (ngày/đêm) và M (bản đồ) có ở M4; nút cảm ứng ở M5.
const DESKTOP: [string, string][] = [
  ['WASD / phím mũi tên', 'đi'],
  ['Shift', 'chạy'],
  ['Chuột', 'xoay camera (bấm vào màn hình để bắt đầu)'],
  ['Cuộn chuột', 'zoom'],
  ['E', 'xem hiện vật'],
  ['V', 'đổi góc nhìn'],
  ['N', 'ngày/đêm'],
  ['M', 'bản đồ'],
  ['ESC', 'tạm dừng'],
];
const TOUCH: [string, string][] = [
  ['Joystick trái', 'đi'],
  ['Kéo nửa phải màn hình', 'xoay camera'],
  ['Nút Xem', 'xem hiện vật'],
  ['Nút ☰', 'tạm dừng'],
];

/** SCR-04 — hướng dẫn điều khiển (FR-03), bản máy tính hoặc cảm ứng. */
export function showTutorial(ui: HTMLElement, isTouch: boolean, onClose: () => void) {
  const ok = h('button', { class: 'btn primary' }, 'Đã hiểu');
  const list = h('dl', { class: 'keys' }, ...(isTouch ? TOUCH : DESKTOP).flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
  const dialog = h(
    'section',
    { class: 'panel panel-center', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tut-title' },
    h('h2', { id: 'tut-title' }, 'Cách tham quan'),
    list,
    h('div', { class: 'actions' }, ok),
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(), focus: ok });
  const done = () => {
    close();
    onClose();
  };
  ok.addEventListener('click', done);
}
