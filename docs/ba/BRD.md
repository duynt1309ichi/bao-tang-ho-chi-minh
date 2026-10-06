# BRD — Bảo tàng Triết học

| Phiên bản | v1.0 | Ngày | 2026-10-06 | Người viết | BA | Trạng thái | APPROVED — GATE-1 (anh Duy, 2026-10-06) |
|-----------|------|------|------------|------------|----|-----------|-------|

## 1. Bối cảnh & Vấn đề

Dự án là **đồ án môn học** của học phần Triết học Mác – Lênin. Giáo trình chính thức (Bộ GD&ĐT, NXB Chính trị quốc gia Sự thật, 2021) dày 495 trang, gồm 3 chương và 10 mục lớn, với nhiều khái niệm trừu tượng như vật chất, ý thức, các quy luật, phạm trù, hình thái kinh tế – xã hội. Khi ôn tập, sinh viên chủ yếu đọc lại giáo trình hoặc đề cương; cách học này khô và khó nhớ quan hệ giữa các khái niệm.

Bản tham khảo https://hcm-58us.vercel.app cho thấy mô hình **bảo tàng 3D trên web** giúp người xem đi qua nội dung theo trình tự và khám phá từng hiện vật. Tuy vậy, bản này có các hạn chế:
- Góc nhìn thứ nhất, không có nhân vật.
- Đồ họa dựng bằng khối hộp đơn giản.
- Hiện vật chỉ để đọc, không có phần kiểm tra kiến thức.
- Bộ đếm sai: ghi 34 hiện vật nhưng thực tế chỉ có 32.

Đồ án tận dụng mô hình này cho nội dung giáo trình Triết học, nâng cấp trải nghiệm (nhân vật góc nhìn thứ 3, đồ họa dựng và bake trong Blender) và bổ sung yếu tố học tập (hiện vật tương tác, trắc nghiệm).

## 2. Mục tiêu kinh doanh (đo được)

| ID | Mục tiêu | Chỉ số (baseline → target) | Thời hạn |
|----|----------|-----------------------------|----------|
| BG-01 | Phủ đủ nội dung giáo trình | Số mục lớn của giáo trình có phòng trưng bày: 0/10 → 10/10; hiện vật có trích trang nguồn: 0% → 100% | UAT 2026-11-06 |
| BG-02 | Người dùng tự hoàn thành chuyến tham quan | Tỉ lệ người thử đi hết 10 phòng mà không cần hướng dẫn trực tiếp: — → ≥ 80% (nhóm thử ≥ 5 người) | UAT 2026-11-06 |
| BG-03 | Hỗ trợ ôn tập hiệu quả | Điểm trắc nghiệm trung bình của nhóm thử, sau tham quan so với trước tham quan (cùng bộ câu hỏi): tăng ≥ 20 điểm phần trăm | UAT 2026-11-06 |
| BG-04 | Giảng viên tự mở link và chấm được | Link web công khai chạy ổn định suốt thời gian chấm; số lỗi chặn (không đi tiếp được, crash, màn hình đen): 0; chạy được trên laptop phổ thông và điện thoại tầm trung | Suốt thời gian chấm đồ án |
| BG-05 | Trải nghiệm vượt bản tham khảo | Điểm hài lòng của nhóm thử về điều khiển và đồ họa: ≥ 4/5 | UAT 2026-11-06 |

## 3. Phạm vi

**Trong phạm vi:**
- Bảo tàng 3D chạy trên trình duyệt (máy tính và điện thoại). Gồm khuôn viên, sảnh, hành lang, 10 phòng theo 3 chương và phòng ôn tập.
- Nhân vật điều khiển ở góc nhìn thứ 3, có tùy chọn chuyển sang góc nhìn thứ nhất.
- Nội dung: 63 hiện vật tóm tắt từ giáo trình 2021, có trích dẫn kèm số trang (nháp hiện có ở `docs/NOI_DUNG.md`). Trong đó có 13 hiện vật tương tác.
- Trắc nghiệm theo từng phòng.
- Lưu tiến độ ngay trên trình duyệt.
- Ngày/đêm, âm thanh, bản đồ nhỏ, cài đặt chất lượng đồ họa.
- Tòa nhà dựng và bake ánh sáng trong Blender (Claude điều khiển bằng script); deploy lên Vercel.

