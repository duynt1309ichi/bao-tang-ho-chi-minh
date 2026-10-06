# LLD — Bảo tàng Triết học

| Phiên bản | v0.1 | Ngày | 2026-10-06 | Trạng thái | APPROVED — GATE-3 (anh Duy, 2026-10-06) |
|-----------|------|------|------------|------------|--------------------|

Căn cứ: [SRS v1.0](../ba/SRS.md), [HLD v1.0](HLD.md), [FSD](../ba/FSD.md), [design.md](../design/design.md). Không có CSDL máy chủ: "data model" ở đây là **kiểu TypeScript** của dữ liệu đóng gói và của dữ liệu lưu trong `localStorage`. Tên kiểu/trường dưới đây là nguồn sự thật cho code.

## 1. Data model

### 1.1 Định danh

| Kiểu | Định nghĩa | Ví dụ |
|------|-----------|-------|
| `ZoneId` | `'A' \| 'B' \| 'C'` | `'B'` |
| `RoomId` | `'P01' \| … \| 'P10'` | `'P04'` |
| `AreaId` | `'courtyard' \| 'lobby' \| 'hallway' \| 'review' \| RoomId` | `'hallway'` |
| `ExhibitId` | chuỗi khớp `^[a-c]\d{1,2}-[a-z0-9-]+$`, lấy nguyên từ NOI_DUNG.md | `'b4-luong-chat'` |
| `QuestionId` | `` `${RoomId}-q${n}` `` | `'P04-q2'` |
| `PageRange` | `[from: number, to: number]`, `from ≤ to`; một trang thì `from = to` | `[128, 134]` |

### 1.2 Nội dung đóng gói (`src/content/`)

**`Room`** — `src/content/rooms.ts`

| Trường | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
|--------|------|:-------:|-----------|-------|
| id | `RoomId` | ✓ | duy nhất, đủ 10 | |
| zone | `ZoneId` | ✓ | P01–P02 = A, P03–P05 = B, P06–P10 = C | |
| chapter | `1 \| 2 \| 3` | ✓ | khớp zone | |
| title | `string` | ✓ | 1–80 ký tự | "Vật chất và ý thức" |
| pages | `PageRange` | ✓ | | khoảng trang của mục lớn |

**`Exhibit`** — `src/content/exhibits.ts`

| Trường | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
|--------|------|:-------:|-----------|-------|
| id | `ExhibitId` | ✓ | duy nhất | |
| room | `RoomId` | ✓ | | |
| kind | `'portrait' \| 'text' \| 'model' \| 'interactive'` | ✓ | 🖼 📜 🧊 🎛 | |
| title | `string` | ✓ | 1–80 ký tự | |
| body | `string` | ✓ | 1–1.500 ký tự; đoạn cách nhau bằng `\n\n`; văn bản thuần | tóm tắt bằng lời của mình |
| quote | `{ text: string; author: string }` | | text ≤ 400 ký tự | trích nguyên văn ngắn |
| pages | `PageRange[]` | ✓ | ≥ 1 phần tử; mọi trang nằm trong `Room.pages` của phòng chứa nó | `[[17,17],[22,22]]` |
| illustrative | `boolean` | | mặc định `false` | nhãn "(minh họa)" |
| image | `{ src: string; creditId: string }` | | chỉ với `portrait`; `src` dưới `/assets/img/`; `creditId` có trong credits | |
| model | `string` | | tên node trong GLB của khu, hoặc file `/assets/models/*.glb` | mô hình trên bục |
| interactive | `{ hint: string }` | chỉ khi `kind = 'interactive'` | hint 1–120 ký tự | câu hướng dẫn SCR-08 |

**`QuizQuestion`** — `src/content/quiz.ts`

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|--------|------|:-------:|-----------|
| id | `QuestionId` | ✓ | duy nhất |
| room | `RoomId` | ✓ | mỗi phòng 3–5 câu |
| prompt | `string` | ✓ | 1–300 ký tự |
| options | `[string, string, string, string]` | ✓ | 4 chuỗi khác nhau, mỗi chuỗi 1–160 ký tự |
| answer | `0 \| 1 \| 2 \| 3` | ✓ | chỉ số trong `options` gốc (trước khi xáo) |
| explanation | `string` | ✓ | 1–300 ký tự |
| exhibitIds | `ExhibitId[]` | ✓ | ≥ 1; mọi mã thuộc `room` |

