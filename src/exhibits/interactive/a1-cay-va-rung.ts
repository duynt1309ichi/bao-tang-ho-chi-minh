import { rng } from '../../world/random';
import { C, slider, text, type Factory } from './base';

/** Thấy cây mà không thấy rừng: lùi camera từ một cái cây ra cả khu rừng (thanh trượt tới 100 %). */
const create: Factory = (s) => {
  let zoom = 0, shown = 0;
  const r = rng(7);
  // Cây 0 ở giữa; các cây khác rải trong bán kính 10 đơn vị — lúc đầu nằm ngoài khung hình.
  const trees = [{ x: 0, y: 0 }, ...Array.from({ length: 180 }, () => ({ x: (r() - 0.5) * 20, y: (r() - 0.5) * 9 }))].sort((a, b) => a.y - b.y);
  const { wrap } = slider('Lùi camera', 0, 100, 0, (v) => (zoom = v / 100));
  s.controls.append(wrap);
  s.say('Chỉ thấy một cái cây.');
  return {
    update(dt) {
      shown += (zoom - shown) * Math.min(1, dt * 5);
      s.say(zoom >= 1 ? 'Thấy cả khu rừng: xem xét sự vật trong mối liên hệ.' : zoom > 0.4 ? 'Thấy vài cái cây…' : 'Chỉ thấy một cái cây.');
    },
    draw() {
      const { ctx, w, h } = s;
      const k = 220 / (1 + 9 * shown); // px mỗi đơn vị
      for (const t of trees) {
        const x = w / 2 + t.x * k, y = h / 2 + 30 + t.y * k * 0.5, size = 0.5 * k;
        if (x < -size || x > w + size || y < -size || y > h + size) continue;
        ctx.fillStyle = '#5a3c22';
        ctx.fillRect(x - size * 0.06, y, size * 0.12, size * 0.5);
        ctx.fillStyle = t.x === 0 && t.y === 0 ? '#5d9a45' : '#3f6f30';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.1, size * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
      text(ctx, `${Math.round(zoom * 100)} %`, w - 30, 16, { size: 12, color: C.muted });
    },
    done: () => zoom >= 1,
    hold: 1500,
  };
};
export default create;
