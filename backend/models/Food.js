const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       required:
 *         - name
 *         - calories
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của thực phẩm
 *         name:
 *           type: string
 *           description: Tên thực phẩm
 *         calories:
 *           type: number
 *           description: Calo trên 100g
 *         protein:
 *           type: number
 *           description: Protein (g) trên 100g
 *         carbs:
 *           type: number
 *           description: Carbohydrate (g) trên 100g
 *         fat:
 *           type: number
 *           description: Chất béo (g) trên 100g
 *         fiber:
 *           type: number
 *           description: Chất xơ (g) trên 100g
 *         sugar:
 *           type: number
 *           description: Đường (g) trên 100g
 *         sodium:
 *           type: number
 *           description: Natri (mg) trên 100g
 *         category:
 *           type: string
 *           enum: [vegetables, fruits, grains, proteins, dairy, fats, beverages, snacks]
 *           description: Danh mục thực phẩm
 *         description:
 *           type: string
 *           description: Mô tả thực phẩm
 *         image:
 *           type: string
 *           description: URL hình ảnh thực phẩm
 *         isCustom:
 *           type: boolean
 *           description: Có phải thực phẩm tự tạo không
 *         createdBy:
 *           type: string
 *           description: ID người tạo (nếu là custom food)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên thực phẩm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên thực phẩm không được quá 100 ký tự']
  },
  calories: {
    type: Number,
    required: [true, 'Calo là bắt buộc'],
    min: [0, 'Calo không được âm']
  },
  protein: {
    type: Number,
    default: 0,
    min: [0, 'Protein không được âm']
  },
  carbs: {
    type: Number,
    default: 0,
    min: [0, 'Carbohydrate không được âm']
  },
  fat: {
    type: Number,
    default: 0,
    min: [0, 'Chất béo không được âm']
  },
  fiber: {
    type: Number,
    default: 0,
    min: [0, 'Chất xơ không được âm']
  },
  sugar: {
    type: Number,
    default: 0,
    min: [0, 'Đường không được âm']
  },
  sodium: {
    type: Number,
    default: 0,
    min: [0, 'Natri không được âm']
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks'],
    default: 'snacks'
  },
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  image: {
    type: String,
    match: [/^https?:\/\/.+/, 'URL hình ảnh không hợp lệ']
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isCustom;
    }
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
foodSchema.index({ name: 'text', category: 1 });
foodSchema.index({ isCustom: 1, createdBy: 1 });

// Virtual để tính tổng dinh dưỡng
foodSchema.virtual('totalNutrients').get(function() {
  return {
    calories: this.calories,
    protein: this.protein,
    carbs: this.carbs,
    fat: this.fat,
    fiber: this.fiber,
    sugar: this.sugar,
    sodium: this.sodium
  };
});

// Method để tính dinh dưỡng theo khối lượng
foodSchema.methods.calculateNutrition = function(weight) {
  const multiplier = weight / 100;
  return {
    calories: Math.round(this.calories * multiplier),
    protein: Math.round(this.protein * multiplier * 10) / 10,
    carbs: Math.round(this.carbs * multiplier * 10) / 10,
    fat: Math.round(this.fat * multiplier * 10) / 10,
    fiber: Math.round(this.fiber * multiplier * 10) / 10,
    sugar: Math.round(this.sugar * multiplier * 10) / 10,
    sodium: Math.round(this.sodium * multiplier)
  };
};

// Cấu hình để virtual fields được include trong JSON
foodSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Food', foodSchema); 