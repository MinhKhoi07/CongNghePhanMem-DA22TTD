const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MealItem:
 *       type: object
 *       required:
 *         - food
 *         - quantity
 *       properties:
 *         food:
 *           type: string
 *           description: ID của thực phẩm
 *         quantity:
 *           type: number
 *           description: Khối lượng (g)
 *         nutrition:
 *           type: object
 *           description: Thông tin dinh dưỡng đã tính
 *     
 *     Meal:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *         - date
 *         - mealType
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của bữa ăn
 *         name:
 *           type: string
 *           description: Tên bữa ăn
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         date:
 *           type: string
 *           format: date
 *           description: Ngày ăn
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           description: Loại bữa ăn
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MealItem'
 *           description: Danh sách thực phẩm trong bữa ăn
 *         totalNutrition:
 *           type: object
 *           description: Tổng dinh dưỡng của bữa ăn
 *         notes:
 *           type: string
 *           description: Ghi chú
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mealItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: [true, 'Thực phẩm là bắt buộc']
  },
  quantity: {
    type: Number,
    required: [true, 'Khối lượng là bắt buộc'],
    min: [1, 'Khối lượng phải lớn hơn 0']
  },
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  }
});

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên bữa ăn là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên bữa ăn không được quá 100 ký tự']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng là bắt buộc']
  },
  date: {
    type: Date,
    required: [true, 'Ngày là bắt buộc'],
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Loại bữa ăn là bắt buộc']
  },
  items: [mealItemSchema],
  totalNutrition: {
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    },
    fiber: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    sodium: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không được quá 500 ký tự']
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
mealSchema.index({ userId: 1, date: 1, mealType: 1 });
mealSchema.index({ date: 1 });

// Middleware để tính tổng dinh dưỡng trước khi lưu
mealSchema.pre('save', async function(next) {
  if (this.items && this.items.length > 0) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    for (let item of this.items) {
      if (item.nutrition) {
        totalCalories += item.nutrition.calories || 0;
        totalProtein += item.nutrition.protein || 0;
        totalCarbs += item.nutrition.carbs || 0;
        totalFat += item.nutrition.fat || 0;
        totalFiber += item.nutrition.fiber || 0;
        totalSugar += item.nutrition.sugar || 0;
        totalSodium += item.nutrition.sodium || 0;
      }
    }

    this.totalNutrition = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      sugar: Math.round(totalSugar * 10) / 10,
      sodium: Math.round(totalSodium)
    };
  }
  next();
});

// Method để thêm thực phẩm vào bữa ăn
mealSchema.methods.addFood = async function(foodId, quantity) {
  const Food = mongoose.model('Food');
  const food = await Food.findById(foodId);
  
  if (!food) {
    throw new Error('Không tìm thấy thực phẩm');
  }

  const nutrition = food.calculateNutrition(quantity);
  
  this.items.push({
    food: foodId,
    quantity: quantity,
    nutrition: nutrition
  });

  return this.save();
};

// Method để xóa thực phẩm khỏi bữa ăn
mealSchema.methods.removeFood = function(foodId) {
  this.items = this.items.filter(item => item.food.toString() !== foodId.toString());
  return this.save();
};

// Virtual để lấy thông tin chi tiết của thực phẩm
mealSchema.virtual('itemsWithDetails').get(function() {
  return this.items.map(item => ({
    ...item.toObject(),
    foodDetails: this.model('Food').findById(item.food)
  }));
});

// Cấu hình để virtual fields được include trong JSON
mealSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Meal', mealSchema); 