# Hệ Thống Quản Lý Khách Hàng - Cửa Hàng Tạp Hóa

Một ứng dụng web đơn giản để quản lý khách hàng và lịch sử mua hàng cho cửa hàng tạp hóa.

## Tính Năng

### 🧑‍🤝‍🧑 Quản Lý Khách Hàng
- **Thêm khách hàng mới**: Tự động tạo mã khách hàng (KH001, KH002, ...)
- **Thông tin khách hàng**: Họ tên, số điện thoại, mã khách hàng
- **Tìm kiếm**: Tìm kiếm khách hàng theo tên
- **Xóa khách hàng**: Xóa khách hàng và tất cả đơn hàng liên quan

### 📋 Danh Sách Khách Hàng
- Hiển thị danh sách tất cả khách hàng
- Thống kê tổng số khách hàng
- Hiển thị tổng giá trị mua hàng của từng khách hàng
- Chọn khách hàng để xem lịch sử mua hàng

### 🛒 Lịch Sử Mua Hàng
- **Xem đơn hàng**: Hiển thị lịch sử mua hàng của khách hàng được chọn
- **Thêm đơn hàng mới**: Thêm sản phẩm, số lượng, đơn giá
- **Tính toán tự động**: Tự động tính tổng tiền cho từng đơn hàng
- **Xóa đơn hàng**: Xóa đơn hàng không còn cần thiết

## Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc giao diện
- **CSS3**: Thiết kế giao diện hiện đại với gradient và animation
- **Vanilla JavaScript**: Logic ứng dụng
- **Font Awesome**: Icon
- **Google Fonts (Inter)**: Typography

## Cách Sử Dụng

1. **Mở ứng dụng**: Mở file `index.html` trong trình duyệt hoặc sử dụng Live Server
2. **Thêm khách hàng**:
   - Nhập họ tên và số điện thoại
   - Mã khách hàng được tạo tự động
   - Nhấn "Thêm Khách Hàng"
3. **Tìm kiếm khách hàng**: Sử dụng ô tìm kiếm trong phần danh sách khách hàng
4. **Xem lịch sử mua hàng**: Nhấn vào khách hàng trong danh sách
5. **Thêm đơn hàng**:
   - Chọn khách hàng từ danh sách
   - Nhấn "Thêm Đơn Hàng"
   - Điền thông tin sản phẩm và nhấn "Thêm Đơn Hàng"

## Dữ Liệu Mẫu

Ứng dụng được tải với dữ liệu mẫu bao gồm:
- 3 khách hàng mẫu
- 6 đơn hàng mẫu với các sản phẩm tạp hóa phổ biến

## Tính Năng Giao Diện

- **Responsive Design**: Tương thích với màn hình desktop và mobile
- **Gradient Background**: Giao diện hiện đại với màu sắc gradient
- **Animation**: Hiệu ứng chuyển động mượt mà
- **Modal**: Popup để thêm đơn hàng mới
- **Search**: Tìm kiếm theo thời gian thực
- **Notification**: Thông báo khi thực hiện các thao tác

## Cấu Trúc File

```
demo-customer-mng-app/
├── index.html          # Giao diện chính
├── styles.css          # CSS styling
├── config.js           # Logic ứng dụng và quản lý dữ liệu
├── README.md           # Tài liệu hướng dẫn
└── .github/
    └── copilot-instructions.md  # Hướng dẫn cho AI coding agents
```

## Phát Triển Thêm

Các tính năng có thể mở rộng:
- Lưu trữ dữ liệu với Local Storage
- Xuất báo cáo bán hàng
- Quản lý kho hàng
- Tính năng in hóa đơn
- Thống kê doanh thu theo thời gian
- Quản lý nhiều cửa hàng