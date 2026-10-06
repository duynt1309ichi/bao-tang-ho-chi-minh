# Test Cases — Bảo tàng Triết học

| Phiên bản | v1.0 | Ngày | 2026-10-06 | Trạng thái | DONE — đã chạy vòng 1 |
|-----------|------|------|------------|------------|------------------------|

## 1. Phạm vi và nguồn suy test case

Phủ 27 FR và 14 NFR của [SRS v1.0](../ba/SRS.md). Mỗi tiêu chí chấp nhận Given–When–Then có ít nhất 1 TC (đánh dấu **AC** ở cột FR). Có thêm case biên và case lỗi theo luồng thay thế của SRS và thông báo MSG của [FSD](../ba/FSD.md). Dự án không có backend nên không có TC cho endpoint.

Chạy trên bản `main` sau khi merge M5 (`9f0b780`), dev server cổng 5173, Chrome trong khung Browser của Claude Code. Cách đặt tiền điều kiện: xem [test-plan](test-plan.md) mục 2.

## 2. Quy ước

- **TC-ID:** `TC-FR<số>-<số>`, `TC-NFR<số>-<số>`.
- **Trạng thái:** Pass / Fail / Blocked (chưa chạy được vì thiếu thiết bị hoặc môi trường) / N/A.
- **Mức lỗi:** Blocker / Critical / Major / Minor (định nghĩa ở test-plan mục 5). Chỉ ghi khi Fail.
- **"GATE-4 Mx"** ở cột kết quả: TC đã chạy và được anh Duy nghiệm thu ở mốc đó; vòng này không có thay đổi mã liên quan nên không chạy lại.

## 3. Bảng test case

### Khởi động (FR-01 → FR-03)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR01-01 | FR-01 AC 1a | Trình duyệt không có WebGL2 | 1) Mở URL | `getContext('webgl2')` trả null | Màn MSG-01 đúng chữ, không màn đen | Đúng MSG-01, tiêu đề "Không hỗ trợ WebGL2" | Pass | |
| TC-FR01-02 | FR-01 AC 2a | Chặn file `characters/nam.glb` | 1) Mở URL; 2) chờ; 3) bỏ chặn; 4) bấm "Thử lại" | fetch GLB lỗi mạng | Thử 3 lần cách 2 s → MSG-02 + "Thử lại"; thử lại chỉ tải file thiếu → màn mở đầu | Gọi lúc 0,2 / 2,2 / 4,2 s → MSG-02; "Thử lại" vào màn mở đầu, `sky.webp` không tải lại | Pass | |
| TC-FR01-03 | FR-01 AC (đã có tiến độ) | Tiến độ 12/63 | 1) Tải lại trang | D-06 rút gọn | "Tiếp tục tham quan →" + "Đã khám phá 12/63 hiện vật" | Đúng cả hai dòng | Pass | |
| TC-FR01-04 | FR-01 bước 4 | Người chơi mới | 1) Mở URL | D-01 | Dòng "BẢO TÀNG SỐ · KHÔNG GIAN 3D", tiêu đề, đoạn giới thiệu, nút "Bắt đầu tham quan →" | Đúng | Pass | |
| TC-FR01-05 | FR-01 2b (biên 30 s) | GLB treo không trả về | 1) Mở URL; 2) chờ 25 s; 3) chờ tới 32 s; 4) cho tải tiếp | — | 25 s chưa có MSG-03; sau 30 s có MSG-03, vẫn tải tiếp | 25 s: không có; 32 s: "Mạng đang chậm, vui lòng chờ thêm…" ở 80%; nhả file → màn mở đầu | Pass | |
| TC-FR01-06 | FR-01 (*) mất ngữ cảnh | Đang chơi | 1) `WEBGL_lose_context.loseContext()`; 2) chờ 6 s; 3) `restoreContext()` | — | MSG-04; quá 5 s có "Tải lại trang"; khôi phục thì chơi tiếp | Đúng cả 3 bước | Pass | |
| TC-FR01-07 | FR-01 bước 5 | Người chơi cũ | 1) "Tiếp tục tham quan" | — | Nhân vật ở sảnh, vào chơi ngay | Ở (-7, 0, 0), khu "Sảnh" | Pass | |
| TC-FR02-01 | FR-02 AC | Lần chơi đầu | 1) "Bắt đầu"; 2) chọn "Nữ"; 3) "Chọn"; 4) tải lại | D-01 | Nhân vật nữ; tải lại vẫn nữ, không hỏi lại | `character: "nu"`, tải lại vào thẳng màn mở đầu "Tiếp tục" | Pass | |
| TC-FR02-02 | FR-02 bước 1 (mặc định) | Lần chơi đầu | 1) "Bắt đầu"; 2) bấm "Chọn" ngay | D-01 | Mặc định Nam | `character: "nam"` | Pass | |
| TC-FR02-03 | FR-02 2a | Đang chơi | 1) Cài đặt → Nhân vật → Nam | — | Đổi mô hình ngay, giữ vị trí và tiến độ | Mô hình đổi, vị trí (11.29, 0, -9.5) giữ nguyên | Pass | |
| TC-FR03-01 | FR-03 bước 1 (máy tính) | Lần chơi đầu, chuột | 1) Chọn nhân vật | D-01 | Hướng dẫn phím WASD/Shift/Chuột/Cuộn/E/V/N/M/ESC | Đúng 9 dòng | Pass | |
| TC-FR03-02 | FR-03 AC (điện thoại) | Lần chơi đầu, `pointer: coarse`, 740 × 360 | 1) Chọn nhân vật; 2) "Đã hiểu"; 3) tải lại | D-01 | Hướng dẫn cảm ứng, không có phím; tải lại không tự hiện | 4 dòng cảm ứng; tải lại không hiện | Pass | |
| TC-FR03-03 | FR-03 1a | Đã xem hướng dẫn | 1) Bấm "?" trên HUD; 2) "Đã hiểu" | — | Hiện cùng nội dung, `tutorialSeen` không đổi | Đúng | Pass | |

