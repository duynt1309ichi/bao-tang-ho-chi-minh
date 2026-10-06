# SRS — Bảo tàng Triết học

| Phiên bản | v0.1 | Ngày | 2026-10-06 | Trạng thái | DRAFT — chờ GATE-2 |
|-----------|------|------|------------|------------|--------------------|

## 1. Giới thiệu

**Mục đích.** Đặc tả yêu cầu phần mềm cho "Bảo tàng Triết học", đủ chi tiết để dev hiện thực và tester viết test case mà không phải hỏi lại.

**Phạm vi.** Theo [BRD v1.0](BRD.md) (đã duyệt GATE-1 ngày 2026-10-06). Đây là một web app tĩnh: bảo tàng 3D chạy trên trình duyệt, nhân vật điều khiển ở góc nhìn thứ 3, 10 phòng với 63 hiện vật lấy từ Giáo trình Triết học Mác – Lênin (2021), trắc nghiệm theo phòng, tiến độ lưu trên trình duyệt. Không có backend, không đăng nhập.

**Nguồn nội dung.** Danh sách phòng và hiện vật lấy theo [NOI_DUNG.md](../NOI_DUNG.md). Khi có mâu thuẫn về số lượng hay mã hiện vật, NOI_DUNG.md thắng; SRS chỉ quy định hành vi.

**Thuật ngữ**

| Thuật ngữ | Nghĩa |
|-----------|-------|
| Hiện vật | Một đối tượng trưng bày có mã `id` trong NOI_DUNG.md. Có 4 loại: 🖼 chân dung/tranh, 📜 pano văn bản, 🧊 mô hình 3D, 🎛 hiện vật tương tác |
| Khám phá | Hiện vật được tính là đã khám phá khi người dùng mở bảng chi tiết của nó lần đầu (BR-S01) |
| Phòng | Một trong 10 phòng ứng với 10 mục lớn của giáo trình, mã `P01`…`P10` |
| Khu | Nhóm phòng theo chương: Khu A (Chương 1: P01–P02), Khu B (Chương 2: P03–P05), Khu C (Chương 3: P06–P10) |
| Đã nắm vững | Trạng thái của một phòng khi người dùng trả lời đúng tất cả câu trắc nghiệm của phòng đó trong một lượt làm |
| Phiên | Khoảng thời gian từ khi mở trang đến khi đóng hoặc tải lại trang |
| Lỗi chặn | Lỗi khiến người dùng không đi tiếp được: kẹt nhân vật không thoát được, crash, màn hình đen, popup không đóng được |
| Thiết bị cảm ứng | Thiết bị mà `matchMedia('(pointer: coarse)')` trả về đúng |

## 2. Mô tả tổng quan

**Bối cảnh.** Sinh viên mở một đường link Vercel, đi nhân vật qua khuôn viên → sảnh → hành lang → 10 phòng → phòng ôn tập; xem hiện vật, thao tác hiện vật tương tác, làm trắc nghiệm. Mọi dữ liệu nội dung được đóng gói sẵn trong bản build; dữ liệu duy nhất thay đổi theo người dùng là tiến độ và cài đặt, lưu ở `localStorage` của chính trình duyệt đó.

**Nhóm người dùng & quyền**

| Nhóm | Mô tả | Quyền |
|------|-------|-------|
| Khách tham quan | Sinh viên, giảng viên chấm, người thử UAT. Không cần tài khoản | Toàn bộ chức năng. Không phân quyền |

**Ràng buộc** (kế thừa BRD mục 6): web tĩnh, host trên Vercel; giao diện và nội dung tiếng Việt; không thu thập dữ liệu cá nhân; chỉ tóm tắt giáo trình bằng lời của mình và trích ngắn có ghi trang; mọi asset ngoài phải có giấy phép rõ ràng; vỏ tòa nhà dựng và bake ánh sáng trong Blender 4.5 LTS; thời hạn UAT 2026-11-06.

**Giả định / phụ thuộc**
- A-01: Máy chấm có trình duyệt hỗ trợ WebGL2 và có Internet.
- A-02: Bài trắc nghiệm **trước/sau** tham quan để đo BG-03 làm **ngoài ứng dụng** (ví dụ Google Form do anh Duy chuẩn bị). Trắc nghiệm trong app (FR-16) là để ôn tập, không dùng để đo BG-03.
- A-03: BG-02 và BG-05 đo bằng quan sát và phiếu khảo sát ngoài ứng dụng; app không thu thập số liệu sử dụng.
- A-04: Nhân vật, hoạt ảnh, mô hình và âm thanh lấy từ nguồn CC0 hoặc tự dựng (theo THIET_KE.md mục 5).

## 3. Yêu cầu chức năng (FR)

### 3.1 Danh mục FR

| ID | Tên | Mô tả | Ưu tiên | Truy vết BRD |
|----|-----|-------|---------|--------------|
| **Khởi động** | | | | |
| FR-01 | Khởi động & tải tài nguyên | Kiểm tra WebGL2, màn tải có tiến trình, màn mở đầu, xử lý lỗi tải | Cao | BR-09 · BG-04 |
| FR-02 | Chọn nhân vật | Chọn nhân vật nam hoặc nữ ở lần chơi đầu; đổi được trong cài đặt | Thấp | BR-01 · BG-05 |
| FR-03 | Hướng dẫn điều khiển | Tự hiện ở lần chơi đầu theo loại thiết bị; mở lại được bất cứ lúc nào | Cao | BR-01 · BG-02 |
| **Di chuyển & camera** | | | | |
| FR-04 | Điều khiển nhân vật bằng bàn phím | Đi, chạy, xoay theo hướng camera; hoạt ảnh idle/walk/run | Cao | BR-01 · BG-02, BG-05 |
| FR-05 | Camera góc nhìn thứ 3 / thứ nhất | Xoay bằng chuột, zoom, chống xuyên tường, chuyển góc nhìn bằng phím V | Cao | BR-01 · BG-05 |
| FR-06 | Điều khiển cảm ứng | Joystick, kéo để xoay camera, nút tương tác trên màn hình | Cao | BR-01, BR-10 · BG-04 |
| FR-07 | Va chạm & thoát kẹt | Nhân vật không xuyên tường, không rời khỏi khu vực đi được; có lệnh "Về sảnh" | Cao | BR-01 · BG-04 |
| **Không gian & định hướng** | | | | |
| FR-08 | Bố cục bảo tàng | Khuôn viên, sảnh, hành lang, 10 phòng theo thứ tự giáo trình, phòng ôn tập; màu theo chương | Cao | BR-02 · BG-01 |
| FR-09 | Vào phòng | Popup giới thiệu phòng ở lần vào đầu tiên; thông báo khu vực | TB | BR-07 · BG-02 |
| FR-10 | Bản đồ nhỏ | Sơ đồ phòng, vị trí người chơi, trạng thái từng phòng | TB | BR-07 · BG-02 |
| FR-11 | HUD | Khu vực hiện tại, tiến độ N/63, các nút nhanh | Cao | BR-05, BR-07 · BG-02 |
| **Hiện vật** | | | | |
| FR-12 | Phát hiện hiện vật ở gần | Viền sáng và lời nhắc "E · Xem" khi đứng gần và nhìn về hiện vật | Cao | BR-03 · BG-02 |
| FR-13 | Xem chi tiết hiện vật | Bảng thông tin: tên, nội dung, trích dẫn, trang nguồn; xoay mô hình 🧊 | Cao | BR-03 · BG-01, BG-03 |
| FR-14 | Hiện vật tương tác 🎛 | 13 hiện vật có thao tác riêng theo một khuôn chung | TB | BR-04 · BG-03, BG-05 |
| FR-15 | Ghi nhận khám phá & tiến độ | Đánh dấu đã khám phá, đếm N/63 và theo phòng | Cao | BR-05 · BG-02 |
| FR-16 | Trắc nghiệm theo phòng | 10 trạm, mỗi trạm 3–5 câu, chấm điểm, giải thích | Cao | BR-06 · BG-03 |
| FR-17 | Gợi ý xem lại khi trả lời sai | Mỗi câu sai chỉ ra hiện vật và phòng cần xem lại | Cao | BR-06 · BG-03 |
| FR-18 | Màn hoàn thành | Hiện khi khám phá đủ 63/63 | TB | BR-05 · BG-02 |
| **Lưu trữ** | | | | |
| FR-19 | Lưu & khôi phục tiến độ | Lưu vào `localStorage`, khôi phục khi quay lại; xử lý dữ liệu hỏng hoặc trình duyệt chặn lưu | Cao | BR-05 · BG-02, BG-04 |
| FR-20 | Xóa tiến độ | Bắt đầu lại từ đầu, có xác nhận | TB | BR-05 · BG-02 |
| **Cài đặt & môi trường** | | | | |
| FR-21 | Menu tạm dừng | ESC: tiếp tục, cài đặt, hướng dẫn, về sảnh, xóa tiến độ | Cao | BR-10 · BG-02, BG-04 |
| FR-22 | Cài đặt | Chất lượng đồ họa, độ nhạy, đảo trục, âm lượng, nhân vật | Cao | BR-10 · BG-04 |
| FR-23 | Ngày/đêm & pháo hoa | Phím N hoặc nút chuyển ngày/đêm; pháo hoa ngoài khuôn viên ban đêm | Thấp | BR-08 · BG-05 |
| FR-24 | Âm thanh | Nhạc nền, bước chân, hiệu ứng hiện vật; tắt/mở nhanh | TB | BR-08 · BG-05 |
| FR-25 | Toàn màn hình | Bật/tắt toàn màn hình | Thấp | BR-10 · BG-04 |
| **Nội dung & nguồn** | | | | |
| FR-26 | Kiểm tra toàn vẹn dữ liệu khi build | Build thất bại nếu dữ liệu hiện vật/trắc nghiệm sai cấu trúc | Cao | BR-02, BR-03 · BG-01 |
| FR-27 | Nguồn & giấy phép | Bảng "Về giáo trình" ở sảnh và trang "Nguồn & giấy phép" trong menu | TB | BR-03 · BG-01 |

