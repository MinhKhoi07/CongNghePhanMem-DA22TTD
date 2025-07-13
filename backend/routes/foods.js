const express = require('express');
const { body, validationResult } = require('express-validator');
const Food = require('../models/Food');
const router = express.Router();

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: Lấy danh sách thực phẩm
 *     tags: [Foods]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [vegetables, fruits, grains, proteins, dairy, fats, beverages, snacks]
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;

    // Xây dựng query
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Đếm tổng số documents
    const total = await Food.countDocuments(query);
    
    // Lấy foods với pagination
    const foods = await Food.find(query)
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
    console.error('Lỗi lấy danh sách thực phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết thực phẩm
 *     tags: [Foods]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 food:
 *                   $ref: '#/components/schemas/Food'
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    res.json({
      success: true,
      food
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin thực phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/foods:
 *   post:
 *     summary: Tạo thực phẩm mới
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - calories
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên thực phẩm
 *               calories:
 *                 type: number
 *                 description: Calo trên 100g
 *               protein:
 *                 type: number
 *                 description: Protein (g) trên 100g
 *               carbs:
 *                 type: number
 *                 description: Carbohydrate (g) trên 100g
 *               fat:
 *                 type: number
 *                 description: Chất béo (g) trên 100g
 *               fiber:
 *                 type: number
 *                 description: Chất xơ (g) trên 100g
 *               sugar:
 *                 type: number
 *                 description: Đường (g) trên 100g
 *               sodium:
 *                 type: number
 *                 description: Natri (mg) trên 100g
 *               category:
 *                 type: string
 *                 enum: [vegetables, fruits, grains, proteins, dairy, fats, beverages, snacks]
 *                 description: Danh mục thực phẩm
 *               description:
 *                 type: string
 *                 description: Mô tả thực phẩm
 *               image:
 *                 type: string
 *                 description: URL hình ảnh thực phẩm
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
 *                 food:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Tên thực phẩm là bắt buộc và không quá 100 ký tự'),
  body('calories').isFloat({ min: 0 }).withMessage('Calo phải là số dương'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein phải là số dương'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbohydrate phải là số dương'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Chất béo phải là số dương'),
  body('fiber').optional().isFloat({ min: 0 }).withMessage('Chất xơ phải là số dương'),
  body('sugar').optional().isFloat({ min: 0 }).withMessage('Đường phải là số dương'),
  body('sodium').optional().isFloat({ min: 0 }).withMessage('Natri phải là số dương'),
  body('category').optional().isIn(['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks']).withMessage('Danh mục không hợp lệ'),
  body('description').optional().isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  body('image').optional().isURL().withMessage('URL hình ảnh không hợp lệ')
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

    const food = new Food(req.body);
    await food.save();

    res.status(201).json({
      success: true,
      message: 'Tạo thực phẩm thành công',
      food
    });

  } catch (error) {
    console.error('Lỗi tạo thực phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/foods/{id}:
 *   put:
 *     summary: Cập nhật thực phẩm
 *     tags: [Foods]
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
 *               fiber:
 *                 type: number
 *               sugar:
 *                 type: number
 *               sodium:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [vegetables, fruits, grains, proteins, dairy, fats, beverages, snacks]
 *               description:
 *                 type: string
 *               image:
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
 *                 food:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy thực phẩm
 */
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Tên thực phẩm không được quá 100 ký tự'),
  body('calories').optional().isFloat({ min: 0 }).withMessage('Calo phải là số dương'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein phải là số dương'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbohydrate phải là số dương'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Chất béo phải là số dương'),
  body('fiber').optional().isFloat({ min: 0 }).withMessage('Chất xơ phải là số dương'),
  body('sugar').optional().isFloat({ min: 0 }).withMessage('Đường phải là số dương'),
  body('sodium').optional().isFloat({ min: 0 }).withMessage('Natri phải là số dương'),
  body('category').optional().isIn(['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks']).withMessage('Danh mục không hợp lệ'),
  body('description').optional().isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  body('image').optional().isURL().withMessage('URL hình ảnh không hợp lệ')
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

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thực phẩm thành công',
      food
    });

  } catch (error) {
    console.error('Lỗi cập nhật thực phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/foods/{id}:
 *   delete:
 *     summary: Xóa thực phẩm
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thực phẩm
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
 *         description: Không tìm thấy thực phẩm
 */
router.delete('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thực phẩm thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa thực phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 