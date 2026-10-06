import { C, slider, text, type Factory } from './base';

const SPOTS = 5;

/** Tấm gương sáng tạo: dời vật tới ≥ 3 vị trí khác nhau; ảnh trong ý thức đổi theo và được "tô thêm" (sáng tạo). */
const create: Factory = (s) => {
  let pos = 0, shown = 0;
  const visited = new Set([0]);
  const { wrap } = slider('Vị trí của vật', 0, SPOTS - 1, 0, (v) => {
    pos = v;
    if (!visited.has(v)) s.sfx('pop');
    visited.add(v);
    s.say(visited.size >= 3 ? 'Ý thức không chép y nguyên: nó chọn lọc, bổ sung, sáng tạo.' : `Đã thử ${visited.size}/3 vị trí.`);
  });
  s.controls.append(wrap);
  s.say('Kéo thanh để dời vật trước gương.');
  return {
    update(dt) {
      shown += (pos - shown) * Math.min(1, dt * 6);
    },
    draw() {
      const { ctx, w } = s;
      const mx = w / 2;
      ctx.fillStyle = 'rgba(160,200,230,.12)';
      ctx.fillRect(mx + 4, 28, 190, 190);
      ctx.fillStyle = '#2d3a44';
      ctx.fillRect(mx - 4, 28, 8, 190);
      text(ctx, 'Thế giới khách quan', mx / 2, 14, { size: 12, color: C.muted });
      text(ctx, 'Hình ảnh trong ý thức', mx + mx / 2, 14, { size: 12, color: C.muted });
      const x = 50 + shown * 32, y = 80 + (shown % 2) * 40;
      ctx.fillStyle = C.c;
      ctx.beginPath();
      ctx.arc(x, y + 30, 24, 0, Math.PI * 2);
      ctx.fill();
      // Ảnh đối xứng qua gương, thêm vầng sáng theo số vị trí đã thử (tính tích cực, sáng tạo).
      const rx = 2 * mx - x;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(rx, y + 30, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.accent;
      for (let k = 1; k < Math.min(visited.size, 4); k++) {
        ctx.beginPath();
        ctx.arc(rx, y + 30, 24 + k * 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    done: () => visited.size >= 3,
  };
};
export default create;
