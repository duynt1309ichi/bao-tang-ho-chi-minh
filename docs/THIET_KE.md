# Thiết kế — Bảo tàng Triết học (góc nhìn thứ 3)

Lấy **cơ chế và cảm giác** của https://hcm-58us.vercel.app (bảo tàng 3D đi bộ, khám phá hiện vật, ngày/đêm), nhưng **nội dung thay hoàn toàn** bằng Giáo trình Triết học Mác – Lênin (2021), xem [NOI_DUNG.md](NOI_DUNG.md). Người chơi điều khiển một **nhân vật ở góc nhìn thứ 3**, đồ họa đẹp hơn.

## 1. So với bản gốc

| Bản gốc | Vấn đề | Bản mới |
|---|---|---|
| Góc nhìn thứ nhất, PointerLockControls, không có nhân vật | Di chuyển như camera bay | Nhân vật có hoạt ảnh, camera bám sau vai |
| Va chạm bằng cách kẹp toạ độ theo từng vùng | Dễ kẹt ở góc | Va chạm capsule với Octree dựng từ hình học tòa nhà |
| Hiện vật chỉ để đọc | Bị động | Có thêm 13 hiện vật tương tác 🎛 (cán cân, bánh răng, ấm nước…) để minh họa khái niệm |
| Bấm vào hiện vật qua tâm ngắm | Phải ngắm đúng | Lại gần → hiện nhắc "E · Xem" |
| Không có kiểm tra kiến thức | — | Phòng ôn tập có trắc nghiệm theo từng phòng |
| Một file `script.js` 170 KB | Khó bảo trì | Chia module (mục 4) |
| Ghi 34 hiện vật nhưng chỉ đặt 32 | Không thể đạt 100% | Số hiện vật đếm từ dữ liệu |

Giữ lại từ bản gốc: sảnh, hành lang có phòng hai bên, popup trước khi vào phòng, bảng thông tin hiện vật, thanh tiến độ, màn hoàn thành, ngày/đêm + pháo hoa (phím N), nhạc nền, điều khiển cảm ứng, toàn màn hình.
Bỏ: phòng chiếu phim YouTube (giáo trình không có phim). Thay bằng **Phòng ôn tập**.

## 2. Gameplay

### Người chơi
- Nhân vật là một sinh viên đến tham quan (chọn nam hoặc nữ ở màn mở đầu).
- Hoạt ảnh: `idle`, `walk`, `run`, `look` (khi xem hiện vật), `interact` (khi thao tác hiện vật 🎛). Chuyển mượt giữa các hoạt ảnh bằng `AnimationMixer`.
- Di chuyển bằng WASD hoặc phím mũi tên, Shift để chạy. Nhân vật xoay theo hướng đi, tính theo hướng camera. Không có nhảy.

### Camera
- Đặt sau vai nhân vật, xoay bằng chuột (pointer lock), cuộn chuột để zoom trong khoảng 1,5–5 m.
- Va chạm camera: raycast từ đầu nhân vật tới camera; nếu gặp tường thì kéo camera vào phía trước tường.
- Chuyển động camera có damping cho mượt; trong phòng hẹp thì tự thu ngắn khoảng cách.
- Phím **V** chuyển sang góc nhìn thứ nhất.

### Không gian và luồng đi
Khuôn viên → sảnh → hành lang dài có 10 phòng xếp xen kẽ hai bên theo đúng thứ tự giáo trình → Phòng ôn tập ở cuối hành lang.
Mỗi chương một **màu chủ đạo** (thảm, viền cửa, biển phòng):
- Khu A (Chương 1, phòng 01–02): đỏ đô.
- Khu B (Chương 2, phòng 03–05): xanh lam đậm.
- Khu C (Chương 3, phòng 06–10): vàng đồng.

Phòng 04 (phép biện chứng, 11 hiện vật) to gấp rưỡi phòng thường, chia ba khu: nguyên lý, phạm trù, quy luật.