**`Credit`** — `src/content/credits.ts` (viết tay song song với `CREDITS.md`; FR-26 đối chiếu hai bên)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|--------|------|:-------:|-----------|
| id | `string` | ✓ | duy nhất, kebab-case |
| asset | `string` | ✓ | tên hiển thị |
| author | `string` | ✓ | |
| sourceUrl | `string` | ✓ | bắt đầu bằng `https://` |
| license | `'CC0' \| 'CC-BY-4.0' \| 'Public domain' \| 'SIL OFL 1.1' \| 'MIT'` | ✓ | danh sách cho phép (NFR-11) |
| files | `string[]` | ✓ | đường dẫn trong `public/` dùng asset này |

### 1.3 Bố cục (`src/content/layout.json`)

Nguồn duy nhất cho vị trí (HLD ADR-04), đọc bởi runtime và `tools/blender/*.py`. Đơn vị mét; trục `x` sang phải, `y` lên trên, `z` hướng về phía người xem (giống three.js); góc theo radian quanh trục `y`. Giá trị cụ thể điền ở B4 (mốc M1).

```jsonc
{
  "version": 1,
  "areas": [
    { "id": "lobby", "zone": null, "rect": [x, z, width, depth], "height": 6 },
    { "id": "P04", "zone": "B", "rect": [x, z, w, d], "height": 5,
      "doors": [{ "to": "hallway", "center": [x, z], "width": 1.8, "axis": "x" }] }
  ],
  "spawns": { "courtyard": { "pos": [x, y, z], "rotY": 0 }, "lobby": {…}, "review-door": {…} },
  "exhibits": [
    { "id": "b4-luong-chat", "pos": [x, y, z], "rotY": 1.57,
      "viewpoint": { "pos": [x, y, z], "target": [x, y, z] } }
  ],
  "quizStations": [ { "room": "P04", "pos": [x, y, z], "rotY": 0 } ]
}
```

| Ràng buộc | Kiểm ở |
|-----------|--------|
| `areas` có đủ `courtyard`, `lobby`, `hallway`, `review`, `P01`…`P10`; hình chữ nhật không chồng nhau | FR-26 |
| Mỗi phòng có ≥ 1 cửa nối `hallway`, `width` ≥ 1,6 m; hành lang rộng ≥ 3 m (BR-S04) | FR-26 |
| P04 có diện tích ≥ 1,5 × trung bình các phòng khác (BR-S06) | FR-26 |
| Mỗi `Exhibit` có đúng 1 mục trong `layout.exhibits`, `pos` nằm trong `rect` của phòng chứa nó | FR-26 |
| Đủ 10 `quizStations`, nằm trong `review` | FR-26 |

### 1.4 Dữ liệu lưu trong `localStorage`

Khóa `bttr.progress.v1` — kiểu `Progress`:

| Trường | Kiểu | Mặc định | Ràng buộc / validate (SRS FR-19) |
|--------|------|----------|----------------------------------|
| version | `1` | `1` | khác 1 → bỏ toàn bộ (MSG-10) |
| explored | `ExhibitId[]` | `[]` | bỏ mã lạ, bỏ trùng |
| quiz | `Partial<Record<RoomId, { best: number; total: number; mastered: boolean }>>` | `{}` | `total` ≠ số câu hiện tại → bỏ phòng đó; `0 ≤ best ≤ total` |
| character | `'nam' \| 'nu'` | (không có) | lạ → coi như chưa chọn |
| tutorialSeen | `boolean` | `false` | |
| completedShown | `boolean` | `false` | |

Khóa `bttr.settings.v1` — kiểu `Settings`:

