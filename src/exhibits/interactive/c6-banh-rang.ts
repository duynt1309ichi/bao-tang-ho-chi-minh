import { button, C, text, type Factory } from './base';

/** Đã thấy đủ hai trạng thái khi máy đang quay: khớp (máy chạy) và lệch (máy kẹt). Hàm thuần. */
export const seenBoth = (seen: { run: boolean; jam: boolean }) => seen.run && seen.jam;

/** Bánh răng LLSX – QHSX: xoay bánh LLSX, chuyển QHSX giữa "khớp" và "lệch". */
const create: Factory = (s) => {
  let spinning = false, fit = true, a = 0, shake = 0;
  let stopGear: (() => void) | null = null;
  const seen = { run: false, jam: false };
  const sync = () => {
    stopGear?.();
    stopGear = null;
    if (!spinning) return s.say('Bấm "Xoay" để lực lượng sản xuất chạy.');
    if (fit) {
      seen.run = true;
      stopGear = s.loop('gear');
      s.say('Khớp: quan hệ sản xuất phù hợp → cỗ máy chạy.');
    } else {
      seen.jam = true;
      s.sfx('jam');
      s.say('Lệch: quan hệ sản xuất thành "xiềng xích" kìm hãm lực lượng sản xuất.');
    }
  };
  const spin = button('Xoay bánh răng LLSX', () => {
    spinning = !spinning;
    spin.textContent = spinning ? 'Dừng' : 'Xoay bánh răng LLSX';
    sync();
  });
  const mode = button('QHSX: khớp', () => {
    fit = !fit;
    mode.textContent = `QHSX: ${fit ? 'khớp' : 'lệch'}`;
    sync();
  });
  s.controls.append(spin, mode);
  sync();

  const gear = (x: number, y: number, r: number, teeth: number, rot: number, color: string, label: string) => {
    const { ctx } = s;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const rr = i % 2 ? r : r + 10;
      const t0 = (i / (teeth * 2)) * Math.PI * 2, t1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
      ctx.lineTo(Math.cos(t0) * rr, Math.sin(t0) * rr);
      ctx.lineTo(Math.cos(t1) * rr, Math.sin(t1) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.bg;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    text(s.ctx, label, x, y + r + 24, { size: 12, color: C.muted });
  };

  return {
    update(dt) {
      shake = spinning && !fit ? shake + dt : 0;
      if (spinning) a += dt * (fit ? 1.6 : 0.15 * Math.sin(shake * 40));
    },
    draw() {
      const jam = spinning && !fit;
      const dy = fit ? 0 : 18; // lệch trục
      gear(150, 110, 60, 12, a, C.accent, 'Lực lượng sản xuất');
      gear(290 + (jam ? Math.sin(shake * 50) * 2 : 0), 110 + dy, 60, 12, -a + Math.PI / 12, fit ? C.c : C.danger, 'Quan hệ sản xuất');
      if (seen.run) text(s.ctx, '✓ máy chạy', 60, 20, { size: 12, color: C.success });
      if (seen.jam) text(s.ctx, '✓ máy kẹt', 380, 20, { size: 12, color: C.danger });
    },
    done: () => seenBoth(seen),
    hold: 2000,
    dispose: () => stopGear?.(),
  };
};
export default create;
