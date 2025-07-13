const express = require('express');
const { body, validationResult } = require('express-validator');
const Meal = require('../models/Meal');
const Food = require('../models/Food');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Áp dụng middleware authentication cho tất cả routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Lấy danh sách bữa ăn của user
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc theo ngày (YYYY-MM-DD)
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: Lọc theo loại bữa ăn
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
 *                 meals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meal'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const date = req.query.date;
    const mealType = req.query.mealType;

    // Xây dựng query
    let query = { userId: req.user._id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (mealType) {
      query.mealType = mealType;
    }

    // Đếm tổng số documents
    const total = await Meal.countDocuments(query);
    
    // Lấy meals với pagination
    const meals = await Meal.find(query)
      .populate('items.food', 'name calories protein carbs fat fiber sugar sodium category image')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      meals,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách bữa ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/meals/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết bữa ăn
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bữa ăn
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
 *                 meal:
 *                   $ref: '#/components/schemas/Meal'
 *       404:
 *         description: Không tìm thấy bữa ăn
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('items.food', 'name calories protein carbs fat fiber sugar sodium category image');
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bữa ăn'
      });
    }

    res.json({
      success: true,
      meal
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin bữa ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/meals:
 *   post:
 *     summary: Tạo bữa ăn mới
 *     tags: [Meals]
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
 *               - date
 *               - mealType
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên bữa ăn
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Ngày ăn
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 description: Loại bữa ăn
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     food:
 *                       type: string
 *                       description: ID của thực phẩm
 *                     quantity:
 *                       type: number
 *                       description: Khối lượng (g)
 *               notes:
 *                 type: string
 *                 description: Ghi chú
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meal:
 *                   $ref: '#/components/schemas/Meal'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Tên bữa ăn là bắt buộc và không quá 100 ký tự'),
  body('date').isISO8601().withMessage('Ngày không hợp lệ'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Loại bữa ăn không hợp lệ'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Ghi chú không được quá 500 ký tự'),
  body('items').optional().isArray().withMessage('Items phải là array'),
  body('items.*.food').optional().isMongoId().withMessage('ID thực phẩm không hợp lệ'),
  body('items.*.quantity').optional().isFloat({ min: 1 }).withMessage('Khối lượng phải lớn hơn 0')
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

    const { name, date, mealType, items, notes } = req.body;

    // Tạo meal mới
    const meal = new Meal({
      name,
      userId: req.user._id,
      date: new Date(date),
      mealType,
      notes
    });

    // Thêm items nếu có
    if (items && items.length > 0) {
      for (const item of items) {
        const food = await Food.findById(item.food);
        if (!food) {
          return res.status(400).json({
            success: false,
            message: `Không tìm thấy thực phẩm với ID: ${item.food}`
          });
        }
        
        const nutrition = food.calculateNutrition(item.quantity);
        meal.items.push({
          food: item.food,
          quantity: item.quantity,
          nutrition
        });
      }
    }

    await meal.save();

    // Populate food details
    await meal.populate('items.food', 'name calories protein carbs fat fiber sugar sodium category image');

    res.status(201).json({
      success: true,
      message: 'Tạo bữa ăn thành công',
      meal
    });

  } catch (error) {
    console.error('Lỗi tạo bữa ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/meals/{id}:
 *   put:
 *     summary: Cập nhật bữa ăn
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bữa ăn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               items:
 *                 type: array
 *               notes:
 *                 type: string
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
 *                 meal:
 *                   $ref: '#/components/schemas/Meal'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy bữa ăn
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Tên bữa ăn không được quá 100 ký tự'),
  body('date').optional().isISO8601().withMessage('Ngày không hợp lệ'),
  body('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Loại bữa ăn không hợp lệ'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Ghi chú không được quá 500 ký tự')
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

    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bữa ăn'
      });
    }

    // Cập nhật các trường cơ bản
    if (req.body.name) meal.name = req.body.name;
    if (req.body.date) meal.date = new Date(req.body.date);
    if (req.body.mealType) meal.mealType = req.body.mealType;
    if (req.body.notes !== undefined) meal.notes = req.body.notes;

    await meal.save();
    await meal.populate('items.food', 'name calories protein carbs fat fiber sugar sodium category image');

    res.json({
      success: true,
      message: 'Cập nhật bữa ăn thành công',
      meal
    });

  } catch (error) {
    console.error('Lỗi cập nhật bữa ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     summary: Xóa bữa ăn
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bữa ăn
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy bữa ăn
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bữa ăn'
      });
    }

    res.json({
      success: true,
      message: 'Xóa bữa ăn thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa bữa ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 