### Di chuyển và camera (FR-04 → FR-07)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR04-01 | FR-04 AC | Đứng ở khuôn viên, camera sau lưng | 1) Giữ W 5 s | — | Đi 10 m ± 0,5 m | 10,06 m (2,0 m/s đều mỗi giây) | Pass | |
| TC-FR04-02 | FR-04 AC 1d | Đang giữ W | 1) Cửa sổ `blur` | — | Nhân vật đứng yên | Dịch chuyển 0,000 m sau blur | Pass | |
| TC-FR04-03 | FR-04 1a (biên chéo) | Ở sảnh | 1) Giữ W + D 1 s | — | Tốc độ bằng đi thẳng | 2,01 m/s | Pass | |
| TC-FR04-04 | FR-04 1b | Ở sảnh | 1) Giữ W + S 1 s | — | Đứng yên | 0,000 m | Pass | |
| TC-FR04-05 | FR-04 bước 2 | Ở sảnh | 1) Kéo joystick > 60% (cùng hàm `Player.update` với Shift) | — | 4,5 m/s | 4,53 m/s | Pass | |
| TC-FR04-06 | FR-04 1c | Đang mở bảng hiện vật | 1) Giữ W 0,8 s | — | Nhân vật không đi | 0 m | Pass | |
| TC-FR04-07 | FR-04 hoạt ảnh | Đang chơi | Đi, chạy, dừng | — | idle / walk / run, cross-fade 0,2 s | GATE-4 M5 | Pass | |
| TC-FR05-01 | FR-05 AC (biên zoom) | Khoảng cách 3 m | 1) Cuộn ra 40 nấc; 2) cuộn vào 40 nấc | — | Dừng ở 5 m và 1,5 m | 3 → 5 → 1,5 | Pass | |
| TC-FR05-02 | FR-05 bước 4, 3a | Góc nhìn thứ 3, 4,5 m | 1) V; 2) cuộn; 3) V | — | Góc nhìn thứ nhất, ẩn nhân vật, cuộn không tác dụng; V lại về 4,5 m | Đúng | Pass | |
| TC-FR05-03 | FR-05 bước 2 (biên dọc) | Đang chơi | 1) Xoay dọc hết lên; 2) hết xuống | — | Kẹp trong [−60°, +60°] | −60° / +60° | Pass | |
| TC-FR05-04 | FR-05 AC 2a | Đứng sát tường sau của 10 phòng, lưng quay vào tường, camera 5 m | 1) Đặt camera ra sau | — | Camera không ra ngoài tường | Camera trong phòng ở cả 10 phòng (z ≈ ±11,6 trong khi tường ở ±12) | Pass | |
| TC-FR05-05 | FR-05 2b | — | 1) Bật "Đảo trục dọc" | — | Hướng xoay dọc đảo | `invertY = true`, áp dụng ngay | Pass | |
| TC-FR05-06 | FR-05 1b | Pointer lock bị từ chối | 1) Giữ chuột trái và kéo | Chuột thật | Vẫn xoay được | Cần chuột thật — đưa vào checklist máy thật | Blocked | |
| TC-FR06-01 | FR-06 AC 1a, 1b | 740 × 360, cảm ứng | 1) Ngón 1 kéo joystick lên; 2) ngón 2 kéo nửa phải sang trái; 3) nhấc ngón 1 | PointerEvent touch | Vừa đi vừa xoay; nhấc ngón là dừng ngay | Đi 2,21 m, xoay 0,4 rad cùng lúc; sau khi nhấc: 0 m | Pass | |
| TC-FR06-02 | FR-06 bước 1 (biên 60%) | Như trên | 1) Kéo 45% bán kính; 2) kéo 89% | — | ≤ 60% đi, > 60% chạy | ≈ 2,2 m/s và 4,53 m/s | Pass | |
| TC-FR06-03 | FR-06 bước 3 | Như trên | 1) Hai ngón nửa phải mở rộng 100 px | — | Zoom lại gần | 3 m → 1,75 m | Pass | |
| TC-FR06-04 | FR-06 bước 4 | Đứng trước `a2-mac` | 1) Bấm "Xem" | — | Nút chỉ hiện khi có mục tiêu, mở bảng | Nút 74 × 64 px hiện, lời nhắc phím ẩn; mở bảng có chân dung | Pass | |
| TC-FR06-05 | FR-06 (*) màn dọc | 375 × 812 | 1) Đóng bảng; 2) "Vẫn chơi màn dọc" | — | Lớp gợi ý xoay ngang; bấm thì ẩn | Đúng | Pass | |
| TC-FR06-06 | FR-06 BR-S03 | 740 × 360 | Đo nút HUD | — | ≥ 44 × 44 px | 5 nút đều 44 × 44 | Pass | |
| TC-FR06-07 | FR-06 trên máy thật | Điện thoại Android, iPhone | Chạy lại TC-FR06-01 → 05 bằng ngón tay | — | Như trên | Chưa có máy | Blocked | |
| TC-FR07-01 | FR-07 AC | 10 vị trí: tường sau P01, P02, P07; tường bên P03, P04, P09; góc P06; tường sảnh; tường hành lang giữa 2 cửa; tường cuối phòng ôn tập | 1) Chạy thẳng vào tường 2 s (≈ 9 m) | — | Không lần nào ra khỏi khu | 10/10 vẫn ở đúng khu | Pass | |
| TC-FR07-02 | FR-07 AC b | Ở P07, 12/63 | 1) Menu → "Về sảnh" | — | Ở sảnh ≤ 1 s, tiến độ không đổi | Ở sảnh sau 0,3 s, vẫn 12/63 | Pass | |
| TC-FR07-03 | FR-07 a (lỗi) | — | 1) Đặt nhân vật ra ngoài khuôn viên (200, 0, 200) | — | Về sảnh + "Đã đưa bạn về sảnh." | Đúng | Pass | |
| TC-FR07-04 | FR-07 c | — | Khung hình > 100 ms | — | Chia bước ≤ 1/60 s hoặc bỏ bước thừa | Unit test `core/loop.test.ts` | Pass | |