### 3.2 Đặc tả chi tiết từng FR

#### FR-01 — Khởi động & tải tài nguyên
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách tham quan / mở URL của app / *Thành công:* màn mở đầu hiện, sẵn sàng vào bảo tàng; *Thất bại:* màn lỗi có nguyên nhân và cách xử lý, không có màn hình đen.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Mở URL | Kiểm tra WebGL2 (`canvas.getContext('webgl2')` khác null) | — |
  | 2 | — | Hiện màn tải: tên sản phẩm, thanh tiến trình theo % dung lượng gói tải ban đầu đã nhận | — |
  | 3 | — | Đọc tiến độ và cài đặt (FR-19); chọn mức chất lượng ban đầu (FR-22 BR-S12) | R: Progress, Settings |
  | 4 | — | Tải xong gói ban đầu → hiện màn mở đầu: dòng "BẢO TÀNG SỐ · KHÔNG GIAN 3D", tiêu đề "Hành trình Triết học Mác – Lênin", đoạn giới thiệu, nút "Bắt đầu tham quan →" (hoặc "Tiếp tục tham quan →" nếu đã có tiến độ, kèm dòng "Đã khám phá N/63 hiện vật") | — |
  | 5 | Bấm nút | Lần đầu: sang FR-02 rồi FR-03. Đã chơi trước đó: đặt nhân vật ở sảnh, vào chế độ chơi | — |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Không có WebGL2 → màn lỗi: "Trình duyệt hoặc máy của bạn không hỗ trợ WebGL2 nên không chạy được bảo tàng 3D. Hãy mở bằng Chrome hoặc Edge bản mới nhất." Dừng.
  - 2a. Một file tài nguyên tải lỗi (HTTP ≠ 2xx hoặc lỗi mạng) → tự thử lại tối đa 2 lần, cách nhau 2 giây. Vẫn lỗi → màn lỗi: "Không tải được dữ liệu bảo tàng. Kiểm tra kết nối mạng rồi bấm Thử lại." + nút "Thử lại" (tải lại các file còn thiếu, không tải lại file đã có).
  - 2b. Màn tải quá 30 giây mà chưa xong → hiện thêm dòng "Mạng đang chậm, vui lòng chờ thêm…" (vẫn tiếp tục tải).
  - 3a. `localStorage` lỗi → xử lý theo FR-19 (3a, 3b), không chặn khởi động.
  - *. Mất ngữ cảnh WebGL (`webglcontextlost`) ở bất kỳ bước nào → hiện "Mất kết nối đồ họa, đang khôi phục…"; khôi phục trong 5 giây (`webglcontextrestored`) thì chơi tiếp; quá 5 giây → nút "Tải lại trang". Tiến độ đã lưu không mất.
- **Quy tắc:** BR-S10: tài nguyên của từng khu (A, B, C, phòng ôn tập) được tải dần sau gói ban đầu, không chặn việc vào chơi. Người dùng đi tới khu chưa tải xong thì cửa khu đó hiện "Đang chuẩn bị phòng…" và nhân vật không đi qua được cho tới khi tải xong.
- **Tiêu chí chấp nhận:**
  - Given trình duyệt không có WebGL2 — When mở URL — Then hiện đúng thông báo 1a, không có màn hình đen.
  - Given chặn mạng tới một file GLB — When tải — Then thử lại 2 lần rồi hiện màn lỗi có nút "Thử lại"; bỏ chặn và bấm "Thử lại" thì vào được màn mở đầu.
  - Given đã có tiến độ 12/63 — When mở lại URL — Then màn mở đầu hiện "Tiếp tục tham quan →" và "Đã khám phá 12/63 hiện vật".

#### FR-02 — Chọn nhân vật
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / lần chơi đầu (Progress chưa có `character`) / *Thành công:* lưu `character`, nhân vật tương ứng xuất hiện ở khuôn viên.
- **Luồng chính:** (1) Hiện 2 thẻ "Nam", "Nữ" có ảnh xem trước, mặc định chọn "Nam". (2) Người dùng chọn một thẻ và bấm "Chọn" → lưu, sang FR-03.
- **Luồng thay thế:** 2a. Đổi nhân vật sau này trong Cài đặt (FR-22) → thay mô hình ngay, giữ nguyên vị trí và tiến độ.
- **Tiêu chí chấp nhận:** Given lần chơi đầu — When chọn "Nữ" — Then nhân vật nữ xuất hiện; tải lại trang thì vẫn là nhân vật nữ và không hỏi lại.

#### FR-03 — Hướng dẫn điều khiển
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / vào chơi lần đầu (`tutorialSeen = false`) hoặc bấm nút "?" / hướng dẫn đóng lại, `tutorialSeen = true`.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Vào chơi lần đầu | Hiện bảng hướng dẫn theo loại thiết bị; tạm dừng điều khiển | R: Progress |
  | 2 | Bấm "Đã hiểu" | Đóng bảng, cho điều khiển | U: Progress.tutorialSeen = true |
- **Nội dung hướng dẫn:**
  - Máy tính: "WASD hoặc phím mũi tên: đi · Shift: chạy · Chuột: xoay camera (bấm vào màn hình để bắt đầu) · Cuộn chuột: zoom · E: xem hiện vật · V: đổi góc nhìn · N: ngày/đêm · M: bản đồ · ESC: tạm dừng".
  - Cảm ứng: "Joystick trái: đi · Kéo nửa phải màn hình: xoay camera · Nút Xem: xem hiện vật · Nút ☰: tạm dừng".
- **Luồng thay thế:** 1a. Mở lại bằng nút "?" trên HUD hoặc mục "Hướng dẫn" trong menu tạm dừng → hiện cùng nội dung, không đổi `tutorialSeen`.
- **Tiêu chí chấp nhận:** Given lần chơi đầu trên điện thoại — When vào chơi — Then hiện hướng dẫn cảm ứng (không hiện phím bấm); bấm "Đã hiểu", tải lại trang thì hướng dẫn không tự hiện nữa.