### Tương tác hiện vật
- Trong bán kính khoảng 2 m và nhân vật nhìn về phía hiện vật: hiện viền sáng và nhắc **E · Xem** (trên mobile là nút trên màn hình).
- 📜🖼🧊: camera bay tới góc nhìn đẹp, mở bảng thông tin gồm tên, nội dung, câu trích dẫn và trang trong giáo trình. Mô hình 🧊 có thể kéo để xoay.
- 🎛: mỗi hiện vật có một thao tác nhỏ, viết riêng nhưng dùng chung một khuôn (bắt đầu → thao tác → hiện giải thích). Ví dụ: kéo thanh nhiệt độ ấm nước, nghiêng cán cân, xoay bánh răng, chạm vào lưới liên hệ.
- Lần xem đầu tiên được tính là đã khám phá, lưu vào `localStorage`. Khám phá đủ 63/63 thì hiện màn hoàn thành.

### Phòng ôn tập
- Có pano câu hỏi ôn tập của giáo trình và 10 bục trắc nghiệm (mỗi phòng một bục, 3–5 câu nhiều lựa chọn).
- Câu hỏi nằm trong dữ liệu, mỗi câu gắn với `exhibitId`: trả lời sai thì gợi ý quay lại xem hiện vật đó.
- Kết quả hiện trên bản đồ nhỏ: phòng nào đã đúng hết thì được đánh dấu "đã nắm vững".

### HUD
- Góc trên trái: khu vực hiện tại, tiến độ `N/63`.
- Bản đồ nhỏ vẽ từ sơ đồ phòng, tô màu theo chương, đánh dấu phòng đã xong.
- Các nút: âm thanh, ngày/đêm, trợ giúp, toàn màn hình, chất lượng đồ họa.
- Nhấn ESC để tạm dừng: tiếp tục, cài đặt (độ nhạy chuột, đảo trục, chất lượng), xem lại hướng dẫn.

### Âm thanh
Nhạc nền không lời, tiếng bước chân khớp với hoạt ảnh, âm thanh cho hiện vật tương tác (nước sôi, bánh răng, domino), pháo hoa ban đêm.

### Di động
Joystick bên trái để đi, kéo nửa phải màn hình để xoay camera, có nút tương tác. Mặc định chất lượng đồ họa thấp.

## 3. Đồ họa

Phong cách: bảo tàng học thuật trang trọng. Tường sáng màu, sàn đá hoặc gỗ, thảm theo màu chương, đèn rọi riêng vào từng hiện vật, pano chữ dễ đọc.

- Tòa nhà dựng bằng code Three.js nhưng làm kỹ hơn bản gốc: có phào chỉ, cột, khung cửa, vật liệu PBR với texture CC0 (Poly Haven, ambientCG). Xem mục 6 về lựa chọn Blender.
- Môi trường HDRI (Poly Haven) để có phản chiếu; tone mapping `AgX`; màu sRGB.
- Ánh sáng: spotlight cho hiện vật. Chỉ vài đèn gần người chơi được đổ bóng.
- Hậu kỳ dùng thư viện `postprocessing`: SMAA, bloom nhẹ, AO (N8AO), vignette. Tắt hết ở mức chất lượng thấp.
- Ba mức chất lượng Thấp / Trung bình / Cao, khác nhau ở pixel ratio, bóng đổ, hậu kỳ, độ phân giải texture. Tự chọn theo thiết bị và cho đổi trong cài đặt.
- Chữ trên pano: vẽ bằng canvas với font có đủ dấu tiếng Việt (Be Vietnam Pro hoặc Noto Serif), lưu texture sẵn khi build để không phải vẽ lại mỗi lần tải.
- Ngày/đêm: đổi bầu trời, đèn và màu sương. Ban đêm có pháo hoa ngoài khuôn viên (particle `Points` + bloom).

## 4. Kỹ thuật

| Phần | Chọn | Lý do |
|---|---|---|
| Build | Vite + TypeScript | Dev server nhanh, build ra file tĩnh để deploy Vercel |
| 3D | Three.js | Bản gốc cũng dùng; đủ cho toàn bộ dự án |
| Va chạm | `Octree` + `Capsule` có sẵn trong `three/addons` | Không cần engine vật lý: tòa nhà tĩnh, chỉ có một nhân vật |
| Hậu kỳ | `postprocessing` (+ `n8ao`) | Nhanh hơn EffectComposer mặc định |
| Nén asset | `gltf-transform` (meshopt + KTX2) | File GLB nhỏ, tải nhanh |
| UI | HTML/CSS thuần chồng lên canvas | Chỉ có vài popup, không cần React |
| Lưu tiến độ | `localStorage` | Không cần backend |
| Deploy | Vercel | Giống bản gốc |

