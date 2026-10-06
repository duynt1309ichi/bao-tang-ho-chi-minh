# Nhân vật CC0 Quaternius (Poly Pizza, xem CREDITS.md) → GLB gọn trong public/assets/characters/.
# Giữ 3 hoạt ảnh dùng trong game (LLD player/character): idle, walk, run. Lúc xem hiện vật nhân vật bị ẩn nên không cần "look".
# Chạy: D:\blender\blender.exe -b --python tools/blender/prepare_characters.py
import os
import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets-src', 'characters')
OUT = os.path.join(ROOT, 'public', 'assets', 'characters')
KEEP = {'Idle': 'idle', 'Walk': 'walk', 'Run': 'run'}

os.makedirs(OUT, exist_ok=True)
for name in ('nam', 'nu'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, f'{name}.glb'))
    for action in list(bpy.data.actions):
        short = action.name.split('|')[-1]
        if short in KEEP:
            action.name = KEEP[short]
            action.use_fake_user = True
        else:
            bpy.data.actions.remove(action)
    for ob in bpy.data.objects:
        if ob.animation_data:
            ob.animation_data.action = None
            for track in list(ob.animation_data.nla_tracks):
                ob.animation_data.nla_tracks.remove(track)
    path = os.path.join(OUT, f'{name}.glb')
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_force_sampling=False,
        export_optimize_animation_size=True,
        export_apply=False,
    )
    print(path, os.path.getsize(path), sorted(a.name for a in bpy.data.actions))