#### FR-04 — Điều khiển nhân vật bằng bàn phím
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách trên máy tính / đang ở chế độ chơi (không mở popup, bảng hiện vật, menu) / nhân vật đổi vị trí và hướng, không xuyên vật cản.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống |
  |---|----------------------|-------------------|
  | 1 | Giữ W/A/S/D hoặc ↑/←/↓/→ | Nhân vật đi theo hướng tương ứng **so với hướng camera** (W = về phía camera đang nhìn) ở tốc độ đi; xoay mặt về hướng di chuyển trong ≤ 0,2 giây; phát hoạt ảnh `walk` |
  | 2 | Giữ thêm Shift | Tốc độ chạy, hoạt ảnh `run` |
  | 3 | Thả hết phím | Dừng trong ≤ 0,15 giây, hoạt ảnh `idle` |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Giữ hai phím chéo (W + D) → đi chéo, tốc độ bằng tốc độ đi thẳng (vector được chuẩn hóa).
  - 1b. Giữ hai phím ngược nhau (W + S) → đứng yên.
  - 1c. Đang mở popup/bảng/menu → bỏ qua phím di chuyển.
  - 1d. Cửa sổ mất focus (`blur`) → coi như thả hết phím (tránh nhân vật tự đi mãi).
- **Quy tắc:** BR-S02: tốc độ đi 2,0 m/s, tốc độ chạy 4,5 m/s (tinh chỉnh được trong code, không có trong cài đặt). Không có nhảy. Hoạt ảnh chuyển mượt (cross-fade 0,2 giây).
- **Tiêu chí chấp nhận:**
  - Given nhân vật đứng ở sảnh — When giữ W 5 giây — Then đi được 10 m ± 0,5 m theo hướng camera, hoạt ảnh `walk`.
  - Given đang giữ W — When chuyển sang tab khác rồi quay lại — Then nhân vật đứng yên.

#### FR-05 — Camera góc nhìn thứ 3 / thứ nhất
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách trên máy tính / đang chơi / camera đúng chế độ, không nhìn xuyên tường.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống |
  |---|----------------------|-------------------|
  | 1 | Bấm chuột vào khung 3D | Khóa con trỏ (pointer lock) |
  | 2 | Di chuột | Camera xoay quanh nhân vật: ngang không giới hạn, dọc trong [−60°, +60°]; tốc độ theo độ nhạy (FR-22) |
  | 3 | Cuộn chuột | Đổi khoảng cách camera trong [1,5 m; 5 m], mặc định 3 m |
  | 4 | Bấm V | Chuyển góc nhìn thứ nhất (camera ở mắt nhân vật, ẩn mô hình nhân vật); bấm V lần nữa thì trở lại góc nhìn thứ 3 ở khoảng cách trước đó |
- **Luồng thay thế / ngoại lệ:**
  - 2a. Giữa nhân vật và camera có tường/vật cản (raycast từ đầu nhân vật tới vị trí camera) → đưa camera tới trước điểm va chạm 0,2 m; hết vật cản thì trả về khoảng cách cũ có damping.
  - 2b. Bật "Đảo trục dọc" → hướng xoay dọc đảo ngược.
  - 1a. Người dùng bấm ESC → trình duyệt tự nhả pointer lock → hệ thống mở menu tạm dừng (FR-21).
  - 1b. Trình duyệt từ chối pointer lock (ví dụ trong iframe bị chặn) → vẫn xoay được khi **giữ chuột trái và kéo**.
  - 3a. Ở góc nhìn thứ nhất → cuộn chuột không có tác dụng.
- **Tiêu chí chấp nhận:**
  - Given nhân vật đứng sát tường, lưng quay vào tường — When xoay camera ra sau — Then camera không bao giờ ở phía bên kia tường (kiểm bằng mắt ở 10 vị trí sát tường trong 10 phòng).
  - Given khoảng cách 3 m — When cuộn ra hết — Then dừng ở 5 m; cuộn vào hết thì dừng ở 1,5 m.

#### FR-06 — Điều khiển cảm ứng
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách trên thiết bị cảm ứng / đang chơi / như FR-04, FR-05.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống |
  |---|----------------------|-------------------|
  | 1 | Chạm và kéo trong vùng joystick (góc dưới trái) | Nhân vật đi theo hướng kéo so với camera; kéo ≤ 60% bán kính → đi, > 60% → chạy |
  | 2 | Kéo một ngón ở nửa phải màn hình (ngoài các nút) | Xoay camera như di chuột |
  | 3 | Chụm/mở hai ngón ở nửa phải | Zoom như cuộn chuột |
  | 4 | Bấm nút "Xem" (chỉ hiện khi có hiện vật trong tầm, FR-12) | Như bấm E |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Hai ngón cùng lúc: một ngón joystick, một ngón xoay camera → xử lý đồng thời, không ngón nào cướp ngón kia.
  - 1b. Ngón rời màn hình hoặc sự kiện `touchcancel` → joystick về giữa, nhân vật dừng.
  - *. Màn hình dọc (chiều cao > chiều rộng) → hiện lớp gợi ý "Xoay ngang điện thoại để dễ chơi hơn" có nút "Vẫn chơi màn dọc"; đã bấm nút thì không hiện lại trong phiên.
- **Quy tắc:** BR-S03: mọi nút cảm ứng có vùng chạm ≥ 44 × 44 px CSS. Trang chặn cuộn và zoom mặc định của trình duyệt trong khung chơi.
- **Tiêu chí chấp nhận:** Given điện thoại cầm ngang — When kéo joystick lên đồng thời kéo nửa phải sang trái — Then nhân vật vừa đi vừa xoay camera; nhấc ngón joystick thì dừng ngay.

#### FR-07 — Va chạm & thoát kẹt
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / đang chơi / nhân vật luôn ở trong vùng đi được.
- **Luồng chính:** Mỗi khung hình, hệ thống kiểm tra va chạm thân nhân vật (hình viên nang, bán kính 0,3 m, cao 1,7 m) với hình va chạm của tòa nhà và hiện vật; đẩy nhân vật ra khỏi vật cản; nhân vật trượt dọc theo tường khi đi chéo vào tường.
- **Luồng thay thế / ngoại lệ:**
  - a. Vị trí nhân vật thấp hơn mặt sàn 2 m hoặc ra ngoài hộp bao của khuôn viên → tự đưa về sảnh, hiện thông báo "Đã đưa bạn về sảnh."
  - b. Người dùng tự thấy bị kẹt → chọn "Về sảnh" trong menu tạm dừng (FR-21) → đưa về sảnh ngay, giữ tiến độ.
  - c. Khung hình kéo dài (> 100 ms, ví dụ khi tab bị ẩn rồi hiện lại) → chia bước mô phỏng thành các bước ≤ 1/60 giây hoặc bỏ qua bước thừa để nhân vật không xuyên tường.
- **Quy tắc:** BR-S04: cửa phòng rộng ≥ 1,6 m, hành lang rộng ≥ 3 m, khoảng trống quanh bục hiện vật ≥ 1 m để nhân vật không bị kẹt.
- **Tiêu chí chấp nhận:**
  - Given nhân vật chạy thẳng vào tường ở 10 vị trí khác nhau — When giữ phím 5 giây — Then không lần nào xuyên tường.
  - Given đang ở phòng P07 — When chọn "Về sảnh" — Then nhân vật ở sảnh trong ≤ 1 giây, tiến độ không đổi.

#### FR-08 — Bố cục bảo tàng
- **Mô tả:** Không gian theo thứ tự: khuôn viên (điểm xuất phát) → sảnh → hành lang → 10 phòng đặt xen kẽ hai bên hành lang theo đúng thứ tự P01…P10 → phòng ôn tập ở cuối hành lang.
- **Quy tắc:**
  - BR-S05: Màu chủ đạo theo khu (thảm, viền cửa, biển phòng): Khu A đỏ đô, Khu B xanh lam đậm, Khu C vàng đồng. Mã màu cụ thể do designer chốt ở `design.md`.
  - BR-S06: Mỗi cửa phòng có biển ghi "Phòng 0X · <tên phòng>" đọc được từ giữa hành lang. P04 có diện tích ≥ 1,5 lần phòng thường và chia ba khu: nguyên lý, phạm trù, quy luật.
  - BR-S07: Sảnh có pano chào (trích Mác, tr.438), sơ đồ bảo tàng và bảng "Về giáo trình" (FR-27). Các đối tượng này không tính là hiện vật.
  - Số phòng, tên phòng, khoảng trang và danh sách hiện vật trong mỗi phòng đúng như NOI_DUNG.md.
- **Tiêu chí chấp nhận:** Given đi dọc hành lang từ sảnh — When đọc biển các cửa — Then thấy lần lượt Phòng 01 → Phòng 10 đúng tên trong NOI_DUNG.md, màu đúng khu, phòng ôn tập ở cuối.