**Ngoài phạm vi:**
- Tài khoản, đăng nhập, backend, cơ sở dữ liệu máy chủ.
- Bảng xếp hạng, chơi nhiều người.
- Chức năng cho giảng viên quản lý lớp hoặc xem kết quả của sinh viên.
- App native (Android/iOS); bản tiếng Anh.
- Nội dung ngoài Giáo trình Triết học Mác – Lênin 2021 (Kinh tế chính trị, CNXH khoa học, Tư tưởng Hồ Chí Minh…).
- Phòng chiếu phim như bản tham khảo.

## 4. Stakeholders

| Vai trò | Người/Bộ phận | Quan tâm chính / Quyền quyết |
|---------|---------------|-------------------------------|
| Chủ dự án (duyệt) | anh Duy | Duyệt mọi cổng; quyết phạm vi, ưu tiên, thời hạn |
| Người chấm | Giảng viên học phần | Nội dung đúng giáo trình, sản phẩm chạy ổn khi demo |
| Người dùng cuối | Sinh viên học phần Triết học Mác – Lênin | Ôn tập dễ nhớ, dễ điều khiển, chạy được trên máy của mình |
| Nhóm thử nghiệm | 5+ sinh viên (bạn cùng lớp) | Thử UAT, làm trắc nghiệm trước/sau, chấm điểm hài lòng |
| Đội thực hiện | Claude (các vai trò BA, SA, designer, dev, tester…) | Làm theo `WORKFLOW.md`, dừng ở từng cổng |

## 5. Yêu cầu mức nghiệp vụ

| ID | Yêu cầu nghiệp vụ | Ưu tiên | Phục vụ mục tiêu |
|----|-------------------|---------|------------------|
| BR-01 | Người dùng tham quan bảo tàng 3D bằng một nhân vật điều khiển ở góc nhìn thứ 3, trên máy tính lẫn điện thoại | Cao | BG-02, BG-05 |
| BR-02 | Nội dung được tổ chức đúng cấu trúc giáo trình: 3 khu ↔ 3 chương, 10 phòng ↔ 10 mục lớn, theo thứ tự trang | Cao | BG-01 |
| BR-03 | Người dùng xem chi tiết từng hiện vật: tên, nội dung tóm tắt, trích dẫn, trang nguồn; xoay được mô hình 3D | Cao | BG-01, BG-03 |
| BR-04 | Một số khái niệm khó được minh họa bằng hiện vật tương tác mà người dùng tự thao tác | TB | BG-03, BG-05 |
| BR-05 | Hệ thống ghi nhận và hiển thị tiến độ khám phá, giữ lại khi quay lại lần sau | Cao | BG-02 |
| BR-06 | Người dùng tự kiểm tra kiến thức bằng trắc nghiệm theo phòng; câu sai được gợi ý hiện vật cần xem lại | Cao | BG-03 |
| BR-07 | Người dùng định hướng được trong bảo tàng: biển phòng, bản đồ nhỏ, thông báo khi vào phòng | TB | BG-02 |
| BR-08 | Không gian có chất lượng hình ảnh và âm thanh cao hơn bản tham khảo (ánh sáng bake, ngày/đêm, nhạc nền) | TB | BG-05 |
| BR-09 | Truy cập bằng một đường link web, không cài đặt, không đăng nhập | Cao | BG-04 |
| BR-10 | Người dùng điều chỉnh được chất lượng đồ họa và điều khiển để chạy trên nhiều cấu hình máy | TB | BG-04 |

## 6. Ràng buộc & Giả định

