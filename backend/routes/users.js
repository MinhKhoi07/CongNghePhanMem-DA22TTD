// New route for changing password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Route lấy thống kê dinh dưỡng (cần xác thực)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Lấy tất cả meals trong khoảng thời gian
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Tính toán thống kê
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const daysTracked = new Set();

    meals.forEach(meal => {
      totalCalories += meal.totalNutrition.calories || 0;
      totalProtein += meal.totalNutrition.protein || 0;
      totalCarbs += meal.totalNutrition.carbs || 0;
      totalFat += meal.totalNutrition.fat || 0;
      daysTracked.add(meal.date.toISOString().split('T')[0]);
    });

    const daysCount = daysTracked.size;
    const averageCalories = daysCount > 0 ? Math.round(totalCalories / daysCount) : 0;

    res.json({
      success: true,
      stats: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        averageCalories,
        daysTracked: daysCount,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router; 