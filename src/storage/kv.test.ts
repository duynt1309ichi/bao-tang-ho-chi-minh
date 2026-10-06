import { afterEach, describe, expect, it, vi } from 'vitest';
import { kv } from './kv';

describe('kv (FR-19 3a, 3b)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ghi lỗi thì giữ trong bộ nhớ và gọi onFail đúng một lần', () => {
    const onFail = vi.fn();
    kv.onFail = onFail;
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('đầy', 'QuotaExceededError');
      },
      removeItem: () => {},
    });
    expect(kv.set('bttr.settings.v1', '{}')).toBe(false);
    expect(kv.set('bttr.progress.v1', '{}')).toBe(false);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(kv.failed).toBe(true);
  });
});
