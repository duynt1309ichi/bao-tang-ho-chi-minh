import { CHARACTER_LABEL, type CharacterId } from '../player/character';
import { h, openOverlay } from './dom';

const SLOW_MS = 30_000; // FR-01 2b

/** SCR-01 — màn tải: thanh % theo byte, dòng mạng chậm sau 30 s, lỗi tải có nút "Thử lại" (FR-01). */
export function showLoading(ui: HTMLElement) {
  const bar = h('progress', { max: '100', value: '0', 'aria-label': 'Đang tải bảo tàng' });
  const pct = h('span', { class: 'pct' }, '0%');
  const slow = h('p', { class: 'muted', hidden: '' }, 'Mạng đang chậm, vui lòng chờ thêm…');
  const status = h('div', { class: 'load-status' }, h('div', { class: 'load-bar' }, bar, pct), slow);
  const el = h('section', { class: 'screen', 'aria-live': 'polite' }, h('h1', {}, 'Bảo tàng Triết học'), status);
  ui.append(el);
  const timer = setTimeout(() => (slow.hidden = false), SLOW_MS);
  return {
    progress(f: number) {
      const p = Math.floor(f * 100);
      bar.value = p;
      pct.textContent = `${p}%`;
    },
    /** Hiện MSG-02; resolve khi người dùng bấm "Thử lại". */
    error() {
      return new Promise<void>((resolve) => {
        const retry = h('button', { class: 'btn primary' }, 'Thử lại');
        const box = h('div', { class: 'load-status', role: 'alert' }, h('p', {}, 'Không tải được dữ liệu bảo tàng. Kiểm tra kết nối mạng rồi bấm Thử lại.'), retry);
        status.replaceWith(box);
        retry.focus();
        retry.addEventListener('click', () => (box.replaceWith(status), resolve()));
      });
    },
    /** Mờ dần 220 ms rồi gỡ (FSD SCR-01). */
    done() {
      clearTimeout(timer);
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 220);
    },
  };
}

/** Màn chỉ có thông báo, không có nút (MSG-01). */
export function showMessageScreen(ui: HTMLElement, title: string, text: string) {
  ui.replaceChildren(h('section', { class: 'screen', role: 'alert' }, h('h1', {}, title), h('p', {}, text)));
}

/** SCR-02 — màn mở đầu (FR-01 bước 4, FR-19). Nền là cảnh khuôn viên, camera bay chậm (do main lo). */
export function showTitle(ui: HTMLElement, o: { returning: boolean; explored: number; total: number }, onStart: () => void) {
  const start = h('button', { class: 'btn primary big' }, o.returning ? 'Tiếp tục tham quan →' : 'Bắt đầu tham quan →');
  const el = h(
    'section',
    { class: 'title-screen', role: 'dialog', 'aria-labelledby': 'title-h' },
    h('p', { class: 'kicker' }, 'BẢO TÀNG SỐ · KHÔNG GIAN 3D'),
    h('h1', { id: 'title-h' }, 'Hành trình Triết học Mác – Lênin'),
    h('p', { class: 'lead' }, 'Bước vào bảo tàng, đi qua 10 phòng theo ba chương của giáo trình và khám phá các khái niệm qua hiện vật tương tác.'),
    start,
    o.explored > 0 && h('p', { class: 'muted' }, `Đã khám phá ${o.explored}/${o.total} hiện vật`),
    h('p', { class: 'small muted' }, 'Nguồn: Giáo trình Triết học Mác – Lênin (2021)'),
  );
  const close = openOverlay(ui, el, { onEsc: () => {}, scrim: false, focus: start });
  start.addEventListener('click', () => (close(), onStart()));
}

/** SCR-03 — chọn nhân vật (FR-02): đổi thẻ là đổi ngay mô hình trong cảnh; ←/→ đổi lựa chọn (radio gốc). */
export function showCharacterSelect(ui: HTMLElement, initial: CharacterId, onPreview: (c: CharacterId) => void, onChoose: (c: CharacterId) => void) {
  let chosen = initial;
  const group = h('div', { class: 'cards', role: 'radiogroup', 'aria-labelledby': 'char-h' });
  for (const c of ['nam', 'nu'] as const) {
    const input = h('input', { type: 'radio', name: 'character', value: c });
    input.checked = c === initial;
    input.addEventListener('change', () => onPreview((chosen = c)));
    group.append(h('label', { class: 'card' }, input, h('span', { class: 'card-icon', 'aria-hidden': 'true' }, c === 'nam' ? '👨' : '👩'), h('span', {}, CHARACTER_LABEL[c])));
  }
  const ok = h('button', { class: 'btn primary' }, 'Chọn');
  const dialog = h('section', { class: 'panel panel-bottom', role: 'dialog', 'aria-labelledby': 'char-h' }, h('h2', { id: 'char-h' }, 'Chọn nhân vật'), group, h('div', { class: 'actions' }, ok));
  const close = openOverlay(ui, dialog, { onEsc: () => {}, scrim: false, focus: group.querySelector<HTMLInputElement>('input:checked')! });
  ok.addEventListener('click', () => (close(), onChoose(chosen)));
}

/** SCR-15 — gợi ý xoay ngang trên điện thoại màn dọc (FR-06, MSG-19); bấm nút thì ẩn tới hết phiên. */
export function createRotateHint(ui: HTMLElement) {
  const keep = h('button', { class: 'btn' }, 'Vẫn chơi màn dọc');
  const el = h('div', { class: 'rotate-hint', role: 'dialog', 'aria-labelledby': 'rotate-msg', hidden: '' }, h('div', { class: 'rotate-icon', 'aria-hidden': 'true' }, '📱'), h('p', { id: 'rotate-msg' }, 'Xoay ngang điện thoại để dễ chơi hơn.'), keep);
  ui.append(el);
  let dismissed = false;
  keep.addEventListener('click', () => {
    dismissed = true;
    el.hidden = true;
  });
  return {
    get visible() {
      return !el.hidden;
    },
    update(portraitTouch: boolean) {
      const show = portraitTouch && !dismissed;
      if (show !== !el.hidden) el.hidden = !show;
    },
  };
}

/** Lớp phủ mất ngữ cảnh WebGL (MSG-04); quá 5 s chưa khôi phục thì có nút "Tải lại trang" (FR-01 *). */
export function watchContextLoss(canvas: HTMLCanvasElement, ui: HTMLElement) {
  const reload = h('button', { class: 'btn primary', hidden: '' }, 'Tải lại trang');
  reload.addEventListener('click', () => location.reload());
  const el = h('div', { class: 'screen', role: 'alert', hidden: '' }, h('p', {}, 'Mất kết nối đồ họa, đang khôi phục…'), reload);
  ui.append(el);
  let timer = 0;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    el.hidden = false;
    timer = window.setTimeout(() => (reload.hidden = false), 5000);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    clearTimeout(timer);
    el.hidden = reload.hidden = true;
  });
}
