import { describe, expect, it } from 'vitest';
import { assetUrl, bytesOf, fetchWithRetry, initialAssets, loadBundle } from './loader';

describe('fetchWithRetry (FR-01 2a)', () => {
  it('lỗi 2 lần rồi được: tải xong ở lần thứ 3', async () => {
    let calls = 0;
    const get = (async () => (++calls < 3 ? new Response('', { status: 503 }) : new Response('abc'))) as typeof fetch;
    const blob = await fetchWithRetry('/x', () => {}, 3, 0, get);
    expect(await blob.text()).toBe('abc');
    expect(calls).toBe(3);
  });

  it('lỗi cả 3 lần thì báo lỗi', async () => {
    let calls = 0;
    const get = (async () => (calls++, new Response('', { status: 404 }))) as typeof fetch;
    await expect(fetchWithRetry('/x', () => {}, 3, 0, get)).rejects.toThrow('HTTP 404');
    expect(calls).toBe(3);
  });
});

describe('loadBundle', () => {
  it('"Thử lại" chỉ tải file còn thiếu', async () => {
    const [a, b] = initialAssets('nam');
    const seen: string[] = [];
    let blockB = true;
    const get = (async (url: string) => (seen.push(url), url === b && blockB ? new Response('', { status: 500 }) : new Response('ok'))) as typeof fetch;
    await expect(loadBundle([a, b], () => {}, get)).rejects.toThrow();
    expect(assetUrl(a)).toMatch(/^blob:/);
    expect(assetUrl(b)).toBe(b);
    seen.length = 0;
    blockB = false;
    let last = 0;
    await loadBundle([a, b], (f) => (last = f), get);
    expect(seen).toEqual([b]);
    expect(assetUrl(b)).toMatch(/^blob:/);
    expect(last).toBeGreaterThan(0);
  }, 20_000);
});

describe('gói tải ban đầu (NFR-03)', () => {
  it('có lightmap, texture 1K và nhân vật; dưới 12 MB (chừa ~3 MB cho JS, font)', () => {
    const urls = initialAssets('nu');
    expect(urls).toContain('/assets/lightmap.webp');
    expect(urls).toContain('/assets/characters/nu.glb');
    expect(urls.some((u) => u.includes('_2k_'))).toBe(false);
    expect(bytesOf(urls)).toBeLessThan(12 * 1024 * 1024);
  });
});

describe('fetchWithRetry — host trả HTML cho file thiếu', () => {
  it('coi là lỗi', async () => {
    const get = (async () => new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } })) as typeof fetch;
    await expect(fetchWithRetry('/assets/x.webp', () => {}, 1, 0, get)).rejects.toThrow('Không phải asset');
  });
});
