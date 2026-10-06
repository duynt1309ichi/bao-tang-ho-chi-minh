# design.md — Bảo tàng Triết học

| Phiên bản | v0.1 | Ngày | 2026-10-06 | Trạng thái | APPROVED — GATE-3 (anh Duy, 2026-10-06) |
|-----------|------|------|------------|------------|--------------------|

Căn cứ: [SRS v1.0](../ba/SRS.md), [HLD v1.0](../sa/HLD.md). Đặc tả hành vi từng màn ở [FSD](../ba/FSD.md).

## 1. Nguyên tắc thiết kế

- **Giọng điệu:** bảo tàng học thuật, trang trọng nhưng dễ gần; câu ngắn, xưng "bạn".
- **Người dùng:** sinh viên ôn thi (đa số dùng laptop và điện thoại), giảng viên chấm (laptop, xem một lượt).
- **Thiết bị:** máy tính trước (giảng viên chấm), điện thoại phải dùng được trọn vẹn. Giao diện tiếng Việt.
- **Không gian 3D:** tường sáng màu ngà, sàn đá/gỗ, thảm và viền cửa theo màu chương, đèn rọi riêng từng hiện vật, pano chữ tối trên nền sáng.
- **Giao diện 2D:** lớp kính tối mờ chồng lên khung 3D, chữ màu ngà, điểm nhấn vàng đồng. Lý do: đọc rõ trên mọi cảnh (ngày, đêm, phòng sáng/tối) mà không phụ thuộc màu nền 3D.
- **Ít chắn tầm nhìn:** khi chơi chỉ có HUD ở các góc; bảng lớn chỉ mở khi người dùng chủ động xem.

## 2. Design token

Khai báo một lần trong `src/ui/tokens.css` dưới dạng CSS custom properties; code 3D đọc màu khu từ `src/ui/tokens.ts` (cùng giá trị).

| Nhóm | Token | Giá trị | Dùng cho |
|------|-------|---------|----------|
| Màu khu | `--zone-a` | `#7A1F2B` (đỏ đô) | Khu A: thảm, viền cửa, biển phòng, bản đồ |
| Màu khu | `--zone-b` | `#1F3A6B` (xanh lam đậm) | Khu B |
| Màu khu | `--zone-c` | `#A87A2A` (vàng đồng) | Khu C |
| Màu khu | `--zone-review` | `#3E5C4A` (xanh rêu) | Phòng ôn tập |
| Màu nền UI | `--surface` | `rgba(18, 20, 26, 0.90)` | Bảng, popup, menu |
| Màu nền UI | `--surface-2` | `rgba(32, 35, 44, 0.92)` | Thẻ, ô trong bảng, phương án trắc nghiệm |
| Màu nền UI | `--scrim` | `rgba(0, 0, 0, 0.45)` | Lớp mờ phủ khung 3D khi mở bảng/menu |
| Chữ | `--ink` | `#F3EEE4` (ngà) | Chữ chính |
| Chữ | `--ink-muted` | `#B9B2A6` | Chữ phụ, nguồn trang |
| Điểm nhấn | `--accent` | `#D9B26A` (vàng đồng sáng) | Nút chính, viền focus, thanh tiến độ, viền sáng hiện vật |
| Điểm nhấn | `--accent-ink` | `#1A1712` | Chữ trên nền `--accent` |
| Trạng thái | `--success` | `#5BBF86` | Đáp án đúng, ✓, ★ |
| Trạng thái | `--danger` | `#E5736B` | Đáp án sai, nút "Xóa" |
| Trạng thái | `--hint` | `#F0A04B` (cam) | Gợi ý xem lại (FR-17) |
| Typography | `--font` | `"Be Vietnam Pro", system-ui, sans-serif` | Mọi chữ UI và pano |
| Typography | cỡ chữ | `--fs-xs 14px` · `--fs-sm 15px` · `--fs-md 16px` · `--fs-lg 18px` · `--fs-xl 22px` · `--fs-2xl 28px` · `--fs-3xl 40px` | HUD ≥ 14px, nội dung ≥ 16px (NFR-07) |
| Typography | độ đậm | 400 (thường), 600 (nhãn, nút), 700 (tiêu đề) | Tự host 3 file woff2 |
| Typography | dòng | `line-height: 1.55` cho nội dung, `1.25` cho tiêu đề | |
| Spacing | đơn vị | 4px; thang `4 · 8 · 12 · 16 · 24 · 32 · 48` | Padding, khoảng cách |
| Bo góc | `--radius-sm` / `--radius-lg` | `6px` / `14px` | Nút / bảng |
| Bóng | `--shadow` | `0 12px 40px rgba(0,0,0,.45)` | Bảng nổi |
| Viền | `--border` | `1px solid rgba(243,238,228,.14)` | Bảng, thẻ |
| Chuyển động | `--t-fast` / `--t-base` | `120ms` / `220ms`, `ease-out` | Hover, mở/đóng bảng; tắt khi `prefers-reduced-motion` |
| Kích thước chạm | `--hit` | `44px` tối thiểu | Mọi nút (BR-S03) |
| Breakpoint | `--bp-mobile` | `< 768px` chiều rộng **hoặc** thiết bị cảm ứng | Bố cục điện thoại |

