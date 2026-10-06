# Bảo tàng Triết học

Bảo tàng số 3D góc nhìn thứ 3, nội dung theo Giáo trình Triết học Mác – Lênin (2021); cơ chế lấy cảm hứng từ https://hcm-58us.vercel.app.

## Chạy ở máy

Cần Node.js 24 LTS.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit test (Vitest)
npm run build    # kiểm kiểu + build ra dist/
npm run preview  # xem bản build
```

Deploy: Vercel build bằng `npm run build`, thư mục `dist/`; header bảo mật ở `vercel.json`.

## Tài liệu

- Trạng thái dự án: [PROJECT_STATE.md](PROJECT_STATE.md)
- BA: [BRD](docs/ba/BRD.md) · [SRS](docs/ba/SRS.md) · [FSD](docs/ba/FSD.md) · [Function map](docs/ba/function-map.html)
- SA: [Techstack](docs/sa/techstack.md) · [HLD](docs/sa/HLD.md) · [LLD](docs/sa/LLD.md) · [Sơ đồ kiến trúc](docs/sa/architecture.html)
- Thiết kế: [design.md](docs/design/design.md)
- Nháp đầu vào: [THIET_KE.md](docs/THIET_KE.md) · [NOI_DUNG.md](docs/NOI_DUNG.md)