| Trường | Kiểu | Mặc định | Ràng buộc |
|--------|------|----------|-----------|
| version | `1` | `1` | khác 1 → dùng toàn bộ mặc định |
| quality | `'low' \| 'medium' \| 'high'` | theo BR-S12 | |
| qualityManual | `boolean` | `false` | |
| sensitivity | `number` | `1.0` | kẹp về [0,1; 3,0], làm tròn 1 chữ số thập phân |
| invertY | `boolean` | `false` | |
| volumeMusic | `number` | `60` | số nguyên [0; 100], bội của 5 |
| volumeSfx | `number` | `80` | như trên |
| muted | `boolean` | `false` | |
| night | `boolean` | `false` | |

Trường settings sai kiểu → dùng mặc định **riêng trường đó** (không bỏ cả khối). Kích thước tối đa ước tính: Progress ≈ 2 KB, Settings < 300 B. Không có trường định danh cá nhân (NFR-10).

### 1.5 Manifest tải (`public/assets/manifest.json`, sinh lúc build)

`{ "bundles": { "initial": [{ "url": string, "bytes": number }], "A": […], "B": […], "C": […], "review": […] } }` — sinh bởi `scripts/build-manifest.ts` từ thư mục `public/assets/<bundle>/`; dùng để tính % tải (FR-01) và kiểm ngân sách dung lượng (HLD 4.2).

## 2. Phân rã module

Đường dẫn dưới `src/`. Hàm thuần (không đụng DOM/three) được đánh dấu **(thuần)** và phải có unit test Vitest.

