import { C, slider, text, type Factory } from './base';

/** Cán cân Vật chất – Ý thức: nghiêng hết về cả hai phía; mỗi phía mở một nhánh (duy vật / duy tâm). */
const create: Factory = (s) => {
  let target = 0, tilt = 0; // −1 = nghiêng về Vật chất, +1 = về Ý thức
  const seen = { matter: false, mind: false };
  const { wrap } = slider('Vật chất ◀ ▶ Ý thức', -100, 100, 0, (v) => (target = v / 100));
  s.controls.append(wrap);
  s.say('Kéo thanh về hết bên trái, rồi hết bên phải.');
  return {
    update(dt) {
      tilt += (target - tilt) * Math.min(1, dt * 6);
      if (target <= -0.99 && !seen.matter) (seen.matter = true), s.sfx('pop'), s.say('Vật chất có trước, quyết định ý thức → chủ nghĩa duy vật.');
      if (target >= 0.99 && !seen.mind) (seen.mind = true), s.sfx('pop'), s.say('Ý thức có trước, quyết định vật chất → chủ nghĩa duy tâm.');
    },
    draw() {
      const { ctx, w } = s;
      const cx = w / 2, cy = 80, arm = 130, ang = -tilt * 0.3; // phía được chọn nặng hơn → hạ xuống
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, 200);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 40, 205);
      ctx.lineTo(cx + 40, 205);
      ctx.stroke();
      const dx = Math.cos(ang) * arm, dy = Math.sin(ang) * arm;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - dx, cy + dy);
      ctx.lineTo(cx + dx, cy - dy);
      ctx.stroke();
      // Đĩa cân: trái = Vật chất (thấp xuống khi nghiêng trái), phải = Ý thức.
      const pan = (x: number, y: number, label: string, color: string, lit: boolean) => {
        ctx.strokeStyle = C.muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 34, y + 50);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 34, y + 50);
        ctx.stroke();
        ctx.fillStyle = lit ? color : '#3a352c';
        ctx.fillRect(x - 46, y + 50, 92, 10);
        text(ctx, label, x, y + 76, { color: lit ? C.ink : C.muted });
      };
      pan(cx - dx, cy + dy, 'Vật chất', C.b, tilt < -0.5);
      pan(cx + dx, cy - dy, 'Ý thức', C.a, tilt > 0.5);
      if (seen.matter) text(ctx, '✓ Duy vật', 70, 230, { color: C.success, size: 13 });
      if (seen.mind) text(ctx, '✓ Duy tâm', w - 70, 230, { color: C.success, size: 13 });
    },
    done: () => seen.matter && seen.mind,
  };
};
export default create;