Tương phản đã tính (WCAG), xét cả trường hợp xấu nhất là `--surface` phủ lên nền 3D trắng: `--ink` ≥ 12,2 : 1; `--ink-muted` ≥ 6,7 : 1; `--accent-ink` trên `--accent` 9,0 : 1; `--success` ≥ 6,2 : 1; `--hint` ≥ 6,6 : 1; `--danger` ≥ 4,7 : 1. Đạt NFR-07.

**Vật liệu 3D (hướng dẫn cho script Blender):** tường `#E9E3D6` nhám; phào chỉ `#F4EFE4`; sàn hành lang đá sáng, sàn phòng gỗ sồi; thảm và khung cửa theo `--zone-*`; pano chữ nền `#2A2620`, chữ `#F3EEE4`; đèn rọi hiện vật nhiệt màu 3200 K.

## 3. User flow

**UC-01 Vào bảo tàng lần đầu** (FR-01, FR-02, FR-03)
```
[Mở link] → [Màn tải] → [Màn mở đầu] --Bắt đầu--> [Chọn nhân vật] → [Hướng dẫn] --Đã hiểu--> [Chơi: khuôn viên]
     \--không có WebGL2--> [Màn không hỗ trợ]
     \--tải lỗi--> [Màn lỗi tải] --Thử lại--> [Màn tải]
```

**UC-02 Quay lại lần sau** (FR-01, FR-19)
```
[Mở link] → [Màn tải] → [Màn mở đầu: "Tiếp tục tham quan · Đã khám phá N/63"] --Tiếp tục--> [Chơi: sảnh]
                              \--tiến độ hỏng--> [Màn mở đầu như lần đầu] + thông báo "Không đọc được tiến độ cũ…"
```

**UC-03 Tham quan một phòng và xem hiện vật** (FR-09, FR-12, FR-13, FR-15)
```
[Chơi: hành lang] --qua ngưỡng cửa--> [Popup vào phòng] --Đi vào phòng--> [Chơi: trong phòng]
                                          \--Quay lại--> [Chơi: hành lang, lùi 1 m]
[Chơi: gần hiện vật] --E / Xem--> [Bảng hiện vật] --Đóng / ESC / E--> [Chơi] + thông báo "Đã khám phá: … (N/63)"
                                          \--hiện vật thứ 63--> [Màn hoàn thành]
```

**UC-04 Thao tác hiện vật tương tác** (FR-14)
```
[Bảng 🎛: Sẵn sàng] --Bắt đầu--> [Đang thao tác] --đạt điều kiện--> [Hoàn thành: giải thích] --Làm lại--> [Sẵn sàng]
        \------------- Xem giải thích luôn -------------/                        \--Đóng--> [Chơi]
```

**UC-05 Làm trắc nghiệm một phòng** (FR-16, FR-17)
```
[Chơi: trạm phòng X] --E--> [Trắc nghiệm: giới thiệu] --Bắt đầu--> [Câu i] --chọn + Trả lời--> [Câu i: đúng/sai + giải thích (+ gợi ý xem lại)]
   --Câu tiếp--> … --câu cuối--> [Kết quả] --đúng hết--> ★ trên bản đồ
                                          \--chưa đúng hết--> danh sách "Xem lại" + [Làm lại]
[Câu i] --ESC / Đóng--> [Hộp "Thoát bài trắc nghiệm?"] --Thoát--> [Chơi]   --Làm tiếp--> [Câu i]
```