| Module | Trách nhiệm | Giao diện public | Phụ thuộc | FR |
|--------|-------------|------------------|-----------|----|
| `core/events.ts` | Bus sự kiện có kiểu | `bus.emit<K>(type: K, detail: Events[K])`, `bus.on<K>(type, fn): () => void`; `Events` = `{ 'state-changed': AppState; 'progress-changed': void; 'area-changed': AreaId; 'zone-loaded': ZoneId \| 'review'; 'settings-changed': Settings; 'quality-changed': Quality }` | — | — |
| `core/app.ts` | Máy trạng thái HLD 4.1; ESC đóng lớp trên cùng | `app.state`, `app.setState(s)`, `app.restart()`; `type AppState = 'boot' \| 'unsupported' \| 'loading' \| 'load-error' \| 'title' \| 'character-select' \| 'tutorial' \| 'playing' \| 'room-popup' \| 'exhibit' \| 'quiz' \| 'completion' \| 'paused'` | events | FR-01, FR-21 |
| `core/transitions.ts` | Bảng chuyển trạng thái hợp lệ **(thuần)** | `canTransition(from, to): boolean` | — | FR-21 |
| `core/renderer.ts` | Tạo `WebGLRenderer`, xử lý mất ngữ cảnh | `hasWebGL2(): boolean`, `createRenderer(canvas)`, `onContextLost(cb)` | three | FR-01 |
| `core/loop.ts` | `requestAnimationFrame`, bước cố định | `loop.add(fn: (dt) => void)`, `stepsFor(elapsed): number[]` **(thuần)**: chia `elapsed` thành các bước ≤ 1/60 s, tối đa 6 bước, phần dư bỏ | — | FR-07 c |
| `core/loader.ts` | Tải theo manifest, thử lại, tiến trình | `loadBundle(name, onProgress)`, `retryMissing()`, `fetchWithRetry(url, tries = 3, delayMs = 2000)` | three/GLTFLoader + MeshoptDecoder | FR-01 |
| `core/quality.ts` | Áp mức chất lượng, đo FPS, tự hạ | `applyQuality(q)`, `pickInitial(isTouch): Quality` **(thuần)**, `FpsMonitor.push(dt)` → `shouldDowngrade(): boolean` **(thuần)** | three, postprocessing, n8ao | FR-22 |
| `core/device.ts` | Nhận diện cảm ứng | `isTouch(): boolean` = `matchMedia('(pointer: coarse)').matches` | — | FR-03, FR-06 |
| `content/index.ts` | Truy cập dữ liệu, định dạng | `room(id)`, `exhibit(id)`, `exhibitsIn(room)`, `quizFor(room)`, `formatPages(ranges): string` **(thuần)** → `"128–134"`, `"17, 22"` | — | FR-08, FR-13, FR-16 |
| `content/validate.ts` | Luật FR-26 **(thuần)**, dùng chung cho script build và test | `validateContent(input): string[]` (danh sách lỗi, rỗng = đạt) | — | FR-26 |
| `storage/progress.ts` | Validate + đọc/ghi Progress | `parseProgress(raw: string \| null, content): { value: Progress; status: 'ok' \| 'empty' \| 'reset' }` **(thuần)**; `progress.markExplored(id): boolean` (true nếu mới); `saveQuiz(room, k, n)`; `mergeQuiz(prev, k, n)` **(thuần)**; `setCharacter`, `setTutorialSeen`, `setCompletedShown`, `resetProgress()`, `exploredCount()` | events, `storage/kv` | FR-15, FR-16, FR-19, FR-20 |
| `storage/settings.ts` | Validate + đọc/ghi Settings | `parseSettings(raw, isTouch)` **(thuần)**; `settings.update(patch)` | events, `storage/kv` | FR-19, FR-22 |
| `storage/kv.ts` | Bọc `localStorage`, rơi về bộ nhớ khi bị chặn | `kv.get(key)`, `kv.set(key, value): boolean`, `kv.blocked: boolean` | — | FR-19 3a/3b |
| `world/zones.ts` | Tải GLB theo khu, gán lightmap, gộp collider | `loadZone(z)`, `preloadZones()`, `collider: MeshBVH`, `areaAt(pos): AreaId` | loader, three-mesh-bvh | FR-01, FR-08 |
| `world/blockout.ts` | Sinh khối hộp từ `layout.json` khi chưa có GLB | `buildBlockout(layout, zone): Group` | three | FR-08 (ADR-04) |
| `world/doors.ts` | Vùng kích hoạt ngưỡng cửa, cửa khu chưa tải | `doorCrossed(prevPos, pos): { room, entering } \| null` **(thuần)** | layout | FR-09 |
| `world/dayNight.ts`, `world/fireworks.ts` | Chuyển ngày/đêm ≤ 2s; pháo hoa `Points` | `dayNight.set(night)`, `toggle()`; `fireworks.setDensity(q)` | three | FR-23 |
| `player/character.ts` | Nạp nhân vật, AnimationMixer, cross-fade 0,2 s | `setCharacter(c)`, `play('idle' \| 'walk' \| 'run' \| 'look' \| 'interact')` | three | FR-02, FR-04 |
| `player/keyboardInput.ts`, `player/touchInput.ts` | Thu điều khiển thành vector chung | `input.move: {x, z}`, `input.run`, `input.look: {dx, dy}`, `input.zoom`; `normalizeMove(keys)` **(thuần)** | — | FR-04, FR-06 |
| `player/collision.ts` | Viên nang 0,3 × 1,7 m với BVH, trượt theo tường | `resolveCapsule(capsule, bvh): Vector3` | three-mesh-bvh | FR-07 |
| `player/camera.ts` | Camera thứ 3/thứ nhất, kẹp góc, zoom, chống xuyên tường | `camera.update(dt)`, `toggleView()`, `clampPitch(p)` **(thuần)**, `requestLock()` | three-mesh-bvh | FR-05 |
| `player/controller.ts` | Ghép input + collision + animation; tốc độ BR-S02 | `controller.update(dt)`, `teleport(spawn)`, `pushBack(m)` | các module player, world | FR-04, FR-07 |
| `exhibits/proximity.ts` | Chọn mục tiêu BR-S09 **(thuần)** | `pickTarget(pos, facing, candidates, maxDist = 2, maxAngleDeg = 60): ExhibitId \| null` | — | FR-12 |
| `exhibits/registry.ts` | Đặt hiện vật vào scene theo layout, viền sáng | `place(zone)`, `highlight(id \| null)`, `interact()` | three, content | FR-12 |
| `exhibits/viewer.ts` | Camera bay, bảng SCR-07, xoay 🧊 | `open(id)`, `close()`, `rotate(dx, dy)`, `clampModelPitch(p)` **(thuần)** | ui, storage | FR-13 |
| `exhibits/interactive/base.ts` | Khuôn chung 🎛 | `interface Interactive { start(): void; update(dt: number): void; isComplete(): boolean; reset(): void; dispose(): void }`; `runInteractive(id)` lo trạng thái Sẵn sàng → Đang thao tác → Hoàn thành | — | FR-14 |
| `exhibits/interactive/<id>.ts` × 13 | Thao tác + điều kiện hoàn thành theo bảng FR-14 | cài đặt `Interactive` | three, audio | FR-14 |
| `quiz/session.ts` | Một lượt trắc nghiệm | `startSession(room, rng)`, `answer(i)`, `finish(): { correct; total; reviewIds }`; `shuffle(options, answer, rng)` **(thuần)**; `addHints(ids)`, `hints: Set<ExhibitId>` (bộ nhớ phiên) | content, storage | FR-16, FR-17 |
| `ui/*` | Mỗi màn SCR một file: `loading`, `title`, `characterSelect`, `tutorial`, `hud`, `minimap`, `roomPopup`, `exhibitPanel`, `quizPanel`, `completion`, `pauseMenu`, `settingsPanel`, `credits`, `rotateHint`, `toast`, `dialog` | mỗi file export `mount(root)`, `show(...)`, `hide()`; `ui/dom.ts` có `h(tag, props, ...children)` chỉ gán `textContent`/thuộc tính, không `innerHTML` | events, content, storage | theo FSD mục 2 |
| `audio/index.ts` | Nhạc nền, bước chân, hiệu ứng | `unlock()`, `setMuted(b)`, `setVolumes(m, s)`, `play(name)`, `footstep()` | three/AudioListener | FR-24 |
| `main.ts` | Khởi tạo theo thứ tự HLD 4.2 | — | tất cả | FR-01 |

