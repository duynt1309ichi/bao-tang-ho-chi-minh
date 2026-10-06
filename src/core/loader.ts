import sizes from 'virtual:asset-sizes';

/** Gói tải ban đầu (HLD 7.2): lightmap, trời, texture 1K, nhân vật đã chọn. Texture 2K tải khi chọn mức Cao. */
const INITIAL = /^\/assets\/(lightmap|sky|tex\/[a-z]+_1k_)/;
export const initialAssets = (character: 'nam' | 'nu') => [...Object.keys(sizes).filter((u) => INITIAL.test(u)), `/assets/characters/${character}.glb`];
export const bytesOf = (urls: string[]) => urls.reduce((s, u) => s + (sizes[u] ?? 0), 0);

/** url → blob URL của file đã tải xong. Nơi dùng gọi `assetUrl(url)`; chưa tải thì trả về url gốc. */
const ready = new Map<string, string>();
export const assetUrl = (url: string) => ready.get(url) ?? url;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Tải một file, thử tối đa `tries` lần, cách nhau `delayMs` (FR-01 2a: lần đầu + 2 lần thử lại, cách 2 s).
 * `onBytes(n)` báo số byte của lượt đang tải (về 0 khi thử lại).
 */
export async function fetchWithRetry(url: string, onBytes: (n: number) => void, tries = 3, delayMs = 2000, get: typeof fetch = fetch): Promise<Blob> {
  for (let attempt = 1; ; attempt++) {
    try {
      onBytes(0);
      const res = await get(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      // Host trả trang HTML cho file không có (SPA fallback) → coi như 404.
      if (res.headers.get('content-type')?.startsWith('text/html')) throw new Error(`Không phải asset: ${url}`);
      if (!res.body) return await res.blob();
      const parts: Uint8Array<ArrayBuffer>[] = [];
      let n = 0;
      for (const reader = res.body.getReader(); ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        onBytes((n += value.byteLength));
      }
      return new Blob(parts, { type: res.headers.get('content-type') ?? '' });
    } catch (e) {
      if (attempt >= tries) throw e;
      await wait(delayMs);
    }
  }
}

/**
 * Tải các file chưa có (gọi lại sau lỗi = chỉ tải file còn thiếu, FR-01 2a). `onProgress` nhận
 * tỉ lệ byte đã nhận / tổng byte của cả gói. Reject nếu còn file lỗi sau khi đã thử lại.
 */
export async function loadBundle(urls: string[], onProgress: (fraction: number) => void, get: typeof fetch = fetch) {
  const total = bytesOf(urls);
  const got = new Map(urls.filter((u) => ready.has(u)).map((u) => [u, sizes[u] ?? 0]));
  const report = () => onProgress(total ? Math.min(1, [...got.values()].reduce((a, b) => a + b, 0) / total) : 1);
  report();
  const results = await Promise.allSettled(
    urls
      .filter((u) => !ready.has(u))
      .map(async (u) => {
        const blob = await fetchWithRetry(u, (n) => (got.set(u, n), report()), 3, 2000, get);
        ready.set(u, URL.createObjectURL(blob));
      }),
  );
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length) throw new Error(`Không tải được ${failed.length} file`, { cause: (failed[0] as PromiseRejectedResult).reason });
}
