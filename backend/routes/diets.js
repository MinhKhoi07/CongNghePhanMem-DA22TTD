const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Áp dụng middleware authentication cho tất cả routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/diets/recommendations:
 *   get:
 *     summary: Lấy gợi ý chế độ ăn dựa trên thông tin user
 *     tags: [Diets]
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
 *                 recommendations:
 *                   type: object
 *                   properties:
 *                     dailyCalories:
 *                       type: number
 *                     proteinGoal:
 *                       type: number
 *                     carbsGoal:
 *                       type: number
 *                     fatGoal:
 *                       type: number
 *                     mealPlan:
 *                       type: object
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/recommendations', async (req, res) => {
  try {
    const user = req.user;
    
    // Tính toán calo mục tiêu dựa trên goal
    let targetCalories = user.tdee;
    if (user.goal === 'lose_weight') {
      targetCalories = user.tdee - 500; // Giảm 500 calo/ngày
    } else if (user.goal === 'gain_weight') {
      targetCalories = user.tdee + 300; // Tăng 300 calo/ngày
    }

    // Tính toán macro goals
    const proteinGoal = Math.round((targetCalories * 0.25) / 4); // 25% calo từ protein
    const carbsGoal = Math.round((targetCalories * 0.45) / 4);   // 45% calo từ carbs
    const fatGoal = Math.round((targetCalories * 0.30) / 9);     // 30% calo từ fat

    // Gợi ý phân bố calo theo bữa ăn
    const mealPlan = {
      breakfast: {
        calories: Math.round(targetCalories * 0.25),
        protein: Math.round(proteinGoal * 0.25),
        carbs: Math.round(carbsGoal * 0.25),
        fat: Math.round(fatGoal * 0.25)
      },
      lunch: {
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(proteinGoal * 0.35),
        carbs: Math.round(carbsGoal * 0.35),
        fat: Math.round(fatGoal * 0.35)
      },
      dinner: {
        calories: Math.round(targetCalories * 0.30),
        protein: Math.round(proteinGoal * 0.30),
        carbs: Math.round(carbsGoal * 0.30),
        fat: Math.round(fatGoal * 0.30)
      },
      snack: {
        calories: Math.round(targetCalories * 0.10),
        protein: Math.round(proteinGoal * 0.10),
        carbs: Math.round(carbsGoal * 0.10),
        fat: Math.round(fatGoal * 0.10)
      }
    };

    res.json({
      success: true,
      recommendations: {
        dailyCalories: targetCalories,
        proteinGoal,
        carbsGoal,
        fatGoal,
        mealPlan,
        userInfo: {
          bmr: user.bmr,
          tdee: user.tdee,
          goal: user.goal,
          activityLevel: user.activityLevel
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy gợi ý chế độ ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

/**
 * @swagger
 * /api/diets/analysis:
 *   get:
 *     summary: Phân tích chế độ ăn hiện tại
 *     tags: [Diets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày phân tích (YYYY-MM-DD)
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
 *                 analysis:
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
 *                     calorieGoal:
 *                       type: number
 *                     proteinGoal:
 *                       type: number
 *                     carbsGoal:
 *                       type: number
 *                     fatGoal:
 *                       type: number
 *                     calorieProgress:
 *                       type: number
 *                     proteinProgress:
 *                       type: number
 *                     carbsProgress:
 *                       type: number
 *                     fatProgress:
 *                       type: number
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get('/analysis', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const user = req.user;

    // Lấy tất cả meals trong ngày
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: startDate, $lt: endDate }
    });

    // Tính tổng dinh dưỡng trong ngày
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach(meal => {
      totalCalories += meal.totalNutrition.calories || 0;
      totalProtein += meal.totalNutrition.protein || 0;
      totalCarbs += meal.totalNutrition.carbs || 0;
      totalFat += meal.totalNutrition.fat || 0;
    });

    // Tính calo mục tiêu
    let targetCalories = user.tdee;
    if (user.goal === 'lose_weight') {
      targetCalories = user.tdee - 500;
    } else if (user.goal === 'gain_weight') {
      targetCalories = user.tdee + 300;
    }

    // Tính macro goals
    const proteinGoal = Math.round((targetCalories * 0.25) / 4);
    const carbsGoal = Math.round((targetCalories * 0.45) / 4);
    const fatGoal = Math.round((targetCalories * 0.30) / 9);

    // Tính phần trăm hoàn thành
    const calorieProgress = targetCalories > 0 ? Math.round((totalCalories / targetCalories) * 100) : 0;
    const proteinProgress = proteinGoal > 0 ? Math.round((totalProtein / proteinGoal) * 100) : 0;
    const carbsProgress = carbsGoal > 0 ? Math.round((totalCarbs / carbsGoal) * 100) : 0;
    const fatProgress = fatGoal > 0 ? Math.round((totalFat / fatGoal) * 100) : 0;

    res.json({
      success: true,
      analysis: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        calorieGoal: targetCalories,
        proteinGoal,
        carbsGoal,
        fatGoal,
        calorieProgress,
        proteinProgress,
        carbsProgress,
        fatProgress,
        meals: meals.length,
        date: date.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Lỗi phân tích chế độ ăn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 