**Script ngoài `src/`**

| File | Việc | Chạy khi |
|------|------|---------|
| `scripts/validate-content.ts` | Gọi `validateContent()` trên `src/content/*` + `layout.json` + đối chiếu `CREDITS.md` và file trong `public/`; in lỗi, thoát mã 1 nếu có lỗi | `npm run build` |
| `scripts/build-manifest.ts` | Sinh `manifest.json` (mục 1.5), in bảng dung lượng, thoát mã 1 nếu vượt ngân sách HLD 4.2 | `npm run build` |
| `tools/blender/build_building.py` | Đọc `layout.json`, dựng tường/sàn/trần/phào/cửa theo khu + mesh va chạm hậu tố `_col` | tay, khi làm asset |
| `tools/blender/bake.py` | UV2 + bake lightmap mỗi khu (Cycles) ra PNG 2048 | tay |
| `tools/blender/export.py` | Xuất GLB mỗi khu vào `assets-src/`, sau đó `gltf-transform` nén vào `public/assets/<bundle>/` | tay |

## 3. Ánh xạ màn hình ↔ dữ liệu

| Màn hình · element | Nguồn | Hiển thị / công thức |
|--------------------|-------|----------------------|
| SCR-02 · nút chính | `Progress.explored.length`, `Progress.character` | "Tiếp tục…" khi `explored.length > 0` hoặc có `character` |
| SCR-02, SCR-05 · N/63 | `Progress.explored` ∩ id hiện vật, tổng `exhibits.length` | `${n}/${total}` |
| SCR-05 · tên khu vực | `world.areaAt(pos)` → `Room.title` | "Phòng 0X — <title>", hoặc tên khu chung |
| SCR-06 | `Room`, `exhibitsIn(room)` ∩ explored | "Đã khám phá k/n hiện vật" |
| SCR-07 · dòng nguồn | `Exhibit.pages` | `formatPages`: mỗi khoảng `a–b` (gạch ngang dài), một trang `a`, nối bằng ", " |
| SCR-09 · ✓ | `exhibitsIn(room)` ⊆ explored | |
| SCR-09 · ★ | `Progress.quiz[room].mastered` | |
| SCR-09 · ◎ | `quiz.hints` (phiên) chứa hiện vật thuộc phòng | |
| SCR-10 · "Tốt nhất" | `Progress.quiz[room]` | `${best}/${total}` hoặc "Chưa làm" |
| SCR-13 | `Settings` | như bảng 1.4 |

