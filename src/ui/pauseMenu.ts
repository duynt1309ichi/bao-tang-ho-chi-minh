import { QUALITIES, QUALITY_LABEL, type Quality } from '../core/quality';
import { h, openOverlay } from './dom';

/**
 * SCR-12 menu tạm dừng (FSD) — bản M3 có Tiếp tục, Cài đặt, Về sảnh.
 * Hướng dẫn, Nguồn & giấy phép, Xóa tiến độ thêm cùng các màn đó (M4/M5).
 */
export function showPauseMenu(ui: HTMLElement, opts: { quality: () => Quality; setQuality: (q: Quality) => void; toLobby: () => void; onClose: () => void }) {
  const resume = h('button', { class: 'btn primary' }, 'Tiếp tục');
  const settings = h('button', { class: 'btn' }, 'Cài đặt');
  const lobby = h('button', { class: 'btn' }, 'Về sảnh');
  const dialog = h(
    'section',
    { class: 'panel panel-center menu', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pause-title' },
    h('h2', { id: 'pause-title' }, 'Tạm dừng'),
    resume, settings, lobby,
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(opts.onClose), focus: resume });
  const done = (then: () => void) => {
    close();
    then();
  };
  resume.addEventListener('click', () => done(opts.onClose));
  lobby.addEventListener('click', () => done(() => (opts.toLobby(), opts.onClose())));
  settings.addEventListener('click', () => {
    dialog.hidden = true;
    showSettings(ui, opts, () => {
      dialog.hidden = false;
      settings.focus();
    });
  });
}

/** SCR-13 — bản M3 chỉ có chất lượng đồ họa; độ nhạy, âm lượng, nhân vật thêm ở M4. */
function showSettings(ui: HTMLElement, opts: { quality: () => Quality; setQuality: (q: Quality) => void }, onBack: () => void) {
  const back = h('button', { class: 'btn' }, '← Quay lại');
  const group = h('div', { class: 'segmented', role: 'radiogroup', 'aria-labelledby': 'q-label' });
  for (const q of QUALITIES) {
    const input = h('input', { type: 'radio', name: 'quality', value: q });
    input.checked = opts.quality() === q;
    input.addEventListener('change', () => opts.setQuality(q));
    group.append(h('label', {}, input, h('span', {}, QUALITY_LABEL[q])));
  }
  const dialog = h(
    'section',
    { class: 'panel panel-center', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'settings-title' },
    h('h2', { id: 'settings-title' }, 'Cài đặt'),
    h('div', { class: 'setting' }, h('span', { id: 'q-label' }, 'Chất lượng đồ họa'), group),
    h('div', { class: 'actions' }, back),
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(), scrim: false, focus: group.querySelector<HTMLInputElement>('input:checked') ?? back });
  const done = () => {
    close();
    onBack();
  };
  back.addEventListener('click', done);
}