#### FR-09 — Vào phòng
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / nhân vật đi từ hành lang qua ngưỡng cửa phòng / *Đi vào:* nhân vật ở trong phòng; *Quay lại:* nhân vật ở hành lang.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Đi tới ngưỡng cửa một phòng chưa vào trong phiên này | Dừng nhân vật, hiện popup "Phòng 0X · Chương N — <tên phòng>", dòng "Giáo trình tr.<từ>–<đến>", số hiện vật đã khám phá trong phòng "k/n", hai nút "Quay lại" và "Đi vào phòng" | R: Room, Progress |
  | 2 | Bấm "Đi vào phòng" | Đóng popup, cho đi tiếp vào phòng | — |
- **Luồng thay thế:**
  - 2a. Bấm "Quay lại" hoặc ESC → đóng popup, lùi nhân vật 1 m ra hành lang.
  - 1a. Phòng đã vào trong phiên này → không hiện popup; chỉ hiện thông báo nhỏ "Phòng 0X — <tên phòng>" trong 3 giây ở giữa phía trên màn hình.
  - 1b. Vào phòng ôn tập → popup "Phòng ôn tập" kèm dòng "Mỗi trạm là bài trắc nghiệm của một phòng."
- **Tiêu chí chấp nhận:** Given phiên mới — When đi vào P03 lần thứ nhất — Then hiện popup đúng tên và trang; đi ra rồi vào lại thì chỉ hiện thông báo 3 giây.

#### FR-10 — Bản đồ nhỏ
- **Mô tả:** Bản đồ nhìn từ trên xuống ở góc trên phải, vẽ từ sơ đồ phòng.
- **Quy tắc:** BR-S08: mỗi phòng tô màu theo khu; phòng đã khám phá đủ hiện vật có dấu ✓; phòng "đã nắm vững" (FR-16) có dấu ★; vị trí và hướng nhân vật là mũi tên. Phím M (hoặc chạm vào bản đồ) phóng to bản đồ ra giữa màn hình kèm chú thích; bấm M, ESC hoặc chạm ngoài để thu nhỏ. Bản đồ chỉ để xem, không dịch chuyển.
- **Tiêu chí chấp nhận:** Given đã khám phá đủ 7/7 hiện vật P01 và trả lời đúng hết trắc nghiệm P01 — When nhìn bản đồ — Then P01 có cả ✓ và ★.

#### FR-11 — HUD
- **Mô tả:** Lớp giao diện chồng lên khung 3D khi đang chơi.
- **Thành phần:** góc trên trái: tên khu vực hiện tại ("Sảnh", "Hành lang", "Phòng 0X — <tên>", "Phòng ôn tập", "Khuôn viên") và tiến độ "N/63" kèm thanh tiến trình; góc trên phải: bản đồ nhỏ (FR-10); hàng nút: âm thanh (FR-24), ngày/đêm (FR-23), hướng dẫn "?" (FR-03), toàn màn hình (FR-25), menu ☰ (FR-21).
- **Quy tắc:** HUD ẩn khi mở bảng hiện vật, popup, menu, trắc nghiệm. N đếm từ dữ liệu, không ghi cứng.
- **Tiêu chí chấp nhận:** Given vừa khám phá hiện vật thứ 5 — When đóng bảng hiện vật — Then HUD hiện "5/63".

#### FR-12 — Phát hiện hiện vật ở gần
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / đang chơi / hiện vật mục tiêu được đánh dấu.
- **Luồng chính:** Mỗi khung hình, chọn **hiện vật mục tiêu** là hiện vật gần nhất thỏa BR-S09. Có mục tiêu → hiện vật có viền sáng; hiện lời nhắc "E · Xem <tên hiện vật>" (máy tính) hoặc nút "Xem" (cảm ứng). Bấm E hoặc nút → FR-13 (hoặc FR-14 với 🎛).
- **Quy tắc:** BR-S09: hiện vật là mục tiêu khi khoảng cách ngang từ nhân vật tới điểm tương tác của hiện vật ≤ 2,0 m **và** góc giữa hướng nhìn (góc nhìn thứ 3: hướng mặt nhân vật; góc nhìn thứ nhất: hướng camera) và hướng tới hiện vật ≤ 60°. Nhiều hiện vật cùng thỏa → chọn cái gần nhất. Hiện vật đã khám phá vẫn xem lại được; lời nhắc của hiện vật đã khám phá có thêm dấu ✓.
- **Luồng thay thế:** a. Bấm E khi không có mục tiêu → không làm gì.
- **Tiêu chí chấp nhận:**
  - Given đứng cách hiện vật 1,5 m, mặt hướng về nó — Then có viền sáng và lời nhắc; quay lưng lại thì mất lời nhắc.
  - Given đứng cách 2,5 m — Then không có lời nhắc.

#### FR-13 — Xem chi tiết hiện vật (🖼 📜 🧊)
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / có hiện vật mục tiêu (FR-12) / *Thành công:* bảng hiện ra; nếu là lần mở đầu thì hiện vật thành "đã khám phá" (FR-15).
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Bấm E / "Xem" | Khóa di chuyển; nhả pointer lock; camera bay tới góc nhìn định sẵn của hiện vật trong ≤ 1 giây; nhân vật phát hoạt ảnh `look` | R: Exhibit |
  | 2 | — | Mở bảng thông tin: biểu tượng loại, tên, phòng ("Phòng 0X · <tên phòng>"), nội dung, trích dẫn (nếu có, in nghiêng, ghi tác giả), dòng nguồn "Giáo trình Triết học Mác – Lênin (2021), tr.<trang>"; nhãn "(minh họa)" nếu hiện vật là ví dụ không có trong sách | — |
  | 3 | — | Lần mở đầu tiên: ghi khám phá (FR-15), hiện thông báo "Đã khám phá: <tên> (N/63)" trong 3 giây | U: Progress.explored |
  | 4 | Bấm "Đóng", ESC hoặc E | Đóng bảng, camera bay về vị trí trước đó trong ≤ 0,5 giây, mở lại điều khiển | — |
- **Luồng thay thế / ngoại lệ:**
  - 2a. Hiện vật loại 🧊 → mô hình hiện trong khung xem bên cạnh bảng; kéo chuột/ngón tay để xoay: ngang 360°, dọc trong [−30°, +30°]; nút "Đặt lại góc" đưa về góc ban đầu.
  - 2b. Nội dung dài hơn khung → khung nội dung cuộn được bằng chuột, bàn phím (↑/↓, PageUp/PageDown) và vuốt.
  - 2c. Hiện vật 🖼 có ảnh chân dung → ảnh hiện trong bảng, dưới ảnh ghi nguồn ảnh và giấy phép.
  - 3a. Không ghi được `localStorage` → vẫn tính khám phá trong bộ nhớ (FR-19 3b).
- **Tiêu chí chấp nhận:**
  - Given hiện vật `b3-dinh-nghia` chưa khám phá, HUD "0/63" — When mở bảng — Then thấy đúng tên, trích dẫn định nghĩa vật chất, "tr.128–134"; HUD sau khi đóng là "1/63".
  - Given mở lại `b3-dinh-nghia` — Then HUD vẫn "1/63", không hiện thông báo "Đã khám phá".
  - Given hiện vật 🧊 `b5-thuc-tien` — When kéo chuột lên hết — Then mô hình dừng ở +30°.

#### FR-14 — Hiện vật tương tác 🎛
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / mục tiêu là hiện vật 🎛 / hiện vật đã khám phá; người dùng xem được phần giải thích.
- **Luồng chính (khuôn chung cho cả 13 hiện vật):**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Bấm E / "Xem" | Như FR-13 bước 1; mở bảng ở trạng thái **Sẵn sàng**: tên, một câu hướng dẫn thao tác, nút "Bắt đầu" | R: Exhibit |
  | 2 | — | Ghi khám phá nếu là lần mở đầu (như FR-13 bước 3) | U: Progress.explored |
  | 3 | Bấm "Bắt đầu" | Sang **Đang thao tác**: hiện điều khiển riêng của hiện vật (bảng dưới) | — |
  | 4 | Thao tác tới khi đạt điều kiện hoàn thành | Sang **Hoàn thành**: phát hiệu ứng/âm thanh, hiện phần nội dung đầy đủ như FR-13 bước 2 | — |
  | 5 | Bấm "Làm lại" hoặc "Đóng" | "Làm lại" → về Sẵn sàng; "Đóng" → như FR-13 bước 4 | — |
