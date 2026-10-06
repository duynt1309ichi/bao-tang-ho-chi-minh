import * as THREE from 'three';
import type { Exhibit, ExhibitKind, Layout, Room } from '../content/types';
import { ZONE_COLORS } from '../ui/tokens';

// Chữ trên pano, biển phòng vẽ bằng Canvas 2D lúc chạy (HLD ADR-06). Màu theo design.md mục 2:
// pano nền #2A2620, chữ #F3EEE4.
const BG = '#2a2620';
const INK = '#f3eee4';
const MUTED = '#b9b2a6';
const ACCENT = '#d9b26a';
const FONT = '"Be Vietnam Pro", system-ui, sans-serif';

/** Ngắt chữ theo từ cho vừa `maxWidth`; quá `maxLines` thì cắt và thêm "…". Hàm thuần (nhận hàm đo). */
export function wrapText(measure: (s: string) => number, text: string, maxWidth: number, maxLines = Infinity): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const out = lines.slice(0, maxLines);
  let last = out[maxLines - 1];
  while (last && measure(`${last}…`) > maxWidth) last = last.slice(0, last.lastIndexOf(' ') > 0 ? last.lastIndexOf(' ') : -1);
  out[maxLines - 1] = `${last}…`;
  return out;
}

const KIND_LABEL: Record<ExhibitKind, string> = { portrait: 'CHÂN DUNG · TRANH', text: 'PANO VĂN BẢN', model: 'MÔ HÌNH', interactive: 'HIỆN VẬT TƯƠNG TÁC' };

function fillLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lh: number) {
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return y + lines.length * lh;
}

/** Atlas 8 × 8 ô 256 px — mỗi hiện vật một ô: loại, tên, phòng; pano văn bản thêm trích dẫn/đoạn đầu. */
export const ATLAS = { cols: 8, cell: 256 };

export function exhibitAtlas(list: Exhibit[], rooms: Room[]) {
  const size = ATLAS.cols * ATLAS.cell;
  const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    list.forEach((e, i) => {
      const c = ATLAS.cell, pad = 18;
      const x0 = (i % ATLAS.cols) * c, y0 = Math.floor(i / ATLAS.cols) * c;
      const zone = rooms.find((r) => r.id === e.room)!.zone;
      ctx.save();
      ctx.translate(x0, y0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, c, c);
      ctx.fillStyle = ZONE_COLORS[zone];
      ctx.fillRect(0, 0, c, 8);
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 14, c - 12, c - 20);
      ctx.fillStyle = MUTED;
      ctx.font = `600 13px ${FONT}`;
      ctx.fillText(`PHÒNG ${e.room.slice(1)} · ${KIND_LABEL[e.kind]}`, pad, 26);
      ctx.fillStyle = INK;
      ctx.font = `700 22px ${FONT}`;
      let y = fillLines(ctx, wrapText((s) => ctx.measureText(s).width, e.title, c - pad * 2, 3), pad, 50, 28) + 8;
      ctx.fillStyle = ACCENT;
      ctx.fillRect(pad, y, 40, 2);
      y += 12;
      if (e.image) {
        // Chân dung có ảnh thật: vẽ ảnh vào phần dưới ô khi tải xong.
        const img = new Image();
        const [top, bottom] = [y0 + y, y0 + c - 16];
        img.onload = () => {
          const hgt = bottom - top, w = (hgt * img.width) / img.height;
          ctx.drawImage(img, x0 + (c - w) / 2, top, w, hgt);
          tex.needsUpdate = true;
        };
        img.src = e.image.src;
        ctx.restore();
        return;
      }
      const excerpt = e.quote ? `“${e.quote.text}”` : e.body.split('\n\n')[0];
      ctx.fillStyle = MUTED;
      ctx.font = `${e.quote ? 'italic ' : ''}400 14px ${FONT}`;
      fillLines(ctx, wrapText((s) => ctx.measureText(s).width, excerpt, c - pad * 2, Math.floor((c - 16 - y) / 19)), pad, y, 19);
      ctx.restore();
    });
    tex.needsUpdate = true;
  };
  whenFonts(draw);
  return tex;
}