Không dùng React/R3F, engine vật lý hay state manager. Thêm khi có nhu cầu thật.

### Cấu trúc thư mục dự kiến

```
index.html
src/
  main.ts            renderer, vòng lặp, các trạng thái (menu / chơi / xem hiện vật / tạm dừng)
  world/             dựng tòa nhà từ bảng phòng, Octree, đèn, ngày/đêm, pháo hoa
  player/            nhân vật + hoạt ảnh, điều khiển (bàn phím, chuột, cảm ứng), camera thứ 3
  exhibits/          đặt hiện vật theo dữ liệu, phát hiện ở gần, chế độ xem cận, các hiện vật 🎛
  ui/                HUD, popup, minimap, trắc nghiệm, cài đặt
  data/rooms.ts      danh sách phòng: kích thước, màu chương, vị trí từng hiện vật
  data/exhibits.ts   nội dung lấy từ NOI_DUNG.md
  data/quiz.ts       câu hỏi trắc nghiệm theo phòng
public/assets/       glb, ảnh, hdr, âm thanh
docs/
```

Tòa nhà được **dựng từ dữ liệu** `rooms.ts`: thêm hay bớt phòng không phải sửa code dựng hình.

### Hiệu năng
- Mục tiêu: 60 fps trên laptop GPU tích hợp ở mức Trung bình; tải ban đầu dưới 15 MB, phần còn lại tải dần theo khu.
- Gộp mesh tĩnh, dùng instancing cho ghế và đèn lặp lại, mặc định tắt `castShadow`.

## 5. Tài nguyên & bản quyền

- **Giáo trình có bản quyền** (NXB Chính trị quốc gia Sự thật, 2021). Chỉ tóm tắt bằng lời của mình và trích ngắn, luôn ghi trang. Không đưa file PDF hay ảnh scan lên repo hoặc lên web.
- Chân dung Mác, Ăngghen, Lênin, Hegel, Kant…: dùng ảnh hoặc tranh thuộc phạm vi công cộng trên Wikimedia Commons, ghi nguồn từng ảnh.
- Mô hình 3D (đầu máy hơi nước, cối xay, kính hiển vi, ấm nước, bánh răng…): ưu tiên giấy phép CC0 (Poly Pizza, Quaternius, KayKit); mô hình đơn giản thì tự dựng bằng code. Nguồn CC-BY ghi trong `CREDITS.md`.
- Nhân vật và hoạt ảnh: Quaternius / KayKit (CC0) hoặc Mixamo.
- Không dùng lại file asset của bản gốc.

## 6. Có dùng Blender không?

Mặc định **không**: tòa nhà dựng bằng code từ `rooms.ts`. Blender chưa được cài trên máy và mình không nhìn được viewport, nên làm trong Blender nghĩa là viết script `bpy`, render ảnh để kiểm tra rồi sửa lặp lại. Lợi ích thật của Blender ở dự án này chủ yếu là **bake lightmap** (ánh sáng gián tiếp, bóng mềm). Nếu sau mốc M3 thấy đồ họa còn thiếu chiều sâu thì thêm một bước bake trong Blender cho phần vỏ tòa nhà.

## 7. Lộ trình

| Mốc | Nội dung | Xong khi |
|---|---|---|
| M0 | Khung Vite + TS + Three, deploy lên Vercel | Mở được scene trống qua link Vercel |
| M1 | Dựng tòa nhà từ `rooms.ts` (blockout 10 phòng + sảnh + phòng ôn tập), nhân vật, camera thứ 3, va chạm | Đi được khắp nơi không kẹt, camera không xuyên tường |
| M2 | Hệ thống hiện vật: dữ liệu 63 hiện vật, bảng thông tin, tiến độ, lưu; trắc nghiệm | Khám phá đủ 63/63 và làm được trắc nghiệm |
| M3 | Đồ họa: vật liệu, HDRI, hậu kỳ, pano chữ, mức chất lượng | Ảnh chụp từng phòng đẹp hơn rõ rệt so với bản gốc, ≥ 60 fps ở mức Trung bình |
| M4 | 13 hiện vật tương tác 🎛, ngày/đêm + pháo hoa, âm thanh, minimap | Mọi hiện vật 🎛 thao tác được |
| M5 | Di động, tối ưu tải, rà nội dung với giáo trình, `CREDITS.md` | Chạy được trên điện thoại tầm trung, ghi nguồn đầy đủ |
