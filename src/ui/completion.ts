import { h, openOverlay } from './dom';

/** SCR-11 — màn hoàn thành (FR-18). */
export function showCompletion(ui: HTMLElement, total: number, onReview: () => void, onClose: () => void) {
  const toReview = h('button', { class: 'btn primary' }, 'Tới Phòng ôn tập');
  const keepGoing = h('button', { class: 'btn' }, 'Tiếp tục tham quan');
  const dialog = h(
    'section',
    { class: 'panel panel-center', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'done-title' },
    h('h2', { id: 'done-title' }, 'Hoàn thành chuyến tham quan'),
    h('p', {}, `Bạn đã khám phá ${total} / ${total} hiện vật. Hãy ghé Phòng ôn tập để kiểm tra kiến thức.`),
    h('blockquote', {}, h('p', {}, '“Sự phát triển tự do của mỗi người là điều kiện cho sự phát triển tự do của tất cả mọi người”'), h('footer', {}, '— C. Mác và Ph. Ăngghen, Tuyên ngôn của Đảng Cộng sản')),
    h('div', { class: 'actions' }, keepGoing, toReview),
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(onClose), focus: toReview });
  const done = (then: () => void) => {
    close();
    then();
  };
  toReview.addEventListener('click', () => done(onReview));
  keepGoing.addEventListener('click', () => done(onClose));
}
