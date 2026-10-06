import { C, slider, text, type Factory } from './base';

/** Lượng đổi – Chất đổi: kéo nhiệt độ ấm nước từ 20 °C; tới 100 °C nước sôi, hiện "điểm nút" và "bước nhảy". */
const create: Factory = (s) => {
  let temp = 20, boil = 0, t = 0;
  let stopBoil: (() => void) | null = null;
  const bubbles: { x: number; y: number; r: number }[] = [];
  const { wrap } = slider('Nhiệt độ', 20, 100, 20, (v) => {
    temp = v;
    s.say(v >= 100 ? 'Điểm nút 100 °C: nước sôi, hóa hơi — bước nhảy sang chất mới.' : `${v} °C — lượng đổi, nước vẫn là nước (trong "độ").`);
  });
  s.controls.append(wrap);
  s.say('20 °C');
  return {
    update(dt) {
      t += dt;
      boil += ((temp >= 100 ? 1 : 0) - boil) * Math.min(1, dt * 3);
      if (temp >= 100 && !stopBoil) stopBoil = s.loop('boil');
      if (temp < 100 && stopBoil) (stopBoil(), (stopBoil = null));
      const rate = temp >= 100 ? 40 : temp > 80 ? (temp - 80) / 2 : 0;
      if (Math.random() < rate * dt) bubbles.push({ x: 140 + Math.random() * 120, y: 200, r: 2 + Math.random() * 4 });
      for (const b of bubbles) b.y -= dt * (40 + boil * 60);
      while (bubbles.length && bubbles[0].y < 110) bubbles.shift();
    },
    draw() {
      const { ctx } = s;
      // Ấm (thân + nước), màu nước ấm dần theo nhiệt độ
      ctx.fillStyle = '#9aa3a8';
      ctx.fillRect(120, 90, 160, 126);
      const k = (temp - 20) / 80;
      ctx.fillStyle = `rgb(${50 + k * 70}, ${120 + k * 50}, ${205 + k * 30})`;
      ctx.fillRect(126, 110, 148, 104);
      // Ngọn lửa bếp to dần theo nhiệt độ
      for (let i = 0; i < 5; i++) {
        const fh = (6 + k * 18) * (0.8 + 0.3 * Math.sin(t * 12 + i * 2));
        ctx.fillStyle = i % 2 ? '#ffb347' : '#ff7a3d';
        ctx.beginPath();
        ctx.moveTo(140 + i * 30, 230);
        ctx.lineTo(150 + i * 30, 230 - fh);
        ctx.lineTo(160 + i * 30, 230);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Hơi nước
      if (boil > 0.05) {
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * boil})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let y = 0; y < 60; y += 4) ctx.lineTo(170 + i * 30 + Math.sin(y / 8 + t * 4 + i) * 6, 84 - y);
          ctx.stroke();
        }
      }
      // Nhiệt kế
      ctx.fillStyle = '#3a352c';
      ctx.fillRect(330, 40, 14, 170);
      ctx.fillStyle = C.danger;
      ctx.fillRect(330, 210 - k * 170, 14, k * 170);
      text(ctx, `${temp} °C`, 337, 226, { size: 13 });
      text(ctx, 'độ', 375, 140, { size: 12, color: C.muted, align: 'left' });
      if (temp >= 100) {
        text(ctx, '← điểm nút', 352, 40, { size: 12, color: C.accent, align: 'left' });
        text(ctx, 'bước nhảy: nước → hơi', 200, 20, { size: 13, color: C.accent });
      }
    },
    done: () => temp >= 100,
    hold: 3000, // xem nước sôi, hơi bốc lên
    dispose: () => stopBoil?.(),
  };
};
export default create;
