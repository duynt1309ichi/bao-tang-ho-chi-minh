import { credits } from '../content/credits';
import { QUALITIES, QUALITY_LABEL, type Quality } from '../core/quality';
import type { Settings } from '../storage/settings';
import { ABOUT_BOOK } from '../world/signs';
import { h, openOverlay } from './dom';
import { showTutorial } from './tutorial';

export interface MenuActions {
  settings: () => Settings;
  setQuality: (q: Quality) => void;
  setSensitivity: (v: number) => void;
  setInvertY: (v: boolean) => void;
  setVolumes: (music: number, sfx: number) => void;
  isTouch: boolean;
  toLobby: () => void;
  /** null khi chưa khám phá đủ 63/63 (ẩn nút "Xem màn hoàn thành"). */
  showCompletion: (() => void) | null;
  resetProgress: () => void;
  onClose: () => void;
}

/** Mở lớp con thay chỗ `parent` (ẩn đi), quay lại thì hiện lại và focus nút đã mở nó. */
function sub(parent: HTMLElement, opener: HTMLElement, open: (back: () => void) => void) {
  parent.hidden = true;
  open(() => {
    parent.hidden = false;
    opener.focus();
  });
}

/** SCR-12 — menu tạm dừng (FSD). */
export function showPauseMenu(ui: HTMLElement, a: MenuActions) {
  const resume = h('button', { class: 'btn primary' }, 'Tiếp tục');
  const settings = h('button', { class: 'btn' }, 'Cài đặt');
  const tutorial = h('button', { class: 'btn' }, 'Hướng dẫn');
  const lobby = h('button', { class: 'btn' }, 'Về sảnh');
  const creditsBtn = h('button', { class: 'btn' }, 'Nguồn & giấy phép');
  const completion = a.showCompletion && h('button', { class: 'btn' }, 'Xem màn hoàn thành');
  const reset = h('button', { class: 'btn danger-btn' }, 'Xóa tiến độ');
  const dialog = h(
    'section',
    { class: 'panel panel-center menu', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pause-title' },
    h('h2', { id: 'pause-title' }, 'Tạm dừng'),
    resume, settings, tutorial, lobby, creditsBtn, completion, reset,
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(a.onClose), focus: resume });
  const done = (then: () => void) => {
    close();
    then();
  };
  resume.addEventListener('click', () => done(a.onClose));
  lobby.addEventListener('click', () => done(() => (a.toLobby(), a.onClose())));
  settings.addEventListener('click', () => sub(dialog, settings, (back) => showSettings(ui, a, back)));
  tutorial.addEventListener('click', () => sub(dialog, tutorial, (back) => showTutorial(ui, a.isTouch, back)));
  creditsBtn.addEventListener('click', () => sub(dialog, creditsBtn, (back) => showCredits(ui, back)));
  completion?.addEventListener('click', () => done(a.showCompletion!));
  reset.addEventListener('click', () =>
    sub(dialog, reset, (back) =>
      confirmDialog(ui, 'Xóa toàn bộ tiến độ khám phá và kết quả trắc nghiệm? Không thể hoàn tác.', 'Xóa', back, () => done(a.resetProgress)),
    ),
  );
}