- **Luồng thay thế:** 3a. Bấm "Xem giải thích luôn" (có ở cả Sẵn sàng và Đang thao tác) → chuyển thẳng sang Hoàn thành. 4a. Đóng giữa chừng → lần sau mở lại bắt đầu từ Sẵn sàng.
- **Bảng trạng thái:** `Sẵn sàng | Bắt đầu | — | Đang thao tác` · `Đang thao tác | đạt điều kiện | — | Hoàn thành` · `Sẵn sàng hoặc Đang thao tác | Xem giải thích luôn | — | Hoàn thành` · `Hoàn thành | Làm lại | — | Sẵn sàng` · `bất kỳ | Đóng | — | (đóng bảng)`.
- **Danh mục 13 hiện vật 🎛:**

  | Mã | Thao tác | Điều kiện hoàn thành |
  |----|----------|----------------------|
  | a1-van-de-co-ban | Kéo nghiêng cán cân về một phía | Đã nghiêng hết về cả hai phía (Vật chất, Ý thức), mỗi phía mở nhánh duy vật / duy tâm |
  | a1-cay-va-rung | Kéo thanh trượt lùi camera từ một cái cây ra cả khu rừng | Thanh trượt tới 100% |
  | a2-ke-sach | Chạm từng cuốn sách để mở dòng tóm tắt | Đã mở ≥ 3 cuốn |
  | b3-van-dong | Chạm lần lượt năm bậc thang từ thấp lên cao | Đã chạm đủ 5 bậc đúng thứ tự cơ học → xã hội |
  | b3-tam-guong | Di chuyển vật trước tấm gương, ảnh phản chiếu đổi theo | Đã di chuyển qua ≥ 3 vị trí |
  | b4-lien-he | Chạm một nút của lưới, cả lưới rung | Đã chạm ≥ 1 nút |
  | b4-nhan-qua | Đẩy quân domino đầu tiên | Quân cuối đổ |
  | b4-tat-nhien | Thả xúc xắc nhiều lần, đường đi tất nhiên hiện dần | Đã thả ≥ 5 lần |
  | b4-luong-chat | Kéo thanh nhiệt độ ấm nước từ 20 °C | Tới 100 °C: nước sôi, hiện chú thích điểm nút và bước nhảy |
  | b5-con-duong | Đi qua ba chặng: trực quan sinh động → tư duy trừu tượng → thực tiễn | Đã qua chặng thứ 3 |
  | c6-banh-rang | Xoay bánh răng LLSX; bật/tắt chế độ "khớp" và "lệch" của QHSX | Đã thấy cả hai trạng thái (máy chạy và máy kẹt) |
  | c8-tinh-the | Chạm các mốc thời gian 1945 theo thứ tự | Đã mở đủ 4 mốc (9/3, 12/3, nạn đói, 19/8–2/9) |
  | c9-bay-cot | Chạm từng cột hình thái ý thức xã hội | Đã chạm đủ 7 cột |

  Chi tiết hình ảnh và bố trí điều khiển của từng hiện vật do FSD + design.md đặc tả ở B3.
- **Tiêu chí chấp nhận:**
  - Given `b4-luong-chat` ở Sẵn sàng — When bấm Bắt đầu và kéo thanh tới 100 °C — Then nước sôi, hiện chú thích "điểm nút", "bước nhảy" và nội dung đầy đủ.
  - Given `b4-nhan-qua` chưa khám phá — When mở rồi đóng ngay — Then hiện vật đã tính là khám phá.
  - Given đang thao tác `c9-bay-cot` — When bấm "Xem giải thích luôn" — Then sang Hoàn thành.

#### FR-15 — Ghi nhận khám phá & tiến độ
- **Quy tắc:**
  - BR-S01: Hiện vật được tính là đã khám phá **ngay khi mở bảng chi tiết lần đầu**, cho cả 4 loại. Không có thao tác bỏ đánh dấu riêng lẻ (chỉ xóa toàn bộ bằng FR-20).
  - Tổng N/63 = số mã trong `Progress.explored` thuộc danh sách hiện vật hiện hành. Tổng 63 lấy từ dữ liệu.
  - Một phòng "đã khám phá đủ" khi mọi hiện vật của phòng nằm trong `explored`.
  - Mỗi lần thêm mã vào `explored` → lưu ngay (FR-19).
- **Tiêu chí chấp nhận:** Given dữ liệu có 63 hiện vật — When mở lần lượt cả 63 — Then HUD đi từ 0/63 tới 63/63, không bỏ sót hay đếm trùng.

#### FR-16 — Trắc nghiệm theo phòng
- **Actor / Tiền điều kiện / Hậu điều kiện:** Khách / đứng ở trạm trắc nghiệm của phòng X trong phòng ôn tập (phát hiện như FR-12) / *Nộp bài:* lưu kết quả lượt tốt nhất; *Thoát giữa chừng:* không lưu gì.
- **Luồng chính:**

  | # | Hành động người dùng | Phản ứng hệ thống | Dữ liệu |
  |---|----------------------|-------------------|---------|
  | 1 | Bấm E / "Xem" ở trạm phòng X | Mở bảng trắc nghiệm: tên phòng, số câu, kết quả tốt nhất trước đó (nếu có), nút "Bắt đầu" | R: Quiz, Progress.quiz |
  | 2 | Bấm "Bắt đầu" | Hiện lần lượt từng câu theo thứ tự cố định; 4 phương án A–D được xáo thứ tự mỗi lượt | — |
  | 3 | Chọn một phương án, bấm "Trả lời" | Khóa câu; tô xanh phương án đúng, tô đỏ phương án đã chọn nếu sai; hiện giải thích của câu; nếu sai thì kèm gợi ý FR-17 | — |
  | 4 | Bấm "Câu tiếp" | Sang câu sau; sau câu cuối hiện màn kết quả | — |
  | 5 | — | Màn kết quả: "Đúng k/n câu"; nếu k = n: "Bạn đã nắm vững Phòng 0X!" và đánh dấu ★; nếu k < n: danh sách hiện vật cần xem lại (gộp gợi ý của các câu sai, không trùng) + nút "Làm lại" | U: Progress.quiz[X] |
- **Luồng thay thế / ngoại lệ:**
  - 3a. Bấm "Trả lời" khi chưa chọn phương án → nút "Trả lời" ở trạng thái vô hiệu, có chú thích "Hãy chọn một đáp án."
  - 2a. Đóng bảng (ESC hoặc "Đóng") giữa chừng → hỏi "Thoát bài trắc nghiệm? Kết quả lượt này sẽ không được lưu." (Thoát / Làm tiếp).
  - 5a. Kết quả lượt này thấp hơn lượt tốt nhất → giữ lượt tốt nhất. Phòng đã ★ thì giữ ★ dù lượt sau sai.
- **Validate dữ liệu đầu vào (người dùng):**

  | Trường | Bắt buộc | Kiểu | Miền giá trị | Thông báo lỗi |
  |--------|:-------:|------|--------------|---------------|
  | Đáp án đã chọn | Có (để bấm Trả lời) | Một lựa chọn | Đúng 1 trong 4 phương án của câu | "Hãy chọn một đáp án." |
- **Quy tắc:**
  - BR-S11: Trắc nghiệm của mọi phòng mở ngay từ đầu, **không** yêu cầu đã khám phá phòng đó.
  - Mỗi phòng có 3–5 câu; mỗi câu đúng 4 phương án, đúng 1 phương án đúng, có giải thích ≤ 300 ký tự và gắn với ≥ 1 mã hiện vật của **chính phòng đó** (`exhibitIds`). Ràng buộc được kiểm khi build (FR-26).
  - Điểm lượt = số câu đúng / tổng số câu của phòng. "Đã nắm vững" ⇔ điểm lượt = 100%.
  - Câu hỏi do BA tự biên soạn từ nội dung hiện vật ở mốc M2; anh Duy rà trước GATE-4.
