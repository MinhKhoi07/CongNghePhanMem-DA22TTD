const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Kiểm tra role admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    req.admin = decoded;
    next();

  } catch (error) {
    console.error('Lỗi xác thực admin:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

module.exports = { authenticateAdmin }; 