/** UV của ô thứ i trong atlas: [u0, v0, u1, v1] (v = 0 ở đáy ảnh theo quy ước three). */
export function atlasRect(i: number): [number, number, number, number] {
  const n = ATLAS.cols;
  const col = i % n, row = Math.floor(i / n);
  return [col / n, 1 - (row + 1) / n, (col + 1) / n, 1 - row / n];
}

/** Biển phòng trên cửa: atlas 2 × 8 ô 512 × 128. Ô i ứng với `entries[i]`. */
export function signAtlas(entries: { kicker: string; title: string; color: string }[]) {
  const W = 512, H = 128;
  const canvas = Object.assign(document.createElement('canvas'), { width: W * 2, height: H * 8 });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  whenFonts(() => {
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    entries.forEach((e, i) => {
      ctx.save();
      ctx.translate((i % 2) * W, Math.floor(i / 2) * H);
      ctx.fillStyle = e.color;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = INK;
      ctx.font = `600 20px ${FONT}`;
      ctx.fillText(e.kicker, 20, 16);
      ctx.font = `700 26px ${FONT}`;
      fillLines(ctx, wrapText((s) => ctx.measureText(s).width, e.title, W - 40, 2), 20, 44, 32);
      ctx.restore();
    });
    tex.needsUpdate = true;
  });
  return tex;
}

/** UV ô thứ i trong atlas biển phòng (2 cột × 8 hàng). Hàm thuần. */
export function signRect(i: number): [number, number, number, number] {
  const col = i % 2, row = Math.floor(i / 2);
  return [col / 2, 1 - (row + 1) / 8, (col + 1) / 2, 1 - row / 8];
}

/** Pano chào ở sảnh (SRS BR-S07, NOI_DUNG.md mục Sảnh). Tỉ lệ 2 : 1. */
export function welcomePanel() {
  const W = 2048, H = 1024;
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  whenFonts(() => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = ACCENT;
    ctx.font = `600 56px ${FONT}`;
    ctx.fillText('BẢO TÀNG TRIẾT HỌC', W / 2, 140);
    ctx.fillStyle = INK;
    ctx.font = `italic 400 84px ${FONT}`;
    const quote = '“mọi triết học chân chính đều là tinh hoa về mặt tinh thần của thời đại mình”';
    const y = fillLines(ctx, wrapText((s) => ctx.measureText(s).width, quote, W - 360), W / 2, 300, 116);
    ctx.fillStyle = MUTED;
    ctx.font = `400 48px ${FONT}`;
    ctx.fillText('— C. Mác', W / 2, y + 40);
  });
  return tex;
}

let fonts: Promise<unknown> | null = null;
/** Vẽ sau khi font tự host tải xong; font lỗi thì vẫn vẽ bằng font dự phòng. */
function whenFonts(draw: () => void) {
  fonts ??= Promise.all(['400', '600', '700', 'italic 400'].map((w) => document.fonts.load(`${w} 20px "Be Vietnam Pro"`, 'Ạ'))).catch(() => {});
  fonts.then(draw);
}

/** Một tấm bảng tối có viền đồng; `draw` vẽ nội dung sau khi font tải xong. */
function panel(W: number, H: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  whenFonts(() => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.textBaseline = 'top';
    draw(ctx);
    tex.needsUpdate = true;
  });
  return tex;
}

