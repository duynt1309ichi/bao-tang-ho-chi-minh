# Test Report — Bảo tàng Triết học

| Phiên bản | v0.2 (vòng 2) | Ngày | 2026-10-06 | Trạng thái | DONE — sạch lỗi, chờ đo trên máy thật |
|-----------|---------------|------|------------|------------|------------------------|

- **Bản được test:** vòng 1 trên `main` tại `9f0b780` (M1–M5 đã nghiệm thu GATE-4); vòng 2 trên nhánh `fix/qa-round1` (sửa 5 lỗi).
- **Môi trường:** Windows 11, Chrome trong khung Browser của Claude Code, dev server cổng 5173; build production `npm run build`.
- **Căn cứ:** [test-plan](test-plan.md), [test-cases](test-cases.md).

## 1. Tóm tắt

| Vòng | Tổng TC | Pass | Fail | Blocked | Tỉ lệ đạt (trên số đã chạy) |
|------|:-------:|:----:|:----:|:-------:|:---------------------------:|
| 1 | 124 | 107 | 7 | 10 | 93,9% (107/114) |
| 2 | 124 | 115 | 0 | 9 | 100% (115/115) |

- **Unit test:** 72/72 xanh (15 file; vòng 2 thêm test xoay mô hình và `storage/kv`). **Build:** xanh, kiểm FR-26 đạt. **`npm audit --omit=dev`:** 0 lỗ hổng.
- **Lỗi:** vòng 1 tìm 5 lỗi (2 Major, 3 Minor). Vòng 2: cả 5 đã sửa và kiểm lại đạt, không phát sinh lỗi mới ở phần regression.
- **Độ phủ:** 27/27 FR có TC; 12/14 NFR có TC (NFR-06, NFR-12 đo ở UAT B6).
- **Kết luận:** phần chức năng đạt tiêu chí ra (test-plan mục 4): 0 Blocker, 0 Critical, 0 Major. Còn 9 TC Blocked, chủ yếu là phép đo trên máy thật (NFR-01, 02, 04, 05). Mục 4 ghi cách gỡ; anh Duy chạy checklist hoặc quyết định dời sang UAT B6.

## 2. Danh sách lỗi

| ID | Mức | FR | Tóm tắt | TC | Trạng thái |
|----|-----|----|---------|----|-----------|
| BUG-01 | Major | FR-09 | Chưa có popup vào phòng (SCR-06) và toast MSG-05 | TC-FR09-01 → 04 | Đã sửa, kiểm lại đạt (V2) |
| BUG-02 | Major | FR-13 2a | Chưa có khung xoay mô hình 🧊 và nút "Đặt lại góc" (23 hiện vật) | TC-FR13-03 | Đã sửa, kiểm lại đạt (V2) |
| BUG-03 | Minor | FR-10 | Bấm M khi bản đồ phóng to đang mở không thu nhỏ được | TC-FR10-03 | Đã sửa, kiểm lại đạt (V2) |
| BUG-04 | Minor | FR-21 b | Ẩn tab không mở menu tạm dừng khi chưa khóa con trỏ | TC-FR21-03 | Đã sửa, kiểm lại đạt (V2) |
| BUG-05 | Minor | FR-19 3b | Ghi cài đặt thất bại không hiện MSG-11 | TC-FR19-06 | Đã sửa, kiểm lại đạt (V2) |

**Cách sửa (nhánh `fix/qa-round1`)**
- BUG-01: thêm `ui/roomPopup.ts` (SCR-06, cả phòng ôn tập). `main.ts` mở popup khi nhân vật bước vào một phòng chưa vào trong phiên, vào lại thì hiện toast MSG-05. "Quay lại"/ESC lùi 1 m về phía vừa đi vào.
- BUG-02: mô hình 🧊 tách khỏi khối hình gộp thành mesh riêng (`world/geometry.ts` `ModelPart`, `world/blockout.ts` `models`). Thêm `exhibits/viewer.ts` (`modelRotator`, `clampModelPitch`). Bảng hiện vật cho kéo trên khung 3D để xoay và có nút "Đặt lại góc"; đóng bảng thì trả mô hình về góc cũ. `scripts/bake-scene.ts` vẫn xuất mô hình làm vật đổ bóng nên lightmap bake lại cho kết quả như cũ.
- BUG-03: lớp bản đồ đánh dấu phím M đã dùng (`preventDefault`); bộ nghe phím ở `main.ts` bỏ qua sự kiện đã được dùng.
- BUG-04: `main.ts` nghe `visibilitychange`, tab ẩn khi đang chơi thì mở menu tạm dừng.
- BUG-05: `storage/kv.ts` gọi `onFail` ở lần đọc/ghi lỗi đầu tiên (cả tiến độ lẫn cài đặt); `main.ts` hiện MSG-11 từ đó.