### Không gian và định hướng (FR-08 → FR-11)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR08-01 | FR-08 AC | — | 1) Xem bản đồ phóng to; 2) đi dọc hành lang đọc biển | — | P01 → P10 xen kẽ hai bên, màu đúng khu, phòng ôn tập ở cuối | Đúng thứ tự và màu trên bản đồ; biển cửa: GATE-4 M3 | Pass | |
| TC-FR08-02 | FR-08 BR-S06 | — | Đo P04 | `layout.json` | ≥ 1,5 lần phòng thường | 15 × 10 m so với 10 × 10 m | Pass | |
| TC-FR08-03 | FR-08 BR-S07 | Ở sảnh | Xem pano chào, sơ đồ, bảng "Về giáo trình" | — | Có đủ 3 đối tượng, không tính là hiện vật | GATE-4 M3 | Pass | |
| TC-FR09-01 | FR-09 AC | Phiên mới | 1) Đi từ hành lang (5, 0, 0) vào P01 | — | Dừng nhân vật, popup "Phòng 01 · Chương 1 — …", "Giáo trình tr.…", "k/n", "Quay lại" / "Đi vào phòng" | Không có popup; nhân vật đi thẳng vào, chỉ nhãn HUD đổi | Fail | Major (BUG-01) |
| TC-FR09-02 | FR-09 1a | Đã vào P01 trong phiên | 1) Ra hành lang; 2) vào lại | — | Toast MSG-05 3 s | Không có toast | Fail | Major (BUG-01) |
| TC-FR09-03 | FR-09 2a | Popup đang mở | 1) "Quay lại" hoặc ESC | — | Đóng, lùi 1 m | Không chạy được vì không có popup | Blocked | (BUG-01) |
| TC-FR09-04 | FR-09 1b | — | 1) Vào phòng ôn tập | — | Popup "Phòng ôn tập" + dòng mô tả | Không có popup | Fail | Major (BUG-01) |
| TC-FR10-01 | FR-10 AC | Đủ 7/7 hiện vật P01, P01 đúng 4/4 | 1) Bấm M | — | P01 có ✓ và ★ | P01 ✓ ★ | Pass | |
| TC-FR10-02 | FR-10 + FR-17 | Sai câu gắn `b4-luong-chat` | 1) Mở bản đồ; 2) mở lại hiện vật; 3) mở bản đồ | — | P04 có ◎; mở lại hiện vật thì mất ◎ | ◎ ở P04, P05; mở lại thì gợi ý bị xóa | Pass | |
| TC-FR10-03 | FR-10 BR-S08 (thu nhỏ bằng M) | Bản đồ phóng to đang mở | 1) Bấm M (phím thật) | — | Bản đồ thu nhỏ | Bản đồ đóng rồi mở lại ngay trong cùng một lần bấm, vẫn đang phóng to | Fail | Minor (BUG-03) |
| TC-FR10-04 | FR-10 BR-S08 | Bản đồ phóng to đang mở | 1) ESC | — | Thu nhỏ, không mở menu | Đúng | Pass | |
| TC-FR11-01 | FR-11 AC | 4/63 | 1) Mở hiện vật thứ 5; 2) đóng | — | HUD "5/63" | "5/63" | Pass | |
| TC-FR11-02 | FR-11 quy tắc | — | 1) Mở bảng / menu / trắc nghiệm | — | HUD ẩn | `hud.hidden = true` | Pass | |
| TC-FR11-03 | FR-11 tên khu | — | Đi qua các khu | — | "Khuôn viên", "Sảnh", "Hành lang", "Phòng 0X — <tên>" | Đúng ở 4 loại khu đã qua | Pass | |