## 4. Sequence luồng chính

**4.1 Khởi động** (FR-01, FR-19)
```
main -> renderer.hasWebGL2()            [false] -> app.setState('unsupported'); dừng
main -> kv / storage.parseProgress(kv.get('bttr.progress.v1'))
                                         [status = reset] -> ghi nhớ hiện MSG-10 ở SCR-02
                                         [kv.blocked]     -> ghi nhớ hiện MSG-11
main -> settings.parseSettings(...); quality.pickInitial(isTouch) nếu chưa có
main -> loader.loadBundle('initial', onProgress -> ui/loading)
          loader -> fetchWithRetry(url) x N   [hết 3 lần] -> app.setState('load-error')
main -> world.loadZone('lobby…'), player.setCharacter(...)
main -> app.setState('title')
người dùng bấm nút -> audio.unlock(); world.preloadZones() (nền: A -> B -> C -> review)
                   -> app.setState('character-select' | 'tutorial' | 'playing')
```

**4.2 Mở hiện vật** (FR-12 → FR-15, FR-18)
```
loop -> controller.update(dt) -> exhibits.proximity.pickTarget(...) -> registry.highlight(id); ui/hud.prompt(id)
người dùng E -> registry.interact() -> app.setState('exhibit') -> viewer.open(id)
viewer -> camera tween (≤ 1 s) ; ui/exhibitPanel.show(exhibit) ; [kind = interactive] -> runInteractive(id)
viewer -> progress.markExplored(id)
            [mới] -> kv.set(...) [false] -> MSG-11 (1 lần/phiên)
                  -> bus.emit('progress-changed') -> hud, minimap cập nhật
người dùng đóng -> viewer.close() ; [mới] toast MSG-06
            [exploredCount = total && !completedShown] -> app.setState('completion')
            [còn lại] -> app.setState('playing')
```

**4.3 Trắc nghiệm** (FR-16, FR-17)
```
E ở trạm X -> app.setState('quiz') -> quizPanel.show(X, progress.quiz[X])
Bắt đầu -> session = startSession(X, Math.random)
mỗi câu: answer(i) -> đúng/sai ; [sai] quiz.addHints(q.exhibitIds)
câu cuối -> finish() -> progress.saveQuiz(X, k, n) -> mergeQuiz(prev, k, n):
            best = max(prev.best, k); mastered = prev.mastered || k = n; total = n
         -> bus.emit('progress-changed')
ESC giữa bài -> dialog(MSG-16) -> [Thoát] app.setState('playing'), không lưu
```

**4.4 Tải khu nền** (BR-S10)
```
world.preloadZones() -> lần lượt loader.loadBundle(z)
   [đạt] -> gắn mesh, gộp collider, mở collider cửa khu, bus.emit('zone-loaded', z)
   [lỗi sau 3 lần] -> toast MSG-12 có nút Thử lại -> loader.loadBundle(z) lại
   [chưa có GLB của khu trong manifest] -> buildBlockout(layout, z)
```

**4.5 Mất ngữ cảnh WebGL** (FR-01 *)
```
canvas 'webglcontextlost' -> preventDefault(); loop.pause(); lớp phủ MSG-04; hẹn giờ 5 s
'webglcontextrestored' trước 5 s -> renderer dựng lại texture/material (three tự xử lý phần lớn); loop.resume()
quá 5 s -> hiện nút "Tải lại trang"
```

## 5. Xử lý lỗi & Trạng thái