## Chi tiết lỗi (vòng 1)

### BUG-01 — Chưa có popup vào phòng (FR-09, SCR-06)
- **Tái lập:** phiên mới → đứng ở hành lang (5, 0, 0) → đi vào Phòng 01. Làm tương tự với phòng ôn tập.
- **Kỳ vọng:** nhân vật dừng; popup "Phòng 01 · Chương 1 — <tên>", "Giáo trình tr.<từ>–<đến>", "Đã khám phá k/n hiện vật", nút "Quay lại" và "Đi vào phòng →". Vào lại trong phiên thì chỉ hiện toast MSG-05 3 giây. Phòng ôn tập có popup riêng (FR-09 1b).
- **Thực tế:** nhân vật đi thẳng vào; chỉ nhãn khu vực trên HUD đổi. Không có popup, không có toast.
- **Nguyên nhân:** chưa có module `ui/roomPopup` (FSD SCR-06, LLD). `main.ts` chỉ cập nhật `areaLabel` khi đổi khu.
- **Ảnh hưởng:** người dùng không thấy số trang giáo trình và số hiện vật đã khám phá của phòng khi bước vào. Ảnh hưởng BG-02 (tự định hướng).

### BUG-02 — Chưa có khung xoay mô hình 🧊 (FR-13 2a)
- **Tái lập:** mở hiện vật `b5-thuc-tien` (hoặc bất kỳ hiện vật loại `model` nào, có 23 cái).
- **Kỳ vọng:** khung xem mô hình cạnh bảng thông tin; kéo chuột hoặc ngón để xoay ngang 360°, dọc trong [−30°, +30°]; nút "Đặt lại góc". FSD SCR-07 element 9; LLD `exhibits/viewer.ts` với `rotate()`, `clampModelPitch()`.
- **Thực tế:** bảng chỉ có phần chữ, giống hiện vật 📜. Không có `exhibits/viewer.ts`.
- **Ảnh hưởng:** tiêu chí chấp nhận thứ 3 của FR-13 không đạt. Hiện vật 🧊 không khác 📜 khi mở bảng.

### BUG-03 — Phím M không thu nhỏ bản đồ (FR-10 BR-S08)
- **Tái lập:** đang chơi → bấm M (mở bản đồ phóng to) → bấm M lần nữa.
- **Kỳ vọng:** bản đồ thu nhỏ.
- **Thực tế:** bản đồ vẫn phóng to. Phần tử bản đồ bị thay bằng phần tử mới, tức là đóng rồi mở lại ngay. ESC và nút ✕ vẫn đóng được.
- **Nguyên nhân:** cùng một sự kiện `keydown` đi qua hai bộ nghe. Bộ nghe của lớp phủ (`ui/minimap.ts`, `onKey` KeyM) đóng bản đồ trước. Sau đó bộ nghe ở `main.ts:295` thấy `overlayOpen()` là false nên gọi `openMap()` lại.

### BUG-04 — Ẩn tab không tự mở menu tạm dừng (FR-21 b)
- **Tái lập:** cảm ứng (hoặc máy tính chưa bấm vào khung 3D) → đang chơi → chuyển sang tab khác → quay lại.
- **Kỳ vọng:** đang ở menu tạm dừng, nhạc đã dừng.
- **Thực tế:** không có menu. Nhạc có dừng khi tab ẩn (Web Audio `suspend`), phím đang giữ được thả. Trên máy tính đã khóa con trỏ thì menu vẫn mở, nhờ sự kiện `pointerlockchange`.
- **Nguyên nhân:** `main.ts` không nghe `visibilitychange` để gọi `openMenu()`.

