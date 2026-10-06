# Bake lightmap bảo tàng bằng Cycles (HLD 3, LLD tools/blender/bake.py).
#   node scripts/export-bake.mjs                                   → assets-src/bake/scene.obj + scene.json
#   D:\blender\blender.exe -b --python tools/blender/bake_lightmap.py [-- --samples 256] [--night]
#   → public/assets/lightmap.webp + lightmap.json ({ "scale": … }); --night → lightmap_night.* (chỉ đèn + trăng, FR-23)
#
# Ánh sáng: dải đèn trần (đèn vùng), đèn rọi 3200 K cho từng hiện vật, trời HDRI (Poly Haven, CC0) có mặt trời.
# Bake DIFFUSE chỉ gồm DIRECT + INDIRECT (không nhân màu vật liệu) = bức xạ tới mặt; runtime nhân với màu texture.
# Ảnh lưu 8 bit sRGB của (giá trị / scale); runtime đặt lightMapIntensity = scale × π.
import json
import math
import os
import sys
import time

import bpy
import numpy as np
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BAKE = os.path.join(ROOT, 'assets-src', 'bake')
HDRI = os.path.join(ROOT, 'assets-src', 'hdri', 'kloofendal_2k.hdr')
OUT = os.path.join(ROOT, 'public', 'assets')

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SAMPLES = int(args[args.index('--samples') + 1]) if '--samples' in args else 256
NIGHT = '--night' in args
NAME = 'lightmap_night' if NIGHT else 'lightmap'

cfg = json.load(open(os.path.join(BAKE, 'scene.json'), encoding='utf-8'))
SIZE = cfg['size']

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def to_blender(v):
    """three (x, y, z; y lên) → Blender (x, -z, y; z lên) — giống bộ nhập OBJ với forward -Z, up Y."""
    return Vector((v[0], -v[2], v[1]))


def srgb_to_linear(hex_color):
    c = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


# ── Hình học
bpy.ops.wm.obj_import(filepath=os.path.join(BAKE, 'scene.obj'), forward_axis='NEGATIVE_Z', up_axis='Y')
image = bpy.data.images.new('lightmap', SIZE, SIZE, float_buffer=True, alpha=False)
baked = []
for obj in scene.objects:
    if obj.type != 'MESH':
        continue
    key, dyn = obj.name.split('__dyn')[0].split('.')[0], '__dyn' in obj.name
    spec = cfg['materials'][key]
    mat = bpy.data.materials.new(key)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*srgb_to_linear(spec['color']), 1)
    bsdf.inputs['Roughness'].default_value = spec['roughness']
    bsdf.inputs['Metallic'].default_value = spec['metalness']
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = False
    if not dyn:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = image
        nodes.active = tex
        baked.append(obj)

# ── Đèn
WARM = (1.0, 0.95, 0.86)
for i, s in enumerate(cfg['strips']):
    light = bpy.data.lights.new(f'strip{i}', 'AREA')
    light.shape = 'RECTANGLE'
    light.size, light.size_y = s['size'][0], s['size'][1]
    light.energy = 4.5 * s['floorArea']  # 2 dải/khu → ~9 W mỗi m² sàn, hành lang hẹp không bị cháy sáng
    light.color = WARM
    obj = bpy.data.objects.new(light.name, light)
    obj.location = to_blender(s['center']) + Vector((0, 0, -0.03))
    scene.collection.objects.link(obj)