| Mã nội bộ | Tình huống | Xử lý | Thông báo (FSD) |
|-----------|-----------|-------|-----------------|
| `E_WEBGL2` | Không tạo được ngữ cảnh WebGL2 | `unsupported` | MSG-01 |
| `E_LOAD_INITIAL` | File gói ban đầu lỗi sau 3 lần (1 + 2 lần thử lại, cách 2 s) | `load-error`, nút Thử lại tải file còn thiếu | MSG-02 |
| `E_LOAD_ZONE` | File gói khu lỗi sau 3 lần | Cửa khu giữ đóng, toast có nút Thử lại | MSG-12 |
| `E_ASSET_IMAGE` | Ảnh/mô hình riêng của một hiện vật lỗi | Giữ bảng, vẫn tính khám phá | MSG-13 |
| `E_CONTEXT_LOST` | Mất ngữ cảnh WebGL | Theo 4.5 | MSG-04 |
| `E_STORAGE_BLOCKED` | `localStorage` ném lỗi khi đọc/ghi | `kv` chuyển sang `Map` trong bộ nhớ | MSG-11 (1 lần/phiên) |
| `E_PROGRESS_INVALID` | JSON hỏng / sai kiểu / sai version | Dùng mặc định, ghi đè khi lưu lần sau | MSG-10 |
| `E_UNCAUGHT` | `window.onerror`, `unhandledrejection` | `console.error`; nếu đang mở lớp giao diện → đóng lớp, về `playing` | — |
| `E_FELL_OUT` | `y` < sàn − 2 m hoặc ra ngoài hộp bao | `teleport('lobby')` | MSG-08 |

- **Timeout tải:** không đặt timeout cứng cho từng file (file lớn trên mạng chậm vẫn tải được); sau 30 s hiện MSG-03.
- **Idempotency:** `markExplored` và `saveQuiz` gọi lặp không đổi kết quả (tập hợp, lấy max).
- **Bảng trạng thái:** ứng dụng — HLD 4.1 (cài trong `core/transitions.ts`); hiện vật 🎛 — SRS FR-14; phòng về trắc nghiệm — SRS FR-16.

## 6. Bảo mật ở mức thiết kế

| Mối lo | Biện pháp | Nơi cài |
|--------|-----------|---------|
| Chèn HTML/script qua nội dung | Không dùng `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function`; mọi chữ qua `textContent` (`ui/dom.ts`) | toàn bộ `ui/` |
| Dữ liệu `localStorage` bị sửa tay | Parse trong `try/catch`, validate từng trường (mục 1.4), bỏ mã lạ; không dùng giá trị làm selector/đường dẫn | `storage/*` |
| Script bên ngoài, rò rỉ dữ liệu | CSP HLD 7.1 trong `vercel.json`; không dependency runtime ngoài bảng techstack; không gọi mạng ngoài GET asset cùng nguồn | `vercel.json`, review |
| Liên kết ngoài trong credits | `target="_blank" rel="noopener noreferrer"`; chỉ cho `https://` (FR-26) | `ui/credits.ts`, `content/validate.ts` |
| Dependency có lỗ hổng | `npm audit --omit=dev` trước GATE-4 và GATE-5; khóa version bằng `package-lock.json` | CI tay |
| Bản quyền | FR-26 đối chiếu `CREDITS.md`; không đưa PDF/scan vào repo (`.gitignore` chặn `*.pdf`) | script, `.gitignore` |

## 7. Truy vết

| Thành phần | FR / NFR |
|------------|----------|
| `core/*` | FR-01, FR-07 c, FR-21, FR-22 · NFR-01, NFR-02, NFR-04 |
| `content/*`, `scripts/validate-content.ts` | FR-08, FR-13, FR-16, FR-26, FR-27 · NFR-11, NFR-13 |
| `storage/*` | FR-15, FR-16, FR-19, FR-20, FR-22 · NFR-10 |
| `world/*`, `tools/blender/*` | FR-07, FR-08, FR-09, FR-23 · NFR-01, NFR-03 |
| `player/*` | FR-02, FR-04 → FR-07 |
| `exhibits/*` | FR-12 → FR-15 |
| `quiz/*` | FR-16, FR-17 |
| `ui/*` | FR-03, FR-09 → FR-11, FR-18, FR-20 → FR-22, FR-25, FR-27 · NFR-07, NFR-08, NFR-14 |
| `audio/*` | FR-24 |
| `scripts/build-manifest.ts` | FR-01 · NFR-03 |
| `vercel.json` | NFR-09, NFR-12 |
