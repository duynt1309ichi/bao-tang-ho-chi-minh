# Test Plan — Bảo tàng Triết học

| Phiên bản | v0.1 | Ngày | 2026-10-06 | Trạng thái | DONE |
|-----------|------|------|------------|------------|------|

Căn cứ: [SRS v1.0](../ba/SRS.md) (FR-01…FR-27, NFR-01…NFR-14), [FSD](../ba/FSD.md) (SCR, MSG), [LLD](../sa/LLD.md). Dự án không có backend nên không có `api-spec.md` và không có test API.

## 1. Phạm vi

**Trong phạm vi**
- 27 FR, kiểm theo tiêu chí chấp nhận Given–When–Then của SRS, cộng thêm case biên và case lỗi.
- 14 NFR. Phần đo được trên máy dev thì test ở đây. Phần cần máy thật hoặc người thử thì ghi ở mục 4 là "chờ thiết bị".
- Bản build production (`npm run build`), kiểm toàn vẹn dữ liệu (FR-26) và dependency (`npm audit`).

**Ngoài phạm vi**
- Đo BG-03 bằng bài trắc nghiệm trước/sau tham quan. Việc này làm ngoài app (SRS A-02).
- NFR-06 (≥ 80% người thử tự đi hết). Đo ở buổi UAT B6.
- NFR-12 (link production luôn sẵn sàng). Kiểm ở B6 khi đã deploy.
- Kiểm thử bảo mật chuyên sâu. Thuộc B5 (`docs/security/pentest-report.md`). Ở đây chỉ kiểm các mục NFR-09/10 đo được.

**Các điểm lệch đã ghi trong LLD (không tính là lỗi)**
- BR-S10 (tải dần theo khu, biển "Đang chuẩn bị phòng…", MSG-12): bỏ. Hình học sinh bằng code (ADR-08) nên không có gói khu (LLD 4.2).
- Hoạt ảnh `look`/`interact` (FR-13 bước 1): bỏ. Nhân vật bị ẩn khi xem hiện vật (LLD, `player/character.ts`).

## 2. Chiến lược

| Mức | Cách làm | Công cụ | Ai chạy |
|-----|----------|---------|---------|
| Unit | Hàm thuần: tiến độ, cài đặt, validate dữ liệu, máy trạng thái 🎛, chọn mục tiêu, camera, va chạm, loader | Vitest (`npm test`) | Tự động, chạy trong `npm run build` |
| Toàn vẹn dữ liệu | Luật FR-26 trên 63 hiện vật, 38 câu, asset, `CREDITS.md` | `content/validate.ts` trong build | Tự động |
| Chức năng | Chạy từng TC trên trình duyệt với dev server | Khung Browser của Claude Code, Chrome (Chromium) | Tester (Claude) |
| Hệ thống / phi chức năng | Build production, kích thước gói, request mạng, khóa `localStorage`, `npm audit --omit=dev` | `vite build`, `vite preview`, DevTools | Tester (Claude) |
| Thiết bị thật | FPS, độ ổn định 30 phút, Safari iOS, cảm ứng thật | Laptop Iris Xe, Android tầm trung, iPhone | anh Duy (theo checklist mục 4) |

**Cách đặt tiền điều kiện khi test trên trình duyệt.** Bản dev có móc `window.__museum` (chỉ có khi `import.meta.env.DEV`, không có trong bản build). Tester dùng móc này để dịch chuyển nhân vật tới trước hiện vật, đọc vị trí và đọc trạng thái. Kết quả luôn đọc từ thứ người dùng thấy (chữ trên màn, HUD, `localStorage`), không đọc từ biến nội bộ. Thao tác bàn phím được giả lập bằng `KeyboardEvent`. Thao tác cảm ứng giả lập bằng `PointerEvent` (`pointerType: 'touch'`) ở viewport 812 × 375.

**Giới hạn của test giả lập.** Pointer lock thật, cảm giác điều khiển, âm thanh nghe được và chớp sáng pháo hoa cần người xem trực tiếp. Các TC này ghi rõ "kiểm bằng mắt / tai".

## 3. Môi trường và dữ liệu thử

**Môi trường**
- Máy dev: Windows 11, RTX 3060 Laptop, Node ≥ 24, Chrome bản mới nhất (khung Browser của Claude Code).
- Dev server: `npm run dev` cổng 5173 (`.claude/launch.json`, cấu hình `dev`).
- Bản build: `npm run build` → `dist/`, chạy bằng `npm run preview`.
- UAT: Vercel Preview (làm ở B6; dải port UAT chưa cấp, không cần vì không tự host).

**Ma trận thiết bị (NFR-05)**

| Nền tảng | Trình duyệt | Bắt buộc | Người chạy |
|----------|-------------|:--------:|------------|
| Windows 10/11 | Chrome 2 bản mới nhất | Có | Claude (máy dev) + anh Duy |
| Windows 10/11 | Edge 2 bản mới nhất | Có | anh Duy |
| Windows | Firefox mới nhất | Chạy được, không cần đạt NFR-01 | anh Duy |
| Android tầm trung (Snapdragon 6-series / Helio G9x, RAM 6 GB, 2022+) | Chrome Android | Có | anh Duy |
| iPhone, iOS ≥ 16 | Safari | Có | anh Duy |