**Ràng buộc:**
- **Thời hạn:** bản UAT khoảng 1 tháng, hạn dự kiến 2026-11-06.
- **Kiến trúc:** web tĩnh, không có backend; hosting Vercel.
- **Bản quyền:** giáo trình có bản quyền. Chỉ tóm tắt bằng lời của mình và trích ngắn có ghi trang; không đăng file PDF hay ảnh scan. Mọi ảnh, mô hình, âm thanh phải có giấy phép rõ ràng (ưu tiên CC0) và ghi nguồn.
- **Dữ liệu cá nhân (PDPL):** không thu thập dữ liệu cá nhân; chỉ lưu tiến độ chơi trên trình duyệt của người dùng.
- **Công cụ:** đồ họa tòa nhà làm bằng Blender 4.5 LTS do Claude điều khiển bằng script. Đây là lựa chọn của anh Duy, chấp nhận tốn token hơn so với dựng bằng code.
- **Quy trình:** theo bộ kit SDLC bản rút gọn. Giữ đủ 6 cổng; backend, mobile app native và api-spec ghi "không áp dụng"; UAT dùng Vercel Preview thay cho docker-compose.
- **Ngôn ngữ:** giao diện và nội dung bằng tiếng Việt.
- **Hình thức nộp:** đồ án được nộp bằng **một đường link web công khai** (host trên Vercel) để giảng viên tự mở xem. Không nộp file cài đặt hay video. Bản production phải luôn chạy được trong thời gian chấm.
- **Tên sản phẩm:** **Bảo tàng Triết học**. Tên repo `bao-tang-ho-chi-minh` giữ nguyên trừ khi anh Duy yêu cầu đổi.

**Giả định (cần kiểm chứng):**
- Giáo trình 2021 là tài liệu chính thức của học phần mà giảng viên chấm theo.
- Máy dùng để chấm demo có trình duyệt hỗ trợ WebGL2 và có Internet.
- Gói miễn phí của Vercel đủ cho dung lượng asset (mục tiêu tải ban đầu dưới 15 MB) và lượng truy cập của nhóm thử.
- Tìm được ít nhất 5 bạn cùng lớp tham gia thử nghiệm và làm trắc nghiệm trước/sau.

## 7. Tiêu chí thành công / Nghiệm thu

- **SC-01 (BG-01):** 10/10 phòng ứng với 10 mục lớn của giáo trình; 100% hiện vật có trang nguồn; anh Duy rà nội dung không còn sai lệch so với giáo trình.
- **SC-02 (BG-02):** ít nhất 80% người thử tự đi hết 10 phòng mà không cần hỏi cách chơi.
- **SC-03 (BG-03):** điểm trắc nghiệm trung bình sau tham quan cao hơn trước tham quan ít nhất 20 điểm phần trăm.
- **SC-04 (BG-04):** link production trên Vercel mở được từ mạng ngoài, không cần đăng nhập; chạy thử toàn bộ chuyến tham quan trên 1 laptop phổ thông và 1 điện thoại tầm trung, không có lỗi chặn.
- **SC-05 (BG-05):** điểm hài lòng trung bình về điều khiển và đồ họa từ 4/5 trở lên.
- **SC-06:** đạt đủ 6 cổng của quy trình, trong đó GATE-5 không còn finding mức High hoặc Critical.

## 8. Rủi ro & Câu hỏi mở

| Rủi ro / Câu hỏi | Ảnh hưởng | Giảm thiểu / Ai quyết | Hạn chót |
|-------------------|-----------|------------------------|----------|
| Dựng và bake bằng Blender qua script tốn thời gian và token hơn dự kiến | Trễ hạn UAT | Làm blockout bằng code trước để game chạy sớm; nếu đến M3 Blender chưa đạt thì dùng bản code. anh Duy quyết lúc trình GATE-4 | 2026-10-27 |
| Hiệu năng trên điện thoại tầm trung không đạt | Không đạt BG-04 | Có mức chất lượng Thấp; giới hạn dung lượng asset; thử trên điện thoại thật từ sớm | 2026-10-30 |
| Nội dung tóm tắt sai lệch với giáo trình | Ảnh hưởng điểm đồ án | Mọi hiện vật ghi trang nguồn; anh Duy rà nội dung trước GATE-4 | 2026-11-02 |
| Ảnh chân dung hoặc mô hình 3D không rõ giấy phép | Rủi ro bản quyền | Chỉ dùng phạm vi công cộng hoặc CC0, ghi `CREDITS.md`; security rà ở B5 | B5 |
| Nhóm thử ít hơn 5 người hoặc không làm trắc nghiệm trước/sau | Không đo được BG-02, BG-03 | anh Duy liên hệ sớm với lớp; chuẩn bị form trắc nghiệm trước/sau | 2026-11-01 |
