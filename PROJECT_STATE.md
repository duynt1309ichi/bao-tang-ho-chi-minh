# PROJECT_STATE — Bảo tàng Triết học

> File điều phối trung tâm. PO và mọi role cập nhật file này. Không xoá lịch sử; chỉ thêm/đổi trạng thái.
> Quy trình: `AI-Skill/training-skill-software/software-development-skills/WORKFLOW.md`.

- **Dự án:** Bảo tàng Triết học (repo `bao-tang-ho-chi-minh`)
- **Ngày khởi tạo:** 2026-10-06
- **Loại dự án:** Mới (Track A)
- **Kiểu bố trí tài liệu:** A — monolith, tài liệu đi chung repo code (`docs/{ba,sa,design,qa,security}`)
- **Giai đoạn hiện tại:** B4 — Phát triển (mốc M1: blockout, nhân vật, camera, va chạm)
- **Cổng đang chờ:** GATE-4
- **GATE-3 (đóng băng thiết kế):** BẬT
- **GATE-4 (nghiệm thu chức năng):** BẬT

## Trạng thái artifact
Trạng thái: `NOT_STARTED` → `IN_PROGRESS` → `DONE` → `APPROVED` (hoặc `NEEDS_REVISION`)

| Artifact          | Role        | Trạng thái   | Cập nhật (yyyy-mm-dd) |
|-------------------|-------------|--------------|------------------------|
| audit-report.md   | BA + SA     | —            | không áp dụng (dự án mới) |
| BRD.md            | BA          | APPROVED     | 2026-10-06             |
| SRS.md            | BA          | APPROVED     | 2026-10-06             |
| function-map.html | BA          | APPROVED     | 2026-10-06             |
| techstack.md      | SA          | APPROVED     | 2026-10-06             |
| HLD.md            | SA          | APPROVED     | 2026-10-06             |
| architecture.html | SA          | APPROVED     | 2026-10-06             |
| FSD.md            | BA          | APPROVED     | 2026-10-06             |
| LLD.md            | SA          | APPROVED     | 2026-10-06             |
| api-spec.md       | SA          | —            | không áp dụng — không có backend (anh Duy chọn quy trình rút gọn 2026-10-06) |
| design.md         | Designer    | APPROVED     | 2026-10-06             |
| scaffold-backend  | Backend     | —            | không áp dụng (quy trình rút gọn) |
| scaffold-frontend | Frontend    | APPROVED     | 2026-10-06             |
| scaffold-mobile   | Mobile      | —            | không áp dụng — web responsive thay app native |
| src (code)        | Frontend    | IN_PROGRESS  | 2026-10-06             |
| test-plan.md      | Tester      | NOT_STARTED  |                        |
| test-cases.md     | Tester      | NOT_STARTED  |                        |
| test-report.md    | Tester      | NOT_STARTED  |                        |
| pentest-report.md | Security    | NOT_STARTED  |                        |
| user-guide.md     | BA          | NOT_STARTED  |                        |
| docker-compose.yml| DevOps      | —            | thay bằng Vercel Preview (quy trình rút gọn); deploy-notes.md vẫn làm |

**Tài liệu nháp đầu vào** (viết trước khi áp quy trình — dùng làm nguyên liệu cho BRD/SRS/HLD, sẽ thay thế dần):
- `docs/THIET_KE.md` — ý tưởng gameplay, đồ họa, kỹ thuật, lộ trình.
- `docs/NOI_DUNG.md` — 10 phòng / 63 hiện vật trích từ Giáo trình Triết học Mác – Lênin (2021), có số trang.

## Log phê duyệt (chỉ con người)
| Cổng   | Kết quả  | Người duyệt | Ngày | Ghi chú |
|--------|----------|-------------|------|---------|
| GATE-1 | Duyệt    | anh Duy     | 2026-10-06 | BRD v1.0 |
| GATE-2 | Duyệt    | anh Duy     | 2026-10-06 | SRS v0.1, techstack, HLD, architecture, function-map |
| GATE-3 | Duyệt    | anh Duy     | 2026-10-06 | FSD, LLD, design, scaffold |
| GATE-4 | —        |             |      |         |
| GATE-5 | —        |             |      |         |
| GATE-6 | —        |             |      |         |