/** SCR-13 — cài đặt (FR-22). Nhóm chọn nhân vật ẩn vì mới có một nhân vật (FSD SCR-13). */
function showSettings(ui: HTMLElement, a: MenuActions, onBack: () => void) {
  const s = a.settings();
  const back = h('button', { class: 'btn' }, '← Quay lại');
  const group = h('div', { class: 'segmented', role: 'radiogroup', 'aria-labelledby': 'q-label' });
  for (const q of QUALITIES) {
    const input = h('input', { type: 'radio', name: 'quality', value: q });
    input.checked = s.quality === q;
    input.addEventListener('change', () => a.setQuality(q));
    group.append(h('label', {}, input, h('span', {}, QUALITY_LABEL[q])));
  }
  const fmt = (v: number) => v.toFixed(1).replace('.', ',');
  const sens = h('input', { type: 'range', min: '0.1', max: '3', step: '0.1', id: 'sens', value: String(s.sensitivity) });
  const sensOut = h('output', { for: 'sens' }, fmt(s.sensitivity));
  sens.addEventListener('input', () => {
    a.setSensitivity(Number(sens.value));
    sensOut.textContent = fmt(Number(sens.value));
  });
  const vol = (id: string, label: string, value: number, set: (v: number) => void) => {
    const input = h('input', { type: 'range', min: '0', max: '100', step: '5', id, value: String(value) });
    const out = h('output', { for: id }, String(value));
    input.addEventListener('input', () => {
      set(Number(input.value));
      out.textContent = input.value;
    });
    return h('div', { class: 'setting' }, h('label', { for: id }, label), h('span', { class: 'range' }, input, out));
  };
  const music = vol('vol-music', 'Nhạc nền', s.volumeMusic, (v) => a.setVolumes(v, a.settings().volumeSfx));
  const sfx = vol('vol-sfx', 'Hiệu ứng', s.volumeSfx, (v) => a.setVolumes(a.settings().volumeMusic, v));
  const invert = h('input', { type: 'checkbox', id: 'invert', role: 'switch' });
  invert.checked = s.invertY;
  invert.addEventListener('change', () => a.setInvertY(invert.checked));

  const dialog = h(
    'section',
    { class: 'panel panel-center', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'settings-title' },
    h('h2', { id: 'settings-title' }, 'Cài đặt'),
    h('div', { class: 'setting' }, h('span', { id: 'q-label' }, 'Chất lượng đồ họa'), group),
    h('div', { class: 'setting' }, h('label', { for: 'sens' }, 'Độ nhạy camera'), h('span', { class: 'range' }, sens, sensOut)),
    h('div', { class: 'setting' }, h('label', { for: 'invert' }, 'Đảo trục dọc'), invert),
    music,
    sfx,
    h('div', { class: 'actions' }, back),
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(), scrim: false, focus: group.querySelector<HTMLInputElement>('input:checked') ?? back });
  const done = () => {
    close();
    onBack();
  };
  back.addEventListener('click', done);
}

/** SCR-14 — nguồn & giấy phép (FR-27): "Về giáo trình" + bảng CREDITS.md. */
function showCredits(ui: HTMLElement, onBack: () => void) {
  const back = h('button', { class: 'btn' }, '← Quay lại');
  const rows = credits.map((c) => {
    const src = /^https?:\/\//.test(c.source) ? h('a', { href: c.source, target: '_blank', rel: 'noopener noreferrer' }, c.source.replace(/^https?:\/\//, '')) : c.source;
    return h('tr', {}, h('td', {}, c.asset), h('td', {}, c.author), h('td', {}, src), h('td', {}, c.license));
  });
  const dialog = h(
    'section',
    { class: 'panel panel-center wide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'credits-title' },
    h('h2', { id: 'credits-title' }, 'Nguồn & giấy phép'),
    h('h3', {}, 'Về giáo trình'),
    h('p', {}, `${ABOUT_BOOK.title} ${ABOUT_BOOK.lines.join('. ')}.`),
    h('p', { class: 'note' }, ABOUT_BOOK.note),
    h('div', { class: 'table-scroll' },
      h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Tài nguyên'), h('th', {}, 'Tác giả'), h('th', {}, 'Nguồn'), h('th', {}, 'Giấy phép'))), h('tbody', {}, ...rows)),
    ),
    h('div', { class: 'actions' }, back),
  );
  const close = openOverlay(ui, dialog, { onEsc: () => done(), scrim: false, focus: back });
  const done = () => {
    close();
    onBack();
  };
  back.addEventListener('click', done);
}

/** Hộp xác nhận: nút "Hủy" focus mặc định, nút nguy hiểm bên phải. */
function confirmDialog(ui: HTMLElement, text: string, okLabel: string, onCancel: () => void, onOk: () => void) {
  const cancel = h('button', { class: 'btn' }, 'Hủy');
  const ok = h('button', { class: 'btn danger-btn' }, okLabel);
  const dialog = h('section', { class: 'panel panel-center menu', role: 'alertdialog', 'aria-modal': 'true', 'aria-describedby': 'confirm-text' }, h('p', { id: 'confirm-text' }, text), h('div', { class: 'actions' }, cancel, ok));
  const close = openOverlay(ui, dialog, { onEsc: () => (close(), onCancel()), scrim: false, focus: cancel });
  cancel.addEventListener('click', () => (close(), onCancel()));
  ok.addEventListener('click', () => (close(), onOk()));
}