**Dữ liệu thử.** Chỉ dùng dữ liệu giả, không có dữ liệu cá nhân (app cũng không thu thập). Các mẫu `localStorage`:

| Mã | Khóa | Giá trị | Dùng cho |
|----|------|---------|----------|
| D-01 | — | `localStorage.clear()` | Người chơi mới |
| D-02 | `bttr.progress.v1` | `abc` | JSON hỏng (FR-19 1b) |
| D-03 | `bttr.progress.v1` | `{"version":2,...}` | Sai `version` (1b) |
| D-04 | `bttr.progress.v1` | `explored` có mã `zz-khong-co` | Mã lạ (1c) |
| D-05 | `bttr.progress.v1` | `quiz.P05.total` khác số câu hiện tại | Bỏ kết quả phòng (1c) |
| D-06 | `bttr.progress.v1` | 62 mã hiện vật, `completedShown: false` | Màn hoàn thành (FR-18) |
| D-07 | `bttr.settings.v1` | `sensitivity: 9` | Ngoài miền → mặc định 1,0 |
| D-08 | `Storage.prototype.setItem` ném lỗi | — | Chặn lưu trữ (FR-19 3a/3b) |

## 4. Tiêu chí vào / ra

**Tiêu chí vào**
- GATE-4 đã nghiệm thu M1–M5 (xong 2026-10-06). `main` chứa M5.
- `npm run build` xanh, gồm 69 unit test và kiểm FR-26.

**Tiêu chí ra (đủ điều kiện báo PO)**
- 100% TC ưu tiên Cao đã chạy. Mọi TC còn lại đã chạy hoặc ghi rõ lý do Blocked.
- Không còn lỗi Blocker hoặc Critical đang mở.
- Mọi lỗi Major đã sửa, hoặc anh Duy quyết định chấp nhận và ghi vào PROJECT_STATE.
- Các NFR cần máy thật (NFR-01, 02, 04, 05) có kết quả đo, hoặc anh Duy chấp nhận dời sang UAT B6.

**Checklist cho anh Duy chạy trên máy thật** (ghi kết quả vào test-report mục 3)
1. NFR-01: laptop Iris Xe, Chrome, 1920 × 1080, mức Trung bình. Đi qua mọi khu, mỗi khu 60 giây, ghi FPS trung bình và FPS phân vị 5% (DevTools → Performance, hoặc `chrome://tracing`).
2. NFR-02: Android tầm trung, mức Thấp, như trên. Ngưỡng ≥ 30 FPS.
3. NFR-04: trên máy Android đó, chơi liên tục 30 phút: đi hết 10 phòng, mở 63 hiện vật, làm 10 trạm. Không crash, không tự tải lại, không mất ngữ cảnh.
4. NFR-05: Safari iOS 16+, Edge, Firefox. Chạy luồng TC-SMOKE (mục 5 của test-cases).
5. FR-06 trên điện thoại thật: joystick + xoay cùng lúc, chụm zoom, nút Xem, gợi ý xoay ngang.

## 5. Mức lỗi

| Mức | Định nghĩa trong dự án này |
|-----|----------------------------|
| Blocker | Lỗi chặn theo SRS: kẹt không thoát được, crash, màn hình đen, popup không đóng được; hoặc không vào được bảo tàng |
| Critical | Mất hoặc sai tiến độ đã lưu; sai nội dung giáo trình; một FR ưu tiên Cao không dùng được |
| Major | Thiếu hoặc sai hẳn một luồng/tiêu chí chấp nhận của FR, nhưng người dùng vẫn đi tiếp được |
| Minor | Sai chữ, sai thời gian nhỏ, lệch giao diện không ảnh hưởng chức năng |

## 6. Đo độ phủ

Mỗi TC trong `test-cases.md` ghi FR/NFR mà nó kiểm. Độ phủ tính ở `test-cases.md` mục 4: FR có ít nhất 1 TC, có case biên, có case lỗi. Kết quả và danh sách lỗi ghi ở `test-report.md`.

## 7. Rủi ro

| Rủi ro | Ảnh hưởng | Cách giảm |
|--------|-----------|-----------|
| Chưa có Iris Xe / Android / iPhone để đo | NFR-01, 02, 04, 05 chưa có số | Checklist mục 4 cho anh Duy; nếu không có máy thì dời sang UAT B6 |
| Thao tác giả lập khác thao tác thật (pointer lock, cảm ứng nhiều ngón) | Bỏ sót lỗi cảm giác điều khiển | TC đánh dấu "kiểm bằng mắt", chạy lại trên máy thật |
| Khung Browser bị ẩn thì trang ngừng vẽ (rAF dừng) | TC trên trình duyệt treo | Giữ khung Browser mở khi chạy test |
