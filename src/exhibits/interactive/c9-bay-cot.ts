import { button, C, text, type Factory } from './base';

export const FORMS = ['Chính trị', 'Pháp quyền', 'Đạo đức', 'Thẩm mỹ', 'Tôn giáo', 'Khoa học', 'Triết học'];

/** Bảy hình thái ý thức xã hội: chạm đủ 7 cột. */
const create: Factory = (s) => {
  const lit = new Set<number>();
  FORMS.forEach((f, i) =>
    s.controls.append(
      button(f, () => {
        lit.add(i);
        s.sfx('click');
        s.say(`${f} (${lit.size}/7) — mỗi hình thái phản ánh một mặt của tồn tại xã hội.`);
      }, 'btn stage-chip'),
    ),
  );
  s.say('Chạm từng cột.');
  return {
    update() {},
    draw() {
      const { ctx } = s;
      ctx.fillStyle = '#4a443a';
      ctx.fillRect(20, 40, 400, 14); // mái
      ctx.fillRect(20, 196, 400, 12); // bệ
      text(ctx, 'Ý THỨC XÃ HỘI', 220, 28, { size: 12, color: C.muted });
      text(ctx, 'tồn tại xã hội', 220, 224, { size: 12, color: C.muted });
      FORMS.forEach((f, i) => {
        const x = 40 + i * 56;
        ctx.fillStyle = lit.has(i) ? C.accent : '#e9e3d6';
        ctx.globalAlpha = lit.has(i) ? 1 : 0.35;
        ctx.fillRect(x, 54, 34, 142);
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.translate(x + 17, 125);
        ctx.rotate(-Math.PI / 2);
        text(ctx, f, 0, 0, { size: 12, color: lit.has(i) ? C.bg : C.ink });
        ctx.restore();
      });
    },
    done: () => lit.size === FORMS.length,
  };
};
export default create;