K3200 = (1.0, 0.72, 0.42)
for i, s in enumerate(cfg['spots']):
    light = bpy.data.lights.new(f'spot{i}', 'SPOT')
    light.energy = 45
    light.color = K3200
    light.spot_size = math.radians(55)
    light.spot_blend = 0.8
    light.shadow_soft_size = 0.05
    obj = bpy.data.objects.new(light.name, light)
    obj.location = to_blender(s['pos'])
    obj.rotation_euler = (to_blender(s['target']) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    scene.collection.objects.link(obj)

# Trời: cùng HDRI và cùng hướng quay với nền runtime (world/environment.ts xoay 180°).
world = bpy.data.worlds.new('sky')
scene.world = world
world.use_nodes = True
wn = world.node_tree.nodes
if NIGHT:
    # Đêm: trời xanh thẫm rất mờ (ánh trăng), không mặt trời; đèn trong nhà giữ nguyên.
    wn['Background'].inputs['Color'].default_value = (0.05, 0.08, 0.18, 1)
    wn['Background'].inputs['Strength'].default_value = 0.08
else:
    env = wn.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(HDRI)
    mapping = wn.new('ShaderNodeMapping')
    mapping.inputs['Rotation'].default_value[2] = math.pi
    coord = wn.new('ShaderNodeTexCoord')
    links = world.node_tree.links
    links.new(coord.outputs['Generated'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], env.inputs['Vector'])
    links.new(env.outputs['Color'], wn['Background'].inputs['Color'])
    wn['Background'].inputs['Strength'].default_value = 1.0

# ── Bake
scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
for backend in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
    try:
        prefs.compute_device_type = backend
        prefs.get_devices()
        if any(d.type == backend for d in prefs.devices):
            for d in prefs.devices:
                d.use = d.type == backend
            scene.cycles.device = 'GPU'
            print('Cycles GPU:', backend)
            break
    except TypeError:
        continue
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = False
scene.render.bake.margin = 2
scene.render.bake.margin_type = 'EXTEND'

bpy.ops.object.select_all(action='DESELECT')
for obj in baked:
    obj.select_set(True)
bpy.context.view_layer.objects.active = baked[0]
t0 = time.time()
bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=2, use_clear=True)
print(f'Bake xong sau {time.time() - t0:.0f} s')

# ── Khử nhiễu bằng OIDN (node Denoise của compositor) trên một scene rỗng: render cảnh rỗng rồi ghép ảnh.
raw = os.path.join(BAKE, f'{NAME}_raw.exr')
image.filepath_raw = raw
image.file_format = 'OPEN_EXR'
image.save()
comp = bpy.data.scenes.new('denoise')
comp.render.engine = 'CYCLES'
comp.cycles.samples = 1
comp.render.resolution_x = comp.render.resolution_y = SIZE
comp.render.resolution_percentage = 100
comp.render.image_settings.file_format = 'OPEN_EXR'
comp.render.image_settings.color_depth = '32'
comp.render.filepath = os.path.join(BAKE, f'{NAME}_denoised.exr')
comp.use_nodes = True
tree = comp.node_tree
for n in list(tree.nodes):
    tree.nodes.remove(n)
src = tree.nodes.new('CompositorNodeImage')
src.image = bpy.data.images.load(raw)
den = tree.nodes.new('CompositorNodeDenoise')
den.use_hdr = True
den.prefilter = 'NONE'
outn = tree.nodes.new('CompositorNodeComposite')
tree.links.new(src.outputs['Image'], den.inputs['Image'])
tree.links.new(den.outputs['Image'], outn.inputs['Image'])
bpy.ops.render.render(scene=comp.name, write_still=True)
clean = bpy.data.images.load(comp.render.filepath)
print('Đã khử nhiễu')

# ── Lưu: chia cho scale (phân vị 99,95 — giữ vùng sáng dưới đèn rọi, không cắt trắng), mã hóa sRGB 8 bit, WebP.
px = np.empty(SIZE * SIZE * 4, dtype=np.float32)
clean.pixels.foreach_get(px)
px = px.reshape(SIZE, SIZE, 4)
lit = px[..., :3].max(axis=2)
scale = float(np.percentile(lit[lit > 0], 99.95))
rgb = np.clip(px[..., :3] / scale, 0, 1)
rgb = np.where(rgb <= 0.0031308, rgb * 12.92, 1.055 * np.power(rgb, 1 / 2.4) - 0.055)
out = bpy.data.images.new('lightmap_out', SIZE, SIZE, alpha=False)
out.colorspace_settings.name = 'Non-Color'
px[..., :3] = rgb
px[..., 3] = 1
out.pixels.foreach_set(px.ravel())
out.filepath_raw = os.path.join(OUT, f'{NAME}.webp')
out.file_format = 'WEBP'
out.save(quality=92)
json.dump({'scale': round(scale, 4), 'samples': SAMPLES}, open(os.path.join(OUT, f'{NAME}.json'), 'w'))
print(f'{NAME}.webp', os.path.getsize(out.filepath_raw) // 1024, 'KB, scale', scale)