**UC-06 Tạm dừng, cài đặt, thoát kẹt, xóa tiến độ** (FR-07, FR-20, FR-21, FR-22)
```
[Chơi] --ESC / ☰ / ẩn tab--> [Menu tạm dừng] --Tiếp tục--> [Chơi]
                                 |--Cài đặt--> [Cài đặt] --Quay lại--> [Menu]
                                 |--Về sảnh--> [Chơi: sảnh]
                                 |--Nguồn & giấy phép--> [Nguồn] --Quay lại--> [Menu]
                                 \--Xóa tiến độ--> [Hộp xác nhận] --Xóa--> [Màn mở đầu như lần đầu]
                                                                   \--Hủy--> [Menu]
```

## 4. Wireframe

**SCR-02 Màn mở đầu** (nền: cảnh khuôn viên 3D, camera bay chậm)
```
+--------------------------------------------------------------+
|                                                              |
|            BẢO TÀNG SỐ · KHÔNG GIAN 3D           (xs, muted) |
|         Hành trình Triết học Mác – Lênin           (3xl)     |
|   Bước vào bảo tàng, đi qua 10 phòng theo ba chương…  (lg)   |
|                                                              |
|              [ Bắt đầu tham quan → ]   (nút chính)           |
|              Đã khám phá 12/63 hiện vật   (chỉ khi có)       |
|                                                              |
|  Nguồn: Giáo trình Triết học Mác – Lênin (2021)     (xs)     |
+--------------------------------------------------------------+
```

**SCR-05 HUD — máy tính**
```
+--------------------------------------------------------------+
| Phòng 03 — Vật chất và ý thức        [🔊][☀][?][⛶][☰]  +----+|
| ██████░░░░░░░░  12/63                                 |map ||
|                                                       +----+|
|               Phòng 03 — Vật chất và ý thức (toast 3s)       |
|                                                              |
|                         (khung 3D)                           |
|                                                              |
|                  [ E · Xem  Định nghĩa vật chất ]            |
|           Đã khám phá: Định nghĩa vật chất (13/63) (toast)   |
+--------------------------------------------------------------+
```

**SCR-05 HUD — điện thoại (ngang)**
```
+--------------------------------------------------------------+
| P03 · 12/63 ████░░        [🔊][☀][?][☰]               [map]  |
|                                                              |
|                         (khung 3D)                           |
|   .---.                                                      |
|  ( ◎  )  joystick                              [ Xem ] 64px  |
|   '---'                                                      |
+--------------------------------------------------------------+
```

**SCR-06 Popup vào phòng**
```
          +--------------------------------------+
          | ▌Phòng 03 · Chương 2                  |  (vạch màu khu bên trái)
          |  Vật chất và ý thức              (xl) |
          |  Giáo trình tr.118–182        (muted) |
          |  Đã khám phá 3/8 hiện vật             |
          |  [ Quay lại ]      [ Đi vào phòng → ] |
          +--------------------------------------+
```

**SCR-07 Bảng hiện vật — máy tính** (bảng bên phải rộng 480px; bên trái thấy hiện vật qua camera cận)
```
+------------------------------+-------------------------------+
|                              | 📜 Pano văn bản           [✕] |
|     (camera cận hiện vật)    | Định nghĩa vật chất của Lênin |
|                              | Phòng 03 · Vật chất và ý thức |
|   🧊: kéo để xoay            |-------------------------------|
|   [Đặt lại góc]              | Nội dung (md, cuộn được)      |
|                              | ┃ "Vật chất là một phạm trù…" |
|                              | ┃ — V.I. Lênin   (trích, nghiêng)
|                              | (minh họa)  ← nhãn nếu có     |
|                              |-------------------------------|
|                              | Giáo trình … (2021), tr.128–134|
+------------------------------+-------------------------------+
```
Điện thoại: bảng chiếm nửa dưới màn hình (60% chiều cao), kéo lên được để xem toàn màn; phần trên vẫn thấy hiện vật.

