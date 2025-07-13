const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Áp dụng middleware authentication cho tất cả routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin profile của user hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *               age:
 *                 type: number
 *                 description: Tuổi
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Giới tính
 *               height:
 *                 type: number
 *                 description: Chiều cao (cm)
 *               weight:
 *                 type: number
 *                 description: Cân nặng (kg)
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, lightly_active, moderately_active, very_active, extremely_active]
 *                 description: Mức độ hoạt động
 *               goal:
 *                 type: string
 *                 enum: [lose_weight, maintain_weight, gain_weight]
 *                 description: Mục tiêu
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Tuổi không hợp lệ'),
  body('height').optional().isFloat({ min: 50, max: 250 }).withMessage('Chiều cao không hợp lệ'),
  body('weight').optional().isFloat({ min: 20, max: 300 }).withMessage('Cân nặng không hợp lệ'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).withMessage('Mức độ hoạt động không hợp lệ'),
  body('goal').optional().isIn(['lose_weight', 'maintain_weight', 'gain_weight']).withMessage('Mục tiêu không hợp lệ')
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };
    
    // Cập nhật user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Tính lại BMR và TDEE nếu có thay đổi thông tin cơ thể
    if (updateData.age || updateData.height || updateData.weight || updateData.gender || updateData.activityLevel) {
      user.bmr = user.calculateBMR();
      user.tdee = user.calculateTDEE();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      user
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Lấy thống kê dinh dưỡng của user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCalories:
 *                       type: number
 *                     totalProtein:
 *                       type: number
 *                     totalCarbs:
 *                       type: number
 *                     totalFat:
 *                       type: number
 *                     averageCalories:
 *                       type: number
 *                     daysTracked:
 *                       type: number
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/stats', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Lấy tất cả meals trong khoảng thời gian
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Tính toán thống kê
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const daysTracked = new Set();

    meals.forEach(meal => {
      totalCalories += meal.totalNutrition.calories || 0;
      totalProtein += meal.totalNutrition.protein || 0;
      totalCarbs += meal.totalNutrition.carbs || 0;
      totalFat += meal.totalNutrition.fat || 0;
      daysTracked.add(meal.date.toISOString().split('T')[0]);
    });

    const daysCount = daysTracked.size;
    const averageCalories = daysCount > 0 ? Math.round(totalCalories / daysCount) : 0;

    res.json({
      success: true,
      stats: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        averageCalories,
        daysTracked: daysCount,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 