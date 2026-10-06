# Techstack — Bảo tàng Triết học

| Phiên bản | v1.0 | Ngày | 2026-10-06 | Trạng thái | APPROVED — GATE-2 (anh Duy, 2026-10-06) |
|-----------|------|------|------------|------------|--------------------|

Kiểu kiến trúc: **web tĩnh, modular monolith phía client** (HLD mục 1). Version kiểm tra trên npm ngày 2026-10-06; anh Duy xác nhận toàn bộ bảng ngày 2026-10-06.

## Nguyên tắc lựa chọn
Ưu tiên: đạt NFR hiệu năng và dung lượng tải trên điện thoại tầm trung (NFR-02, NFR-03) > không có máy chủ phải vận hành (BRD: web tĩnh, Vercel) > ít phụ thuộc > độ trưởng thành.

## Bảng công nghệ

| Lớp | Lựa chọn | Version | Lý do (chọn & chọn version) | Phương án thay thế đã cân nhắc | NFR liên quan | Xác nhận |
|-----|----------|---------|------------------------------|-------------------------------|---------------|:--------:|
| Runtime build | Node.js | 24 LTS (máy dev 24.19) | LTS "Krypton", còn hỗ trợ dài; chạy được script TypeScript trực tiếp (type stripping) nên không cần thêm `tsx` | Node 26 (chưa LTS); Node 22 (LTS cũ hơn) | NFR-13 | ✅ |
| Ngôn ngữ | TypeScript | 6.0 | Kiểu dữ liệu chặt cho dữ liệu nội dung và trạng thái; 6.0 là bản ổn định | TS 7.0 (bản viết lại bằng Go, mới ra, rủi ro tương thích công cụ); JavaScript thuần (mất kiểm tra kiểu cho 63 hiện vật) | NFR-13 | ✅ |
| Build / dev server | Vite | 8.3 | Dev server nhanh, build ra file tĩnh có hash để cache lâu; hỗ trợ Node 24 | Webpack (cấu hình nặng); Parcel (ít dùng với Three.js) | NFR-03 | ✅ |
| Đồ họa 3D | three | 0.186.x (khóa `~0.186.1`) | Bản tham khảo cũng dùng Three.js; gói nhỏ, tree-shake được; có sẵn loader glTF, meshopt, lightmap. Khóa minor vì `postprocessing` chỉ hỗ trợ three < 0.187 | React Three Fiber (gói nặng hơn, thêm React); Babylon.js (gói lớn hơn, đổi hệ sinh thái) — xem HLD ADR-02 | NFR-01, NFR-02, NFR-03 | ✅ |
| Hậu kỳ | postprocessing + n8ao | 6.39 + 2.0 | Gộp nhiều hiệu ứng vào ít pass hơn EffectComposer mặc định; N8AO cho AO chất lượng cao ở mức Cao | EffectComposer của three (chậm hơn khi nhiều pass); không hậu kỳ (kém BG-05) | NFR-01, BG-05 | ✅ |
| Va chạm | three-mesh-bvh | 0.9 | Kiểm tra va chạm viên nang và raycast camera nhanh trên mesh va chạm xuất từ Blender | `Octree` của three/addons (chậm hơn với mesh nhiều tam giác); engine vật lý Rapier/cannon (thừa, chỉ có 1 nhân vật, tòa nhà tĩnh) | NFR-01, FR-05, FR-07 | ✅ |
| Nén asset | @gltf-transform/cli | 4.5 | Nén hình học meshopt + texture WebP, gộp mesh, bỏ dữ liệu thừa; chạy bằng npm, không cần cài thêm công cụ | KTX2/Basis (tiết kiệm bộ nhớ GPU hơn nhưng cần cài KTX-Software riêng — để dành nếu NFR-02 không đạt); Draco (giải nén chậm hơn meshopt) | NFR-03, NFR-02 | ✅ |
| Unit test | Vitest | 5.0 | Chạy chung cấu hình Vite, test logic thuần: lưu trữ, trắc nghiệm, kiểm tra dữ liệu, phát hiện hiện vật | Jest (phải cấu hình ESM/TS riêng) | NFR-04, NFR-13 | ✅ |
| Dựng & bake tòa nhà | Blender | 4.5.14 LTS | Bake lightmap (ánh sáng gián tiếp, bóng mềm) cho vỏ tòa nhà; điều khiển bằng script `bpy` chạy headless; đã cài tại `D:\blender\blender.exe` | Dựng hoàn toàn bằng code (dùng làm bản blockout và phương án dự phòng — HLD ADR-04) | BG-05, NFR-01 | ✅ |
| Giao diện 2D | HTML/CSS thuần chồng lên canvas | — | Chỉ có vài lớp giao diện (HUD, bảng, menu, trắc nghiệm); không cần framework | React/Vue (thêm dung lượng, không cần) | NFR-03, NFR-08 | ✅ |
| Lưu trữ | `localStorage` | API trình duyệt | Đúng phạm vi BRD: không backend, dữ liệu không rời thiết bị | IndexedDB (thừa cho ~2 KB dữ liệu) | NFR-10 | ✅ |
| Hosting | Vercel (gói miễn phí) | — | Ràng buộc BRD; HTTPS, CDN, Preview cho mỗi nhánh làm môi trường UAT | GitHub Pages (không có Preview theo nhánh, không đặt được header CSP) | NFR-09, NFR-12 | ✅ |
| Font | Be Vietnam Pro (SIL OFL), tự host woff2 | — | Đủ dấu tiếng Việt; tự host để CSP chỉ cần cùng nguồn và không gọi Google Fonts | Noto Serif (dự phòng cho pano trích dẫn); Google Fonts CDN (thêm nguồn ngoài vào CSP) | NFR-07, NFR-09, NFR-14 | ✅ |
| Backend / API | Không áp dụng | — | BRD: web tĩnh, không backend | — | — | ✅ |
| CSDL / cache / hàng đợi | Không áp dụng | — | Không có dữ liệu máy chủ | — | — | ✅ |
| Mobile native | Không áp dụng | — | BRD: web responsive thay app native | — | — | ✅ |
| Quan sát (analytics, log tập trung) | Không áp dụng | — | NFR-10: không gửi dữ liệu sử dụng ra mạng. Lỗi xem bằng console khi test; log build xem trên Vercel | Vercel Analytics (vi phạm NFR-10) | NFR-10 | ✅ |

## Ràng buộc & Rủi ro công nghệ
- **Khóa three 0.186.x:** nâng three lên 0.187 phải chờ `postprocessing` hỗ trợ; đổi version sau GATE-2 là Change Request.
- **Giấy phép:** three, postprocessing, n8ao, three-mesh-bvh, gltf-transform, Vite, Vitest đều MIT/tương đương; Blender GPL chỉ dùng làm công cụ, file xuất ra không bị ràng buộc GPL; font Be Vietnam Pro theo SIL OFL. Asset ngoài ghi `CREDITS.md` (NFR-11).
- **Vendor lock-in:** thấp. Bản build là file tĩnh, chuyển sang host tĩnh khác được (chỉ mất header CSP trong `vercel.json` và Preview theo nhánh).
- **WebAssembly:** bộ giải nén meshopt chạy WebAssembly nên CSP phải có `'wasm-unsafe-eval'` (HLD mục 7).
- **PDPL:** không có thành phần nào thu thập hay gửi dữ liệu người dùng.
