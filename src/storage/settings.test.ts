import { describe, expect, it } from 'vitest';
import { parseSettings } from './settings';

describe('parseSettings', () => {
  it('chưa có / JSON hỏng / sai version → mặc định theo thiết bị', () => {
    expect(parseSettings(null, true)).toEqual({ version: 1, quality: 'low', qualityManual: false, sensitivity: 1, invertY: false, volumeMusic: 60, volumeSfx: 80, muted: false, night: false });
    expect(parseSettings('{x', false).quality).toBe('medium');
    expect(parseSettings('{"version":2,"quality":"high"}', false).quality).toBe('medium');
  });

  it('giữ trường hợp lệ, trường sai chỉ về mặc định riêng nó', () => {
    const p = (s: object, touch = false) => parseSettings(JSON.stringify({ version: 1, ...s }), touch);
    expect(p({ quality: 'high', qualityManual: true, sensitivity: 2, invertY: true }, true)).toMatchObject({ quality: 'high', qualityManual: true, sensitivity: 2, invertY: true });
    expect(p({ quality: 'ultra', qualityManual: true })).toMatchObject({ quality: 'medium', qualityManual: true });
    expect(p({ quality: 'low', qualityManual: 'yes', invertY: 1 })).toMatchObject({ quality: 'low', qualityManual: false, invertY: false });
  });

  it('độ nhạy kẹp [0,1; 3,0], làm tròn 0,1; sai kiểu → 1,0', () => {
    const s = (v: unknown) => parseSettings(JSON.stringify({ version: 1, sensitivity: v }), false).sensitivity;
    expect(s(5)).toBe(3);
    expect(s(0)).toBe(0.1);
    expect(s(1.26)).toBe(1.3);
    expect(s('2')).toBe(1);
  });

  it('âm lượng kẹp [0; 100], bội 5; muted/night sai kiểu → mặc định', () => {
    const p = (o: object) => parseSettings(JSON.stringify({ version: 1, ...o }), false);
    expect(p({ volumeMusic: 63, volumeSfx: 120 })).toMatchObject({ volumeMusic: 65, volumeSfx: 100 });
    expect(p({ volumeMusic: -5, volumeSfx: 'x' })).toMatchObject({ volumeMusic: 0, volumeSfx: 80 });
    expect(p({ muted: true, night: 'yes' })).toMatchObject({ muted: true, night: false });
  });
});