- **Bảng trạng thái của phòng (về trắc nghiệm):** `Chưa làm | nộp bài | k < n | Chưa đạt` · `Chưa làm | nộp bài | k = n | Đã nắm vững` · `Chưa đạt | nộp bài | k = n | Đã nắm vững` · `Chưa đạt | nộp bài | k < n | Chưa đạt` · `Đã nắm vững | nộp bài | bất kỳ | Đã nắm vững` · `bất kỳ | Xóa tiến độ (FR-20) | — | Chưa làm`.
- **Tiêu chí chấp nhận:**
  - Given P05 có 4 câu — When trả lời đúng 4/4 — Then màn kết quả "Đúng 4/4 câu", P05 có ★ trên bản đồ.
  - Given P05 đã ★ — When làm lại và đúng 2/4 — Then P05 vẫn ★, kết quả tốt nhất vẫn 4/4.
  - Given đang ở câu 2 — When bấm ESC và chọn Thoát — Then không có kết quả mới được lưu.

#### FR-17 — Gợi ý xem lại khi trả lời sai
- **Quy tắc:** Với mỗi câu trả lời sai, hiện dòng "Xem lại: <tên hiện vật> (Phòng 0X)" cho từng mã trong `exhibitIds` của câu. Hiện vật được gợi ý có viền màu cam trên bản đồ phóng to (FR-10) cho tới khi người dùng mở lại nó.
- **Tiêu chí chấp nhận:** Given câu hỏi gắn `b4-luong-chat` — When trả lời sai — Then hiện "Xem lại: Lượng đổi – Chất đổi (Phòng 04)".

#### FR-18 — Màn hoàn thành
- **Luồng chính:** Ngay sau khi hiện vật thứ 63 được khám phá và người dùng đóng bảng hiện vật → hiện màn "Bạn đã khám phá 63 / 63 hiện vật. Hãy ghé Phòng ôn tập để kiểm tra kiến thức." kèm câu trích ở khu hoàn thành, hai nút "Tiếp tục tham quan" và "Tới Phòng ôn tập" (đưa nhân vật tới cửa phòng ôn tập). Ghi `completedShown = true`.
- **Luồng thay thế:** a. `completedShown = true` → không tự hiện lại; vẫn xem được qua menu tạm dừng nếu đã đủ 63/63.
- **Tiêu chí chấp nhận:** Given đã khám phá 62/63 — When đóng bảng của hiện vật cuối — Then hiện màn hoàn thành đúng một lần.

#### FR-19 — Lưu & khôi phục tiến độ
- **Actor / Tiền điều kiện / Hậu điều kiện:** Hệ thống / khởi động (đọc) hoặc tiến độ/cài đặt thay đổi (ghi) / dữ liệu trong `localStorage` khớp trạng thái trong bộ nhớ.
- **Luồng chính:**

  | # | Sự kiện | Phản ứng hệ thống | Dữ liệu |
  |---|---------|-------------------|---------|
  | 1 | Khởi động | Đọc khóa `bttr.progress.v1` và `bttr.settings.v1`, parse JSON, validate theo bảng dưới | R: Progress, Settings |
  | 2 | Khám phá hiện vật, nộp trắc nghiệm, đổi cài đặt, đổi nhân vật, đóng hướng dẫn | Ghi lại khóa tương ứng ngay | U: Progress / Settings |
- **Luồng thay thế / ngoại lệ:**
  - 1a. Không có khóa → dùng giá trị mặc định (người chơi mới).
  - 1b. JSON hỏng, sai kiểu, hoặc `version` khác 1 → dùng mặc định, hiện thông báo "Không đọc được tiến độ cũ nên bảo tàng bắt đầu lại từ đầu." trong 5 giây.
  - 1c. Hợp lệ nhưng có mã hiện vật/phòng không còn trong dữ liệu → bỏ các mã đó, giữ phần còn lại, không báo lỗi.
  - 3a. Trình duyệt chặn `localStorage` (truy cập ném lỗi) → chạy với bộ nhớ tạm; hiện một lần trong phiên: "Trình duyệt đang chặn lưu trữ nên tiến độ sẽ mất khi đóng trang."
  - 3b. Ghi thất bại (ví dụ `QuotaExceededError`) → giữ trạng thái trong bộ nhớ, hiện thông báo như 3a một lần trong phiên, các lần ghi sau vẫn thử lại.
- **Validate dữ liệu đọc từ `localStorage`:**

  | Trường | Bắt buộc | Kiểu | Miền giá trị / ràng buộc | Khi sai |
  |--------|:-------:|------|--------------------------|---------|
  | progress.version | Có | Số nguyên | = 1 | 1b |
  | progress.explored | Có | Mảng chuỗi | Mỗi phần tử là mã hiện vật hợp lệ; bỏ trùng | Phần tử lạ: 1c; không phải mảng: 1b |
  | progress.quiz | Có | Đối tượng | Khóa là `P01`…`P10`; giá trị `{ best: số nguyên 0..n, total: n, mastered: boolean }`, n là số câu hiện tại của phòng | Khóa lạ: 1c; `total` ≠ số câu hiện tại: bỏ kết quả phòng đó (1c); sai kiểu: 1b |
  | progress.character | Không | Chuỗi | `nam` \| `nu` | Thiếu hoặc lạ: coi như chưa chọn → hỏi lại FR-02 |
  | progress.tutorialSeen | Có | boolean | — | 1b |
  | progress.completedShown | Có | boolean | — | 1b |
  | settings.version | Có | Số nguyên | = 1 | Dùng cài đặt mặc định, không báo |
  | settings.quality | Có | Chuỗi | `low` \| `medium` \| `high` | Mặc định theo thiết bị (BR-S12) |
  | settings.qualityManual | Có | boolean | — | `false` |
  | settings.sensitivity | Có | Số | 0,1 – 3,0 | 1,0 |
  | settings.invertY | Có | boolean | — | `false` |
  | settings.volumeMusic, volumeSfx | Có | Số nguyên | 0 – 100 | 60, 80 |
  | settings.muted | Có | boolean | — | `false` |
  | settings.night | Có | boolean | — | `false` |
- **Quy tắc:** Chỉ lưu các trường trên. Không lưu bất kỳ dữ liệu định danh nào (tên, email, IP, mã thiết bị). Không gửi dữ liệu này ra mạng.
- **Tiêu chí chấp nhận:**
  - Given đã khám phá 10 hiện vật — When tải lại trang — Then HUD "10/63".
  - Given sửa tay `bttr.progress.v1` thành `abc` — When tải lại — Then bắt đầu từ 0/63 và hiện thông báo 1b; app không lỗi.
  - Given trình duyệt chặn lưu trữ — When chơi — Then chơi bình thường, hiện thông báo 3a đúng một lần.

#### FR-20 — Xóa tiến độ
- **Luồng chính:** (1) Menu tạm dừng → "Xóa tiến độ". (2) Hộp xác nhận: "Xóa toàn bộ tiến độ khám phá và kết quả trắc nghiệm? Không thể hoàn tác." (Hủy / Xóa). (3) Bấm "Xóa" → xóa khóa `bttr.progress.v1`, giữ cài đặt, đưa người dùng về màn mở đầu như lần chơi đầu (có FR-02, FR-03).
- **Luồng thay thế:** 2a. Bấm "Hủy" hoặc ESC → đóng hộp, không đổi gì.
- **Tiêu chí chấp nhận:** Given 20/63 và P01 ★ — When xóa tiến độ — Then 0/63, không còn ★, cài đặt chất lượng vẫn giữ.

#### FR-21 — Menu tạm dừng
- **Luồng chính:** ESC (máy tính) hoặc nút ☰ → dừng điều khiển và âm thanh bước chân, làm mờ khung 3D, mở menu: "Tiếp tục", "Cài đặt", "Hướng dẫn", "Về sảnh", "Nguồn & giấy phép", "Xem màn hoàn thành" (chỉ hiện khi đủ 63/63), "Xóa tiến độ".
- **Luồng thay thế:** a. Đang mở bảng hiện vật/popup/trắc nghiệm thì ESC đóng lớp đó trước, không mở menu. b. Tab bị ẩn (`visibilitychange`) khi đang chơi → tự mở menu tạm dừng và dừng nhạc; hiện lại tab thì giữ ở menu.
- **Tiêu chí chấp nhận:** Given đang chơi — When chuyển sang tab khác rồi quay lại — Then đang ở menu tạm dừng, nhạc đã dừng.