### BUG-05 — Ghi cài đặt thất bại không báo MSG-11 (FR-19 3b)
- **Tái lập:** đang chơi → làm `localStorage.setItem` ném `QuotaExceededError` → bật/tắt ngày đêm hoặc đổi cài đặt.
- **Kỳ vọng:** MSG-11 hiện một lần trong phiên.
- **Thực tế:** không có thông báo. MSG-11 chỉ hiện khi tiến độ thay đổi, vì việc kiểm `kv.failed` nằm trong `renderProgress` (`main.ts:141`), chỉ chạy qua `progress.onChange`.
- **Ảnh hưởng:** thấp. Lỗi ghi tiến độ vẫn được báo. Trường hợp chặn lưu ngay từ đầu (3a) báo đúng.

## 3. Kết quả phi chức năng

| NFR | Kết quả | Ghi chú |
|-----|---------|---------|
| NFR-01 FPS máy tính | Chưa đo (Blocked) | Cần laptop Iris Xe. Máy dev RTX 3060 không đại diện |
| NFR-02 FPS điện thoại | Chưa đo (Blocked) | Cần Android tầm trung |
| NFR-03 Tải trang | Dung lượng **Pass** (4,6 MB ≤ 15 MB); thời gian chưa đo | Ước tính ~2 s truyền ở 20 Mbps. Đo bằng DevTools throttling trên Vercel Preview ở B6 |
| NFR-04 Ổn định 30 phút | Chưa đo (Blocked) | Trên máy dev cả phiên test không có lỗi JS chưa bắt. Lỗi console duy nhất là lỗi tải cố ý ở TC-FR01-02 |
| NFR-05 Tương thích | Chrome Windows **Pass**; các trình duyệt khác chưa thử | Luồng smoke ở test-cases mục 5 |
| NFR-07 Khả năng đọc | **Pass** | 16 px nội dung, 14 px HUD, tương phản 15,9 : 1 và 8,75 : 1 |
| NFR-08 Bàn phím | **Pass** | Viền focus 2 px, Tab giữ trong lớp, ESC đóng đúng lớp |
| NFR-09 Bảo mật | **Pass** phần rà mã | CSP, không HTML thô, 0 lỗ hổng. Header thật kiểm ở B5 |
| NFR-10 Quyền riêng tư | **Pass** | Chỉ request cùng nguồn và `blob:`; chỉ 2 khóa `localStorage` |
| NFR-11 Bản quyền | **Pass** | |
| NFR-13 Bảo trì nội dung | **Pass** | |
| NFR-14 Ngôn ngữ | **Pass** | |

## 4. TC bị Blocked và cách gỡ

| TC | Lý do | Cách gỡ |
|----|-------|---------|
| TC-FR05-06, TC-FR25-01 | Khung Browser nhúng: không có chuột thật để kéo khi pointer lock bị từ chối; không vào được toàn màn hình | anh Duy thử trên Chrome thật (2 phút) |
| TC-FR06-07, TC-NFR01-01, TC-NFR02-01, TC-NFR04-01, TC-NFR05-02 | Chưa có thiết bị | Checklist test-plan mục 4. Nếu không có máy thì dời sang UAT B6 |
| TC-NFR03-02 | Cần đo trên host thật có băng thông giới hạn | Đo trên Vercel Preview ở B6 |
| TC-FR13-08 | Ưu tiên thấp, chưa dựng được ảnh lỗi | Chạy ở vòng 2 |

## 5. Ghi chú (không tính là lỗi)

- Dòng gợi ý "Xem lại" có thêm biểu tượng ⚑ phía trước so với chữ trong SRS FR-17. Nội dung đúng.
- Dòng nguồn "Giáo trình … tr.x" trong bảng hiện vật cỡ 14 px. NFR-07 yêu cầu chữ nội dung ≥ 16 px; dòng này là chú thích nguồn nên tester coi là đạt. Designer xem lại nếu muốn chặt hơn.
- BR-S10 (tải dần theo khu) và hoạt ảnh `look` đã được bỏ có ghi trong LLD, nên không test.
- Build cảnh báo chunk JS 1,17 MB (387 KB gzip). Không vi phạm NFR-03.

## 6. Đề xuất

1. Trình anh Duy nghiệm thu chức năng (GATE-4) cho bản sau sửa lỗi, rồi merge `fix/qa-round1` vào `main`.
2. anh Duy chạy checklist máy thật (test-plan mục 4), hoặc quyết định dời NFR-01, 02, 04, 05 và TC-NFR03-02 sang UAT B6.
3. Sang B5: security-engineer làm `docs/security/pentest-report.md`.
