import { describe, expect, it } from 'vitest';
import { parseSettings } from './settings';

describe('parseSettings', () => {
  it('chưa có / JSON hỏng / sai version → mặc định theo thiết bị', () => {
    expect(parseSettings(null, true)).toEqual({ version: 1, quality: 'low', qualityManual: false });
    expect(parseSettings('{x', false).quality).toBe('medium');
    expect(parseSettings('{"version":2,"quality":"high"}', false).quality).toBe('medium');
  });

  it('giữ trường hợp lệ, trường sai chỉ về mặc định riêng nó', () => {
    expect(parseSettings('{"version":1,"quality":"high","qualityManual":true}', true)).toEqual({ version: 1, quality: 'high', qualityManual: true });
    expect(parseSettings('{"version":1,"quality":"ultra","qualityManual":true}', false)).toEqual({ version: 1, quality: 'medium', qualityManual: true });
    expect(parseSettings('{"version":1,"quality":"low","qualityManual":"yes"}', false)).toEqual({ version: 1, quality: 'low', qualityManual: false });
  });
});
