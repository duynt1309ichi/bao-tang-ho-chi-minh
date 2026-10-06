import { roomMarks, rooms } from '../content';
import type { Area, Layout } from '../content/types';
import type { ProgressStore } from '../storage/progress';
import { ZONE_COLORS } from './tokens';
import { h, openOverlay } from './dom';

// FR-10 / SCR-09: bản đồ nhìn từ trên xuống, x sang phải, z xuống dưới. Hướng bắc cố định; mũi tên là hướng nhân vật.

const AREA_FILL = { courtyard: '#3d5230', lobby: '#4a443a', hallway: '#4a443a', review: '#3e5c4a' } as Record<string, string>;
const HINT = '#f0a04b';
const AREA_LABEL: Record<string, string> = { courtyard: 'Khuôn viên', lobby: 'Sảnh', hallway: 'Hành lang', review: 'Ôn tập' };

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number) {
  ctx.font = `600 ${size}px "Be Vietnam Pro", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(243,238,228,.8)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function fill(a: Area) {
  const r = rooms.find((x) => x.id === a.id);
  return r ? ZONE_COLORS[r.zone] : AREA_FILL[a.id] ?? '#4a443a';
}

interface DrawOpts {
  /** Khung nhìn trong thế giới: tâm và nửa cạnh (m). */
  cx: number;
  cz: number;
  half: number;
  player: { x: number; z: number; yaw: number };
  progress: ProgressStore;
  hints: ReadonlySet<string>;
  labels: boolean;
  exhibitPos?: Map<string, [number, number]>;
}

function draw(canvas: HTMLCanvasElement, layout: Layout, o: DrawOpts) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  const s = Math.min(W, H) / (o.half * 2);
  const X = (x: number) => W / 2 + (x - o.cx) * s, Z = (z: number) => H / 2 + (z - o.cz) * s;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(18,20,26,.9)';
  ctx.fillRect(0, 0, W, H);
  const explored = new Set(o.progress.value.explored);
  for (const a of layout.areas) {
    const [x, z, w, d] = a.rect;
    ctx.fillStyle = fill(a);
    ctx.globalAlpha = a.outdoor ? 0.6 : 0.9;
    ctx.fillRect(X(x) + 1, Z(z) + 1, w * s - 2, d * s - 2);
    ctx.globalAlpha = 1;
    const room = rooms.find((r) => r.id === a.id);
    if (!room) {
      if (o.labels && s > 4) text(ctx, AREA_LABEL[a.id] ?? '', X(x + w / 2), Z(z + d / 2), Math.min(14, s * 1.2));
      continue;
    }
    const m = roomMarks(room.id, explored, Boolean(o.progress.value.quiz[room.id]?.mastered), o.hints);
    if (m.hinted) {
      ctx.strokeStyle = HINT;
      ctx.lineWidth = Math.max(2, s * 0.25);
      ctx.strokeRect(X(x) + 2, Z(z) + 2, w * s - 4, d * s - 4);
    }
    const fs = Math.max(9, Math.min(16, s * 1.4));
    ctx.font = `700 ${fs}px "Be Vietnam Pro", system-ui, sans-serif`;
    ctx.fillStyle = '#f3eee4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = `${o.labels ? room.id : ''}${m.done ? ' ✓' : ''}${m.mastered ? ' ★' : ''}${m.hinted ? ' ◎' : ''}`.trim();
    if (label) ctx.fillText(label, X(x + w / 2), Z(z + d / 2));
  }
  // Hiện vật được gợi ý: vòng cam (bản đồ phóng to).
  if (o.exhibitPos) {
    ctx.strokeStyle = HINT;
    ctx.lineWidth = 2;
    for (const id of o.hints) {
      const p = o.exhibitPos.get(id);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(X(p[0]), Z(p[1]), Math.max(5, s * 0.6), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Mũi tên nhân vật: hướng mặt = (sin yaw, cos yaw) trên mặt phẳng xz.
  const px = X(o.player.x), pz = Z(o.player.z), r = Math.max(6, Math.min(W, H) * 0.045);
  ctx.save();
  ctx.translate(px, pz);
  ctx.rotate(Math.atan2(Math.cos(o.player.yaw), Math.sin(o.player.yaw))); // mũi tên vẽ hướng +x màn hình
  ctx.fillStyle = '#d9b26a';
  ctx.strokeStyle = '#1a1712';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(-r * 0.7, r * 0.6);
  ctx.lineTo(-r * 0.35, 0);
  ctx.lineTo(-r * 0.7, -r * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function createMinimap(layout: Layout, progress: ProgressStore, hints: ReadonlySet<string>) {
  const canvas = h('canvas', { class: 'minimap', role: 'button', tabindex: '0', 'aria-label': 'Bản đồ nhỏ — bấm hoặc phím M để phóng to' });
  const exhibitPos = new Map(layout.exhibits.map((e) => [e.id, [e.pos[0], e.pos[2]] as [number, number]]));
  let last = 0;
  return {
    el: canvas,
    /** Vẽ lại tối đa 10 lần/giây (FSD SCR-05 element 8). */
    update(now: number, player: DrawOpts['player']) {
      if (now - last < 100) return;
      last = now;
      const size = canvas.clientWidth * Math.min(devicePixelRatio, 2);
      if (size && canvas.width !== size) canvas.width = canvas.height = size;
      draw(canvas, layout, { cx: player.x, cz: player.z, half: 18, player, progress, hints, labels: true });
    },
    /** SCR-09 — bản đồ phóng to cả bảo tàng; đóng bằng M, ESC, ✕ hoặc bấm ra ngoài. */
    openLarge(player: DrawOpts['player'], onClose: () => void) {
      const big = h('canvas', { class: 'bigmap', 'aria-label': 'Bản đồ bảo tàng' });
      const closeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Đóng bản đồ' }, '✕');
      const legend = h(
        'ul',
        { class: 'legend' },
        h('li', {}, h('i', { class: 'sw-a' }), 'Khu A · Chương 1'),
        h('li', {}, h('i', { class: 'sw-b' }), 'Khu B · Chương 2'),
        h('li', {}, h('i', { class: 'sw-c' }), 'Khu C · Chương 3'),
        h('li', {}, '✓ khám phá đủ hiện vật'),
        h('li', {}, '★ đã nắm vững trắc nghiệm'),
        h('li', { class: 'hint' }, '◎ có hiện vật nên xem lại'),
      );
      const dialog = h('section', { class: 'panel panel-center wide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'map-title' }, h('header', { class: 'panel-head' }, h('h2', { id: 'map-title' }, 'Bản đồ'), closeBtn), big, legend);
      const close = openOverlay(document.querySelector('#ui')!, dialog, {
        onEsc: () => done(),
        onKey: (e) => e.code === 'KeyM' && done(),
        focus: closeBtn,
      });
      const done = () => {
        close();
        onClose();
      };
      closeBtn.addEventListener('click', done);
      dialog.parentElement!.addEventListener('click', (e) => e.target === dialog.parentElement && done());
      requestAnimationFrame(() => {
        const dpr = Math.min(devicePixelRatio, 2);
        big.width = big.clientWidth * dpr;
        big.height = big.clientHeight * dpr;
        const xs = layout.areas.flatMap((a) => [a.rect[0], a.rect[0] + a.rect[2]]);
        const zs = layout.areas.flatMap((a) => [a.rect[1], a.rect[1] + a.rect[3]]);
        const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
        const half = Math.max((x1 - x0) / 2 / (big.width / Math.min(big.width, big.height)), (z1 - z0) / 2 / (big.height / Math.min(big.width, big.height))) * 1.04;
        draw(big, layout, { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, half, player, progress, hints, labels: true, exhibitPos });
      });
    },
  };
}