### Hiện vật (FR-12 → FR-15)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR12-01 | FR-12 AC | Cách `b3-dinh-nghia` 1,5 m | 1) Mặt hướng về hiện vật; 2) quay lưng | — | Có viền + lời nhắc; quay lưng thì mất lời nhắc của hiện vật đó | Có "E Xem Định nghĩa vật chất…"; quay lưng → nhắc hiện vật đối diện "Từ nguyên tử đến điện tử" | Pass | |
| TC-FR12-02 | FR-12 AC (biên 2 m) | Mặt hướng về hiện vật | 1) Đứng 1,69 m; 2) 2,3 m; 3) 2,5 m | — | ≤ 2 m có, > 2 m không | Có / không / không | Pass | |
| TC-FR12-03 | FR-12 BR-S09 | Hiện vật đã khám phá | Đứng gần | — | Lời nhắc có ✓ | "… ✓" | Pass | |
| TC-FR12-04 | FR-12 a | Không có mục tiêu | 1) Bấm E | — | Không làm gì | Không mở lớp nào | Pass | |
| TC-FR13-01 | FR-13 AC | 0/63 | 1) Mở `b3-dinh-nghia`; 2) đóng | — | Đúng tên, trích dẫn, "tr.128–134"; toast MSG-06; HUD 1/63 | Đúng; toast "Đã khám phá: Định nghĩa vật chất của Lênin (1/63)" | Pass | |
| TC-FR13-02 | FR-13 AC | Đã mở `b3-dinh-nghia` | 1) Mở lại | — | HUD vẫn 1/63, không toast | Đúng | Pass | |
| TC-FR13-03 | FR-13 AC 2a | Hiện vật 🧊 `b5-thuc-tien` | 1) Mở; 2) kéo chuột lên hết; 3) "Đặt lại góc" | — | Khung xoay mô hình, dừng ở +30°, có nút "Đặt lại góc" | Bảng chỉ có chữ: không có khung xoay, không có nút. Ảnh hưởng 23 hiện vật 🧊 | Fail | Major (BUG-02) |
| TC-FR13-04 | FR-13 bước 4 | Bảng đang mở | Đóng bằng ✕, ESC, E (lần lượt) | — | Đóng, mở lại điều khiển, không mở menu | Đúng cả 3 cách | Pass | |
| TC-FR13-05 | FR-13 2c | — | 1) Mở `a2-mac` | — | Ảnh chân dung + nguồn ảnh, giấy phép | Ảnh 480 px, "Ảnh: John Jabez Edwin Mayall, 1875 · phạm vi công cộng · Wikimedia Commons" | Pass | |
| TC-FR13-06 | FR-13 bước 2 (minh họa) | — | 1) Mở `b4-luong-chat` tới Hoàn thành | — | Nhãn "(minh họa)" | Có | Pass | |
| TC-FR13-07 | FR-13 điện thoại | 375 × 812 | 1) Mở bảng; 2) bấm tay kéo | — | Bảng 60% dưới; tay kéo mở toàn màn | 0,60 chiều cao; mở rộng 796/812 px | Pass | |
| TC-FR13-08 | FR-13 MSG-13 (lỗi ảnh) | Ảnh chân dung lỗi | Mở bảng | — | "Không tải được hình ảnh.", bảng vẫn mở | Chưa chạy (ưu tiên thấp; có mã xử lý `img.onerror`) | Blocked | |
| TC-FR14-01 | FR-14 AC | `b4-luong-chat` Sẵn sàng | 1) "Bắt đầu"; 2) kéo 99 °C; 3) kéo 100 °C | Thanh 20–100, bước 1 | 99 °C chưa sôi; 100 °C → Hoàn thành, có "điểm nút", "bước nhảy" | 99 °C: "lượng đổi, nước vẫn là nước"; 100 °C: Hoàn thành + nội dung đầy đủ | Pass | |
| TC-FR14-02 | FR-14 AC | `b4-nhan-qua` chưa khám phá | 1) Mở; 2) đóng ngay | — | Đã tính khám phá | 2/63 → 3/63 | Pass | |
| TC-FR14-03 | FR-14 AC 3a | `c9-bay-cot` Đang thao tác | 1) "Xem giải thích luôn" | — | Sang Hoàn thành | Đúng | Pass | |
| TC-FR14-04 | FR-14 4a | `c9-bay-cot` Đang thao tác | 1) Đóng; 2) mở lại | — | Bắt đầu từ Sẵn sàng | Có nút "Bắt đầu" | Pass | |
| TC-FR14-05 | FR-14 bước 5 | Hoàn thành | 1) "Làm lại" | — | Về Sẵn sàng | Đúng | Pass | |
| TC-FR14-06 | FR-14 bảng 13 hiện vật | — | Điều kiện hoàn thành của 13 hiện vật | — | Đúng bảng FR-14 | Unit test `interactive.test.ts` + GATE-4 M4 | Pass | |
| TC-FR15-01 | FR-15 AC | 62/63 | 1) Mở hiện vật còn lại | D-06 | 63/63, không đếm trùng | 62 → 63; mở lại hiện vật cũ không tăng; unit test `progress.test.ts` | Pass | |
| TC-FR15-02 | FR-15 lưu ngay | — | 1) Mở hiện vật mới; 2) đọc `localStorage` khi bảng còn mở | — | Đã có mã trong `explored` | Có ngay | Pass | |

