import * as THREE from 'three';
import type { Exhibit, ExhibitKind, Room } from '../content/types';
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
  const rect = (i: number): [number, number, number, number] => {
    const col = i % 2, row = Math.floor(i / 2);
    return [col / 2, 1 - (row + 1) / 8, (col + 1) / 2, 1 - row / 8];
  };
  return { tex, rect };
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
