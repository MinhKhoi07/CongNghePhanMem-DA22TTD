const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const auth = require('../middleware/auth');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Routes cho bữa ăn
router.post('/', mealController.createMeal);
router.get('/', mealController.getUserMeals);
router.put('/:id', mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);
router.get('/stats', mealController.getNutritionStats);

module.exports = router; 