#### FR-22 — Cài đặt
- **Luồng chính:** Mở từ menu tạm dừng. Mọi thay đổi áp dụng ngay và lưu (FR-19).
- **Validate từng trường:**

  | Trường | Điều khiển | Miền giá trị | Mặc định | Ghi chú |
  |--------|-----------|--------------|----------|---------|
  | Chất lượng đồ họa | 3 lựa chọn | Thấp / Trung bình / Cao | Theo BR-S12 | Chọn tay → `qualityManual = true` |
  | Độ nhạy xoay camera | Thanh trượt, bước 0,1 | 0,1 – 3,0 | 1,0 | Áp dụng cho chuột và cảm ứng |
  | Đảo trục dọc | Công tắc | Bật / Tắt | Tắt | |
  | Âm lượng nhạc nền | Thanh trượt, bước 5 | 0 – 100 | 60 | |
  | Âm lượng hiệu ứng | Thanh trượt, bước 5 | 0 – 100 | 80 | Bước chân, hiện vật, pháo hoa |
  | Nhân vật | 2 lựa chọn | Nam / Nữ | Theo FR-02 | |

  Điều khiển chỉ cho chọn trong miền giá trị nên không có thông báo lỗi nhập liệu.
- **Quy tắc:** BR-S12: mức chất lượng ban đầu — thiết bị cảm ứng: Thấp; còn lại: Trung bình. Mức Cao chỉ bật khi người dùng chọn. Nếu `qualityManual = false` và FPS trung bình < 25 trong 5 giây liên tục khi đang chơi (không tính lúc đang tải) → tự hạ một bậc, hiện "Đã giảm chất lượng đồ họa xuống <mức> để chạy mượt hơn." Tự hạ tối đa một lần mỗi phiên. Nội dung từng mức (độ phân giải, bóng đổ, hậu kỳ) do SA quy định trong HLD.
- **Tiêu chí chấp nhận:** Given đổi độ nhạy sang 2,0 — When tải lại trang — Then độ nhạy vẫn 2,0. Given máy yếu, chất lượng tự chọn Trung bình, FPS 18 — When chơi 5 giây — Then tự xuống Thấp và có thông báo, không tự hạ thêm lần nữa.

#### FR-23 — Ngày/đêm & pháo hoa
- **Mô tả:** Phím N hoặc nút ☀/☾ chuyển ngày ↔ đêm; chuyển đổi bầu trời, đèn, sương trong ≤ 2 giây. Ban đêm có pháo hoa trên bầu trời khuôn viên, nhìn thấy từ khuôn viên và qua cửa sổ sảnh. Trạng thái được lưu (`settings.night`).
- **Quy tắc:** Pháo hoa không tạo chớp sáng toàn màn hình quá 3 lần mỗi giây (NFR-08). Ở mức Thấp, số hạt pháo hoa giảm còn ≤ 25% mức Cao.
- **Tiêu chí chấp nhận:** Given ban ngày ở khuôn viên — When bấm N — Then trong ≤ 2 giây thành ban đêm và thấy pháo hoa.

#### FR-24 — Âm thanh
- **Mô tả:** Nhạc nền không lời lặp lại; tiếng bước chân khớp nhịp hoạt ảnh walk/run; âm thanh riêng cho một số hiện vật 🎛 (ấm nước sôi, bánh răng, domino); âm thanh pháo hoa ban đêm. Nút loa trên HUD bật/tắt toàn bộ âm thanh (`muted`).
- **Quy tắc:** Âm thanh chỉ bắt đầu sau thao tác đầu tiên của người dùng (chính sách autoplay của trình duyệt). Âm thanh dừng khi tab bị ẩn.
- **Tiêu chí chấp nhận:** Given bấm nút loa — Then mọi âm thanh tắt ngay; tải lại trang vẫn tắt.

#### FR-25 — Toàn màn hình
- **Mô tả:** Nút ⛶ bật/tắt toàn màn hình bằng Fullscreen API. Trình duyệt không hỗ trợ (ví dụ Safari trên iPhone) → ẩn nút.

#### FR-26 — Kiểm tra toàn vẹn dữ liệu khi build
- **Actor / Tiền điều kiện / Hậu điều kiện:** Dev, CI / chạy lệnh build / *Đạt:* build tiếp; *Không đạt:* build dừng, in danh sách lỗi (mã, trường, lý do).
- **Quy tắc kiểm tra:**

  | Đối tượng | Ràng buộc |
  |-----------|-----------|
  | Phòng | Đúng 10 phòng `P01`…`P10`; mỗi phòng có khu (A/B/C), tên, trang bắt đầu ≤ trang kết thúc |
  | Hiện vật | Mã duy nhất, khớp `^[a-c]\d{1,2}-[a-z0-9-]+$`; loại ∈ {portrait, text, model, interactive}; tên khác rỗng; nội dung khác rỗng; trường trang khác rỗng, mọi số trang nằm trong khoảng trang của phòng chứa nó; thuộc đúng 1 phòng |
  | Tổng | Đúng 63 hiện vật, trong đó đúng 13 loại interactive (khớp NOI_DUNG.md) |
  | Câu trắc nghiệm | Mỗi phòng 3–5 câu; mỗi câu đúng 4 phương án khác nhau, đúng 1 đáp án đúng, có giải thích ≤ 300 ký tự, `exhibitIds` không rỗng và mọi mã thuộc phòng đó |
  | Asset | Mọi file ảnh/mô hình/âm thanh do dữ liệu tham chiếu đều tồn tại; mọi asset bên ngoài có dòng tương ứng trong `CREDITS.md` |
- **Tiêu chí chấp nhận:** Given xóa trường trang của một hiện vật — When build — Then build thất bại và chỉ đúng mã hiện vật đó.

#### FR-27 — Nguồn & giấy phép
- **Mô tả:** (a) Bảng "Về giáo trình" ở sảnh: tên giáo trình, đơn vị biên soạn (Bộ GD&ĐT), NXB Chính trị quốc gia Sự thật, năm 2021, kèm lưu ý "Nội dung trưng bày là bản tóm tắt phục vụ ôn tập; khi học hãy đối chiếu giáo trình." (b) Mục "Nguồn & giấy phép" trong menu tạm dừng: hiển thị nội dung `CREDITS.md` (tên asset, tác giả, nguồn, giấy phép), cuộn được.
- **Tiêu chí chấp nhận:** Given mở "Nguồn & giấy phép" — Then mọi asset bên ngoài dùng trong app đều có tên tác giả và giấy phép.

## 4. Yêu cầu phi chức năng (NFR)