/** Sơ đồ bảo tàng ở sảnh (BR-S07): 3 khu theo 3 chương, 10 phòng, phòng ôn tập cuối hành lang. */
export function museumMapPanel(layout: Layout, rooms: Room[]) {
  const W = 1500, H = 900;
  return panel(W, H, (ctx) => {
    ctx.fillStyle = ACCENT;
    ctx.font = `700 48px ${FONT}`;
    ctx.fillText('SƠ ĐỒ BẢO TÀNG', 60, 50);
    const areas = layout.areas.filter((a) => !a.outdoor);
    const minX = Math.min(...areas.map((a) => a.rect[0])), maxX = Math.max(...areas.map((a) => a.rect[0] + a.rect[2]));
    const minZ = Math.min(...areas.map((a) => a.rect[1])), maxZ = Math.max(...areas.map((a) => a.rect[1] + a.rect[3]));
    const s = Math.min((W - 120) / (maxX - minX), (H - 300) / (maxZ - minZ));
    const ox = 60, oz = 140;
    for (const a of areas) {
      const [x, z, w, d] = a.rect;
      const room = rooms.find((r) => r.id === a.id);
      ctx.fillStyle = room ? ZONE_COLORS[room.zone] : a.id === 'review' ? '#3e5c4a' : '#4a443a';
      const px = ox + (x - minX) * s, pz = oz + (z - minZ) * s;
      ctx.fillRect(px + 2, pz + 2, w * s - 4, d * s - 4);
      ctx.fillStyle = INK;
      ctx.font = `700 ${room ? 30 : 24}px ${FONT}`;
      const label = room ? room.id : a.id === 'lobby' ? 'Sảnh' : a.id === 'review' ? 'Ôn tập' : 'Hành lang';
      ctx.fillText(label, px + 12, pz + (a.id === 'hallway' ? (d * s - 24) / 2 : 12));
      if (a.id === 'lobby') {
        ctx.fillStyle = ACCENT;
        ctx.font = `600 22px ${FONT}`;
        ctx.fillText('▲ Bạn đang ở đây', px + 12, pz + d * s - 40);
      }
    }
    const legend: [string, string][] = [
      [ZONE_COLORS.A, 'Khu A · Chương 1 — Khái luận về triết học và triết học Mác – Lênin'],
      [ZONE_COLORS.B, 'Khu B · Chương 2 — Chủ nghĩa duy vật biện chứng'],
      [ZONE_COLORS.C, 'Khu C · Chương 3 — Chủ nghĩa duy vật lịch sử'],
    ];
    ctx.font = `400 26px ${FONT}`;
    legend.forEach(([c, t], i) => {
      const y = H - 150 + i * 38;
      ctx.fillStyle = c;
      ctx.fillRect(60, y, 28, 28);
      ctx.fillStyle = INK;
      ctx.fillText(t, 104, y);
    });
  });
}

/** Bảng "Về giáo trình" (SRS FR-27 a). Dùng chung câu chữ với SCR-14. */
export const ABOUT_BOOK = {
  title: 'Giáo trình Triết học Mác – Lênin',
  lines: ['(Dành cho bậc đại học hệ không chuyên lý luận chính trị)', 'Bộ Giáo dục và Đào tạo', 'Nhà xuất bản Chính trị quốc gia Sự thật, Hà Nội, 2021'],
  note: 'Nội dung trưng bày là bản tóm tắt phục vụ ôn tập; khi học hãy đối chiếu giáo trình.',
};

export function aboutPanel() {
  const W = 1500, H = 1000;
  return panel(W, H, (ctx) => {
    const m = (s: string) => ctx.measureText(s).width;
    ctx.fillStyle = ACCENT;
    ctx.font = `700 48px ${FONT}`;
    ctx.fillText('VỀ GIÁO TRÌNH', 80, 80);
    ctx.fillStyle = INK;
    ctx.font = `700 64px ${FONT}`;
    let y = fillLines(ctx, wrapText(m, ABOUT_BOOK.title, W - 160), 80, 170, 80) + 30;
    ctx.font = `400 40px ${FONT}`;
    ctx.fillStyle = MUTED;
    for (const l of ABOUT_BOOK.lines) y = fillLines(ctx, wrapText(m, l, W - 160), 80, y, 54) + 6;
    ctx.fillStyle = ACCENT;
    ctx.fillRect(80, y + 30, 80, 4);
    ctx.fillStyle = INK;
    ctx.font = `italic 400 40px ${FONT}`;
    fillLines(ctx, wrapText(m, ABOUT_BOOK.note, W - 160), 80, y + 70, 54);
  });
}
