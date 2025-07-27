const express = require('express');
const { authenticateAdmin } = require('../middleware/adminAuth');
const User = require('../models/User');
const Food = require('../models/Food');
const Meal = require('../models/Meal');
const router = express.Router();

// Áp dụng middleware authentication cho tất cả routes
router.use(authenticateAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho admin
 *     tags: [Admin]
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
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalFoods:
 *                       type: number
 *                     totalMeals:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/stats', async (req, res) => {
  try {
    // Đếm tổng số users
    const totalUsers = await User.countDocuments();
    
    // Đếm tổng số foods
    const totalFoods = await Food.countDocuments();
    
    // Đếm tổng số meals
    const totalMeals = await Meal.countDocuments();
    
    // Đếm users hoạt động (có tạo meal trong 30 ngày qua)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      _id: {
        $in: await Meal.distinct('userId', {
          createdAt: { $gte: thirtyDaysAgo }
        })
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFoods,
        totalMeals,
        activeUsers
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thống kê admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách tất cả users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng item trên mỗi trang
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
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/foods:
 *   get:
 *     summary: Lấy danh sách tất cả foods
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng item trên mỗi trang
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
 *                 foods:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/foods', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await Food.countDocuments();
    const foods = await Food.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      foods,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách foods:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     summary: Khóa/mở khóa người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.patch('/users/:id/block', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Toggle trạng thái active
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Lỗi khóa/mở khóa user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa user và tất cả meals liên quan
    await User.findByIdAndDelete(userId);
    await Meal.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Đã xóa người dùng thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 