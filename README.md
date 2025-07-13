# Ứng Dụng Quản Lý Chế Độ Ăn

Ứng dụng web quản lý chế độ ăn với RESTful API, Docker và Swagger documentation.

## Tính Năng

- 👤 Quản lý thông tin người dùng
- 🍎 Quản lý thực phẩm và dinh dưỡng
- 📊 Tạo và quản lý chế độ ăn
- 📈 Theo dõi calo và dinh dưỡng
- 📚 API documentation với Swagger

## Công Nghệ Sử Dụng

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Swagger/OpenAPI
- Docker

### Frontend
- React + TypeScript
- Material-UI
- Axios
- Docker

## Cách Chạy Dự Án

### Sử dụng Docker Compose (Khuyến nghị)
```bash
docker-compose up --build
```

### Chạy riêng lẻ
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

## API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:
- http://localhost:3001/api-docs

## Cấu Trúc Dự Án

```
├── backend/          # Node.js API server
├── frontend/         # React frontend
├── docker-compose.yml
└── README.md
``` 