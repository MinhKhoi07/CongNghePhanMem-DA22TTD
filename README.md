# Ứng dụng Quản lý Chế độ Ăn với Chatbot

Ứng dụng web quản lý chế độ ăn uống với tính năng chatbot thông minh, được xây dựng theo kiến trúc client/server.

## Cấu trúc dự án

- `frontend-next/`: Giao diện người dùng (Next.js + TypeScript)
- `backend/`: API server (Node.js + Express)
- `chatbot/`: Module xử lý chatbot (sẽ được thêm sau)

## Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x

## Cài đặt và chạy

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend-next
npm install
npm run dev
```

## Các nhánh (Branches)

- `main`: Nhánh chính, chứa code ổn định
- `develop`: Nhánh phát triển, nơi tích hợp các tính năng
- `feature/frontend`: Nhánh phát triển giao diện người dùng
- `feature/backend`: Nhánh phát triển backend API
- `feature/auth`: Nhánh phát triển tính năng xác thực
- `feature/meal-management`: Nhánh phát triển tính năng quản lý bữa ăn

## Tính năng chính

- Quản lý thông tin người dùng
  - Đăng ký/Đăng nhập
  - Quản lý thông tin cá nhân
- Theo dõi chế độ ăn uống
  - Thêm/Sửa/Xóa bữa ăn
  - Theo dõi lượng calo và dinh dưỡng
  - Lịch sử bữa ăn
- Chatbot tư vấn dinh dưỡng (sẽ được thêm sau)
- Thống kê và báo cáo (sẽ được thêm sau)

## Công nghệ sử dụng

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hooks
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose

## Các API Endpoints

### User
- POST /api/users/register - Đăng ký người dùng mới
- POST /api/users/login - Đăng nhập
- GET /api/users/me - Lấy thông tin người dùng hiện tại

### Meal
- GET /api/meals - Lấy danh sách bữa ăn
- POST /api/meals - Thêm bữa ăn mới
- PUT /api/meals/:id - Cập nhật bữa ăn
- DELETE /api/meals/:id - Xóa bữa ăn

## Tác giả

- Nguyễn Minh Khởi
- Châu Thị Mỹ Hương
- Võ Bảo Ngọc