## Thông số môi trường
- **Dải port UAT (anh Duy cấp):** <chưa có — hỏi trước khi deploy>
- **Blender:** 4.5.14 LTS tại `D:\blender\blender.exe` — đã thử chạy headless + glTF exporter OK (2026-10-06).

## Nhật ký (append-only)
- 2026-10-06 — Tạo repo, commit đầu `08338b8` (README).
- 2026-10-06 — Phân tích bản tham khảo https://hcm-58us.vercel.app (Three.js, góc nhìn thứ 1, 6 phòng).
- 2026-10-06 — Anh Duy đổi nội dung sang Giáo trình Triết học Mác – Lênin (2021); đã đọc đủ 495 trang, viết nháp `docs/NOI_DUNG.md`.
- 2026-10-06 — Anh Duy chọn phương án đồ họa: Claude điều khiển Blender bằng script (`bpy`) để dựng/bake tòa nhà. Đã cài Blender.
- 2026-10-06 — PO phân loại: Dự án mới (Track A). Bắt đầu B1 — BA brainstorm.
- 2026-10-06 — BA brainstorm, anh Duy chốt: đồ án môn học; UAT ~1 tháng (2026-11-06); quy trình rút gọn (giữ 6 cổng, bỏ backend/mobile/api-spec, UAT = Vercel Preview); AI-Skill/ không đẩy git (.gitignore).
- 2026-10-06 — BA viết `docs/ba/BRD.md` v0.1 → DONE. PO trình GATE-1.
- 2026-10-06 — anh Duy trả lời câu hỏi mở: nộp đồ án bằng link web host (Vercel) cho giảng viên xem; tên sản phẩm "Bảo tàng Triết học". BRD → v0.2. PO trình lại GATE-1.
- 2026-10-06 — anh Duy duyệt GATE-1 (BRD v1.0). Sang B2: BA viết SRS + function-map; SA brainstorm kiến trúc.
- 2026-10-06 — BA viết `docs/ba/SRS.md` v0.1 (27 FR, 14 NFR, 4 điểm chờ xác nhận ở mục 8) + `docs/ba/function-map.html` → DONE. SA bắt đầu brainstorm kiến trúc.
- 2026-10-06 — anh Duy xác nhận 4 điểm SRS mục 8, chọn phương án kiến trúc A (Three.js thuần) và toàn bộ bảng version. SA viết `docs/sa/techstack.md`, `HLD.md`, `architecture.html` → DONE. PO trình GATE-2.
- 2026-10-06 — anh Duy duyệt GATE-2. Sang B3: FSD, LLD, design, scaffold-frontend.
- 2026-10-06 — B3: designer viết `docs/design/design.md`; BA viết `docs/ba/FSD.md` (15 màn SCR, 19 thông báo MSG, ma trận 27/27 FR); SA viết `docs/sa/LLD.md`; frontend dựng khung Vite 8.3 + TS 6.0 + three 0.186 + Vitest 5 + `vercel.json` (CSP) — build OK, chạy dev OK. Chưa deploy Vercel (chốt cách kết nối ở B6 theo HLD). PO trình GATE-3.
- 2026-10-06 — anh Duy duyệt GATE-3. Sang B4, mốc M1 trên nhánh `feature/m1-blockout`. Kết nối Vercel giữ ở B6 (anh chưa yêu cầu làm sớm).
- 2026-10-06 — M1 (nhánh `feature/m1-blockout`): `layout.json` (63 vị trí hiện vật, 10 trạm), bảo tàng khối hộp sinh từ layout, nhân vật tạm, camera thứ 3/thứ nhất chống xuyên tường + không xuống dưới sàn, va chạm three-mesh-bvh, nhãn khu vực. 18 unit test xanh; thử trên trình duyệt: đi 5 s = 10,01 m, chạy hết trục bảo tàng không kẹt, không xuyên tường, camera không xuyên tường ở 30 lần thử. Còn lại của M1: điều khiển cảm ứng dời sang M5 theo lộ trình.
