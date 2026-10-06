# Chuyển asset CC0 (Poly Haven) trong assets-src/ thành WebP gọn trong public/assets/.
# Chạy: D:\blender\blender.exe -b --python tools/blender/convert_assets.py
#
# - Texture: mỗi bộ ra bản 1K và 2K (HLD 7.3). Màu "detail" (vữa) được khử màu và chuẩn hóa quanh 1,0
#   để vật liệu runtime nhân với màu design (#E9E3D6) — giữ đúng tông ngà.
# - HDRI: ra ảnh trời LDR 2048 × 1024 (nền + môi trường), tone map Reinhard, sRGB.
import os
import bpy
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets-src')
OUT = os.path.join(ROOT, 'public', 'assets')

# tên runtime: (tên Poly Haven, các map, chế độ màu)
SETS = {
    'parquet': ('herringbone_parquet', ['diff', 'nor_gl', 'rough'], 'color'),
    'marble': ('marble_01', ['diff', 'nor_gl', 'rough'], 'color'),
    'plaster': ('white_plaster_02', ['diff', 'nor_gl'], 'detail'),
    'grass': ('leafy_grass', ['diff', 'nor_gl'], 'color'),
    'carpet': ('fabric_pattern_07', ['nor_gl'], None),
}
SUFFIX = {'diff': 'color', 'nor_gl': 'normal', 'rough': 'rough'}


def load(path):
    img = bpy.data.images.load(path)
    img.colorspace_settings.name = 'Non-Color'  # đọc giá trị thô, không đổi gamma
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4), w


def save(px, path, quality=88):
    h, w = px.shape[:2]
    img = bpy.data.images.new('out', w, h, alpha=False)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(np.clip(px, 0, 1).astype(np.float32).ravel())
    img.filepath_raw = path
    img.file_format = 'WEBP'
    img.save(quality=quality)
    bpy.data.images.remove(img)
    print('  ->', os.path.relpath(path, ROOT), os.path.getsize(path) // 1024, 'KB')


def half(px):
    h, w = px.shape[:2]
    return px.reshape(h // 2, 2, w // 2, 2, 4).mean(axis=(1, 3))


def detail(px):
    """Khử màu, giảm độ loang 50 %, chuẩn hóa trung bình về 0,9 (gamma-space)."""
    lum = px[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    lum = lum / lum.mean()
    lum = 1 + (lum - 1) * 0.5
    out = px.copy()
    out[..., :3] = (lum * 0.9)[..., None]
    return out


os.makedirs(os.path.join(OUT, 'tex'), exist_ok=True)
for name, (ph, maps, mode) in SETS.items():
    print(name)
    for m in maps:
        px, _ = load(os.path.join(SRC, 'tex', f'{ph}_{m}_2k.jpg'))
        if m == 'diff' and mode == 'detail':
            px = detail(px)
        for size, data in (('2k', px), ('1k', half(px))):
            save(data, os.path.join(OUT, 'tex', f'{name}_{size}_{SUFFIX[m]}.webp'))

# Trời: HDR tuyến tính → Reinhard → sRGB, giữ 2048 × 1024.
print('sky')
img = bpy.data.images.load(os.path.join(SRC, 'hdri', 'kloofendal_2k.hdr'))
img.colorspace_settings.name = 'Linear Rec.709'
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
rgb = px[..., :3] * 0.9
rgb = rgb / (1 + rgb)
rgb = np.where(rgb <= 0.0031308, rgb * 12.92, 1.055 * np.power(rgb, 1 / 2.4) - 0.055)
px[..., :3] = rgb
save(px, os.path.join(OUT, 'sky.webp'), quality=85)
