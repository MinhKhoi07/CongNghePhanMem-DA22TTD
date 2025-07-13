const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của user
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *         password:
 *           type: string
 *           description: Mật khẩu (được hash)
 *         age:
 *           type: number
 *           description: Tuổi
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Giới tính
 *         height:
 *           type: number
 *           description: Chiều cao (cm)
 *         weight:
 *           type: number
 *           description: Cân nặng (kg)
 *         activityLevel:
 *           type: string
 *           enum: [sedentary, lightly_active, moderately_active, very_active, extremely_active]
 *           description: Mức độ hoạt động
 *         goal:
 *           type: string
 *           enum: [lose_weight, maintain_weight, gain_weight]
 *           description: Mục tiêu
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  age: {
    type: Number,
    min: [1, 'Tuổi phải lớn hơn 0'],
    max: [120, 'Tuổi không hợp lệ']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  height: {
    type: Number,
    min: [50, 'Chiều cao phải lớn hơn 50cm'],
    max: [250, 'Chiều cao không hợp lệ']
  },
  weight: {
    type: Number,
    min: [20, 'Cân nặng phải lớn hơn 20kg'],
    max: [300, 'Cân nặng không hợp lệ']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'sedentary'
  },
  goal: {
    type: String,
    enum: ['lose_weight', 'maintain_weight', 'gain_weight'],
    default: 'maintain_weight'
  },
  bmr: {
    type: Number,
    default: 0
  },
  tdee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method để tính BMR (Basal Metabolic Rate)
userSchema.methods.calculateBMR = function() {
  if (!this.age || !this.height || !this.weight || !this.gender) {
    return 0;
  }
  
  // Công thức Mifflin-St Jeor
  let bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age;
  bmr = this.gender === 'male' ? bmr + 5 : bmr - 161;
  
  return Math.round(bmr);
};

// Method để tính TDEE (Total Daily Energy Expenditure)
userSchema.methods.calculateTDEE = function() {
  const bmr = this.calculateBMR();
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[this.activityLevel] || 1.2);
};

// Virtual để tính BMI
userSchema.virtual('bmi').get(function() {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
});

// Cấu hình để virtual fields được include trong JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 