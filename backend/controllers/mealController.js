const Meal = require('../models/Meal');

// Tạo bữa ăn mới
exports.createMeal = async (req, res) => {
    try {
        const meal = new Meal({
            ...req.body,
            userId: req.userId
        });
        await meal.save();
        res.status(201).json(meal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating meal', error: error.message });
    }
};

// Lấy danh sách bữa ăn của người dùng
exports.getUserMeals = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.userId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const meals = await Meal.find(query).sort({ date: -1 });
        res.json(meals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meals', error: error.message });
    }
};

// Cập nhật bữa ăn
exports.updateMeal = async (req, res) => {
    try {
        const meal = await Meal.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        res.json(meal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating meal', error: error.message });
    }
};

// Xóa bữa ăn
exports.deleteMeal = async (req, res) => {
    try {
        const meal = await Meal.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        res.json({ message: 'Meal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meal', error: error.message });
    }
};

// Lấy thống kê dinh dưỡng
exports.getNutritionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.userId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Meal.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' },
                    totalProtein: { $sum: '$protein' },
                    totalCarbs: { $sum: '$carbs' },
                    totalFat: { $sum: '$fat' },
                    averageCalories: { $avg: '$calories' }
                }
            }
        ]);

        res.json(stats[0] || {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            averageCalories: 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nutrition stats', error: error.message });
    }
}; 