| ID | Loại | Yêu cầu đo được | Cách đo | Truy vết |
|----|------|-----------------|---------|----------|
| NFR-01 | Hiệu năng (máy tính) | FPS trung bình ≥ 60 và FPS thấp nhất (phân vị 5%) ≥ 45 ở mức Trung bình, độ phân giải 1920×1080, trên laptop GPU tích hợp (Intel Iris Xe hoặc tương đương), Chrome bản mới nhất | Đi tuyến chuẩn qua mọi khu, ghi FPS 60 giây mỗi khu | BG-04, BG-05 |
| NFR-02 | Hiệu năng (điện thoại) | FPS trung bình ≥ 30 ở mức Thấp trên điện thoại Android tầm trung (chip Snapdragon 6-series hoặc Helio G9x, RAM 6 GB, đời 2022 trở về sau), Chrome Android | Như NFR-01 | BG-04 |
| NFR-03 | Tải trang | Gói tải ban đầu (dung lượng truyền qua mạng, đã nén) ≤ 15 MB; từ lúc mở URL tới màn mở đầu ≤ 10 giây trên mạng 20 Mbps, bộ nhớ đệm trống | Chrome DevTools, throttling tùy chỉnh 20 Mbps | BG-04 |
| NFR-04 | Ổn định | Chơi liên tục 30 phút (đi hết 10 phòng, mở 63 hiện vật, làm 10 trạm trắc nghiệm) trên điện thoại ở NFR-02: không crash, không tải lại trang, không mất ngữ cảnh WebGL; số lỗi chặn = 0; không có lỗi JavaScript chưa bắt trong console | Chạy tay theo kịch bản test | BG-04 |
| NFR-05 | Tương thích | Chạy đủ chức năng trên: Chrome và Edge (2 bản chính mới nhất) trên Windows; Chrome Android (bản mới nhất); Safari iOS 16 trở lên. Firefox bản mới nhất: chạy được, không bắt buộc đạt NFR-01 | Ma trận thiết bị ở test-plan | BG-04 |
| NFR-06 | Khả dụng | ≥ 80% người thử lần đầu tự đi hết 10 phòng không cần hỏi (SC-02); người thử mở được hiện vật đầu tiên trong ≤ 2 phút kể từ khi vào chơi | Quan sát buổi UAT | BG-02 |
| NFR-07 | Khả năng đọc | Chữ nội dung trong bảng hiện vật ≥ 16 px CSS, chữ HUD ≥ 14 px CSS; tương phản chữ/nền ≥ 4,5 : 1; font hiển thị đúng mọi dấu tiếng Việt | Đo tương phản bằng công cụ kiểm tra; soát mắt cả 63 hiện vật | BG-01, BG-05 |
| NFR-08 | Truy cập & an toàn thị giác | Mọi lớp giao diện (popup, bảng, menu, trắc nghiệm) điều khiển được hoàn toàn bằng bàn phím (Tab, Enter, ESC) và có viền focus thấy được; không có hiệu ứng chớp sáng toàn màn hình > 3 lần/giây | Test tay | BG-04 |
| NFR-09 | Bảo mật | Chỉ phục vụ qua HTTPS; có header `Content-Security-Policy` chỉ cho phép tài nguyên cùng nguồn (ngoại trừ font nếu SA chọn nguồn ngoài, phải liệt kê trong HLD); không cookie; không script bên thứ ba (quảng cáo, theo dõi, analytics); `npm audit` không có lỗ hổng High/Critical ở dependency production; nội dung hiện vật được hiển thị dưới dạng văn bản, không chèn HTML thô | Kiểm header bằng DevTools/securityheaders; `npm audit --omit=dev` | BG-04 · SC-06 |
| NFR-10 | Quyền riêng tư (PDPL) | Không thu thập, không gửi ra mạng bất kỳ dữ liệu cá nhân hay dữ liệu sử dụng nào; chỉ ghi 2 khóa `localStorage` của FR-19 | Kiểm tab Network trong một chuyến tham quan: không có request nào ngoài tải tài nguyên tĩnh | BRD mục 6 |
| NFR-11 | Bản quyền | 100% asset bên ngoài có trong `CREDITS.md` kèm giấy phép cho phép dùng (ưu tiên CC0; CC-BY phải ghi tác giả); không có file PDF hay ảnh scan giáo trình trong repo và bản build; trích nguyên văn chỉ là câu ngắn, luôn kèm trang | Rà repo + FR-26 | BG-01 · BRD mục 6 |
| NFR-12 | Sẵn sàng | Link production trả về HTTP 200 và vào được màn mở đầu suốt thời gian chấm; mọi thay đổi chỉ lên production sau khi chạy thử trên Vercel Preview | Kiểm tra tay hằng ngày trong thời gian chấm | BG-04 |
| NFR-13 | Bảo trì nội dung | Thêm, sửa, xóa hiện vật hoặc câu trắc nghiệm chỉ cần sửa file dữ liệu, không sửa code xử lý; FR-26 bắt lỗi dữ liệu trước khi deploy | Review code ở GATE-4 | BG-01 |
| NFR-14 | Ngôn ngữ | 100% chữ trên giao diện và nội dung bằng tiếng Việt có dấu; thuật ngữ nước ngoài chỉ xuất hiện khi giáo trình dùng (ví dụ *philosophia*) | Soát mắt | BRD mục 6 |

## 5. Ràng buộc dữ liệu

| Thực thể | Nguồn | Thuộc tính chính | Phân loại | Lưu trú & vòng đời |
|----------|-------|------------------|-----------|---------------------|
| Room | Dữ liệu build (từ NOI_DUNG.md) | mã `P01`…`P10`, khu, chương, tên, khoảng trang | Công khai | Đóng gói trong bản build; đổi khi deploy bản mới |
| Exhibit | Dữ liệu build | mã, phòng, loại, tên, nội dung, trích dẫn, tác giả trích dẫn, trang, cờ "minh họa", asset tham chiếu | Công khai (tóm tắt nội dung có bản quyền — chịu NFR-11) | Như trên |
| QuizQuestion | Dữ liệu build | mã câu, phòng, câu hỏi, 4 phương án, đáp án đúng, giải thích, `exhibitIds` | Công khai | Như trên |
| Credit | `CREDITS.md` | asset, tác giả, nguồn (URL), giấy phép | Công khai | Như trên |
| Progress | `localStorage` khóa `bttr.progress.v1` | xem bảng validate FR-19 | Dữ liệu cục bộ, **không phải PII**, không rời thiết bị | Tồn tại tới khi người dùng xóa tiến độ (FR-20) hoặc xóa dữ liệu trình duyệt |
| Settings | `localStorage` khóa `bttr.settings.v1` | xem bảng validate FR-19 | Như Progress | Như Progress (FR-20 không xóa Settings) |

**Vòng đời hiện vật đối với một người dùng:** `Chưa khám phá | mở bảng chi tiết | — | Đã khám phá` · `Đã khám phá | Xóa tiến độ | — | Chưa khám phá`.
**Vòng đời phòng về trắc nghiệm:** xem bảng trạng thái ở FR-16.

## 6. Giao diện ngoài

| Giao diện | Mô tả | Ràng buộc |
|-----------|-------|-----------|
| Vercel | Hosting tĩnh, HTTPS, Preview cho mỗi lần đẩy nhánh, Production cho bản nộp | Gói miễn phí; không dùng serverless function |
| API trình duyệt | WebGL2, Pointer Lock, Fullscreen, Web Audio, Touch/Pointer Events, `localStorage`, `visibilitychange` | Có phương án khi API không có hoặc bị chặn (FR-01, FR-05 1b, FR-19 3a, FR-25) |
| Blender 4.5 LTS | Công cụ dựng và bake vỏ tòa nhà ở máy dev, xuất glTF | Chỉ dùng lúc làm asset, không phải phụ thuộc lúc chạy |
| Nguồn asset (Poly Haven, ambientCG, Quaternius, KayKit, Wikimedia Commons…) | Lấy texture, HDRI, mô hình, ảnh chân dung | Tải về và đóng gói cùng bản build; không gọi trực tiếp lúc chạy; ghi `CREDITS.md` |

Không có API backend, không có tích hợp bên thứ ba lúc chạy.

## 7. Truy vết

| Mục tiêu BRD | Yêu cầu nghiệp vụ | FR | NFR |
|--------------|-------------------|----|-----|
| BG-01 Phủ đủ nội dung | BR-02, BR-03 | FR-08, FR-13, FR-26, FR-27 | NFR-07, NFR-11, NFR-13 |
| BG-02 Tự hoàn thành chuyến tham quan | BR-01, BR-05, BR-07 | FR-03, FR-04, FR-09, FR-10, FR-11, FR-12, FR-15, FR-18, FR-19, FR-20, FR-21 | NFR-06 |
| BG-03 Hỗ trợ ôn tập | BR-03, BR-04, BR-06 | FR-13, FR-14, FR-16, FR-17 | — (đo ngoài app, giả định A-02) |
| BG-04 Giảng viên mở link và chấm được | BR-09, BR-10 | FR-01, FR-06, FR-07, FR-19, FR-21, FR-22, FR-25 | NFR-01 → NFR-05, NFR-08, NFR-09, NFR-12 |
| BG-05 Trải nghiệm vượt bản tham khảo | BR-01, BR-04, BR-08 | FR-02, FR-04, FR-05, FR-14, FR-23, FR-24 | NFR-01, NFR-07 |
| Ràng buộc BRD mục 6 (PDPL, bản quyền, ngôn ngữ) | — | FR-19, FR-27 | NFR-10, NFR-11, NFR-14 |

Mọi FR-01…FR-27 và NFR-01…NFR-14 đều có trong bảng trên.

## 8. Điểm cần anh Duy xác nhận ở GATE-2

1. **Trắc nghiệm trước/sau để đo BG-03** làm ngoài app (Google Form) — giả định A-02. Nếu muốn làm trong app thì thêm một FR.
2. **Hiện vật 🎛 tính "đã khám phá" ngay khi mở** (BR-S01), không bắt buộc làm xong thao tác — để không ai bị kẹt ở 62/63.
3. **Trắc nghiệm mở ngay từ đầu** (BR-S11), không cần khám phá phòng trước.
4. **Chọn nhân vật nam/nữ (FR-02)** để ưu tiên Thấp: nếu thiếu thời gian thì chỉ làm một nhân vật.