### Trắc nghiệm và hoàn thành (FR-16 → FR-18)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR16-01 | FR-16 AC | P05 chưa làm | 1) Trạm P05 → Bắt đầu; 2) đúng 4/4 | — | "Đúng 4/4 câu", MSG-15, ★ trên bản đồ | Đúng; bản đồ P05 ★ | Pass | |
| TC-FR16-02 | FR-16 AC 5a | P05 ★ | 1) Làm lại, đúng 2/4 | — | Vẫn ★, tốt nhất 4/4 | `{best: 4, mastered: true}` | Pass | |
| TC-FR16-03 | FR-16 AC 2a | Đang ở câu 2 P04 | 1) ESC; 2) "Thoát" | — | MSG-16; không lưu kết quả | Hộp MSG-16, focus "Làm tiếp"; `quiz.P04` không có | Pass | |
| TC-FR16-04 | FR-16 3a (lỗi nhập) | Câu chưa chọn | 1) Xem nút "Trả lời" | — | Nút vô hiệu, chú thích MSG-14 | `disabled`, "Hãy chọn một đáp án." | Pass | |
| TC-FR16-05 | FR-16 2a | Hộp MSG-16 đang mở | 1) ESC | — | Như "Làm tiếp" | Hộp đóng, bài vẫn mở | Pass | |
| TC-FR16-06 | FR-16 bước 2 | — | Xáo phương án mỗi lượt | — | Thứ tự đổi mỗi lượt | Unit test `quiz/session` + GATE-4 M2 | Pass | |
| TC-FR16-07 | FR-16 bước 5 | Sai 2 câu | Xem màn kết quả | — | Danh sách xem lại gộp, không trùng | 2 dòng, không trùng dù 2 câu cùng gắn "Ba hình thức thực tiễn" | Pass | |
| TC-FR17-01 | FR-17 AC | Câu `P04-q2` gắn `b4-luong-chat` | 1) Trả lời sai | — | "Xem lại: Lượng đổi – Chất đổi (Phòng 04)" | "⚑ Xem lại: Lượng đổi – Chất đổi (Phòng 04)" | Pass | |
| TC-FR18-01 | FR-18 AC | 62/63 | 1) Mở hiện vật cuối; 2) đóng; 3) mở lại hiện vật khác | D-06 | Màn hoàn thành MSG-17 đúng một lần, `completedShown = true` | Hiện một lần; lần sau không hiện | Pass | |
| TC-FR18-02 | FR-18 bước chính | Màn hoàn thành | 1) "Tới Phòng ôn tập" | — | Nhân vật ở cửa phòng ôn tập | (53, 0, 0), trước cửa phòng ôn tập | Pass | |
| TC-FR18-03 | FR-18 a | 62/63 rồi 63/63 | Mở menu | — | "Xem màn hoàn thành" chỉ có khi đủ 63 | 62: không có; 63: có, mở được | Pass | |