**SCR-08 Hiện vật tương tác** (cùng khung SCR-07; phần nội dung đổi theo trạng thái)
```
| 🎛 Lượng đổi – Chất đổi                 [✕] |
| Kéo thanh nhiệt độ để đun nước.             |
| Sẵn sàng:      [ Bắt đầu ]  Xem giải thích luôn |
| Đang thao tác: (điều khiển riêng, ví dụ thanh trượt 20 → 100 °C)  Xem giải thích luôn |
| Hoàn thành:    (nội dung đầy đủ như SCR-07)  [ Làm lại ] |
```

**SCR-10 Trắc nghiệm**
```
          +----------------------------------------------+
          | Trắc nghiệm · Phòng 04             Câu 2/5 [✕]|
          | Câu hỏi … (lg)                                |
          | ( A ) phương án …                             |
          | ( B ) phương án …   ← đã chọn: viền accent    |
          | ( C ) …                                       |
          | ( D ) …                                       |
          |                         [ Trả lời ] (disabled khi chưa chọn) |
          | Sau khi trả lời: đúng = nền success, sai = nền danger |
          | Giải thích …                                  |
          | ⚑ Xem lại: Lượng đổi – Chất đổi (Phòng 04) (hint) |
          |                         [ Câu tiếp → ]        |
          +----------------------------------------------+
```

**SCR-12 Menu tạm dừng**
```
          +---------------------------+
          |        Tạm dừng           |
          | [ Tiếp tục ]   (nút chính)|
          | [ Cài đặt ]               |
          | [ Hướng dẫn ]             |
          | [ Về sảnh ]               |
          | [ Nguồn & giấy phép ]     |
          | [ Xem màn hoàn thành ]    |  (chỉ khi 63/63)
          | [ Xóa tiến độ ]  (danger) |
          +---------------------------+
```

**SCR-13 Cài đặt**
```
          +----------------------------------------+
          | ← Cài đặt                              |
          | Chất lượng đồ họa  ( Thấp )(•TB )( Cao )|
          | Độ nhạy camera     ───●──────  1,0      |
          | Đảo trục dọc       [  tắt ]             |
          | Nhạc nền           ──────●───  60       |
          | Hiệu ứng           ────────●─  80       |
          | Nhân vật           (•Nam)( Nữ )         |
          +----------------------------------------+
```

**SCR-09 Bản đồ phóng to**
```
+--------------------------------------------------------------+
|  Bản đồ                                                   [✕]|
|      [P01 ✓★][P03   ][P05   ][P07   ][P09   ]               |
|  [Sảnh]════════════ hành lang ═══════════════[Ôn tập]        |
|      [P02   ][P04 ◎ ][P06   ][P08   ][P10   ]                |
|                 ▲ bạn đang ở đây                             |
|  ■ Khu A  ■ Khu B  ■ Khu C   ✓ đã khám phá đủ  ★ đã nắm vững  ◎ cần xem lại |
+--------------------------------------------------------------+
```

## 5. Component & Trạng thái

