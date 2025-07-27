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

/**
 * @swagger
 * /api/admin/foods:
 *   get:
 *     summary: Lấy danh sách thực phẩm (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng item mỗi trang
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/foods', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const foods = await Food.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Food.countDocuments();

    res.json({
      success: true,
      foods,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách foods admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/foods:
 *   post:
 *     summary: Thêm thực phẩm mới (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - calories
 *               - protein
 *               - carbs
 *               - fat
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fat:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/foods', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, category, description } = req.body;

    // Validation
    if (!name || !calories || !protein || !carbs || !fat || !category) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const newFood = new Food({
      name,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      category,
      description: description || ''
    });

    await newFood.save();

    res.status(201).json({
      success: true,
      message: 'Thêm thực phẩm thành công',
      food: newFood
    });

  } catch (error) {
    console.error('Lỗi thêm food admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/foods/{id}:
 *   put:
 *     summary: Cập nhật thực phẩm (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thực phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fat:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.put('/foods/:id', async (req, res) => {
  try {
    const foodId = req.params.id;
    const { name, calories, protein, carbs, fat, category, description } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    // Update food
    food.name = name || food.name;
    food.calories = Number(calories) || food.calories;
    food.protein = Number(protein) || food.protein;
    food.carbs = Number(carbs) || food.carbs;
    food.fat = Number(fat) || food.fat;
    food.category = category || food.category;
    food.description = description !== undefined ? description : food.description;

    await food.save();

    res.json({
      success: true,
      message: 'Cập nhật thực phẩm thành công',
      food
    });

  } catch (error) {
    console.error('Lỗi cập nhật food admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/foods/{id}:
 *   delete:
 *     summary: Xóa thực phẩm (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thực phẩm
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.delete('/foods/:id', async (req, res) => {
  try {
    const foodId = req.params.id;
    const food = await Food.findById(foodId);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    await Food.findByIdAndDelete(foodId);

    res.json({
      success: true,
      message: 'Xóa thực phẩm thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa food admin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/stats/detailed:
 *   get:
 *     summary: Lấy thống kê chi tiết cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: ['7', '30', '90', '365']
 *         description: Khoảng thời gian (ngày)
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/stats/detailed', async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Thống kê cơ bản
    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalMeals = await Meal.countDocuments();
    
    // Người dùng hoạt động
    const activeUsers = await User.countDocuments({
      _id: {
        $in: await Meal.distinct('userId', {
          createdAt: { $gte: startDate }
        })
      }
    });

    // Người dùng mới tháng này và tháng trước
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    // Top thực phẩm được sử dụng nhiều nhất
    const topFoods = await Meal.aggregate([
      { $unwind: '$foods' },
      {
        $group: {
          _id: '$foods.foodId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'foods',
          localField: '_id',
          foreignField: '_id',
          as: 'food'
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ['$food.name', 0] },
          count: 1
        }
      }
    ]);

    // Tăng trưởng người dùng theo tháng (6 tháng gần nhất)
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const usersInMonth = await User.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      
      userGrowth.push({
        month: `T${monthStart.getMonth() + 1}`,
        users: usersInMonth
      });
    }

    // Phân bố thực phẩm theo danh mục
    const categoryDistribution = await Food.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1
        }
      }
    ]);

    // Phân bố người dùng theo giới tính
    const genderDistribution = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          gender: '$_id',
          count: 1
        }
      }
    ]);

    // Phân bố người dùng theo mục tiêu
    const goalDistribution = await User.aggregate([
      {
        $group: {
          _id: '$goal',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          goal: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFoods,
        totalMeals,
        activeUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        topFoods,
        userGrowth,
        categoryDistribution,
        genderDistribution,
        goalDistribution
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thống kê chi tiết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Lấy cài đặt hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/settings', async (req, res) => {
  try {
    // Trong thực tế, settings sẽ được lưu trong database
    // Ở đây chúng ta trả về default settings
    const settings = {
      siteName: 'Diet Management System',
      siteDescription: 'Hệ thống quản lý dinh dưỡng và chế độ ăn',
      adminEmail: 'admin@dietmanagement.com',
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableNotifications: true,
      enableBackup: true,
      backupFrequency: 'daily',
      enableLogging: true,
      logLevel: 'info',
      enableRateLimit: true,
      rateLimitRequests: 100,
      rateLimitWindow: 15,
      enableCORS: true,
      corsOrigins: ['http://localhost:3000', 'https://dietmanagement.com'],
      jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      jwtExpiry: 24
    };

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Lỗi lấy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Cập nhật cài đặt hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               siteDescription:
 *                 type: string
 *               adminEmail:
 *                 type: string
 *               sessionTimeout:
 *                 type: number
 *               maxLoginAttempts:
 *                 type: number
 *               enableNotifications:
 *                 type: boolean
 *               enableBackup:
 *                 type: boolean
 *               backupFrequency:
 *                 type: string
 *               enableLogging:
 *                 type: boolean
 *               logLevel:
 *                 type: string
 *               enableRateLimit:
 *                 type: boolean
 *               rateLimitRequests:
 *                 type: number
 *               rateLimitWindow:
 *                 type: number
 *               enableCORS:
 *                 type: boolean
 *               corsOrigins:
 *                 type: array
 *               jwtSecret:
 *                 type: string
 *               jwtExpiry:
 *                 type: number
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // Validation
    if (!settings.siteName || !settings.adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Trong thực tế, settings sẽ được lưu vào database
    // Ở đây chúng ta chỉ log và trả về success
    console.log('Cập nhật settings:', settings);

    res.json({
      success: true,
      message: 'Cài đặt đã được cập nhật thành công',
      settings
    });

  } catch (error) {
    console.error('Lỗi cập nhật settings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Kiểm tra tình trạng hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/health', async (req, res) => {
  try {
    // Kiểm tra database connection
    let databaseStatus = 'healthy';
    try {
      await User.findOne().limit(1);
    } catch (error) {
      databaseStatus = 'error';
    }

    // Kiểm tra API status
    const apiStatus = 'healthy';

    // Kiểm tra frontend status (giả định)
    const frontendStatus = 'healthy';

    // Mock system metrics
    const health = {
      database: databaseStatus,
      api: apiStatus,
      frontend: frontendStatus,
      memory: Math.floor(Math.random() * 30) + 50, // 50-80%
      cpu: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 20) + 70, // 70-90%
      uptime: Math.floor(Math.random() * 1440) + 720 // 12-36 hours
    };

    res.json({
      success: true,
      health
    });

  } catch (error) {
    console.error('Lỗi kiểm tra health:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 