### Lưu trữ (FR-19, FR-20)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR19-01 | FR-19 AC | 12/63, cài đặt đã đổi | 1) Tải lại | — | HUD 12/63, cài đặt giữ | 12/63; độ nhạy 2, đảo trục, tắt tiếng, đêm đều giữ | Pass | |
| TC-FR19-02 | FR-19 AC 1b | — | 1) Đặt khóa = `abc`; 2) tải lại | D-02 | 0/63 + MSG-10 5 s, không lỗi | "Bắt đầu tham quan"; toast MSG-10 ở giây thứ 1 | Pass | |
| TC-FR19-03 | FR-19 1b | — | 1) `version: 2`; 2) tải lại | D-03 | Như TC-FR19-02 | Về người chơi mới | Pass | |
| TC-FR19-04 | FR-19 1c | — | 1) `explored` có mã lạ và trùng; `quiz.P05.total = 9`; khóa `P99`; 2) tải lại | D-04, D-05 | Bỏ mã lạ, bỏ trùng, bỏ P05 và P99, giữ phần còn lại, không báo | `explored = [b3-dinh-nghia]`, chỉ còn `quiz.P01`, không toast | Pass | |
| TC-FR19-05 | FR-19 AC 3a | `localStorage` ném lỗi ngay từ đầu | 1) Mở trang; 2) chơi | D-08 | Chơi bình thường, MSG-11 một lần | Vào màn mở đầu; MSG-11 một lần | Pass | |
| TC-FR19-06 | FR-19 3b | `setItem` ném `QuotaExceededError` giữa phiên | 1) Bật/tắt ngày đêm (ghi cài đặt) | D-08 | MSG-11 một lần trong phiên | Không có thông báo. MSG-11 chỉ hiện khi tiến độ thay đổi, lỗi ghi cài đặt bị bỏ qua | Fail | Minor (BUG-05) |
| TC-FR19-07 | FR-19 bảng validate cài đặt | — | Giá trị ngoài miền | D-07 | Về mặc định | Unit test `settings.test.ts` | Pass | |
| TC-FR20-01 | FR-20 AC | 63/63, P01 ★, P05 ★ | 1) Menu → Xóa tiến độ → "Xóa" | — | 0/63, không còn ★, cài đặt giữ, về màn mở đầu như lần đầu | Khóa tiến độ bị xóa; "Bắt đầu tham quan"; `bttr.settings.v1` không đổi | Pass | |
| TC-FR20-02 | FR-20 2a | Hộp MSG-18 đang mở | 1) "Hủy"; 2) mở lại, ESC | — | Đóng, không đổi | Cả hai: không đổi; focus mặc định "Hủy" | Pass | |

### Cài đặt và môi trường (FR-21 → FR-25)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR21-01 | FR-21 | Đang chơi | 1) Bấm ☰ | — | Đủ mục: Tiếp tục, Cài đặt, Hướng dẫn, Về sảnh, Nguồn & giấy phép, (Xem màn hoàn thành), Xóa tiến độ | Đủ | Pass | |
| TC-FR21-02 | FR-21 a | Đang mở bản đồ / bảng hiện vật | 1) ESC | — | Đóng lớp đó, không mở menu | Đúng | Pass | |
| TC-FR21-03 | FR-21 AC b | Đang chơi, chưa khóa con trỏ (hoặc trên điện thoại) | 1) Ẩn tab; 2) hiện lại | `visibilitychange` | Đang ở menu tạm dừng, nhạc dừng | Không mở menu; Web Audio có tạm dừng khi ẩn. Trên máy tính đã khóa con trỏ thì menu có mở (nhờ `pointerlockchange`) | Fail | Minor (BUG-04) |
| TC-FR21-04 | FR-21 | Đang chơi | 1) ESC (phím thật); 2) ESC | — | Mở menu; ESC lần nữa đóng | Đúng | Pass | |
| TC-FR22-01 | FR-22 AC | Độ nhạy 1,0 | 1) Đặt 2,0; 2) tải lại | — | Vẫn 2,0 | 2,0 | Pass | |
| TC-FR22-02 | FR-22 AC BR-S12 | TB, `qualityManual = false` | 1) Giả lập ~18 FPS 15 s | Vòng lặp chiếm 45 ms mỗi khung | Xuống Thấp + MSG-09; không hạ thêm | Xuống Thấp, 1 toast, sau đó giữ Thấp | Pass | |
| TC-FR22-03 | FR-22 bảng validate (biên) | — | Đọc điều khiển | — | Độ nhạy 0,1–3,0 bước 0,1 mặc định 1,0; nhạc 0–100 bước 5 mặc định 60; hiệu ứng mặc định 80 | Đúng cả 3 | Pass | |
| TC-FR22-04 | FR-22 BR-S12 | Không có cài đặt | Mở trên máy tính và trên cảm ứng | D-01 | TB / Thấp | TB / Thấp | Pass | |
| TC-FR22-05 | FR-22 | — | Chọn Cao | — | Texture 2K, thông báo tải | GATE-4 M3 | Pass | |
| TC-FR23-01 | FR-23 AC | Ban ngày ở khuôn viên | 1) Bấm ☀ | — | ≤ 2 s thành đêm, thấy pháo hoa | Chuyển 1,5 s; ảnh chụp có pháo hoa | Pass | |
| TC-FR23-02 | FR-23 | Đêm | 1) Tải lại | — | Vẫn đêm | ☾, `night: true` | Pass | |
| TC-FR23-03 | FR-23 (Thấp ≤ 25%) và NFR-08 (không chớp > 3 lần/s) | — | Xem pháo hoa ở mức Thấp | — | Mật độ ≤ 25%, không chớp toàn màn | Mật độ 25% theo `PRESETS`; chớp: GATE-4 M4 (kiểm bằng mắt) | Pass | |
| TC-FR24-01 | FR-24 AC | Có âm thanh | 1) Bấm 🔊; 2) tải lại | — | Tắt ngay; tải lại vẫn tắt | 🔇, `muted: true` sau tải lại | Pass | |
| TC-FR24-02 | FR-24 quy tắc | — | Nghe nhạc, bước chân, hiệu ứng; ẩn tab | — | Chỉ phát sau thao tác đầu; dừng khi ẩn tab | GATE-4 M4 (kiểm bằng tai); mã có `ctx.suspend()` khi ẩn | Pass | |
| TC-FR25-01 | FR-25 | — | 1) Bấm ⛶; 2) bấm lại | — | Bật / tắt toàn màn hình | Khung Browser nhúng không vào toàn màn hình. Cần thử trên Chrome thật | Blocked | |

