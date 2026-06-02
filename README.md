<<<<<<< HEAD
# ☕ Chiba — Tea, Coffee & Foods

Chào mừng bạn đến với **Chiba**, một nền tảng ứng dụng đặt trà, cà phê và đồ ăn với giao diện cao cấp, hiện đại và trải nghiệm người dùng tối ưu. Dự án được phát triển bằng **Next.js 14** kết hợp với hệ thống thiết kế độc bản sử dụng **Tailwind CSS**.
=======
# ☕ ZEN F&B — Trà & Cà Phê Nguyên Bản

Chào mừng bạn đến với **ZEN F&B**, một nền tảng ứng dụng đặt trà, sữa tươi và cà phê thốt nốt với giao diện cao cấp, hiện đại và trải nghiệm người dùng tối ưu. Dự án được phát triển bằng **Next.js 14** kết hợp với hệ thống thiết kế Zen F&B độc bản sử dụng **Tailwind CSS**.
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379

---

## 🎨 Điểm Nổi Bật Về Giao Diện & Trải Nghiệm (UX/UI)
<<<<<<< HEAD
* **Chiba Design System**: Tone màu chủ đạo được phối hài hòa giữa sắc Xanh Thiền định cổ điển (Deep Zen Green `#1E4620`) và sắc Cam Ấm cúng từ logo Chiba (Cafe Warm Orange `#D87D4A`).
=======
* **Zen Design System**: Tone màu chủ đạo được phối hài hòa giữa sắc Xanh Thiền định cổ điển (Deep Zen Green `#1E4620`) và sắc Cam Ấm cúng từ những hạt cà phê rang xay (Cafe Warm Orange `#D87D4A`).
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379
* **Trải nghiệm Mockup Di động cao cấp**: Toàn bộ ứng dụng được bọc trong khung mô phỏng di động hiện đại mang lại cảm giác tiện lợi như đang sử dụng ứng dụng di động thực tế.
* **Tương tác chuyển động vi mô (Micro-interactions)**: Các nút bấm, ô nhập liệu và các hộp thông tin đều sở hữu các chuyển động mềm mại, đổ bóng cao cấp (`shadow-premium`, `shadow-floating`) kích thích thị giác của khách hàng.

---

## 🚀 Tính Năng Chính Của Ứng Dụng
1. **Hệ thống Mô phỏng Đăng nhập & Đăng ký**:
   * Hỗ trợ 3 vai trò tài khoản: **Khách hàng (Customer)**, **Nhân viên (Staff)** và **Quản trị viên (Admin)**.
   * Giao diện đăng nhập tích hợp sẵn **Nút truy cập nhanh (Quick Login)** cho từng vai trò để phục vụ quá trình kiểm thử nhanh chóng.
2. **Trình Chọn Món & Tùy Biến Toppings Thông Minh**:
   * Khách hàng có thể dễ dàng tìm kiếm đồ uống qua thanh tìm kiếm thời gian thực.
   * Cửa sổ tùy biến Toppings cao cấp cho phép chọn thêm trân châu, thạch đào, kem phô mai... kèm theo bộ tăng giảm số lượng cốc và tính toán tổng tiền động cực kỳ mượt mà.
3. **Giỏ Hàng & Thanh Toán Bền Vững (Persistence)**:
   * Giỏ hàng lưu trữ và đồng bộ tự động với `localStorage` để dữ liệu không bị mất khi làm mới trang.
   * Cho phép tăng/giảm số lượng món hoặc xóa món trực tiếp ngay tại trang Giỏ hàng.
4. **Bảng Điều Khiển Admin & Nhân Viên (Dashboard)**:
   * **Chế độ Admin**: Giám sát chỉ số doanh thu tổng, số lượng đơn hàng, số khách hàng, quản lý và mời thêm Nhân viên (Staff) mới qua Email.
   * **Chế độ Staff**: Hỗ trợ tiếp nhận đơn hàng, phê duyệt pha chế và hoàn thành đơn hàng của khách, đồng thời cập nhật trạng thái bật/tắt Còn hàng/Hết hàng của sản phẩm.

---

