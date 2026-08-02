# Ecommerce Frontend

Giao diện người dùng cho nền tảng thương mại điện tử full-stack — xây dựng bằng React, TypeScript, Redux Toolkit và Tailwind CSS.

> Backend tương ứng: [ecommerce-backend](https://github.com/phamdinhkhoik2/ecommerce-backend)

## 🎯 Điểm nổi bật

- **Đồng bộ giỏ hàng Guest ↔ User liền mạch** — khách chưa đăng nhập vẫn giữ được giỏ hàng, tự động merge khi đăng nhập, không mất dữ liệu.
- **Thanh toán PayPal tích hợp thật** — redirect, capture, xử lý cả 3 trạng thái (thành công/thất bại/hủy) với đồng bộ trạng thái real-time.
- **Custom Dropdown cho cây phân cấp** — tự xây dựng component chọn danh mục dạng cây có Expand/Collapse, khắc phục giới hạn của thư viện UI khi cần lồng phần tử tương tác.

## 🛠️ Tech Stack

React 18 · TypeScript · Vite · Redux Toolkit + redux-persist · React Router · React Hook Form + Zod · Tailwind CSS v4 · Shadcn/ui (Base UI)

## ✨ Tính năng

**Người dùng**
- Đăng ký/đăng nhập, xác thực email, quên/đặt lại mật khẩu
- Trang cá nhân: thông tin, avatar, đổi mật khẩu, sổ địa chỉ (dropdown Tỉnh/Huyện/Xã thật)

**Mua sắm**
- Duyệt sản phẩm theo danh mục, tìm kiếm nâng cao (filter brand/giá/rating, sắp xếp đa dạng)
- Chi tiết sản phẩm: chọn biến thể thông minh (tự động điều chỉnh tổ hợp hợp lệ, không bị khóa cứng)
- Giỏ hàng, danh sách yêu thích, áp mã giảm giá
- Đánh giá sản phẩm kèm ảnh, vote hữu ích

**Đặt hàng & Thanh toán**
- Checkout với chọn địa chỉ giao hàng, phương thức thanh toán (COD/PayPal)
- Theo dõi đơn hàng, hủy đơn, xem lịch sử trạng thái

**Quản trị (Admin)**
- Quản lý danh mục (cây phân cấp có Expand/Collapse), sản phẩm (wizard 3 bước), đơn hàng, mã giảm giá, người dùng, đánh giá
- Dashboard thống kê doanh thu cơ bản

## 🏗️ Kiến trúc đáng chú ý

**Đồng bộ Guest/User Cart:**
```
App khởi động → tạo/giữ guestId (localStorage) NẾU chưa đăng nhập
Mọi request Cart → tự động gắn header X-Guest-Id (nếu có)
Đăng nhập thành công → xóa guestId, Backend tự merge giỏ hàng Guest vào User
```

**Xử lý lỗi và trạng thái phiên đăng nhập tập trung:**
```
axiosInstance (interceptor)
  ├─ Tự động gắn Access Token vào mọi request
  ├─ 401 → tự động thử refresh token, hàng đợi request đang chờ
  └─ Refresh thất bại → logout, điều hướng /login (soft navigation, không hard reload)
```

## 📁 Cấu trúc thư mục

```
src/
├── components/       # ui/ (shadcn), layout/, common/ (dùng chung)
├── features/           # theo domain: auth, category, product, cart, order...
│   └── [domain]/
│       ├── components/
│       ├── xService.ts
│       └── xSlice.ts
├── pages/                 # lắp ráp Layout + Component thành trang
├── routes/                   # AppRoute, PrivateRoute, AdminRoute
├── store/                       # cấu hình Redux
├── types/                          # interface khớp response Backend
├── lib/validations/                   # Zod schema cho form
└── utils/                                # hàm tiện ích
```

## 🚀 Cài đặt local

```bash
git clone https://github.com/phamdinhkhoik2/ecommerce-frontend.git
cd ecommerce-frontend
npm install
```

Tạo file `.env` với `VITE_API_URL` trỏ tới Backend đang chạy (mặc định `http://localhost:5000/api`).

```bash
npm run dev
```

## 📝 License

MIT