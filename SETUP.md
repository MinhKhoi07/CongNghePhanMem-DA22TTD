# Hướng Dẫn Setup Dự Án Quản Lý Chế Độ Ăn

## Yêu Cầu Hệ Thống

- Docker và Docker Compose
- Node.js 18+ (để chạy riêng lẻ)
- MongoDB (nếu chạy riêng lẻ)

## Cách Chạy Dự Án

### 1. Sử Dụng Docker Compose (Khuyến Nghị)

```bash
# Clone dự án (nếu chưa có)
git clone <repository-url>
cd diet-management-app

# Chạy toàn bộ ứng dụng
docker-compose up --build

# Hoặc chạy ở background
docker-compose up -d --build
```

Sau khi chạy thành công:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger UI: http://localhost:3001/api-docs
- MongoDB: localhost:27017

### 2. Chạy Riêng Lẻ

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### MongoDB
```bash
# Cài đặt MongoDB và chạy
mongod
```

## Cấu Trúc Dự Án

```
├── backend/                 # Node.js API server
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Middleware functions
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.tsx        # Main app component
│   └── package.json       # Frontend dependencies
├── docker-compose.yml     # Docker configuration
└── README.md             # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user

### Users
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/stats` - Thống kê dinh dưỡng

### Foods
- `GET /api/foods` - Lấy danh sách thực phẩm
- `GET /api/foods/:id` - Lấy chi tiết thực phẩm
- `POST /api/foods` - Tạo thực phẩm mới
- `PUT /api/foods/:id` - Cập nhật thực phẩm
- `DELETE /api/foods/:id` - Xóa thực phẩm

### Meals
- `GET /api/meals` - Lấy danh sách bữa ăn
- `GET /api/meals/:id` - Lấy chi tiết bữa ăn
- `POST /api/meals` - Tạo bữa ăn mới
- `PUT /api/meals/:id` - Cập nhật bữa ăn
- `DELETE /api/meals/:id` - Xóa bữa ăn

### Diets
- `GET /api/diets/recommendations` - Gợi ý chế độ ăn
- `GET /api/diets/analysis` - Phân tích dinh dưỡng

## Tính Năng Chính

### Backend
- ✅ RESTful API với Express
- ✅ MongoDB với Mongoose
- ✅ JWT Authentication
- ✅ Swagger/OpenAPI documentation
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ CORS support

### Frontend
- ✅ React với TypeScript
- ✅ Material-UI components
- ✅ React Router
- ✅ Context API cho state management
- ✅ Responsive design
- ✅ Modern UI/UX

### DevOps
- ✅ Docker containerization
- ✅ Docker Compose
- ✅ Environment variables
- ✅ Production-ready setup

## Troubleshooting

### Lỗi Kết Nối Database
```bash
# Kiểm tra MongoDB container
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Lỗi Backend
```bash
# Xem logs backend
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Lỗi Frontend
```bash
# Xem logs frontend
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

### Xóa Dữ Liệu
```bash
# Xóa tất cả containers và volumes
docker-compose down -v

# Xóa images
docker-compose down --rmi all
```

## Phát Triển Tiếp

### Thêm Tính Năng Mới
1. Tạo model trong `backend/models/`
2. Tạo routes trong `backend/routes/`
3. Thêm Swagger documentation
4. Tạo components trong `frontend/src/components/`
5. Tạo pages trong `frontend/src/pages/`

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Build Production
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## Liên Hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue hoặc liên hệ qua email. 