| Component | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Nút chính | default nền `--accent` chữ `--accent-ink` · hover sáng hơn 8% · focus viền 2px `--ink` lệch 2px · disabled nền `--surface-2`, chữ `--ink-muted`, `cursor: not-allowed` · pressed thu 2% | Mỗi bảng tối đa 1 nút chính |
| Nút phụ | default trong suốt, viền `--border`, chữ `--ink` · hover nền `--surface-2` · focus như nút chính · disabled chữ `--ink-muted` | |
| Nút nguy hiểm | như nút phụ nhưng chữ và viền `--danger` | "Xóa tiến độ", "Xóa" |
| Nút biểu tượng HUD | 44 × 44px, nền `--surface`, biểu tượng `--ink` · hover viền `--accent` · trạng thái bật/tắt đổi biểu tượng (🔊/🔇, ☀/☾) + `aria-pressed` | Có `aria-label` tiếng Việt |
| Bảng (panel) | mở: trượt vào 220ms + mờ dần · đóng: ngược lại · nội dung dài: cuộn trong bảng, thanh cuộn mảnh | Bẫy focus trong bảng, ESC đóng |
| Hộp xác nhận | như bảng, nhỏ hơn; focus mặc định vào nút an toàn ("Hủy", "Làm tiếp") | |
| Thông báo (toast) | xuất hiện giữa-trên, tự ẩn sau 3s (thông tin) hoặc 5s (cảnh báo); tối đa 2 cái xếp chồng | `role="status"` |
| Lời nhắc tương tác | nền `--surface`, phím "E" trong ô viền `--accent`; ẩn khi không có mục tiêu | Điện thoại: thay bằng nút "Xem" 64px |
| Phương án trắc nghiệm | default nền `--surface-2` · hover viền `--accent` · đã chọn viền 2px `--accent` · đúng nền `--success` 25% + ✓ · sai nền `--danger` 25% + ✗ · khóa sau khi trả lời | Đúng/sai có cả biểu tượng và chữ, không chỉ đổi màu |
| Thanh trượt | track `--surface-2`, phần đã chọn `--accent`, núm 20px (vùng chạm 44px) · focus viền · hiện giá trị số bên phải | Phím ←/→ đổi theo bước |
| Công tắc / nhóm chọn | nhóm nút radio dạng viên; mục chọn nền `--accent` | |
| Thanh tiến độ | track `--surface-2`, phần đầy `--accent`, chiều cao 6px | |
| Joystick | đế tròn 120px viền `--ink` 30%, núm 56px `--ink` 60%; hiện ở chỗ ngón chạm đầu tiên trong nửa trái | Mờ đi khi không chạm |
| Viền sáng hiện vật (3D) | viền ngoài màu `--accent`, dày 2px, nhấp nháy nhẹ 1,5s/chu kỳ | Không nhấp nháy khi `prefers-reduced-motion` |

## 6. Accessibility
- Tương phản ≥ 4,5 : 1 (đã tính ở mục 2); nội dung ≥ 16px; HUD ≥ 14px.
- Vùng chạm ≥ 44 × 44px; nút "Xem" trên điện thoại 64px.
- Mọi lớp giao diện dùng được bằng bàn phím: Tab/Shift+Tab di chuyển, Enter/Space kích hoạt, ESC đóng; focus nhìn thấy được; khi mở bảng thì focus vào bảng, khi đóng thì trả focus về khung 3D.
- Bảng, popup, hộp xác nhận dùng `role="dialog"` + `aria-modal="true"` + tiêu đề `aria-labelledby`; toast dùng `role="status"`.
- Trạng thái đúng/sai, đã khám phá, đã nắm vững luôn có biểu tượng + chữ, không chỉ màu.
- Không chớp sáng toàn màn hình > 3 lần/giây (pháo hoa); tôn trọng `prefers-reduced-motion` (tắt nhấp nháy, rút ngắn camera bay còn 0s).

## 7. Truy vết màn hình → FR

| Màn hình | FR phục vụ |
|----------|-----------|
| SCR-01 Màn tải / lỗi | FR-01 |
| SCR-02 Màn mở đầu | FR-01, FR-19 |
| SCR-03 Chọn nhân vật | FR-02 |
| SCR-04 Hướng dẫn | FR-03 |
| SCR-05 HUD (kể cả điều khiển cảm ứng, lời nhắc, toast) | FR-04, FR-05, FR-06, FR-07, FR-10, FR-11, FR-12, FR-15, FR-19, FR-22, FR-23, FR-24, FR-25 |
| SCR-06 Popup vào phòng | FR-09 |
| SCR-07 Bảng hiện vật | FR-13, FR-15 |
| SCR-08 Hiện vật tương tác | FR-14 |
| SCR-09 Bản đồ phóng to | FR-10, FR-17 |
| SCR-10 Trắc nghiệm | FR-16, FR-17 |
| SCR-11 Màn hoàn thành | FR-18 |
| SCR-12 Menu tạm dừng (kể cả hộp xác nhận xóa) | FR-07, FR-20, FR-21 |
| SCR-13 Cài đặt | FR-02, FR-22 |
| SCR-14 Nguồn & giấy phép | FR-27 |
| SCR-15 Gợi ý xoay ngang | FR-06 |