### Nội dung và nguồn (FR-26, FR-27)

| TC-ID | FR / Tiêu chí | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|---------------|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-FR26-01 | FR-26 AC | — | 1) Xóa trang của `a1-the-gioi-quan`; 2) `npm run build`; 3) hoàn nguyên | `pages: []` | Build thất bại, chỉ đúng mã đó | Exit 1, "a1-the-gioi-quan: thiếu trang" | Pass | |
| TC-FR26-02 | FR-26 | Dữ liệu hiện hành | `npm run build` | — | Không lỗi | 69/69 test, build xanh | Pass | |
| TC-FR27-01 | FR-27 AC (b) | — | 1) Menu → Nguồn & giấy phép | — | Mọi asset ngoài có tác giả và giấy phép | 6 texture/HDRI, 4 ảnh, 2 nhân vật, font, 4 thư viện — đủ tác giả và giấy phép | Pass | |
| TC-FR27-02 | FR-27 (a) | Ở sảnh | Đọc bảng "Về giáo trình" | — | Tên giáo trình, Bộ GD&ĐT, NXB CTQG Sự thật, 2021, lưu ý | Có (cũng có ở đầu trang Nguồn & giấy phép); bảng 3D: GATE-4 M3 | Pass | |

### Phi chức năng

| TC-ID | NFR | Tiền điều kiện | Bước thực hiện | Dữ liệu | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức lỗi |
|-------|-----|----------------|----------------|---------|-----------------|-----------------|:----------:|---------|
| TC-NFR01-01 | NFR-01 | Laptop Iris Xe, 1920 × 1080, TB | Tuyến chuẩn, 60 s mỗi khu | — | TB ≥ 60 FPS, phân vị 5% ≥ 45 | Chưa có máy | Blocked | |
| TC-NFR02-01 | NFR-02 | Android tầm trung, Thấp | Như trên | — | TB ≥ 30 FPS | Chưa có máy | Blocked | |
| TC-NFR03-01 | NFR-03 | `dist/` | Cộng dung lượng gói ban đầu | — | ≤ 15 MB | 4,6 MB (asset 4,2 MB + JS gzip 0,39 MB + CSS + font) | Pass | |
| TC-NFR03-02 | NFR-03 | Mạng 20 Mbps, cache trống | Đo tới màn mở đầu | — | ≤ 10 s | Chưa đo có giới hạn băng thông. Ước tính 4,6 MB ở 20 Mbps ≈ 2 s truyền | Blocked | |
| TC-NFR04-01 | NFR-04 | Android tầm trung | Chơi 30 phút theo kịch bản | — | 0 crash, 0 lỗi chặn | Chưa có máy. Trên máy dev: không có lỗi JS chưa bắt trong cả phiên test | Blocked | |
| TC-NFR05-01 | NFR-05 | Chrome Windows | Toàn bộ TC trên | — | Chạy đủ | Đã chạy | Pass | |
| TC-NFR05-02 | NFR-05 | Edge, Firefox, Chrome Android, Safari iOS 16+ | Luồng smoke (mục 5) | — | Chạy đủ | Chưa có máy | Blocked | |
| TC-NFR07-01 | NFR-07 | Bảng hiện vật, HUD | Đo cỡ chữ và tương phản | — | Nội dung ≥ 16 px, HUD ≥ 14 px, tương phản ≥ 4,5 : 1 | Nội dung 16 px, HUD 14–15 px; tương phản 15,9 : 1 (chữ chính), 8,75 : 1 (chữ phụ). Dòng nguồn trang 14 px (ghi chú, không phải thân nội dung) | Pass | |
| TC-NFR08-01 | NFR-08 | Menu tạm dừng | Tab, Enter, ESC bằng phím thật | — | Điều khiển được, viền focus thấy được | Viền 2 px màu chữ trên `:focus-visible`; Tab bị giữ trong lớp; ESC đóng | Pass | |
| TC-NFR09-01 | NFR-09 | Mã nguồn, `vercel.json` | Rà CSP, `innerHTML`, `npm audit --omit=dev` | — | CSP chỉ `'self'`; không HTML thô; 0 High/Critical | CSP `default-src 'self'`…; không có `innerHTML`; 0 lỗ hổng. Header thật trên HTTPS kiểm ở B5/B6 | Pass | |
| TC-NFR10-01 | NFR-10 | Một chuyến tham quan | Xem tab Network, `localStorage` | — | Chỉ tài nguyên tĩnh cùng nguồn; chỉ 2 khóa | Chỉ `localhost:5173` và `blob:`; không có POST; chỉ `bttr.progress.v1`, `bttr.settings.v1` | Pass | |
| TC-NFR11-01 | NFR-11 | Repo và `dist/` | Tìm PDF, ảnh scan; đối chiếu `CREDITS.md` | — | Không có PDF/scan; 100% asset có credit | Không có; FR-26 kiểm credit khi build | Pass | |
| TC-NFR13-01 | NFR-13 | — | Sửa dữ liệu không sửa code | — | Chỉ sửa file dữ liệu | TC-FR26-01 chỉ sửa `exhibits.ts` | Pass | |
| TC-NFR14-01 | NFR-14 | — | Soát mắt giao diện | — | 100% tiếng Việt có dấu | Đúng ở mọi màn đã chạy | Pass | |