## 💻 Công Nghệ Sử Dụng
* **Core Framework**: [Next.js 14.2.3](https://nextjs.org/) (App Router)
* **UI Library**: [React 18](https://react.dev/)
* **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) & PostCSS
* **Icons**: [Lucide React](https://lucide.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

Làm theo các bước đơn giản sau để thiết lập dự án trên máy cục bộ của bạn:

### 1. Yêu cầu hệ thống
* Đảm bảo bạn đã cài đặt **Node.js** phiên bản **18.0.0 hoặc cao hơn**.

### 2. Tải các gói thư viện phụ thuộc
Di chuyển vào thư mục dự án và cài đặt:
```bash
npm install
```

### 3. Khởi chạy máy chủ Phát triển (Development Mode)
Chạy lệnh sau để khởi chạy máy chủ phát triển cục bộ:
```bash
npm run dev
```
Sau khi chạy xong, hãy mở trình duyệt của bạn và truy cập: **[http://localhost:3000](http://localhost:3000)**.

### 4. Biên dịch và Đóng gói Sản xuất (Production Build)
Để biên dịch tối ưu hóa và kiểm tra chạy sản phẩm:
```bash
# Biên dịch đóng gói dự án
npm run build

# Chạy máy chủ sản xuất
npm run start
```

---

## 🔑 Tài Khoản Thử Nghiệm Có Sẵn
Để trải nghiệm nhanh các vai trò trong hệ thống, bạn có thể click nhanh vào nút test ở giao diện đăng nhập hoặc sử dụng thông tin đăng nhập sau:

| Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :--- | :--- |
<<<<<<< HEAD
| **Quản Trị Viên (Admin)** | `admin@chiba.com` | `123456` | Xem doanh thu hệ thống, mời/thu hồi lời mời cho Nhân viên mới. |
| **Nhân Viên (Staff)** | `staff@chiba.com` | `123456` | Tiếp nhận, xác nhận đơn hàng, hoàn thành pha chế, cập nhật kho hàng. |
| **Khách Hàng (Customer)** | `user@chiba.com` | `123456` | Xem thực đơn, thêm topping vào giỏ hàng, đặt hàng và tích lũy điểm Chiba. |
=======
| **Quản Trị Viên (Admin)** | `admin@zenfb.com` | `123456` | Xem doanh thu hệ thống, mời/thu hồi lời mời cho Nhân viên mới. |
| **Nhân Viên (Staff)** | `staff@zenfb.com` | `123456` | Tiếp nhận, xác nhận đơn hàng, hoàn thành pha chế, cập nhật kho hàng. |
| **Khách Hàng (Customer)** | `user@zenfb.com` | `123456` | Xem thực đơn, thêm topping vào giỏ hàng, đặt hàng và tích lũy điểm ZEN. |
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379

---

## 📂 Cấu Trúc Thư Mục Chính
```text
ChibaApp/
├── .vscode/               # Cấu hình không gian làm việc VS Code (ẩn lỗi linter Tailwind)
├── src/
│   ├── app/               # Next.js App Router Pages (Layout, Home, Cart, Admin, Profile...)
<<<<<<< HEAD
│   │   ├── globals.css    # File cấu hình CSS Chiba Theme & tối ưu scrollbar/animations
=======
│   │   ├── globals.css    # File cấu hình CSS Zen Theme & tối ưu scrollbar/animations
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379
│   │   └── layout.tsx     # Cấu hình Layout tổng và SEO Meta tags
│   ├── components/        # Thư mục chứa các Component dùng chung (Header, ProductList...)
│   ├── lib/
│   │   ├── context/       # AuthContext (quản lý session/roles) và CartContext (quản lý giỏ hàng)
│   │   └── providers.tsx  # Providers bọc quanh ứng dụng Next.js
│   └── types/             # Kiểu dữ liệu TypeScript (User, Order, CartItem, Product...)
<<<<<<< HEAD
├── tailwind.config.js     # File cấu hình bảng màu Chiba Theme cho Tailwind v3
=======
├── tailwind.config.js     # File cấu hình bảng màu Zen Theme cho Tailwind v3
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379
├── postcss.config.mjs     # File cấu hình biên dịch CSS
└── package.json           # Danh sách thư viện và scripts chạy dự án
```

<<<<<<< HEAD
Chúc bạn có những trải nghiệm tuyệt vời cùng **Chiba**! ☕🍵
=======
Chúc bạn có những trải nghiệm tuyệt vời cùng **ZEN F&B**! ☕🍵
>>>>>>> 830185a0d427a1d6f732d73e31daaba7eea71379