## 4. Độ phủ TC → FR

| FR | Số TC | Có case biên? | Có case lỗi? | Ghi chú |
|----|:-----:|:-------------:|:------------:|---------|
| FR-01 | 7 | Có (30 s) | Có (WebGL2, tải lỗi, mất ngữ cảnh) | |
| FR-02 | 3 | — | — | Không có luồng lỗi trong SRS |
| FR-03 | 3 | — | — | |
| FR-04 | 7 | Có (chéo, ngược) | Có (blur, đang mở bảng) | |
| FR-05 | 6 | Có (zoom, góc dọc) | Có (xuyên tường) | 1 Blocked |
| FR-06 | 7 | Có (60%) | Có (nhấc ngón) | 1 Blocked (máy thật) |
| FR-07 | 4 | — | Có (rơi khỏi bản đồ) | |
| FR-08 | 3 | Có (diện tích P04) | — | |
| FR-09 | 4 | — | Có (Quay lại) | 3 Fail, 1 Blocked |
| FR-10 | 4 | — | — | 1 Fail |
| FR-11 | 3 | — | — | |
| FR-12 | 4 | Có (2 m) | Có (E khi không có mục tiêu) | |
| FR-13 | 8 | Có (+30°) | Có (ảnh lỗi) | 1 Fail, 1 Blocked |
| FR-14 | 6 | Có (99/100 °C) | Có (đóng giữa chừng) | |
| FR-15 | 2 | Có (62 → 63) | — | |
| FR-16 | 7 | Có (★ giữ khi điểm thấp hơn) | Có (chưa chọn, thoát giữa bài) | |
| FR-17 | 1 | — | — | Phần ◎ ở TC-FR10-02 |
| FR-18 | 3 | Có (62/63) | — | |
| FR-19 | 7 | — | Có (JSON hỏng, sai version, mã lạ, chặn lưu, ghi lỗi) | 1 Fail |
| FR-20 | 2 | — | Có (Hủy, ESC) | |
| FR-21 | 4 | — | Có (ESC chồng lớp) | 1 Fail |
| FR-22 | 5 | Có (miền giá trị) | Có (FPS thấp) | |
| FR-23 | 3 | — | — | |
| FR-24 | 2 | — | — | |
| FR-25 | 1 | — | — | Blocked (môi trường) |
| FR-26 | 2 | — | Có (thiếu trang) | |
| FR-27 | 2 | — | — | |

27/27 FR có TC. NFR: 12/14 có TC (NFR-06 và NFR-12 đo ở UAT B6, xem test-plan mục 1).

## 5. Luồng smoke cho máy thật (NFR-05)

Dùng khi anh Duy thử trên Edge, Firefox, Chrome Android, Safari iOS:
1. Mở link, thấy màn tải rồi màn mở đầu.
2. Bắt đầu → chọn nhân vật → hướng dẫn → Đã hiểu.
3. Đi vào Phòng 01, mở 1 hiện vật 📜 và 1 hiện vật 🎛 (`a1-cay-va-rung`), đóng.
4. Mở bản đồ, đóng. Mở menu → Cài đặt → đổi chất lượng, quay lại.
5. Tới phòng ôn tập, làm trạm P01.
6. Tải lại trang: "Tiếp tục tham quan", tiến độ còn.
7. Bật đêm, xem pháo hoa ở khuôn viên. Tắt tiếng.

## 6. Tổng hợp kết quả (vòng 1, 2026-10-06)

| Tổng | Pass | Fail | Blocked |
|:----:|:----:|:----:|:-------:|
| 124 | 107 | 7 | 10 |

TC Fail: TC-FR09-01, TC-FR09-02, TC-FR09-04 (BUG-01, Major); TC-FR13-03 (BUG-02, Major); TC-FR10-03 (BUG-03, Minor); TC-FR21-03 (BUG-04, Minor); TC-FR19-06 (BUG-05, Minor). Chi tiết ở [test-report](test-report.md).
